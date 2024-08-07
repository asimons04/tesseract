<script lang="ts">
    import type { Snapshot } from './$types';
    import { PageSnapshot } from '$lib/storage'
    
    import { amModOfAny } from '$lib/components/lemmy/moderation/moderation';
    import { beforeNavigate, goto } from '$app/navigation'
    import { 
        mergeNewInfiniteScrollBatch,
        scrollToLastSeenPost, 
    } from '$lib/components/lemmy/post/helpers'
    import { load } from './+page'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util';
    import { userSettings } from '$lib/settings'
    
    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte'
    import InfiniteScrollRefreshOldestPosts from '$lib/components/ui/InfiniteScrollRefreshOldestPosts.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    export let data
    
    // Page state that will persist in snapshots
    let pageState = {
        scrollY: 0,
    }
    
    // Infinite scroll object to hold config parms
    let infiniteScroll = {
        loading: false,
        exhausted: false,
        maxPosts: $userSettings.uiState.maxScrollPosts,      
        truncated: false,   
        enabled: $userSettings.uiState.infiniteScroll,      
    }

   
    // Needed to re-enable scroll fetching when switching between an exhausted sort option (top hour) to one with more post (top day)
    beforeNavigate(() => {
        infiniteScroll.exhausted = false
    })

    // Store and reload the page data between navigations (Override functions to use LocalStorage instead of Session Storage)
    // Also jumps to last seen post upon restore.
    export const snapshot: Snapshot<void> = {
        capture: () => {
            pageState.scrollY = window.scrollY
            if (infiniteScroll.enabled) PageSnapshot.capture({data: data, state: pageState})
        },
        restore: async () => {
            try { 
                if (infiniteScroll.enabled) {
                    let snapshot = PageSnapshot.restore() 
                    if (snapshot.data)  data = snapshot.data
                    if (snapshot.state) pageState = snapshot.state
                }
                await scrollToLastSeenPost(data.posts.posts.length + 200)
            }
            catch { 
                PageSnapshot.clear() 
                window.scrollTo(0,0)
            }
        }
    }
    
    async function refresh() {
        PageSnapshot.clear()
        infiniteScroll.exhausted = false
        infiniteScroll.truncated = false
        window.scrollTo(0,0)
    }

    function loadPosts() {
        const url = new URL(window.location.href)
        url.searchParams.set('limit', $userSettings?.uiState.postsPerPage.toString() || '10')
        url.searchParams.set('sort', data.sort)
        url.searchParams.set('listingType', data.type)
        if (data.posts.next_page) url.searchParams.set('page_cursor', data.posts.next_page)

        load({url: url, passedSite: data.site}).then((nextBatch) => {
            if (nextBatch.posts.posts.length < 1) infiniteScroll.exhausted = true
            else infiniteScroll.exhausted = false
           
            data.posts = mergeNewInfiniteScrollBatch(data.posts, nextBatch.posts)

            // To reduce memory consumption, remove posts from the beginning after the max number have been rendered
            while (data.posts.posts.length > infiniteScroll.maxPosts) {
                data.posts.posts.shift()
                infiniteScroll.truncated = true  
            }
            data = data
            infiniteScroll.loading  = false
        })
    }

    
    // These exist so the subnavbar component can bind/export its values to them and so we can modify them to add/remove moderator view
    let listingTypeOptions: string[]
    let listingTypeOptionNames: string[]
    
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


<SubNavbar quickSettings
    toggleMargins toggleCommunitySidebar scrollButtons 
    listingType     bind:listingTypeOptions bind:listingTypeOptionNames bind:selectedListingType={data.listingType}
    sortMenu        bind:selectedSortOption={data.sort}
    refreshButton   on:navRefresh={()=> refresh()}
>
    <!---Inline Search in Middle--->
    <SiteSearch placeholder="Search {data?.site?.site_view?.site?.name ?? "everything"}" slot="center"/>
</SubNavbar>


<MainContentArea>
    
    <!---Shows a button to refresh for oldest ost once infinite scroll FIFO overflows--->
    <InfiniteScrollRefreshOldestPosts bind:show={infiniteScroll.truncated} 
        on:click={() => {
            goto(window.location.href, {invalidateAll: true})
            refresh()
        }}
    />

    <!---The actual feed--->
    <PostFeed bind:posts={data.posts.posts} />

    <InfiniteScroll bind:loading={infiniteScroll.loading} bind:exhausted={infiniteScroll.exhausted} bind:enabled={infiniteScroll.enabled} threshold={750} 
        disableBack={ $page.url.searchParams.get('page_cursor') ? false : true }
        on:loadMore={ () => {
            if (!infiniteScroll.exhausted) {
                infiniteScroll.loading = true
                loadPosts()
            }
        }}

        on:next={ () => {
            searchParam($page.url, 'page_cursor', data.posts.next_page ?? '', 'page')
        }}
        on:prev={ () => history.back() }
    />

    <!---Show the site card on the right side--->
    <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} slot="right-panel"/>

</MainContentArea>