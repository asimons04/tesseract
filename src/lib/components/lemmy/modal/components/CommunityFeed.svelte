<script lang="ts">
    import type { FeedController } from './helpers'
    import type { GetPostsResponse, ListingType, PostView, SortType } from "lemmy-js-client"
    import type { InfiniteScrollStateVars } from "$lib/components/ui/infinitescroll/helpers"

    
    import { addMBFCResults, filterKeywords, findCrossposts, lastSeenPost, sleep } from "../../post/helpers"
    import { compressedStorage } from '$lib/storage'
    import { dispatchWindowEvent, type ClickIntoPostEvent } from "$lib/ui/events"
    import { getClient } from "$lib/lemmy"
    import {  goto } from '$app/navigation';
    import { onDestroy, onMount } from "svelte"
    import { page as pageStore } from '$app/stores'
    import { userSettings } from "$lib/settings";

    import InfiniteScrollDiv from "$lib/components/ui/infinitescroll/InfiniteScrollDiv.svelte";
    import Post from "../../post/Post.svelte";
    import Placeholder from "$lib/components/ui/Placeholder.svelte";
    import Pageination from "$lib/components/ui/Pageination.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte";
    
    import { ArchiveBox } from "svelte-hero-icons";
    
    
    export let community_id: number | undefined     = undefined
    export let community_name: string | undefined   = undefined
    export let disliked_only: boolean|undefined     = undefined
    export let liked_only: boolean|undefined        = undefined
    export let saved_only: boolean|undefined        = undefined
    export let type: ListingType                    = 'All'
    export let sort: SortType                       = 'New'
    export let actions: boolean                     = false
    
    let posts = {
        next_page: undefined,
        posts: [] as PostView[]
    } as GetPostsResponse
    
    let scrollState = {
        loading: false,
        exhausted: false
    } as InfiniteScrollStateVars
    
    let scrollContainer: HTMLDivElement
    let loading = false
    let page = 1
    let last_clicked_post: number | undefined = undefined
    let refreshing = false


    // Keep an array where the index is the page number and the element is the page cursor. Position 0 is a placeholder, 1 is undefined intentionally
    let page_cursors =  [undefined, undefined] as (string|undefined)[]
    let storageKey = updateStorageKey()

    // Controller that can be expored and used outside the component. Includes getters/setters for parameters.
    export const controller = {
        load: async function(initial?:boolean): Promise<void> {
            try {
                console.log("Initial: ", initial)

                if (loading || scrollState.loading) {
                    console.log("already loading; returning")
                    return
                }

                $userSettings.uiState.infiniteScroll
                    ? scrollState.loading = true
                    : loading = true

                let pageSnapshot = compressedStorage.retrieve(storageKey)

                if (pageSnapshot) {

                    if ('posts' in pageSnapshot)             posts = pageSnapshot.posts
                    if ('page' in pageSnapshot)              page = pageSnapshot.page
                    if ('last_clicked_post' in pageSnapshot) last_clicked_post = pageSnapshot.last_clicked_post
                    if ('page_cursors' in pageSnapshot)      page_cursors = pageSnapshot.page_cursors
                    if ('sort' in pageSnapshot)              sort = pageSnapshot.sort
                    if ('type' in pageSnapshot)              type = pageSnapshot.type
                    if ('liked_only' in pageSnapshot)        liked_only = pageSnapshot.liked_only
                    if ('disliked_only' in pageSnapshot)     disliked_only = pageSnapshot.disliked_only
                    if ('saved_only' in pageSnapshot)        saved_only = pageSnapshot.saved_only
                    if ('community_id' in pageSnapshot)      community_id = pageSnapshot.community_id
                    if ('community_name' in pageSnapshot)    community_name = pageSnapshot.community_name

                    console.log("Snapshot loaded")
                    
                    
                    if (initial) {
                        $userSettings.uiState.infiniteScroll
                            ? scrollState.loading = false
                            : loading = false
                        return
                    }
                    
                }
                

                console.log("Running fetch")


                const batch = await getClient().getPosts({
                    limit: $userSettings?.uiState?.postsPerPage ?? 20,
                    page_cursor: $userSettings.uiState.infiniteScroll
                        ? posts.next_page
                        : page_cursors[page],
                    sort: sort,
                    disliked_only: disliked_only,
                    liked_only: liked_only,
                    saved_only: saved_only,
                    type_: type,
                    community_id: community_id,
                    community_name: community_name
                })
                
                batch.posts = addMBFCResults(batch.posts)
                batch.posts = filterKeywords(batch.posts)

                // Omit certain post processors if viewing a community (e.g. don't run xpost detection)
                if (!community_id && !community_name) {
                    batch.posts = findCrossposts(batch.posts)
                }
                        
                $userSettings.uiState.infiniteScroll
                    ? scrollState.loading = false
                    : loading = false
                
                if ($userSettings.uiState.infiniteScroll) {
                    if (batch.posts.length < 1) scrollState.exhausted = true
                    posts = {
                        next_page: batch.next_page,
                        posts: [...posts.posts, ...batch.posts]
                    }
                }
                else {
                    page_cursors[page+1] = batch.next_page
                    posts = batch
                }

                posts = posts
                
                // Store the data after each fetch?
                compressedStorage.store(storageKey, this.data)
            }
            catch (err){
                console.log(err);
            }
        },
        
        reset: function(clearSnapshot?: boolean) {
            if (clearSnapshot) compressedStorage.remove(storageKey)
            page = 1
            loading = false
            last_clicked_post = -1
            scrollState.loading = false
            scrollState.exhausted = false
            page_cursors =  [undefined, undefined]
            posts.next_page = undefined
            posts.posts = [] as PostView[]

        },

        refresh: function(clearSnapshot?: boolean) {
            refreshing = true
            this.reset(clearSnapshot)
            setTimeout( ()=> {
                this.load(true)
                this.scrollTop()
                refreshing = false
            }, 300)
        },

        scrollBottom: function() {
            scrollContainer.scrollTo(0,scrollContainer.scrollHeight)
        },

        scrollTop: function() {
            scrollContainer.scrollTo(0,0)
        },

        // Getter for the component's operational data and state
        get data() {
            return {
                sort: sort,
                type: type,
                saved_only: saved_only,
                liked_only: liked_only,
                disliked_only: disliked_only,
                community_id: community_id,
                community_name: community_name,

                page: page,
                posts: posts,
                last_clicked_post: last_clicked_post,
                page_cursors: page_cursors
            }
        },

        get community_id(): number|undefined {
            return community_id
        },

        set community_id(id:number|undefined) {
            community_name = undefined
            community_id = id
        },

        get community_name(): string|undefined {
            return community_name
        },

        set community_name(name:string|undefined) {
            community_id = undefined
            community_name = name
        },

        get disliked_only(): boolean|undefined {
            return disliked_only
        },

        set disliked_only(dlo:boolean | undefined) {
            disliked_only = dlo
            liked_only = undefined
            
            if (disliked_only) {
                $pageStore.url.searchParams.set('disliked_only', '1')
                $pageStore.url.searchParams.delete('liked_only')
            }
            else {
                $pageStore.url.searchParams.delete('disliked_only', '1')
            }
            goto($pageStore.url)
        },
        
        get liked_only(): boolean|undefined {
            return liked_only
        },

        set liked_only(lo:boolean | undefined) {
            liked_only = lo
            disliked_only = false

            if (liked_only) {
                $pageStore.url.searchParams.set('liked_only', '1')
                $pageStore.url.searchParams.delete('disliked_only')
            }
            else {
                $pageStore.url.searchParams.delete('liked_only')
            }
            goto($pageStore.url)
        },

        get saved_only(): boolean | undefined {
            return saved_only
        },

        set saved_only(so:boolean|undefined) {
            saved_only = so
        },

        get sort():SortType {
            return sort
        },

        set sort(sortType:SortType) {
            sort = sortType
            $pageStore.url.searchParams.set('sort', sort)
            goto($pageStore.url)
        },

        get type(): ListingType {
            return type
        },

        set type(t:ListingType) {
            type = t
            $pageStore.url.searchParams.set('type', type)
            goto($pageStore.url)
        }
    } as FeedController


 

    


    function changeCommunity(name:string) {
        if (controller.community_name != name) {
            
            // If changing communities, store a snapshot of the current community's data
            compressedStorage.store(storageKey, controller.data)

            console.log("Responding to community change")
            controller.community_name = name
            storageKey = updateStorageKey()
            controller.refresh()
        }

    }

    function updateStorageKey() {
        return 'snapshot_data_' + btoa(JSON.stringify({
            community_id,
            community_name,
        }))
    }
    

    

    // React to URL params
    if ($pageStore.url.searchParams.has('sort'))    controller.sort = $pageStore.url.searchParams.get('sort') as SortType
    if ($pageStore.url.searchParams.has('type'))    controller.type = $pageStore.url.searchParams.get('type') as ListingType
    
    if ($pageStore.url.searchParams.has('disliked_only')) {
        controller.disliked_only = true
        controller.liked_only = undefined
    }

    if ($pageStore.url.searchParams.has('liked_only')) {
        controller.disliked_only = undefined
        controller.liked_only = true
    }

    $: $pageStore.params.name, changeCommunity($pageStore.params.name)

    // When clicking into a post, an event is dispatched.  Store the post ID in the data that's put into the snapshot
    function handleClickIntoPost(e:ClickIntoPostEvent) {
        last_clicked_post = e.detail.post_id
        //compressedStorage.store(storageKey, controller.data)
    }


    onMount(async () => {
        await controller.load(true) 
    })

    onDestroy(() => {
        console.log("Component destroyed; saving data")
        compressedStorage.store(storageKey, controller.data)
    })

