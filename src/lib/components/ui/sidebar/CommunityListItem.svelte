<script lang="ts">
    import type { Community } from 'lemmy-js-client'
    
    import { isFavorite, addFavorite } from '$lib/favorites'
    import { onDestroy } from 'svelte'
    import { userSettings } from '$lib/settings'
    
    import Avatar from '../Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte';

    import {
        Icon,
        Star
    } from 'svelte-hero-icons'

    export let community:Community
    export let hidden:boolean = false
    export let expanded:boolean = true;
    export let showFavoriteButton: boolean = true

    let favorite = false
    $:  community, favorite = isFavorite(community)
    $:  avatarSize = expanded ? 28 : 20

    let button: any

    onDestroy(() => {
        if (button?.remove) button.remove()
        button = null
    })
</script>


<Button {hidden}
    bind:this={button}
    class="!text-xs hover:bg-slate-200 w-full h-max {expanded ? '' : '!p-1.5'}"
    color="tertiary"
    alignment="{expanded ? 'left' : 'center'}"
    href="/c/{community.name}@{new URL(community.actor_id).hostname}"
    title="{community.title.replace('&amp;', '&')}@{new URL(community.actor_id).hostname}"
>
    <div class="flex flex-row gap-2 w-full items-center">
        <span style="width: {expanded ? `calc(100% - 50px - ${avatarSize}px)` : `${avatarSize}px`}">
            <CommunityLink {community}
                boldCommunityName={true} 
                avatar={true}
                avatarBackground={true}
                avatarSize={avatarSize}
                maxNameLength={30} 
                inline={false} 
                showInstance={$userSettings.uiState.showInstancesSidebarCommunityList}
                bind:name={expanded}
                href={!expanded}
            />
        </span>

        <!---Favorites Button--->
        {#if expanded && showFavoriteButton}
            <Button color="tertiary" title="{favorite ? 'Un-Favorite' : 'Add Favorite'}" 
                icon={Star} iconSize={24}
                class="ml-auto hover:scale-125 {favorite ? '!text-amber-500' : ''}"
                on:click={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    addFavorite(community, !favorite)
                }}
            />
        {/if}

    </div>
    
        
        
        
    




</Button>