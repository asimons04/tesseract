<script context="module">
    const moduleName = '/+page.svelte';
</script>

<script lang="ts">
    import type { FeedController } from '$lib/components/lemmy/feed/helpers'
    
    import { page } from '$app/stores'
    import { parseListingType, parseSortType } from '$lib/components/lemmy/feed/helpers'
    import { userSettings } from '$lib/settings'
    
    import MainContentArea  from '$lib/components/ui/containers/MainContentArea.svelte'
    import SiteCard         from '$lib/components/lemmy/SiteCard.svelte'
    import SiteSearch       from '$lib/components/ui/subnavbar/SiteSearch.svelte'
    import SubNavbar        from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import PostFeed         from '$lib/components/lemmy/feed/PostFeed.svelte'
    import SiteCardSmall    from '$lib/components/lemmy/SiteCardSmall.svelte'
    import TaglinesCard     from '$lib/components/lemmy/TaglinesCard.svelte'

    export let data
    
    let feedController: FeedController = {} as FeedController
    let sort = parseSortType($page.params.sort)
    let type = parseListingType($page.params.listing_type)

    $:  $page.params.sort, $page.params.listing_type, applySortAndType()

    function applySortAndType() {
        const newSort = parseSortType($page.params.sort)
        const newType = parseListingType($page.params.listing_type)

        // If feedController not yet bound or if the sort/type are the same as already applied, don't process the change
        if ( !feedController.bound || (sort == newSort && type == newType) ) return

        sort = newSort
        type = newType

        feedController.refreshing = true
        feedController.reset(false)
            .then(() => feedController.load({loadSnapshot: true, append: false}))
            .then(() => feedController.refreshing = false)
    }

</script>

<svelte:head>
    <title>{data?.site?.site_view?.site?.name ?? "Tesseract"}</title>
</svelte:head>


<SubNavbar quickSettings toggleMargins toggleCommunitySidebar compactSwitch
    scrollButtons scrollPreventDefault 
    on:navScrollBottom={() => feedController.scrollBottom() } 
    on:navScrollTop={() => feedController.scrollTop() }
    
    refreshButton refreshPreventDefault refreshButtonLoading={feedController.busy} 
    on:navRefresh={()=> {
        if ($userSettings.debugInfo) console.log(moduleName, "Calling NAV REFRESH")
        feedController.refreshing = true
        feedController.refresh(true) 
    }} 


>
    <!---Inline Search in Middle--->
    <div class="hidden lg:flex" slot="center">
        <SiteSearch placeholder="Search {data?.site?.site_view?.site?.name ?? "everything"}"/>
    </div>
</SubNavbar>


<MainContentArea>

    <div class="flex w-full" style="height: calc(100vh - 8.2rem);">
        <PostFeed actions bind:controller={feedController} {sort} {type}>

            <!---Add the Site Banner to the top of the feed below 'xl' width--->
            <div class="flex 2xl:hidden flex-col mx-auto w-full max-w-[820px]" slot="banner">    
                <SiteCardSmall site={data.site.site_view} version={data.site.version}/>

                {#if data.site.taglines && data.site.taglines.length > 0}
                    <TaglinesCard taglines={data.site.taglines} interval={10}/>
                {/if}
            </div>

        </PostFeed>
    </div>

    <!---Show the site card on the right side--->
    <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} taglineUpdateInterval={10} slot="right-panel"/>

</MainContentArea>