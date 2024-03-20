<script lang="ts">
    import type { GetPosts, PostView } from 'lemmy-js-client'
    import type { Snapshot } from './$types';
    import { afterNavigate } from '$app/navigation'
    
    import { addMBFCResults, findCrossposts, filterKeywords, scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers'
    import { getClient } from '$lib/lemmy.js'
    //import { getSessionStorage, setSessionStorage } from '$lib/session'
    //import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    //import { searchParam } from '$lib/util.js'
    //import { userSettings } from '$lib/settings.js'

    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import { load } from './+page';
    


    export let data

    let nextBatchLoading = false    // Controls whether to show the loading spinner
    let noMorePosts = !data.refresh // Flags that no more posts are available from the API
    const maxPosts = 100            // Maximum number of posts to keep in memory before the oldest start getting ejected in FIFO method.

    $: noMorePosts = !data.refresh  // Hack to clear the no more posts flag when data is refreshed through invalidation

    // Store and reload the page data between navigations
    export const snapshot: Snapshot<string> = {
		capture: () => JSON.stringify(data),
        restore: (value) => {
            data = JSON.parse(value)
        },
	};

    afterNavigate(async() => {
        await scrollToLastSeenPost()
    })

    async function loadPosts() {
        const params = {
            //limit: $userSettings?.uiState.postsPerPage || 20,
            limit: 10,
            page: undefined,
            next_page: undefined,
            sort: data.sort,
            type_: data.listingType,
            auth: $profile?.jwt,
        } as GetPosts
        
        //@ts-ignore
        if (data.posts.next_page) {
            //@ts-ignore
            params.page_cursor = data.posts.next_page;
        }
        else {
            params.page = ++data.page
        }

        // Fetch posts
        let posts = await getClient().getPosts(params);

        if (posts.posts.length < 1) noMorePosts = true
        else noMorePosts = false

        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts);

        // Roll up any duplicate posts/crossposts
        posts.posts = findCrossposts(posts.posts);

        // Apply MBFC data object to post
        posts.posts = addMBFCResults(posts.posts);


        for (let i:number=0; i < posts.posts.length; i++) {
            data.posts.posts.push(posts.posts[i])
            // To reduce memory consumption, remove posts from the beginning after the max number have been rendered
            if (data.posts.posts.length > maxPosts) data.posts.posts.shift()    
        }
        
        //@ts-ignore
        if (posts.next_page) data.posts.next_page = posts.next_page
        data.posts.posts = data.posts.posts
        nextBatchLoading  = false
    }
</script>

<svelte:head>
    <title>{data?.site?.site_view?.site?.name ?? "Tesseract"}</title>
</svelte:head>

<SubNavbar
    compactSwitch refreshButton toggleMargins toggleCommunitySidebar scrollButtons
    listingType={true}      bind:selectedListingType={data.listingType}
    sortMenu={true}         bind:selectedSortOption={data.sort}
/>


<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full py-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">

        <section class="flex flex-col gap-3 sm:gap-4 h-full">
            <PostFeed posts={data.posts.posts} />
        </section>
        
        <InfiniteScroll bind:loading={nextBatchLoading} bind:noMorePosts threshold={250} automatic={true}
            on:loadMore={ () => {
                if (!noMorePosts) {
                    nextBatchLoading = true
                    loadPosts()
                }
            }}
        />
        
        
    </div>

    <div class="lg:mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} />
    </div>
</div>
