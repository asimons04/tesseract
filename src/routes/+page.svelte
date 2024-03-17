<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { Snapshot } from './$types';

    import { addMBFCResults, findCrossposts, filterKeywords } from '$lib/components/lemmy/post/helpers'
    
    import { getClient } from '$lib/lemmy.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'

    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    export let data

    let nextBatch = [] as PostView[]
    
    $: data.posts.posts = [
		...data.posts.posts,
        ...nextBatch
    ];

    export const snapshot: Snapshot<string> = {
		capture: () => JSON.stringify(data),
		restore: (value) => (data = JSON.parse(value)),
	};

    async function loadPosts() {
        // Fetch posts
        let posts = await getClient().getPosts({
            limit: $userSettings?.uiState.postsPerPage || 20,
            page: ++data.page,
            sort: data.sort,
            type_: data.listingType,
            auth: $profile?.jwt,
        });

        // Apply MBFC data object to post
        posts = addMBFCResults(posts.posts);

        // Filter the posts for keywords
        posts = filterKeywords(posts.posts);

        // Roll up any duplicate posts/crossposts
        posts = findCrossposts(posts.posts);
        //return posts.posts
        nextBatch = posts.posts
    }
</script>

<svelte:head>
    <title>{data.site.site_view.site.name}</title>
</svelte:head>

<SubNavbar
    home compactSwitch toggleMargins refreshButton toggleCommunitySidebar scrollButtons
    listingType={true}      bind:selectedListingType={data.listingType}
    sortMenu={true}         bind:selectedSortOption={data.sort}
    pageSelection={true}    bind:currentPage={data.page}
/>

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full py-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        

        <section class="flex flex-col gap-3 sm:gap-4 h-full">
            <PostFeed posts={data.posts.posts} />
        </section>

        <button on:click={async () => {
            await loadPosts()
        }}>
            Test
        </button>

        <div class="mt-auto px-2">
            <Pageination
                page={data.page}
                on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
            />
        </div>
    </div>

    <div class="lg:mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} />
    </div>
</div>
