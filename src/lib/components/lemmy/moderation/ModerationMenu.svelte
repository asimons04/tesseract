<script lang="ts">
    
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import type { CommentView, PostView } from 'lemmy-js-client'
    
    import { amMod, isAdmin, remove } from './moderation'
    import type { ButtonColor } from '$lib/ui/colors.js'
    import { getClient } from '$lib/lemmy'
    import { isPostView } from '$lib/lemmy/item.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import BanCommunityModal from '$lib/components/lemmy/moderation/BanCommunityModal.svelte'
    import BanInstanceModal from '$lib/components/lemmy/moderation/BanInstanceModal.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import RemoveModal from '$lib/components/lemmy/moderation/RemoveModal.svelte'

    import {
        Fire,
        Icon,
        InformationCircle,
        LockClosed,
        LockOpen,
        Megaphone,
        Newspaper,
        ShieldExclamation,
        Trash,
    } from 'svelte-hero-icons'
    
    

    export let item: PostView | CommentView
    export let color:ButtonColor = "tertiary-border"
    export let alignment:Alignment = $userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'
    export let menuIconSize:number = 16

    let locking = false
    let pinning = false
    let removing = false
    let purging = false
    let banningInstance = false
    let banningCommunity = false

    $: acting = locking || pinning || removing || purging || banningInstance || banningCommunity

    async function lock(lock: boolean) {
        if (!$profile?.jwt || !isPostView(item)) return
        locking = true

        try {
            await getClient().lockPost({
                auth: $profile.jwt,
                locked: lock,
                post_id: item.post.id,
            })

            item.post.locked = lock

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
    }

    async function pin(pinned: boolean, toInstance: boolean = false) {
        if (!$profile?.jwt || !isPostView(item)) return
        pinning = true

        try {
            await getClient().featurePost({
                feature_type: toInstance ? 'Local' : 'Community',
                auth: $profile.jwt,
                featured: pinned,
                post_id: item.post.id,
            })
            item.post.featured_community = pinned

            toast({
                content: `Successfully ${pinned ? 'pinned' : 'unpinned'} that post. You must refresh to see changes.`,
                type: 'success',
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
        pinning = false
    }
</script>

<RemoveModal bind:open={removing} bind:item bind:purge={purging} reason='' />

<BanInstanceModal bind:open={banningInstance} bind:banned={item.creator.banned} bind:user={item.creator} />

<BanCommunityModal bind:open={banningCommunity} bind:banned={item.creator_banned_from_community} bind:user={item.creator} bind:community={item.community}/>

<Menu alignment={alignment}>
    <Button
        on:click={toggleOpen}
        slot="button"
        title="Moderation Menu"
        size="square-md"
        color={color}
        loading={acting}
        let:toggleOpen
        {...$$restProps}
    >
        <svg
            width="{menuIconSize.toString()}"
            height="{menuIconSize.toString()}"
            viewBox="0 0 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            slot="icon"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.516 1.17C10.3767 1.03791 10.192 0.964283 10 0.964283C9.80801 0.964283 9.62333 1.03791 9.484 1.17C7.36127 3.18588 4.53412 4.29133 1.607 4.25C1.44753 4.24793 1.29156 4.29674 1.16172 4.38935C1.03189 4.48196 0.934957 4.61355 0.885 4.765C0.462973 6.05116 0.248618 7.39637 0.25 8.75C0.25 14.692 4.314 19.683 9.813 21.098C9.93566 21.1296 10.0643 21.1296 10.187 21.098C15.686 19.683 19.75 14.692 19.75 8.75C19.75 7.36 19.527 6.02 19.115 4.765C19.0652 4.61336 18.9684 4.48156 18.8385 4.38875C18.7087 4.29595 18.5526 4.247 18.393 4.249L18.25 4.25C15.254 4.25 12.533 3.08 10.516 1.17Z"
                fill="currentColor"
            />
        </svg>
    </Button>

    {#if ($profile?.user && amMod($profile.user, item.community)) || ($profile?.user && isAdmin($profile.user))}
        
        <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1">
            Moderation
            <span class="ml-auto" />
            <Icon slot="icon" src={ShieldExclamation} width={16} mini />
        </li>
        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        
        <!--- Modlog filtered for this user--->
        <MenuButton link
            href="/modlog?other_person_id={item.creator.id}"
            title="Modlog for {item.creator.display_name ?? item.creator.name}"
        >
            <Icon src={Newspaper} mini size="16" />
            User Modlog
        </MenuButton>


        <!--- Mod Feature Post Community--->
        <MenuButton
            on:click={() =>
                pin(isPostView(item) ? !item.post.featured_community : false)
            }
            loading={pinning}
            disabled={pinning}
        >
            <Icon src={Megaphone} size="16" mini />
            <div class="flex flex-row gap-2 text-left items-center justify-between w-full">
                <span>{item.post.featured_community ? 'Unfeature' : 'Feature'}</span>
                <span class="text-xs opacity-80">Community</span>
            </div>
        </MenuButton>
        
        <!--- Admin Feature Post on Instance--->
        {#if isAdmin($profile.user)}
            <MenuButton
                on:click={() =>
                    pin(isPostView(item) ? !item.post.featured_local : false, true)
                }
            >
                <Icon src={Megaphone} size="16" mini />
                <div class="flex flex-row gap-2 text-left items-center justify-between w-full">
                    <span>{item.post.featured_local ? 'Unfeature' : 'Feature'}</span>
                    <span class="text-xs opacity-80">Instance</span>
                </div>
            </MenuButton>
        {/if}

        <!--- Lock Post--->
        <MenuButton on:click={() => lock(!item.post.locked)} loading={locking} disabled={locking} >
            <Icon mini size="16" slot="icon" src={item.post.locked ? LockOpen : LockClosed} />
            {item.post.locked ? 'Unlock Post' : 'Lock Post'}
        </MenuButton>

        <!--- Mod/Admin Restore/Remove Post --->
        <MenuButton on:click={() => { removing = true }}>
            <Icon src={Trash} size="16" mini />
            {item.post.removed ? 'Restore Post' : 'Remove Post'}
        </MenuButton>
    
        <!---Hide ban from community option for own posts--->
        {#if $profile?.user && $profile.user.local_user_view.person.id != item.creator.id}
            <MenuButton on:click={() => banningCommunity = true} >
                <Icon src={ShieldExclamation} size="16" mini />
                {
                    item.creator_banned_from_community
                    ? 'Unban from Community'
                    : 'Ban from Community'
                }
            </MenuButton>
        {/if}

        <!--- Admin Only Options--->
        {#if isAdmin($profile.user)}
            <MenuButton on:click={() => remove(item, true)}>
                <Icon src={Fire} size="16" mini />
                Purge Post
            </MenuButton>

            <!--Hide ban button if viewing own profile--->
            {#if item.creator.id != $profile.user.local_user_view.person.id}
                <MenuButton on:click={() => banningInstance = true } >
                    <Icon slot="icon" mini size="16" src={ShieldExclamation} />
                    {item.creator.banned ? 'Unban from Instance' : 'Ban from Instance'}
                </MenuButton>
            {/if}
        {/if}

    {/if}
</Menu>
