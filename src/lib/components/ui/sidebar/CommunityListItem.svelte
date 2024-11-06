<script lang="ts">
    import type { Community } from 'lemmy-js-client'
    
    import { isFavorite, addFavorite } from '$lib/favorites'
    import { userSettings } from '$lib/settings'
    
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
    $: community, favorite = isFavorite(community)
</script>


<Button {hidden}
    class="!text-xs hover:bg-slate-200 w-full h-max {expanded ? '' : '!p-1.5'}"
    color="tertiary"
    alignment="left"
    href="/c/{community.name}@{new URL(community.actor_id).hostname}"
    title="{community.title.replace('&amp;', '&')}@{new URL(community.actor_id).hostname}"
>
    <CommunityLink bind:community class="!w-fit"
        boldCommunityName={true} 
        avatarSize={expanded ? 28 : 20} 
        avatar 
        avatarBackground
        maxNameLength={30} 
        inline={false} 
        showInstance={$userSettings.uiState.showInstancesSidebarCommunityList}
        bind:name={expanded}
        href={!expanded}
    />
    
    <!---Favorites Button--->
    {#if expanded && showFavoriteButton}
        <span class="ml-auto" />
        <Button color="tertiary" title="{favorite ? 'Un-Favorite' : 'Add Favorite'}" on:click={(e) => {
            e.preventDefault()
            e.stopPropagation()
            addFavorite(community, !favorite)
        }}>
            <Icon src={Star} width={24} mini class="hover:scale-125 {favorite ? 'text-amber-500' : ''}"/>
        </Button>
    {/if}




</Button>