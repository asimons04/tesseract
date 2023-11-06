<script lang="ts">
    import type { Community } from 'lemmy-js-client'

    import { addFavorite, isFavorite } from '$lib/favorites'
    import { amMod, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { fullCommunityName } from '$lib/util.js'
    import { goto } from '$app/navigation'
    import { profile } from '$lib/auth'
    import {  setSessionStorage } from '$lib/session.js'
    import { userSettings } from '$lib/settings.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'


    import {
        Icon,
        EllipsisVertical,
        PencilSquare,
        QueueList,
        Star
    } from 'svelte-hero-icons'

    export let community:Community
    export let hidden:boolean = false
    export let expanded:boolean = true;
    
    $: favorite = isFavorite(community)

    function createPost() {
        setSessionStorage('lastSeenCommunity', {
            id: community.id,
            name: fullCommunityName(community.name, community.actor_id),
        });
        
        // Hack to get the session storage to read on create post. "goto" wasn't picking up the change
        //let redir = new URL(window.location.href)
        //redir.pathname='/create/post';
        window.location.pathname='/create/post';
        
    }

</script>

<div class="inline-flex w-full" class:hidden={ hidden}>
    <Button
        class="hover:bg-slate-200 w-full h-max {expanded ? '' : '!p-1.5'}"
        color="tertiary"
        alignment="left"
        href="/c/{community.name}@{new URL(community.actor_id).hostname}"
        title="{community.title.replace('&amp;', '&')}@{new URL(community.actor_id).hostname}"
    >
        <div class="flex-none">
            <Avatar
                url={community.icon}
                alt={community.name}
                title={community.title}
                width={20}
                slot="icon"
            />
        </div>
        
        <span class="w-full break-words" class:hidden={!expanded}>
            {community.title.replace('&amp;', '&')}
        </span>

        <span class="ml-auto"/>

    </Button>
    
    {#if expanded}
    <Menu
        alignment="bottom-right"
        itemsClass="h-8 md:h-8"
        containerClass="!max-h-[90vh]"
    >
        <Button color="tertiary" slot="button" let:toggleOpen on:click={toggleOpen} title="Community Options">
            <Icon src={EllipsisVertical} mini size="16" slot="icon" />
        </Button>
        
        <span class="px-4 py-1 my-1 text-xs text-slate-600 dark:text-zinc-400">
            {community.title ?? community.name}
        </span>

        <!---Favorite/Unfavorite--->
        <MenuButton title="{favorite ? 'Remove from Favorites' : 'Add to Favorites'}" on:click={(e) => {e.stopPropagation(); addFavorite(community, !favorite)} }>
        
            <Icon src={Star} mini size="16" />
            {favorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </MenuButton>

        <!---Add to Group (Not yet implemented--->
        <MenuButton title="Add to Group" on:click={(e) => {e.stopPropagation(); addFavorite(community, !favorite)} }>
            <Icon src={QueueList} mini size="16" />
            Add to Group
        </MenuButton>

        <!---Create Post --->
        <MenuButton link href="/create/post"
            disabled={(community.posting_restricted_to_mods && !amMod($profile.user, community)) || community.removed}
            on:click={createPost}
            title="Create post"
        >
            <Icon src={PencilSquare} mini size="16" />
            Create Post
        </MenuButton>
    </Menu>
    {/if}
</div>