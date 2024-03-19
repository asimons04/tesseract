<script lang="ts">
    import type { GetPosts, PostView } from 'lemmy-js-client'
    import type { Snapshot } from './$types';
    import { afterNavigate, disableScrollHandling } from '$app/navigation'
    
    import { addMBFCResults, findCrossposts, filterKeywords, scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers'
    import { getClient } from '$lib/lemmy.js'
    import { getSessionStorage, setSessionStorage } from '$lib/session'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte'
    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';

    import { 
        Icon, 
        ChevronDown
    } from 'svelte-hero-icons'

    export let data

    let nextBatchLoading = false
    let maxPosts = 100

    // To reduce memory consumption, remove posts from the beginning after the max number have been rendered
    $: {
        if (data.posts.posts.length > maxPosts) {
            let diff = data.posts.posts.length - maxPosts
            for (let i:number = 0; i < diff; i++) {
                data.posts.posts.shift()
            }
        }
    }
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
        
        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts);

        // Roll up any duplicate posts/crossposts
        posts.posts = findCrossposts(posts.posts);

        // Apply MBFC data object to post
        posts.posts = addMBFCResults(posts.posts);

        /*
        data.posts.posts = [
		    ...data.posts.posts,
            ...posts.posts
        ];
        */

        for (let i:number=0; i < posts.posts.length; i++) {
            data.posts.posts.push(posts.posts[i])
        }
        
        //@ts-ignore
        data.posts.next_page = posts.next_page
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

        {#if nextBatchLoading}
        <div class="mx-auto">
            <Spinner width={24} />
        </div>
        {/if}
        
        <InfiniteScroll bind:loading={nextBatchLoading} threshold={250} on:loadMore={() => {
            nextBatchLoading = true
            loadPosts()
        }} />

        <Button color="secondary" class="w-full"
            title="Load More Posts" id="loadmore"
            on:click={() => {
                nextBatchLoading  = true
                loadPosts()
            }}
        >
            <Icon src={ChevronDown} mini size="16" />
            Load More Posts
            <Icon src={ChevronDown} mini size="16" />
        </Button>
    </div>

    <div class="lg:mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} />
    </div>
</div>
