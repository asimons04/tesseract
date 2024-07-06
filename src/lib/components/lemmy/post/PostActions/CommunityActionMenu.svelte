<script lang="ts">
    // Note:  This component is deprecated as of 1.4.1 07/26/2024. All of these actions are accessible from the community 
    // profile modal.  Access it by clicking the community name in the post header.
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import type { Person, PostView } from 'lemmy-js-client'
    
    import {addFavorite, isFavorite } from '$lib/favorites'
    import { blockCommunity, createPost, subscribe } from '$lib/components/lemmy/community/helpers'
    import { createEventDispatcher } from 'svelte'
    import { goto } from '$app/navigation'
    import { instance } from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { userSettings } from '$lib/settings'
    
    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'

    import {
        Icon,
        Minus,
        Newspaper,
        NoSymbol,
        PencilSquare,
        QueueList,
        Rss,
        Star,
        User,
        UserGroup,
    } from 'svelte-hero-icons'


    export let post:PostView
    export let menuIconSize:number  = 16
    export let alignment:Alignment = $userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'
    export let suppressModal:boolean = false

    // Helpers for community groups
    let groups = {
        favorite: false,
        showModal: false
    }
    $: groups.favorite = isFavorite(post.community)

    const dispatch = createEventDispatcher()

    $: subscribed = ['Subscribed', 'Pending'].includes(post.subscribed)
    $: onHomeInstance = ($page.params.instance ?? $instance)  == $instance
</script>

<!---Community Group Modal--->
{#if !suppressModal}
    <AddCommunityGroup bind:open={groups.showModal} community={post.community} />
{/if}

<!---Community Actions Menu--->
<Menu {alignment} containerClass="overflow-auto">
    <Button slot="button" aria-label="Community Actions" let:toggleOpen on:click={toggleOpen} size="square-md" title="Community Actions" color="tertiary-border">
        <Icon slot="icon" src={UserGroup} width={menuIconSize} mini />
    </Button>

    <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1">
        {post.community.name}@{new URL(post.community.actor_id).hostname}
        <span class="ml-auto"/>
        <Icon slot="icon" src={UserGroup} width={16} mini />
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
    
    <!---Create Post--->
    {#if $profile?.user}
        <MenuButton on:click={() => createPost(post.community)} title="Create Post" color="info">
            <Icon src={PencilSquare} width={16} mini />
            Create Post
        </MenuButton>
    {/if}

    <!---Browse Community--->
    <MenuButton on:click={() => goto(`/c/${post.community.name}@${new URL(post.community.actor_id).hostname}`)} title="Browse {post.community.title || post.community.name}" color="info">
        <Icon src={QueueList} width={16} mini />
        Browse Community
    </MenuButton>
    
    
    {#if onHomeInstance}
        <!---Posts In This Community by This Creator--->
        <MenuButton link href="/search?type=All&q=%20&community_id={post.community.id}&person_id={post.creator.id}" title="Submissions in this community by this creator" color="info">
            <Icon src={User} mini size="16" />
            More from {post.creator.display_name ? post.creator.display_name : post.creator.name}@{new URL(post.creator.actor_id).hostname}
        </MenuButton>

        <!---Modlog--->
        <MenuButton link href="/modlog?community={post.community.id}" title="Modlog for {post.community.title}" color="info" >
            <Icon src={Newspaper} mini size="16" />
            Modlog
        </MenuButton>
    {/if}

    {#if $profile?.user}
        <!---Add/Remove to Favorites--->
        <MenuButton color="warning" on:click={ (e) => {
            groups.favorite = !groups.favorite
            addFavorite(post.community, groups.favorite)
        }}>
                <Icon src={Star} mini size="16" />
                {groups.favorite ? 'Un-Favorite Community' : 'Favorite Community'}
        </MenuButton>

        <!---Add to Group--->
        <MenuButton color="warning" title="Add/Remove to Group" on:click={(e) => {
                if (!suppressModal) {
                    groups.showModal=!groups.showModal
                } else {
                    dispatch('addGroup', true);
                }
            }}
        >
            <Icon src={UserGroup} mini size="16" />
            Add/Remove to Group(s)
        </MenuButton>

        <!---These only apply if not viewing on remote instance e.g./post/notyourinstance.xyz/12345 --->
        {#if onHomeInstance}
            <!---Subscribe/Unsubscribe--->    
            <MenuButton color="{subscribed ? 'dangerSecondary' : 'success'}" title="{subscribed ? 'Unsubscribe' : 'Subscribe'}" 
                on:click={async () => {
                    subscribed = await subscribe(post.community, subscribed)
                    subscribed = subscribed
                    subscribed
                        ? post.subscribed = 'Subscribed'
                        : post.subscribed = 'NotSubscribed'
                }}
            > 
                <Icon src={subscribed ? Minus : Rss} width={16} mini />
                {subscribed ? 'Unsubscribe' : 'Subscribe'}
            </MenuButton>
            

            <!---Block Community--->
            <MenuButton color="dangerSecondary" title="Block Community" on:click={(e) =>  blockCommunity(post.community.id) } >
                <Icon src={NoSymbol} mini size="16" />
                Block Community
            </MenuButton>
        {/if}
    {/if}

</Menu>