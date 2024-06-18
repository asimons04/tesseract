<script lang="ts">
    import type {Filters, ModLog} from '../+page.js'
    import type { Person, Post } from 'lemmy-js-client'

    import { amMod, amModOfAny, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { getClient } from '$lib/lemmy'
    import { goto } from '$app/navigation';
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js';
    import { userSettings } from '$lib/settings.js'
    
    import BanCommunityModal from '$lib/components/lemmy/moderation/BanCommunityModal.svelte'
    import BanInstanceModal from '$lib/components/lemmy/moderation/BanInstanceModal.svelte';
    import Button from '$lib/components/input/Button.svelte';
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import ModlogAction from '../ModlogAction.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import ModlogRemoveCommentModal from '../ModlogRemoveCommentModal.svelte';
    import ModlogRemovePostModal from '../ModlogRemovePostModal.svelte';
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    
    import { Icon, 
        ArrowUpTray,
        Bars3,
        Fire,
        LockClosed,
        LockOpen,
        Megaphone,
        MinusCircle, 
        PlusCircle, 
        ShieldExclamation,
        Trash
    } from 'svelte-hero-icons'
    
    
    
    export let item: ModLog
    export let filter: Filters

    let banningCommunity = false
    let banningInstance = false
    let locking         = false
    let removing        = false
    let removingComment = false

    async function lock(item: Post, lock: boolean) {
        if (!$profile?.jwt) return !lock
        locking = true

        try {
            await getClient().lockPost({
                locked: lock,
                post_id: item.id,
            })

            item.locked = lock

            toast({
                content: `Successfully ${lock ? 'locked' : 'unlocked' } that post. You must refresh to see changes.`,
                type: 'success',
                title: "Success"
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        locking = false
        return lock
    }

    async function pin(item: Post, pinned: boolean, toInstance: boolean = false) {
        if (!$profile?.jwt) return
        
        try {
            await getClient().featurePost({
                feature_type: toInstance ? 'Local' : 'Community',
                featured: pinned,
                post_id: item.id,
            })
            
            if (toInstance) item.featured_local = pinned
            else item.featured_community = pinned

            toast({
                content: `Successfully ${pinned ? 'pinned' : 'unpinned'} that post.`,
                type: 'success',
                title: 'Success'
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
    }

</script>

<!---Ban/Unban Community--->
{#if item.moderatee && item.community && (isAdmin($profile?.user) || amMod($profile?.user, item.community))}
    <BanCommunityModal bind:open={banningCommunity} banned={item.actionName=='banCommunity'} user={item.moderatee} bind:community={item.community} 
        on:banCommunity={(e) => {
            goto(window.location.href, {invalidateAll: true})
        }}
    />
{/if}

<!---Ban/Unban Instance--->
{#if item.moderatee && isAdmin($profile?.user)}
    <BanInstanceModal bind:open={banningInstance} bind:banned={item.moderatee.banned} bind:user={item.moderatee} 
        on:ban={(e) => {
            //goto(window.location.href, {invalidateAll: true})
            if (item.moderatee) item.moderatee.banned = e.detail
        }}
    />
{/if}

<!---Remove/Restore Post--->
{#if item.post && item.community && (amMod($profile?.user, item.community) || isAdmin($profile?.user))}
    <ModlogRemovePostModal bind:open={removing} bind:post={item.post} purge={false} reason='' 
        on:remove={(e) => {
            goto(window.location.href, {invalidateAll: true})
        }}
    />
{/if}

<!---Remove/Restore Comment--->
{#if item.comment && item.community && (amMod($profile?.user, item.community) || isAdmin($profile?.user))}
    <ModlogRemoveCommentModal bind:open={removingComment} bind:comment={item.comment} purge={false} reason='' 
        on:remove={(e) => {
            goto(window.location.href, {invalidateAll: true})
        }}
    />
{/if}


<div class="flex flex-col-reverse gap-1 items-start lg:flex-row lg:gap-4 lg:items-center w-full" >
    
    <!---Date/time column--->
    <div class="flex flex-row gap-2 text-xs w-full lg:w-[5%]">
        <span class="lg:hidden text-xs font-bold">When:</span>
        <RelativeDate date={item.when} />
    </div>

    <!---Community--->
    <div class="flex flex-row gap-1 text-xs w-full lg:w-[15%] items-center">
        {#if item.community}
            <span class="flex flex-row gap-2 items-center w-full">
                <span class="lg:hidden text-xs font-bold">Community:</span>
                
                <button class="cursor-pointer" title="Filter modlog for {item.community.name}" on:click={() => {
                    filter.community.set = !filter.community.set;
                    if (item?.community?.id && filter.community.set) {
                        filter.community.community = item.community;
                        searchParam($page.url, 'community', item.community.id.toString(), 'page');
                    } else {
                        searchParam($page.url, 'community', '', 'community');
                    }
                    
                }}>
                    <Icon src={filter.community.set ? MinusCircle : PlusCircle} mini width={24} />
                </button>

                <CommunityLink showInstance={true} avatar={false} avatarSize={20} community={item.community}/>
            </span>
        {/if}
    </div>
    
    <!---Moderator--->
    {#if $profile?.user}
        <div class="flex flex-row gap-1 text-xs w-full lg:w-[20%] items-center">
            {#if item.moderator}
            <span class="flex flex-row gap-2 items-center w-full">    
                <span class="lg:hidden text-xs font-bold">Moderator:</span>
                
                <button class="cursor-pointer" title="Filter modlog for {item.moderator.name}" on:click={() => {
                    filter.moderator.set = !filter.moderator.set;
                    if (item?.moderator && filter.moderator.set) {
                        filter.moderator.person = item.moderator;
                        searchParam($page.url, 'mod_id', item.moderator.id.toString(), 'page');
                    } else {
                        searchParam($page.url, 'mod_id', '', 'mod_id');
                    }
                    
                }}>
                    <Icon src={filter.moderator.set ? MinusCircle : PlusCircle} mini width={24} />
                </button>

                <UserLink showInstance={true} avatar={false} avatarSize={20} user={item.moderator} />
            </span>
            {/if}
        </div>
    {/if}

    <!---Moderatee / user --->
    <div class="flex flex-row gap-1 text-xs w-full lg:w-[20%] items-center">
        {#if item.moderatee}
        <span class="flex flex-row gap-2 items-center w-full">        
            <span class="lg:hidden text-xs font-bold">Moderatee:</span>
            
            <button class="cursor-pointer" title="Filter modlog for {item.moderatee.name}" on:click={() => {
                filter.moderatee.set = !filter.moderatee.set;
                if (item?.moderatee && filter.moderatee.set) {
                    filter.moderatee.person = item.moderatee;
                    searchParam($page.url, 'other_person_id', item.moderatee.id.toString(), 'page');
                } else {
                    searchParam($page.url, 'other_person_id', '', 'other_person_id');
                }
                
            }}>
                <Icon src={filter.moderatee.set ? MinusCircle : PlusCircle} mini width={24} />
            </button>

            
            <UserLink avatar={false} showInstance={true} user={item.moderatee} />
        </span>
        {/if}

    </div>


    <!---Details--->
    <div class="flex flex-row gap-1 text-xs w-full {$profile?.user ? 'lg:w-[40%]' : 'lg:w-[60%]'}">
            <div class="flex flex-col gap-2 text-xs w-full">
                <ModlogAction action={item.actionName} expires={item.expires} />

                <ul class="pl-4 text-xs">
                    {#if item.expires}
                        <li class="flex flex-nowrap gap-1">
                            <strong>Expires</strong>: {new Date(item.expires).toLocaleDateString()}
                        </li>
                    {/if}

                    {#if item.reason}
                        <li class="flex flex-nowrap gap-1">
                            <strong>Reason:</strong> {item.reason}
                        </li>
                    {/if}

                    {#if item.link || item.content}
                        <li class="flex flex-nowrap gap-1">
                            <strong>Item:</strong>
                            {#if item.link && item.content}
                                <Link href={item.link} highlight newtab={$userSettings.openInNewTab.links} title={item.content}> {item.content.substring(0, 250)} </Link>
                            {:else if item.content}
                                <span title="{item.content}">{item.content.substring(0,250)}</span>
                            {:else if item.link}
                                <Link href={item.link} highlight newtab={$userSettings.openInNewTab.links}/>
                            {/if}
                        </li>
                    {/if}
                </ul>
            </div>

            <!---Action Menu for mods/admins --->
            {#if item.actionName != 'purge' && (isAdmin($profile?.user) || (item.community && amMod($profile?.user, item.community))) }
                <Menu alignment="bottom-right" itemsClass="flex my-auto h-8 md:h-8" containerClass="!max-h-[90vh] max-w-[18rem]">
                
                    <Button color="tertiary" slot="button" let:toggleOpen on:click={toggleOpen} title="Action Menu">
                        <Icon src={Bars3} mini size="16" slot="icon" />
                    </Button>

                    <!---Items Available for Entries with a Moderatee--->
                    {#if item.moderatee}

                        <!---Ban/Unban Community--->
                        {#if item.community}
                            <MenuButton title="{item.actionName=='banCommunity' ? 'Unban Community' : 'Ban Community'}" on:click={() => banningCommunity = true}>    
                                <Icon mini width={14} src={ShieldExclamation} />
                                {item.actionName=='banCommunity' ? 'Unban Community' : 'Ban Community'}
                            </MenuButton>
                        {/if}
                        
                        <!---Ban/Unban Instance--->
                        {#if item.moderatee && isAdmin($profile?.user)}
                            <MenuButton title="{item.moderatee.banned ? 'Unban Instance' : 'Ban Instance'}" on:click={() => banningInstance = true}>
                                <Icon mini width={14} src={ShieldExclamation} />
                                {item.moderatee.banned ? 'Unban Instance' : 'Ban Instance'}
                            </MenuButton>
                        {/if}

                        <!---Convert Temp Instance Ban to Permanent--->
                        {#if item.moderatee && isAdmin($profile?.user) && item.moderatee.banned && item.expires}
                            <MenuButton title="Ban Permanently From Instance" on:click={() => {
                                if (item.moderatee) {
                                    // Temporarily set to not banned so the modal will react properly
                                    item.moderatee.banned = false
                                    banningInstance = true
                                }
                            }}>
                                <Icon mini width={14} src={ShieldExclamation} />
                                Ban Permanently
                            </MenuButton>
                        {/if}
                    {/if}

                    <!---Actions Available for Post Remove/Restore Actions--->
                    {#if item.post && item.community}

                        <!---Lock/Unlock Post Button--->
                        <MenuButton title="{item.post.locked ? 'Unlock' : 'Lock'}" on:click={async () => {
                            if (!item.post) return
                            item.post.locked = await lock(item.post, !item.post.locked)
                            goto(window.location.href, {invalidateAll: true })
                        }}>
                            <Icon mini width={14} src={item.post.locked ? LockOpen : LockClosed} />
                            {item.post.locked ? 'Unlock Post' : 'Lock Post'}
                        </MenuButton>
                        
                        <!---Remove/Restore Post Button-->
                        <MenuButton title="{item.post.removed ? 'Restore' : 'Remove'}"  on:click={async () => {removing = true}}>
                            <Icon mini width={14} src={item.post.removed ? ArrowUpTray : Trash} />
                            {item.post.removed ? 'Restore Post' : 'Remove Post'}
                        </MenuButton>

                        <!---Unfeature Post on Instance Button-->
                        {#if isAdmin($profile?.user) && item.post.featured_local }
                            <MenuButton title="Unpin Local" on:click={async () => {
                                if (item.post) {
                                    await pin(item.post, false, true)
                                    goto(window.location.href, {invalidateAll: true})
                                }
                            }}>
                                <Icon mini width={14} src={Megaphone} />
                                Unpin Local
                            </MenuButton>
                        {/if}

                        <!---Unfeature Post in Community Button-->
                        {#if amMod($profile?.user, item.community) && item.post.featured_community}
                            <MenuButton title="Unpin Community" on:click={async () => {
                                if (item.post) {
                                    await pin(item.post, false, false)
                                    goto(window.location.href, {invalidateAll: true})
                                }
                            }}>
                                <Icon mini width={14} src={Megaphone} />
                                Unpin Community
                            </MenuButton>
                        {/if}
                    {/if}

                    <!---Actions Available for Comment Remove/Restore Actions--->
                    {#if item.comment}
                        <!---Remove/Restore Post Button-->
                        <MenuButton title="{item.comment.removed ? 'Restore Comment' : 'Remove Comment'}" on:click={async () => {removingComment = true}}>
                            <Icon mini width={14} src={item.comment.removed ? ArrowUpTray : Trash} />
                            {item.comment.removed ? 'Restore Comment' : 'Remove Comment'}
                        </MenuButton>
                    {/if}
                </Menu>
                

            {/if}
            
            
                
            
        
            
            

    </div>
    

</div>
