<script context="module">
    const moduleName = '/+page.svelte';
</script>

<script lang="ts">
    import type { FeedController } from '$lib/components/lemmy/feed/helpers.js';
    import type { ListingType, SortType } from 'lemmy-js-client';
    
    import { amModOfAny } from '$lib/components/lemmy/moderation/moderation';
    import { profile } from '$lib/auth'
    import { userSettings } from '$lib/settings'
    
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import PostFeed from '$lib/components/lemmy/feed/PostFeed.svelte';
    import SiteCardSmall from '$lib/components/lemmy/SiteCardSmall.svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import Markdown from '$lib/components/markdown/Markdown.svelte';

    export let data
    
    // These exist so the subnavbar component can bind/export its values to them and so we can modify them to add/remove moderator view
    let listingTypeOptions: ListingType[]
    let listingTypeOptionNames: string[]
    let feedController: FeedController = {} as FeedController
    
    
    //let selectedListingType: ListingType = ($page.url.searchParams.get('type') as ListingType) ?? $userSettings.defaultSort.feed ?? 'All'
   
    $: debugMode = $userSettings.debugInfo

   

    // Conditionally add/remove "Moderator View" to the listing types if the user is a mod or admin
    $:  if (listingTypeOptions && listingTypeOptionNames && $profile?.user && amModOfAny($profile.user)) {
            if (!listingTypeOptions.includes('ModeratorView'))      listingTypeOptions.push('ModeratorView')
            if (!listingTypeOptionNames.includes('Moderator View')) listingTypeOptionNames.push("Moderator View")
        }
        else if (listingTypeOptions && listingTypeOptionNames ){
            if (listingTypeOptions.includes('ModeratorView'))       listingTypeOptions.splice(listingTypeOptions.indexOf('ModeratorView'), 1)
            if (listingTypeOptionNames.includes('ModeratorView'))   listingTypeOptionNames.splice(listingTypeOptionNames.indexOf('Moderator View'), 1)
        }

</script>

<svelte:head>
    <title>{data?.site?.site_view?.site?.name ?? "Tesseract"}</title>
</svelte:head>


<SubNavbar quickSettings toggleMargins toggleCommunitySidebar compactSwitch

    listingType     bind:listingTypeOptions bind:listingTypeOptionNames selectedListingType={feedController.type}
    on:navChangeListingType={(e) => {
        if (e?.detail && feedController.type != e.detail) {
            feedController.type = e.detail
        }
    }}
    
    
    sortMenu sortPreventDefault selectedSortOption={feedController.sort} 
     on:navChangeSort={(e) => {
        if (e?.detail && feedController.sort != e.detail) {
            feedController.sort = e.detail
        }
    }}
    

    scrollButtons scrollPreventDefault on:navScrollBottom={() => feedController.scrollBottom() } on:navScrollTop={() => feedController.scrollTop() }
    refreshButton refreshPreventDefault on:navRefresh={()=> feedController.refresh(true) } 


>
    <!---Inline Search in Middle--->
    <SiteSearch placeholder="Search {data?.site?.site_view?.site?.name ?? "everything"}" slot="center"/>
</SubNavbar>


<MainContentArea>

    <div class="flex w-full" style="height: calc(100vh - 8rem);">
        <FeedContainer>
            <PostFeed actions 
                bind:controller={feedController} 
            >

                <!---Add the Site Banner to the top of the feed below 'xl' width--->
                <div class="flex xl:hidden flex-col gap-2 w-full" slot="banner">    
                    <SiteCardSmall site={data.site.site_view} version={data.site.version}/>

                    {#if data.site.taglines && data.site.taglines.length > 0}
                        <Card class="p-2 text-center">
                            <Markdown source={data.site.taglines[Math.floor(Math.random() * data.site.taglines.length)].content} />
                        </Card>
                    {/if}
                </div>
            </PostFeed>
        </FeedContainer>
    </div>

    <!---Show the site card on the right side--->
    <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} slot="right-panel"/>

</MainContentArea>