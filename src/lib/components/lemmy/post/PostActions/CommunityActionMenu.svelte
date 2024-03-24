<script lang="ts">
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import type { PostView } from 'lemmy-js-client'
    
    import {addFavorite, isFavorite } from '$lib/favorites'
    import { blockCommunity, createPost, subscribe } from '$lib/components/lemmy/community/helpers'
    import { createEventDispatcher } from 'svelte'
    import { goto } from '$app/navigation'
    import { profile } from '$lib/auth'
    
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
        UserGroup,
    } from 'svelte-hero-icons'


    export let post:PostView
    export let menuIconSize:number  = 16
    export let alignment:Alignment = 'top-right'

    export let suppressModal:boolean = false

    // Helpers for community groups
    let groups = {
        favorite: false,
        showModal: false
    }
    $: groups.favorite = isFavorite(post.community)

    const dispatch = createEventDispatcher()

    let subscribed:boolean = ['Subscribed', 'Pending'].includes(post.subscribed)
</script>

<!---Community Group Modal--->
{#if !suppressModal}
    <AddCommunityGroup bind:open={groups.showModal} community={post.community} />
{/if}

<!---Community Actions Menu--->
<Menu {alignment} containerClass="overflow-auto">
    <Button
        slot="button"
        aria-label="Community Actions"
        let:toggleOpen
        on:click={toggleOpen}
        
        size="square-md"
        title="Community Actions"
        color="tertiary-border"
    >
        <Icon slot="icon" src={UserGroup} width={menuIconSize} mini />
    </Button>

    <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1">
        {post.community.name}@{new URL(post.community.actor_id).hostname}
        <span class="ml-auto"/>
        <Icon slot="icon" src={UserGroup} width={16} mini />
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
    
    {#if $profile?.user}
    <MenuButton on:click={() => createPost(post.community)} title="Create Post">
        <Icon src={PencilSquare} width={16} mini />
        Create Post
    </MenuButton>
    {/if}

    <MenuButton on:click={() => goto(`/c/${post.community.name}@${new URL(post.community.actor_id).hostname}`)} title="Browse {post.community.title || post.community.name}">
        <Icon src={QueueList} width={16} mini />
        Browse Community
    </MenuButton>

    <!---Modlog--->
    <MenuButton link href="/modlog?community={post.community.id}" title="Modlog for {post.community.title}" >
        <Icon src={Newspaper} mini size="16" />
        Community Modlog
    </MenuButton>

    {#if $profile?.user}
        <!---Add/Remove to Favorites--->
        <MenuButton>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="flex flex-row gap-2 w-full" on:click={ (e) => {
                //e.stopPropagation();
                groups.favorite = !groups.favorite
                addFavorite(post.community, groups.favorite)
            }}>
                <Icon src={Star} mini size="16" />
                {groups.favorite ? 'Un-Favorite Community' : 'Favorite Community'}
            </span>
        </MenuButton>

        <!---Add to Group--->
        <MenuButton title="Add/Remove to Group" on:click={(e) => {
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

        <MenuButton title="{subscribed ? 'Unsubscribe' : 'Subscribe'}" 
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
        <MenuButton title="Block Community" on:click={(e) =>  blockCommunity(post.community.id) } >
            <Icon src={NoSymbol} mini size="16" />
            Block {post.community.name}@{new URL(post.community.actor_id).hostname}
        </MenuButton>
    {/if}

</Menu>