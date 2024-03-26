<script lang="ts">
    import type { Snapshot } from './$types';
    import type { GetPosts } from 'lemmy-js-client'
    
    import { addMBFCResults,  filterKeywords,  scrollToLastSeenPost, setLastSeenPost } from '$lib/components/lemmy/post/helpers'
    import { afterNavigate, beforeNavigate } from '$app/navigation'
    import { fullCommunityName, searchParam } from '$lib/util.js'
    import { getClient } from '$lib/lemmy.js'
    import { setSessionStorage } from '$lib/session.js'
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { userSettings } from '$lib/settings'
    
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte'
    //import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'


    export let data
    
    onMount(() => {
        if (data?.community) {
            setSessionStorage('lastSeenCommunity', {
                id: data.community.community_view.community.id,
                name: fullCommunityName(
                    data.community.community_view.community.name,
                    data.community.community_view.community.actor_id
                ),
            })
        }
    })

    let infiniteScroll = {
        loading: false,
        exhausted: false,
        maxPosts: 100,
        automatic: true,
        enabled: true,
    }

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
        setLastSeenPost(-1)
        window.scrollTo(0,0)
    }

    async function loadPosts(params: GetPosts =  {
            limit: $userSettings?.uiState.postsPerPage || 10,
            community_name: $page.params.name,
            page: undefined,
            next_page: undefined,
            sort: data.sort,
            auth: $profile?.jwt,
        } as GetPosts): Promise<void> {
        
        if (!data?.posts) return

        //@ts-ignore
        if (!data?.posts?.next_page && !data?.page) data.page = 1

        //@ts-ignore
        if (data.posts.next_page) params.page_cursor = data.posts.next_page;
        else params.page = ++data.page!

        // Fetch posts
        let posts = await getClient().getPosts(params);

        if (posts.posts.length < 1) infiniteScroll.exhausted = true
        else infiniteScroll.exhausted = false

        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts);

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
    <title>{data?.community?.community_view.community.title ?? "Community Not Found"}</title>

    <meta name="og:title"
        content={data?.community?.community_view.community.title ?? "Community Not Found"}
    />
    {#if data?.community?.community_view.community.description}
        <meta name="og:description"
            content={data.community.community_view.community.description}
        />
    {/if}
</svelte:head>
<!--pageSelection={true}    bind:currentPage={data.page}-->
<SubNavbar home back compactSwitch toggleMargins toggleCommunitySidebar scrollButtons
    sortMenu={true}         bind:selectedSortOption={data.sort}
    refreshButton           on:navRefresh={()=> refresh()}
/>

{#if data?.posts && data?.community}
    <div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full py-2">
        <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
            
            <PostFeed posts={data.posts.posts}/>
            
            <InfiniteScroll bind:loading={infiniteScroll.loading} bind:exhausted={infiniteScroll.exhausted} threshold={500} automatic={infiniteScroll.automatic}
                on:loadMore={ () => {
                    if (!infiniteScroll.exhausted) {
                        infiniteScroll.loading = true
                        loadPosts()
                    }
                }}
            />
            <!--<Pageination page={data.page} on:change={(p) => searchParam($page.url, 'page', p.detail.toString())} />-->
        </div>

        <div class="mt-[8px]">
            <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators}/>
        </div>
    </div>
{/if}