<script lang="ts">
    import type { Snapshot } from './$types';
    
    import { beforeNavigate, goto } from '$app/navigation'
    import { load } from './+layout'
    import { mergeNewInfiniteScrollBatch, scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers'
    import { onMount } from 'svelte'
    import { PageSnapshot } from '$lib/storage'
    import { setLastSeenCommunity } from '$lib/components/lemmy/community/helpers';
    import { userSettings } from '$lib/settings'
    
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte'
    import InfiniteScrollRefreshOldestPosts from '$lib/components/ui/InfiniteScrollRefreshOldestPosts.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import { searchParam } from '$lib/util';
    import { page } from '$app/stores';
    
    

    export let data
    
    onMount(() => { 
        if (data?.community) setLastSeenCommunity(data.community.community_view.community)
    })
    
    
    let pageState = {
        scrollY: 0,
    }

    let infiniteScroll = {
        loading: false,     
        exhausted: false,   
        maxPosts: $userSettings.uiState.maxScrollPosts,
        truncated: false,   
        enabled: $userSettings.uiState.infiniteScroll,
    }
    $: infiniteScroll.truncated = (data?.posts?.posts && data.posts.posts.length > infiniteScroll.maxPosts-2) ?? false
    
    beforeNavigate(() => {
        infiniteScroll.exhausted = false
    })

    // Store and reload the page data between navigations (Override functions to use LocalStorage instead of Session Storage)
    export const snapshot: Snapshot<void> = {
        capture: () => {
            pageState.scrollY = window.scrollY
            if (infiniteScroll.enabled) PageSnapshot.capture({data: data, state: pageState})
        },
        restore: async () => {
            try { 
                if (infiniteScroll.enabled)  {
                    let snapshot = PageSnapshot.restore() 
                    if (snapshot.data)  data = snapshot.data
                    if (snapshot.state) pageState = snapshot.state
                }

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

    function loadPosts(): void {
        if (!data?.posts) return
        
        const req = {
            passedCommunity: data.community,
            url: new URL(window.location.href)
        }

        req.url.searchParams.set('limit', $userSettings?.uiState.postsPerPage.toString() || '10')
        req.url.searchParams.set('community_name', data.community_name)
        req.url.searchParams.set('sort', data.sort ?? 'New')

        if (data.posts.next_page) req.url.searchParams.set('page_cursor', data.posts.next_page)
        
        load(req).then((nextBatch) => {
            if (!nextBatch || !data?.posts) return
            
            if (nextBatch && nextBatch.posts.posts.length < 1) infiniteScroll.exhausted = true
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


<SubNavbar home back quickSettings qsShiftLeft={2} toggleMargins toggleCommunitySidebar scrollButtons
    sortMenu={true}         bind:selectedSortOption={data.sort}
    refreshButton           on:navRefresh={()=> refresh()}
>
    <SiteSearch placeholder="Search {data.community.community_view.community.name}" community_id={data.community.community_view.community.id} slot="center"/>
</SubNavbar>

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
        
        <InfiniteScroll bind:loading={infiniteScroll.loading} bind:exhausted={infiniteScroll.exhausted} threshold={500} bind:enabled={infiniteScroll.enabled}
            on:loadMore={ () => {
                if (!infiniteScroll.exhausted) {
                    infiniteScroll.loading = true
                    loadPosts()
                }
            }}
            on:next={ () => {
                searchParam($page.url, 'page_cursor', data?.posts?.next_page ?? '', 'page')
            }}
        />
        
        <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel" />
        
    </MainContentArea>
{/if}