</script>

<svelte:window on:clickIntoPost={handleClickIntoPost} />


<div bind:this={scrollContainer}  class="flex flex-col w-full mt-2 gap-4 overflow-x-hidden overflow-y-scroll h-full {$$props.class}" style={$$props.style}>
    
    <!---Only use this loading spinner if infinite scroll is disabled--->
    {#if loading && !$userSettings.uiState.infiniteScroll}
        <span class="flex flex-row w-full h-full items-center">        
            <Spinner width={24} class="mx-auto my-auto"/>
        </span>
    {/if}

    {#if !loading && posts?.posts?.length > 0 }
        
        {#each posts.posts as item, idx (item.post.id)}
            <Post bind:post={item} scrollTo={last_clicked_post}  {actions} inCommunity={(community_id || community_name) ? true : false} />
        {/each}
        
    <!---Only use this placeholder if infinite scroll is disabled--->
    {:else if (!loading && !$userSettings.uiState.infiniteScroll)}
        <div class="mt-2 w-full flex flex-col gap-5 mx-auto">
            <Placeholder icon={ArchiveBox} title="No Posts" description="No posts were returned." />
        </div>
    {/if}

    
    
    {#if $userSettings.uiState.infiniteScroll}
        <div class="flex flex-col items-center pt-2 w-full">
            <InfiniteScrollDiv bind:state={scrollState} bind:element={scrollContainer} threshold={500} disabled={refreshing}
                on:loadMore={ () => {
                    // Hack to override the auto loading state
                    scrollState.loading = false
                    console.log("got loadMore")
                    controller.load()
                }}
            />
        </div>
    {:else}
        <Pageination bind:page class="px-4" on:change={async (e) => {
            page = e.detail
            //snapshot.store(storageKey, controller.data)
            compressedStorage.remove(storageKey)
            await controller.load(true)
            scrollContainer.scrollTo(0,0)
        }}/>
    {/if}
</div>

