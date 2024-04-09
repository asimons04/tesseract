<script lang="ts">
    import type { SortType, GetPosts, GetPostsResponse, GetSiteResponse, ListingType } from 'lemmy-js-client'

    import type { Snapshot } from './$types';
    import { PageSnapshot } from '$lib/storage'
    

    import { beforeNavigate, goto } from '$app/navigation'
    import { 
        addMBFCResults, 
        findCrossposts, 
        filterKeywords, 
        fixHourAheadPosts, 
        scrollToLastSeenPost, 
        scrollTo,
        setLastSeenPost, 
        sortPosts 
    } from '$lib/components/lemmy/post/helpers'
    
    import { getClient, site } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { userSettings } from '$lib/settings'
    
    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte'
    import InfiniteScrollRefreshOldestPosts from '$lib/components/ui/InfiniteScrollRefreshOldestPosts.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    export let data
    
    // Page state that will persist in snapshots
    let pageState = {
        scrollY: 0,
    }
    
    // Infinite scroll object to hold config parms
    let infiniteScroll = {
        loading: false,     // Used to toggle loading indicator
        exhausted: false,   // Sets to true if the API returns 0 posts
        maxPosts: $userSettings.uiState.maxScrollPosts,      // Maximum number of posts to keep in the FIFO
        truncated: false,   // Once maxPosts has been reached and oldest pushed out, set to true
        automatic: true,    // Whether to fetch new posts automatically on scroll or only on button press
        enabled: true,      // Whether to use infinite scroll or manual paging (assumes automatic = false)
    }

    $: infiniteScroll.truncated = data.posts.posts.length > infiniteScroll.maxPosts-2
    
    // Needed to re-enable scroll fetching when switching between an exhausted sort option (top hour) to one with more post (top day)
    beforeNavigate(() => {
        infiniteScroll.exhausted = false
    })

    // Store and reload the page data between navigations (Override functions to use LocalStorage instead of Session Storage)
    export const snapshot: Snapshot<void> = {
        capture: () => {
            pageState.scrollY = window.scrollY
            PageSnapshot.capture({data: data, state: pageState})
        },
        restore: async () => {
            try { 
                let snapshot = PageSnapshot.restore() 
                if (snapshot.data)  data = snapshot.data
                if (snapshot.state) pageState = snapshot.state
            }
            catch { 
                PageSnapshot.clear() 
            }
            
            // Scroll to last stored position if found in snapshot data (delay by number of posts + 100 ms)
            if (pageState.scrollY) await scrollTo(pageState.scrollY, infiniteScroll.maxPosts + 400)
            else window.scrollTo(0,0)
        }
    }
    
    async function refresh() {
        PageSnapshot.clear()
        infiniteScroll.exhausted = false
        infiniteScroll.truncated = false
        window.scrollTo(0,0)
    }

    async function loadPosts(params: GetPosts =  {
                limit: $userSettings?.uiState.postsPerPage || 10,
                page: undefined,
                next_page: undefined,
                sort: data.sort,
                type_: data.listingType,
                auth: $profile?.jwt,
            } as GetPosts
        ) {
        
        //@ts-ignore
        if (data.posts.next_page) params.page_cursor = data.posts.next_page;
        else params.page = ++data.page

        // Fetch posts
        let posts = await getClient().getPosts(params);

        if (posts.posts.length < 1) infiniteScroll.exhausted = true
        else infiniteScroll.exhausted = false

        // Fix posts that come in an hour ahead
        posts.posts = fixHourAheadPosts(posts.posts)

        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts)

        // Apply MBFC data object to post
        posts.posts = addMBFCResults(posts.posts)
        
        // Roll up crossposts
        posts.posts = findCrossposts(posts.posts)

        // Sort the new result set based on the selected sort method
        posts.posts = sortPosts(posts.posts, data.sort)
        
        
        // Loop over the new posts
        for (let i:number=0; i < posts.posts.length; i++) {
            
            // Check if the current new post already exists in the existing array of posts
            let exists = false
            for (let j:number=0; j < data.posts.posts.length; j++) {
                if (posts.posts[i].post.id == data.posts.posts[j].post.id) exists = true
            }

            // Only add the new post if it doesn't already exist in the post array
            if (!exists) data.posts.posts.push(posts.posts[i])
            
            // To reduce memory consumption, remove posts from the beginning after the max number have been rendered
            if (data.posts.posts.length > infiniteScroll.maxPosts) {
                data.posts.posts.shift()    
                infiniteScroll.truncated = true
            }
        }

        //@ts-ignore
        if (posts.next_page) data.posts.next_page = posts.next_page
        data = data
        infiniteScroll.loading  = false
    }

</script>

<svelte:head>
    <title>{data?.site?.site_view?.site?.name ?? "Tesseract"}</title>
</svelte:head>


<SubNavbar
    compactSwitch  toggleMargins toggleCommunitySidebar scrollButtons 
    listingType={true}      bind:selectedListingType={data.listingType}
    sortMenu={true}         bind:selectedSortOption={data.sort}
    refreshButton           on:navRefresh={()=> refresh()}
>
    <!---Inline Search in Middle--->
    <SiteSearch slot="center"/>

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

    <InfiniteScroll bind:loading={infiniteScroll.loading} bind:exhausted={infiniteScroll.exhausted} threshold={750} automatic={infiniteScroll.automatic}
        on:loadMore={ () => {
            if (!infiniteScroll.exhausted) {
                infiniteScroll.loading = true
                loadPosts()
            }
        }}
    />

    <!---Show the site card on the right side--->
    <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} slot="right-panel"/>

</MainContentArea>