<script lang="ts">
    import type { Snapshot } from '@sveltejs/kit';    

    import { beforeNavigate } from '$app/navigation';
    import { isCommentView } from '$lib/lemmy/item.js'
    import { goto } from '$app/navigation'
    import { load } from './+page'
    import { page } from '$app/stores'
    import { PageSnapshot } from '$lib/storage.js';
    import { scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers.js';
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'

    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte'
    import InfiniteScrollRefreshOldestPosts from '$lib/components/ui/InfiniteScrollRefreshOldestPosts.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'

    import {
        PencilSquare,
    } from 'svelte-hero-icons'
    
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
            
            while (data.items.length > infiniteScroll.maxPosts) {
                data.items.shift()
                infiniteScroll.truncated = true
            }
            if (infiniteScroll.enabled) PageSnapshot.capture({data: data, state: pageState, infiniteScroll: infiniteScroll})
        },
        restore: async () => {
            try { 
                if (infiniteScroll.enabled) {
                    let snapshot = PageSnapshot.restore() 
                    if (snapshot.data)              data = snapshot.data
                    if (snapshot.state)             pageState = snapshot.state
                    if (snapshot.infiniteScroll)    infiniteScroll = snapshot.infiniteScroll
                }

                await scrollToLastSeenPost(data.items.length + 200)
            }
            catch (err) { 
                console.error("Error restoring snapshot: ", err)
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
        const loadParams = {
            params: {
                name: $page.params.name
            },
            url: new URL(window.location.href)
        }
        
        loadParams.url.searchParams.set('sort', data.sort)
        loadParams.url.searchParams.set('type', data.type)
        loadParams.url.searchParams.set('page', (++data.page).toString())
        loadParams.url.searchParams.set('limit', data.limit.toString())

        load(loadParams).then((nextBatch) => {
            if (nextBatch.items.length < 1) infiniteScroll.exhausted = true
            else infiniteScroll.exhausted = false

            nextBatch.items.forEach((item) => {
                data.items.push(item)
            })
            
            data = data
            infiniteScroll.loading  = false
        })
    }

</script>

<svelte:head>
  <title>Profile | {data.person_view.person.display_name ?? data.person_view.person.name}</title>
</svelte:head>



<!---Only show on /u/{username} routes since the /profile/user route will use the navbar from its layout page--->
{#if $page.url.pathname.startsWith('/u/')}
<SubNavbar  back quickSettings toggleMargins toggleCommunitySidebar scrollButtons
    refreshButton   on:navRefresh={()=> refresh()}
    sortMenu        sortOptions={['New', 'TopAll', 'Old']} sortOptionNames={['New', 'Top', 'Old']} bind:selectedSortOption={data.sort}
    listingType     listingTypeOptions={['all', 'posts', 'comments']} listingTypeOptionNames={['All', 'Posts', 'Comments']} bind:selectedListingType={data.type}
>
    <SiteSearch placeholder="Search {$userSettings.displayNames ? (data.person_view.person.display_name ?? data.person_view.person.name) : data.person_view.person.name }" 
        person_id={data.person_view.person.id} slot="center"
    />
</SubNavbar>
{/if}

<MainContentArea>
    {#if data.items.length > 0}
        
        <!---Shows a button to refresh for oldest ost once infinite scroll FIFO overflows--->
        <InfiniteScrollRefreshOldestPosts bind:show={infiniteScroll.truncated} 
            on:click={() => {
                goto(window.location.href, {invalidateAll: true})
                refresh()
            }}
        />

        <FeedContainer>
            {#each data.items as item, idx (isCommentView(item) ? item.comment.id : item.post.id)}
                {#if item && isCommentView(item) && (data.type == 'all' || data.type == 'comments')}
                    <CommentItem bind:comment={item} />
                
                {:else if item && !isCommentView(item) && (data.type == 'all' || data.type == 'posts')}
                    <Post bind:post={item} />
                {/if}
            {/each}
        </FeedContainer>

        <InfiniteScroll bind:loading={infiniteScroll.loading} bind:exhausted={infiniteScroll.exhausted} threshold={75} bind:enabled={infiniteScroll.enabled}
            disableBack={ data.page < 2 ? true : false }
            on:loadMore={ () => {
                if (!infiniteScroll.exhausted && !infiniteScroll.loading) {
                    infiniteScroll.loading = true
                    loadPosts()
                }
            }}

            on:next={ () => {
                searchParam($page.url, 'page', (++data.page).toString())
            }}
            on:prev={ () => {
                if (data.page > 1) searchParam($page.url, 'page', (--data.page).toString())
            }}
        />
        
    {:else}
        <Placeholder icon={PencilSquare} title="No submissions" description="This user has no submissions that match this filter."/>
    {/if}

    <!---User Info Panel: Only show on /u/ pages.  Profile (/profile/user) will use its own layout--->
    <UserCard bind:person={data.person_view} moderates={data.moderates} display={$page.url.pathname.startsWith('/u/')} slot="right-panel"/>

</MainContentArea>
