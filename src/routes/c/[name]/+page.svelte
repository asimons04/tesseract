<script lang="ts">
    import type { FeedController } from '$lib/components/lemmy/modal/components/helpers.js'

    import { page } from '$app/stores';
        
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import CommunityFeed from '$lib/components/lemmy/modal/components/CommunityFeed.svelte';
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
        
    export let data
      

    // Container for the bound variables from the feed component
    let feedController: FeedController = {} as FeedController

</script>


<svelte:head>
    <title>{data?.community?.community_view.community.title ?? "Community Not Found"}</title>

    <meta name="og:title"
        content={data?.community?.community_view.community.title ?? "Community Not Found"}
    />
    {#if data?.community?.community_view.community.description}
        <meta name="og:description" content={data.community.community_view.community.description}/>
    {/if}
</svelte:head>


<SubNavbar back quickSettings toggleMargins toggleCommunitySidebar compactSwitch
    sortMenu sortPreventDefault selectedSortOption={feedController?.sort } 
     on:navChangeSort={(e) => {
        if (e?.detail && feedController.sort != e.detail) {
            feedController.sort = e.detail
            feedController.refresh(true)
        }
    }}

    scrollButtons scrollPreventDefault on:navScrollBottom={() => feedController.scrollBottom() } on:navScrollTop={() => feedController.scrollTop() }


    refreshButton refreshPreventDefault on:navRefresh={()=> feedController.refresh(true) } 
>
    <SiteSearch placeholder="Search {data.community.community_view.community.name}" community_id={data.community.community_view.community.id} slot="center"/>
</SubNavbar>

<MainContentArea>

    <div class="flex w-full" style="height: calc(100vh - 9rem);">
        <FeedContainer>
            <CommunityFeed actions community_name={$page.params.name}  bind:controller={feedController} />
        </FeedContainer>
    </div>
    
    <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel" />
    
</MainContentArea>
