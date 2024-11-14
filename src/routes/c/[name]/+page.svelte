<script lang="ts">
    import type { ListingType, SortType } from 'lemmy-js-client';
    import type { FeedController } from '$lib/components/lemmy/feed/helpers.js'

    import { page } from '$app/stores';
    import { userSettings } from '$lib/settings'

    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import CommunityCardSmall from '$lib/components/lemmy/community/CommunityCardSmall.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import PostFeed from '$lib/components/lemmy/feed/PostFeed.svelte';
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
        
    export let data

    // Container for the bound variables from the feed component
    let feedController: FeedController = {} as FeedController
    let selectedSort: SortType = ($page.url.searchParams.get('sort') as SortType) ?? $userSettings.defaultSort.sort ?? 'New'
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
    sortMenu sortPreventDefault bind:selectedSortOption={selectedSort} 
     on:navChangeSort={(e) => {
        if (e?.detail && feedController.sort != e.detail) {
            feedController.sort = e.detail
        }
    }}
    scrollButtons scrollPreventDefault on:navScrollBottom={() => feedController.scrollBottom() } on:navScrollTop={() => feedController.scrollTop() }
    refreshButton refreshPreventDefault on:navRefresh={()=> feedController.refresh(true) } 
>
    <SiteSearch placeholder="Search {data.community.community_view.community.name}" community_id={data.community.community_view.community.id} slot="center"/>
</SubNavbar>

<MainContentArea>

    <div class="flex w-full" style="height: calc(100vh - 8rem);">
        <FeedContainer>
            <PostFeed actions type="All"
                bind:community_name={$page.params.name}  
                bind:controller={feedController} 
                bind:sort={selectedSort}
            >
                <!---Add the Site Banner to the top of the feed below 'xl' width--->
                <div class="flex xl:hidden flex-col w-full" slot="banner">    
                    <CommunityCardSmall community_view={data.community.community_view}/>
                </div>
            </PostFeed>
        </FeedContainer>
    </div>
    
    <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel" />
    
</MainContentArea>
