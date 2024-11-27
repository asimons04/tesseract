<script context="module">
    const moduleName = '/+page.svelte';
</script>

<script lang="ts">
    import type { FeedController } from '$lib/components/lemmy/feed/helpers'
    
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { parseListingType, parseSortType } from '$lib/components/lemmy/feed/helpers'
    import { userSettings } from '$lib/settings'
    
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import PostFeed from '$lib/components/lemmy/feed/PostFeed.svelte'
    import SiteCardSmall from '$lib/components/lemmy/SiteCardSmall.svelte'
    import TaglinesCard from '$lib/components/lemmy/TaglinesCard.svelte'

    export let data
    
    let feedController: FeedController = {} as FeedController

    $: debugMode = $userSettings.debugInfo

    $:  sort = parseSortType($page.params.sort)
    $:  sort, applySortOption()
   
    $:  type = parseListingType($page.url.searchParams.get('type'))
    $:  type, applyTypeOption()

        
    function applyTypeOption() {
        if (!feedController.bound || feedController.type == type) return
        feedController.type = type
    }

    function applySortOption() {
        if (!feedController.bound || feedController.sort == sort) return
        feedController.sort = sort
    }

</script>

<svelte:head>
    <title>{data?.site?.site_view?.site?.name ?? "Tesseract"}</title>
</svelte:head>


<SubNavbar quickSettings toggleMargins toggleCommunitySidebar compactSwitch

    listingType moderatorViewItem
    bind:selectedListingType={type}
    on:navChangeListingType={(e) => {
        if (e?.detail) {
            type = e.detail
            $page.url.searchParams.set('type', e.detail)
            goto($page.url)
        }
        
    }}

    sortMenu sortPreventDefault 
    bind:selectedSortOption={sort} 
    on:navChangeSort={() => {
        const url = new URL($page.url)
        url.pathname = `/home/${sort.toLowerCase()}`
        goto(url)
    }}
    
    

    scrollButtons scrollPreventDefault 
    on:navScrollBottom={() => feedController.scrollBottom() } 
    on:navScrollTop={() => feedController.scrollTop() }
    
    refreshButton refreshPreventDefault refreshButtonLoading={feedController.busy} 
    on:navRefresh={()=> {
        if (debugMode) console.log(moduleName, "Calling NAV REFRESH")
        feedController.refreshing = true
        feedController.refresh(true) 
    }} 


>
    <!---Inline Search in Middle--->
    <SiteSearch placeholder="Search {data?.site?.site_view?.site?.name ?? "everything"}" slot="center"/>
</SubNavbar>


<MainContentArea>

    <div class="flex w-full" style="height: calc(100vh - 8rem);">
        <FeedContainer>
            
            <PostFeed actions bind:controller={feedController} bind:sort bind:type >

                <!---Add the Site Banner to the top of the feed below 'xl' width--->
                <div class="flex 2xl:hidden flex-col mx-auto w-full max-w-[820px]" slot="banner">    
                    <SiteCardSmall site={data.site.site_view} version={data.site.version}/>

                    {#if data.site.taglines && data.site.taglines.length > 0}
                        <TaglinesCard taglines={data.site.taglines} interval={10}/>
                    {/if}
                </div>

            </PostFeed>
            
        </FeedContainer>
    </div>

    <!---Show the site card on the right side--->
    <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} taglineUpdateInterval={10} slot="right-panel"/>

</MainContentArea>