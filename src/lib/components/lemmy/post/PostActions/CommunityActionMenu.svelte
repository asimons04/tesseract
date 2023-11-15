<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import {addFavorite, isFavorite } from '$lib/favorites'
    import { blockCommunity, createPost, subscribe } from '$lib/components/lemmy/community/helpers'
    import { goto } from '$app/navigation'

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


    // Helpers for community groups
    let groups = {
        favorite: false,
        showModal: false
    }
    $: groups.favorite = isFavorite(post.community)

    let subscribed:boolean = ['Subscribed', 'Pending'].includes(post.subscribed)
</script>

<!---Community Group Modal--->
<AddCommunityGroup bind:open={groups.showModal} community={post.community} />

<!---Community Actions Menu--->
<Menu alignment="top-right" containerClass="overflow-auto">
    <Button
        slot="button"
        aria-label="Community Actions"
        let:toggleOpen
        on:click={toggleOpen}
        class="hover:text-inherit !border-none"
        size="square-md"
        title="Community Actions"
        color="ghost"
    >
        <Icon slot="icon" src={UserGroup} width={16} mini />
    </Button>

    <li class="flex flex-row gap-1 items-center ml-2 text-xs opacity-80 text-left font-bold my-1 py-1">
        <Icon slot="icon" src={UserGroup} width={16} mini />
        {post.community.name}@{new URL(post.community.actor_id).hostname}
    </li>

    <MenuButton on:click={() => createPost(post.community)} title="Create Post">
        <Icon src={PencilSquare} width={16} mini />
        Create Post
    </MenuButton>

    <MenuButton on:click={() => goto(`/c/${post.community.name}@${new URL(post.community.actor_id).hostname}`)} title="Browse {post.community.title || post.community.name}">
        <Icon src={QueueList} width={16} mini />
        Browse Community
    </MenuButton>

    <!---Modlog--->
    <MenuButton link href="/modlog?community={post.community.id}" title="Modlog for {post.community.title}" >
        <Icon src={Newspaper} mini size="16" />
        Community Modlog
    </MenuButton>

    <!---Add/Remove to Favorites--->
    <MenuButton>
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
    <MenuButton title="Add/Remove to Group" on:click={(e) => {groups.showModal=!groups.showModal} }>
        <Icon src={UserGroup} mini size="16" />
        Add/Remove to Group(s)
    </MenuButton>

    <MenuButton title="{subscribed ? 'Unsubscribe' : 'Subscribe'}" 
        on:click={async () => {
            subscribed = await subscribe(post.community, subscribed, true)
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
    <MenuButton title="Block Community" color="dangerSecondary" on:click={(e) =>  blockCommunity(post.community.id) } >
        <Icon src={NoSymbol} mini size="16" />
        Block {post.community.name}@{new URL(post.community.actor_id).hostname}
    </MenuButton>

</Menu>