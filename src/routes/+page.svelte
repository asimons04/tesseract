<script lang="ts">
    import type { GetPosts, PostView } from 'lemmy-js-client'
    import type { Snapshot } from './$types';
    import { afterNavigate, beforeNavigate } from '$app/navigation'
    
    import { addMBFCResults, findCrossposts, filterKeywords, scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers'
    import { getClient } from '$lib/lemmy.js'
    //import { getSessionStorage, setSessionStorage } from '$lib/session'
    //import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    //import { searchParam } from '$lib/util.js'
    //import { userSettings } from '$lib/settings.js'
    //import { load } from './+page'

    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import { afterAll } from 'vitest';


    export let data

    let infiniteScroll = {
        loading: false,
        exhausted: false,
        maxPosts: 100,
        automatic: true,
        enabled: true,
    }

    // Hack to clear the no more posts flag when data is refreshed through invalidation
    //$: infiniteScroll.exhausted = !data.refresh  

    // Store and reload the page data between navigations
    export const snapshot: Snapshot<string> = {
		capture: () => JSON.stringify(data),
        restore: (value) => {
            data = JSON.parse(value)
        },
	};

    beforeNavigate(() => {
        infiniteScroll.exhausted = false
    })

    afterNavigate(async() => {
        await scrollToLastSeenPost()
    })

    async function refresh() {
        //data = await load({url: new URL(window.location.href)})
    }

    async function loadPosts(params: GetPosts =  {
                //limit: $userSettings?.uiState.postsPerPage || 20,
                limit: 10,
                page: undefined,
                next_page: undefined,
                sort: data.sort,
                type_: data.listingType,
                auth: $profile?.jwt,
            } as GetPosts
        ){
        
        //@ts-ignore
        if (data.posts.next_page) params.page_cursor = data.posts.next_page;
        else params.page = ++data.page

        // Fetch posts
        let posts = await getClient().getPosts(params);

        if (posts.posts.length < 1) infiniteScroll.exhausted = true
        else infiniteScroll.exhausted = false

        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts);

        // Roll up any duplicate posts/crossposts
        posts.posts = findCrossposts(posts.posts);

        // Apply MBFC data object to post
        posts.posts = addMBFCResults(posts.posts);

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
            if (data.posts.posts.length > infiniteScroll.maxPosts) data.posts.posts.shift()    
        }

        //@ts-ignore
        if (posts.next_page) data.posts.next_page = posts.next_page
        
        data.posts.posts = data.posts.posts
        infiniteScroll.loading  = false
    }
</script>

<svelte:head>
    <title>{data?.site?.site_view?.site?.name ?? "Tesseract"}</title>
</svelte:head>

<SubNavbar
    compactSwitch  toggleMargins toggleCommunitySidebar scrollButtons pageUpDownButtons
    listingType={true}      bind:selectedListingType={data.listingType}
    sortMenu={true}         bind:selectedSortOption={data.sort}
    refreshButton           on:navRefresh={()=> refresh()}
/>


<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full py-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">

        <section class="flex flex-col gap-3 sm:gap-4 h-full">
            <PostFeed posts={data.posts.posts} />
        </section>
        
        <InfiniteScroll bind:loading={infiniteScroll.loading} bind:exhausted={infiniteScroll.exhausted} threshold={500} automatic={infiniteScroll.automatic}
            on:loadMore={ () => {
                if (!infiniteScroll.exhausted) {
                    infiniteScroll.loading = true
                    loadPosts()
                }
            }}
        />
        
        
    </div>

    <div class="lg:mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} />
    </div>
</div>
