<script lang="ts">
    import type { CommunityView, CommunityModeratorView } from 'lemmy-js-client'
    
    import {addFavorite, isFavorite } from '$lib/favorites'

    import { addSubscription } from '$lib/lemmy/user.js'
    import { amMod, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { fullCommunityName } from '$lib/util.js'
    import { getClient, hideCommunity } from '$lib/lemmy.js'
    import { goto } from '$app/navigation';
    import {imageProxyURL} from '$lib/image-proxy'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    

    import {
        Calendar,
        ChatBubbleOvalLeftEllipsis,
        ChevronDoubleRight,
        Cog6Tooth,
        EllipsisHorizontal,
        EllipsisVertical,
        Eye,
        EyeSlash,
        HandRaised,
        Icon,
        InformationCircle,
        Minus,
        MinusCircle,
        Newspaper,
        PencilSquare,
        Plus,
        PlusCircle,
        QueueList,
        Rss,
        ShieldCheck,
        ShieldExclamation,
        Star,
        UserGroup,
    } from 'svelte-hero-icons'
    
    

    export let community_view: CommunityView
    export let moderators: Array<CommunityModeratorView> = []
    
    
    let sidebar: boolean = false
    let groupAddModal:boolean = false
    let expandModerators:boolean = false

    let loading = {
        blocking: false,
        hiding: false,
        removing: false,
        subscribing: false,
    }

    $: favorite = isFavorite(community_view.community)

    async function subscribe() {
        if (!$profile?.jwt) return
        loading.subscribing = true
        const subscribed = community_view.subscribed == 'Subscribed' || community_view.subscribed == 'Pending'
        try {
            await getClient().followCommunity({
                auth: $profile.jwt,
                community_id: community_view.community.id,
                follow: !subscribed,
            })
        } catch (error) {
            toast({ content: error as any, type: 'error' })
        }

        community_view.subscribed = subscribed ? 'NotSubscribed' : 'Subscribed'
        addSubscription(community_view.community, !subscribed)

        loading.subscribing = false
    }

    async function remove() {
        if (!$profile?.jwt) return
        loading.removing = true
        
        const removed = community_view.community.removed

        try {
            await getClient().removeCommunity({
                auth: $profile.jwt,
                community_id: community_view.community.id,
                removed: !removed,
            })
            community_view.community.removed = !removed
        } catch (error) {
            toast({ content: error as any, type: 'error' })
        }
        loading.removing = false
    }

    async function block() {
        if (!$profile?.jwt) return
        loading.blocking = true
        const blocked = community_view.blocked

        try {
            await getClient().blockCommunity({
                auth: $profile.jwt,
                community_id: community_view.community.id,
                block: !blocked,
            })
            community_view.blocked = !blocked
        } catch (error) {
            toast({ content: error as any, type: 'error' })
        }
      
        loading.blocking = false
        
        goto($page.url.toString(), {
            invalidateAll: true,
        })
    }

    async function hide() {
        if (!$profile?.jwt) return
        loading.hiding = true
        
        const hidden = community_view.community.hidden;
        try {
            await hideCommunity(community_view.community.id, !hidden); 
            community_view.community.hidden = !hidden

        } catch (error) {
            toast({content: error as any, type: 'error'})
        }
        loading.hiding = false;

        goto($page.url.toString(), {
            invalidateAll: true,
        })
    }

</script>


<!---Community Info Modal--->
<Modal bind:open={sidebar}>
    <span slot="title">{community_view.community.title.replace('&amp;', '&')}</span>
    <div class="mx-auto">

        {#if moderators.length > 0}
            <div class="flex flex-col gap-1 mt-2 mb-4">
                <Button
                    color="tertiary"
                    alignment="left"
                    on:click={ ()=> { expandModerators = !expandModerators}}
                 >
                    
                    <Icon src={HandRaised} mini size="18" />
        
                    <span class="w-full flex flex-row justify-between">
                        Moderators
                        <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                            {moderators.length}
                        </span>
                    </span>
                </Button>
                
                <div class="flex flex-col gap-2 pl-4" class:hidden={!expandModerators}>
                    {#each moderators as moderator}
                        <UserLink user={moderator.moderator} avatar={true} />
                    {/each}
                </div>
            </div>
        {/if}
        
        {#if community_view.community.description}
            <h1 class="font-bold text-xl">About Community</h1>
            <hr class="border-slate-300 dark:border-zinc-800 my-1" />
            <Markdown source={community_view.community.description} />
        {/if}
    </div>
</Modal>

<!---Modal to Add Community to a Group--->
<div class="z-20">
    <AddCommunityGroup bind:open={groupAddModal} community={community_view.community} />
</div>




<!--- Hideable div to contain the main part of the community sidebar --->
<StickyCard class="mb-3 {(!$userSettings.uiState.expandCommunitySidebar && window.innerWidth > 640) ? 'hidden' : ''} " >
    <Card backgroundImage={($userSettings.uiState.showBannersInCards && community_view?.community?.banner) ? imageProxyURL(community_view.community.banner, '384', 'webp') : ''}>
        <div class="flex flex-col gap-2 h-full">
            <!--- Commuinity Avatar, display name, and federation name--->
            <div class="flex flex-row gap-3 items-start p-3">
                <div class="flex-shrink-0">
                    <Avatar
                        width={48}
                        url={community_view.community.icon}
                        alt={community_view.community.name}
                    />
                </div>
                
                
                <div class="flex flex-col gap-0 w-full">
                    <div class="flex flex-row">
                        <h1 class="font-bold text-xl">
                            <a href="/c/{community_view.community.name}@{new URL(community_view.community.actor_id).hostname}" title="{community_view.community.name}">
                                {community_view.community.title.replace('&amp;', '&')}
                            </a>
                        </h1>

                        <!---Community Action Menu --->
                        <div class="ml-auto">
                            <!--- Community Info Modal--->                
                            <Menu
                                alignment="bottom-right"
                                itemsClass="h-8 md:h-8"
                                containerClass="!max-h-[90vh]"
                            >
                                <Button color="tertiary" slot="button" let:toggleOpen on:click={toggleOpen} title="Community Options">
                                    <Icon src={EllipsisVertical} mini size="16" slot="icon" />
                                </Button>
                                
                                <span class="px-4 py-1 my-1 text-xs text-slate-600 dark:text-zinc-400">
                                    Community Actions
                                </span>

                                {#if $profile?.jwt}
                                <!---Create Post --->
                                <MenuButton link href="/create/post"
                                    disabled={
                                        (community_view.community.posting_restricted_to_mods && !amMod($profile.user, community_view.community)) || 
                                        community_view.community.removed
                                    }
                                    title="Create post"
                                >
                                    <Icon src={PencilSquare} mini size="16" />
                                    Create Post
                                </MenuButton>
                                {/if}

                                <!---Community Info Modal--->
                                <span class="xl:hidden">
                                    <MenuButton
                                        on:click={() => (sidebar = !sidebar)} 
                                        title="Community Info"
                                    >
                                        <Icon src={InformationCircle} mini width={16}/>
                                        Community Info
                                    </MenuButton>
                                </span>

                                <!---Modlog--->
                                <MenuButton link
                                    href="/modlog?community={community_view.community.id}"
                                    title="Modlog for {community_view.community.title}"
                                >
                                    <Icon src={Newspaper} mini size="16" />
                                    Community Modlog
                                </MenuButton>
                                
                                {#if $profile?.jwt}
                                    <!--- Subscribe/Unsubscribe--->
                                    <MenuButton disabled={loading.subscribing || community_view.community.removed } loading={loading.subscribing}>
                                        <span class="flex flex-row gap-2 w-full" on:click={ (e) => {
                                            e.stopPropagation();
                                            subscribe();
                                        }}>
                                            <Icon src={community_view.subscribed == 'Subscribed' ? Minus : Rss} mini size="16" />
                                            {
                                                community_view.subscribed == 'Subscribed' || community_view.subscribed == 'Pending'
                                                ? 'Unsubscribe'
                                                : 'Subscribe'
                                            }
                                        </span>
                                    </MenuButton>

                                    <!--- Add/Remove Favorite--->
                                    <MenuButton>
                                        <span class="flex flex-row gap-2 w-full" on:click={ (e) => {
                                            e.stopPropagation();
                                            favorite = !favorite
                                            addFavorite(community_view.community, favorite)
                                        }}>
                                            <Icon src={Star} mini size="16" />
                                            {favorite ? 'Remove Favorite' : 'Add Favorite'}
                                        </span>
                                    </MenuButton>

                                    <!---Add to Group--->
                                    <MenuButton title="Add/Remove to Group" on:click={(e) => {e.stopPropagation(); groupAddModal=!groupAddModal} }>
                                        <Icon src={QueueList} mini size="16" />
                                        Add/Remove to Group(s)
                                    </MenuButton>
                                    
                                    <!--- Block/Unblock Community --->
                                    <MenuButton disabled={loading.blocking || community_view.community.removed} loading={loading.blocking} color="dangerSecondary">
                                        <span class="flex flex-row gap-2 w-full" on:click={(e) => { 
                                            e.stopPropagation(); 
                                            block(); 
                                        }}>
                                            <Icon src={community_view.blocked  ? ShieldCheck : ShieldExclamation} mini size="16" />
                                            {community_view.blocked ? 'Unblock' : 'Block'} Community
                                        </span>
                                    </MenuButton>
                                {/if}
                                
                                <!--- Admin-Remove-Community--->
                                {#if $profile.user && isAdmin($profile.user)}
                                    <MenuButton disabled={loading.removing} loading={loading.removing} color="dangerSecondary">
                                        <span class="flex flex-row gap-2 w-full" on:click={(e) => { 
                                            e.stopPropagation(); 
                                            remove(); 
                                        }}>

                                            <Icon src={community_view.community.removed  ? PlusCircle : MinusCircle} mini size="16" />
                                            {community_view.community.removed ? 'Restore' : 'Remove'} Community
                                        </span>
                                    </MenuButton>

                                    <!--- Hide/Unhide Community --->
                                    <MenuButton disabled={loading.hiding} loading={loading.hiding} color="dangerSecondary">
                                        <span class="flex flex-row gap-2 w-full" on:click={(e) => { 
                                            e.stopPropagation(); 
                                            hide();
                                        }}>
                                            <Icon src={community_view.community.hidden  ? Eye : EyeSlash} mini size="16" />
                                            {community_view.community.hidden ? 'Unhide' : 'Hide'} Community
                                        </span>
                                    </MenuButton>
                                {/if}
                                
                                <!--- Settings --->
                                {#if $profile.user && amMod($profile.user, community_view.community)}
                                    <MenuButton link
                                        href="/c/{fullCommunityName(
                                            community_view.community.name,
                                            community_view.community.actor_id
                                        )}/settings"
                                        title="Edit Community"
                                    >
                                        <Icon src={Cog6Tooth} mini size="16" />
                                        Community Settings
                                    </MenuButton>
                                {/if}                
                            </Menu>
                        </div>
                        <!--- End Community Action Menu --->
                    </div>
                        
                    <span class="dark:text-zinc-400 text-slate-600 text-xs">
                        !{community_view.community.name}@{new URL(community_view.community.actor_id).hostname}
                    </span>
                </div>
            </div>


            <div class="mt-auto"/>

            <!-- Community subscribers, counts, etc --->
            <div class="flex flex-row p-3 mx-auto">
                <div class="text-sm flex flex-row flex-wrap gap-8 mx-auto">
                    <span class="flex flex-row items-center gap-2" title="Created">
                        <Icon src={Calendar} width={16} height={16} mini />
                        <RelativeDate date={community_view.community.published} />
                    </span>

                    <span class="flex flex-row items-center gap-2" title="Subscribers">
                        <Icon src={UserGroup} width={16} height={16} mini />
                        <FormattedNumber number={community_view.counts.subscribers} />
                    </span>

                    <span class="flex flex-row items-center gap-2" title="Posts">
                        <Icon src={PencilSquare} width={16} height={16} mini />
                        <FormattedNumber number={community_view.counts.posts} />
                    </span>

                    <span class="flex flex-row items-center gap-2" title="Comments">
                        <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                        <FormattedNumber number={community_view.counts.comments} />
                    </span>
                </div>
            </div>
        </div>

        
    </Card>
        
    <!--- Convenience button to create post --->
    <div class="w-full mt-2 mb-2 flex flex-col gap-2 hidden xl:flex">
        {#if $profile?.jwt}
            <Button
                href="/create/post"
                color="primary"
                size="lg"
                hidden={
                    (community_view.community.posting_restricted_to_mods && !amMod($profile.user, community_view.community)) || 
                    community_view.community.removed
                }
                
            >
                <Icon src={PencilSquare} mini size="16" slot="icon" />
                Create Post
            </Button>

            <Button 
                color="primary"
                size="lg"
                disabled={loading.subscribing || community_view.community.removed } 
                loading={loading.subscribing}
                on:click={ (e) => {
                    e.stopPropagation();
                    subscribe();
                }}
            >
                <Icon
                    src={community_view.subscribed == 'Subscribed' ? Minus : Rss}
                    mini
                    size="16"
                />
                {
                    (community_view.subscribed == 'Subscribed' || community_view.subscribed == 'Pending')
                        ? 'Unsubscribe'
                        : 'Subscribe'
                }
            </Button>
        {/if}
    </div>

    <div class="hidden  xl:block">
        {#if moderators.length > 0}
            <div class="flex flex-col gap-1 mt-2 mb-4">
                <Button
                    color="tertiary"
                    alignment="left"
                    on:click={ ()=> { expandModerators = !expandModerators}}
                 >
                    
                    <Icon src={HandRaised} mini size="18" />
        
                    <span class="w-full flex flex-row justify-between">
                        Moderators
                        <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                            {moderators.length}
                        </span>
                    </span>
                </Button>
                
                <div class="flex flex-col gap-2 pl-4" class:hidden={!expandModerators}>
                    {#each moderators as moderator}
                        <UserLink user={moderator.moderator} avatar={true} />
                    {/each}
                </div>
            </div>
        {/if}
        
        {#if community_view.community.description}
            <div class="flex flex-col gap-1">
                <Markdown source={community_view.community.description} />
            </div>
        {/if}
        
        <!-- Spacer block to give community action menu room to expand --->
        <div class="hidden xl:block h-[150px]" />

    </div>

</StickyCard>
