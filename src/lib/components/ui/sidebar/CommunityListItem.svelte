<script lang="ts">
    import type { Community } from 'lemmy-js-client'

    import { addFavorite, isFavorite } from '$lib/favorites'
    import { flip } from 'svelte/animate'
    import { expoOut } from 'svelte/easing'
    import { slide, fade } from 'svelte/transition'
    import { userSettings } from '$lib/settings.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'


    import {
        Icon,
        EllipsisVertical,
        QueueList,
        Star
    } from 'svelte-hero-icons'

    export let community:Community
    export let hidden:boolean = false
    export let expanded:boolean = true;
    
    $: favorite = isFavorite(community)

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
        alignment="left"
        itemsClass="h-8 md:h-8"
        containerClass="!max-h-[90vh]"
    >
        <Button color="tertiary" slot="button" let:toggleOpen on:click={toggleOpen} title="Community Options">
            <Icon src={EllipsisVertical} mini size="16" slot="icon" />
        </Button>
        
        <span class="px-4 py-1 my-1 text-xs text-slate-600 dark:text-zinc-400">
            {community.title ?? community.name}
        </span>

        <MenuButton title="{favorite ? 'Remove from Favorites' : 'Add to Favorites'}" on:click={(e) => {e.stopPropagation(); addFavorite(community, !favorite)} }>
        
            <Icon src={Star} mini size="16" />
            {favorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </MenuButton>

        <MenuButton title="Add to Group" on:click={(e) => {e.stopPropagation(); addFavorite(community, !favorite)} }>
            <Icon src={QueueList} mini size="16" />
            Add to Group
        </MenuButton>
    </Menu>
    {/if}
</div>