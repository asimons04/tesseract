<script lang="ts">
    import type { Snapshot } from './$types';
    import type { GetPosts } from 'lemmy-js-client'
    
    import { addMBFCResults,  filterKeywords,  scrollTo, scrollToLastSeenPost, setLastSeenPost, sortPosts } from '$lib/components/lemmy/post/helpers'
    import { fullCommunityName, searchParam } from '$lib/util.js'
    import { getClient } from '$lib/lemmy.js'
    import { beforeNavigate, goto } from '$app/navigation'
    import { setSessionStorage } from '$lib/session.js'
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    import { PageSnapshot } from '$lib/storage'
    import { profile } from '$lib/auth.js'
    import { userSettings } from '$lib/settings'
    
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte'
    import InfiniteScrollRefreshOldestPosts from '$lib/components/ui/InfiniteScrollRefreshOldestPosts.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    
    import { load } from './+layout'
    

    export let data
    
    onMount(() => {

        if (data?.community) {
            console.log("Setting last seen community")
            setSessionStorage('lastSeenCommunity', {
                id: data.community.community_view.community.id,
                name: fullCommunityName(
                    data.community.community_view.community.name,
                    data.community.community_view.community.actor_id
                ),
            })
        }
    })

    let pageState = {
        scrollY: 0,
    }

    let infiniteScroll = {
        loading: false,     // Used to toggle loading indicator
        exhausted: false,   // Sets to true if the API returns 0 posts
        maxPosts: $userSettings.uiState.maxScrollPosts,      // Maximum number of posts to keep in the FIFO
        truncated: false,   // Once maxPosts has been reached and oldest pushed out, set to true
        automatic: true,    // Whether to fetch new posts automatically on scroll or only on button press
        enabled: true,      // Whether to use infinite scroll or manual paging (assumes automatic = false)
    }
    $: infiniteScroll.truncated = (data?.posts?.posts && data.posts.posts.length > infiniteScroll.maxPosts-2) ?? false
    
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

                await scrollToLastSeenPost()
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
        <meta name="og:description" content={data.community.community_view.community.description}/>
    {/if}
</svelte:head>

<!--pageSelection={true}    bind:currentPage={data.page}-->
<SubNavbar home back compactSwitch toggleMargins toggleCommunitySidebar scrollButtons
    sortMenu={true}         bind:selectedSortOption={data.sort}
    refreshButton           on:navRefresh={()=> refresh()}
/>

{#if data?.posts && data?.community}
    <MainContentArea>
        
        <!---Shows a button to refresh for oldest ost once infinite scroll FIFO overflows--->
        <InfiniteScrollRefreshOldestPosts bind:show={infiniteScroll.truncated} 
            on:click={() => {
                goto(window.location.href, {invalidateAll: true})
                refresh()
            }}
        />
        <PostFeed posts={data.posts.posts}/>
        
        <InfiniteScroll bind:loading={infiniteScroll.loading} bind:exhausted={infiniteScroll.exhausted} threshold={500} automatic={infiniteScroll.automatic}
            on:loadMore={ () => {
                if (!infiniteScroll.exhausted) {
                    infiniteScroll.loading = true
                    loadPosts()
                }
            }}
        />
        
        <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel" />
        
    </MainContentArea>
{/if}