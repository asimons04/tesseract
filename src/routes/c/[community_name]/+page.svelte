<script lang="ts">
    import type { ListingType, SortType } from 'lemmy-js-client';
    import type { FeedController } from '$lib/components/lemmy/feed/helpers.js'

    import { page } from '$app/stores';
    import { userSettings } from '$lib/settings'

    import CommunityCard                from '$lib/components/lemmy/community/CommunityCard.svelte'
    import CommunityCardSmall           from '$lib/components/lemmy/community/CommunityCardSmall.svelte'
    import CommunityCreatePostButton    from '$lib/components/lemmy/community/CommunityCreatePostButton.svelte'
    import CommunitySubscribeButton     from '$lib/components/lemmy/community/CommunitySubscribeButton.svelte'
    import MainContentArea              from '$lib/components/ui/containers/MainContentArea.svelte'
    import PostFeed                     from '$lib/components/lemmy/feed/PostFeed.svelte'
    import SiteSearch                   from '$lib/components/ui/subnavbar/SiteSearch.svelte'
    import SubNavbar                    from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import { communityProfileModal } from '$lib/components/lemmy/moderation/moderation';
    import { EllipsisVertical } from 'svelte-hero-icons';
    import Button from '$lib/components/input/Button.svelte';
        
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

{#if data?.community}
    <SubNavbar home back quickSettings toggleMargins toggleCommunitySidebar compactSwitch
        scrollButtons scrollPreventDefault on:navScrollBottom={() => feedController.scrollBottom() } on:navScrollTop={() => feedController.scrollTop() }
        refreshButton refreshPreventDefault on:navRefresh={()=> feedController.refresh(true) } 
    >
        <div class="hidden lg:flex" slot="center">
            <SiteSearch placeholder="Search {data.community.community_view.community.name}" community_id={data.community.community_view.community.id} />
        </div>
    </SubNavbar>


    <MainContentArea>

        <div class="flex w-full" style="height: calc(100vh - 8.2rem);">
            
            <PostFeed actions type="All"
                bind:community_name={$page.params.community_name}  
                bind:controller={feedController} 
                bind:sort={selectedSort}
            >
                <!---Add the Site Banner to the top of the feed below 'xl' width--->
                <div class="flex 2xl:hidden flex-col mx-auto w-full max-w-[820px]" slot="banner">    
                    <CommunityCardSmall community_view={data.community.community_view}/>
                    
                    <!--- Convenience buttons --->
                    <div class="w-full mt-2 flex flex-row gap-2">

                        <!---Create Post--->
                        <CommunityCreatePostButton community_view={data.community.community_view} class="w-[45%]" />

                        <!---Subscrube/UnSubscribe--->
                        <CommunitySubscribeButton community_view={data.community.community_view} class="w-[45%]" />

                        <!---Bring Up Community Modal--->
                        <Button color="tertiary-border" class="w-[10%]" size="square-lg" icon={EllipsisVertical} iconSize={20}  title="Community Actions"
                            on:click={() => {
                                communityProfileModal(data.community.community_view.community)
                            }}
                        />
                    </div>
                </div>
            </PostFeed>
            
        </div>
        
        <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel" />
        
    </MainContentArea>
{/if}