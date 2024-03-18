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
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';

    export let data

    console.log(data)

    let nextBatch = [] as PostView[]
    
    // @ts-ignore since using 0.18.x lemmy-js-client
    let nextPage: string|undefined = data.posts.next_page
    let nextBatchLoading = false

    $: data.posts.posts = [
		...data.posts.posts,
        ...nextBatch
    ];

    //@ts-ignore
    $: data.posts.next_page = nextPage

    // Store and reload the page data between navigations
    export const snapshot: Snapshot<string> = {
		capture: () => JSON.stringify(data),
		restore: (value) => (data = JSON.parse(value)),
	};

    afterNavigate(async() => {
        await scrollToLastSeenPost()
        
        /*
        let lastClickedPost = getSessionStorage('lastClickedPost') as { postID?: number }
        
        if (lastClickedPost?.postID) {
            let postID = lastClickedPost.postID
            await sleep(100)

            let postElement = document.getElementById(postID.toString())
            if (postElement) {
                disableScrollHandling()
                scrollToTop(postElement, false)
                //setSessionStorage('lastClickedPost', undefined)
            }
        }
        */
        

    })

    async function loadPosts() {
        const params = {
            limit: $userSettings?.uiState.postsPerPage || 20,
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

        nextBatch = posts.posts
        nextBatchLoading  = false
        //@ts-ignore
        nextPage = posts.next_page
    }
</script>

<svelte:head>
    <title>{data?.site?.site_view?.site?.name ?? "Tesseract"}</title>
</svelte:head>

<!---If next_page is available, don't show pagination selector--->
{#if data?.posts?.next_page}
    <SubNavbar
        home compactSwitch toggleMargins refreshButton toggleCommunitySidebar scrollButtons
        listingType={true}      bind:selectedListingType={data.listingType}
        sortMenu={true}         bind:selectedSortOption={data.sort}
    />
{:else}
<SubNavbar
        home compactSwitch toggleMargins refreshButton toggleCommunitySidebar scrollButtons
        listingType={true}      bind:selectedListingType={data.listingType}
        sortMenu={true}         bind:selectedSortOption={data.sort}
        pageSelection={true}    bind:currentPage={data.page}
    />
{/if}

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

        <Button color="secondary" on:click={() => {
            nextBatchLoading  = true
            loadPosts()
        }}>
            
            Next Page
        </Button>
        <!--
        <div class="mt-auto px-2">
            <Pageination
                page={data.page}
                on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
            />
        </div>
        -->
    </div>

    <div class="lg:mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} />
    </div>
</div>
