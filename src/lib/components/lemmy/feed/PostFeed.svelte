<script context="module">
    const moduleName = 'PostFeed.svelte';
</script>

<script lang="ts">
    import type {
        BanCommunityEvent, 
        BanUserEvent, 
        BlockCommunityEvent, 
        BlockInstanceEvent, 
        BlockUserEvent, 
        HideCommunityEvent, 
        LastClickedPostEvent, 
        RemoveCommunityEvent, 
        RemovePostEvent, 
        SetSortTypeEvent

    } from "$lib/ui/events"
    
    import type { FeedController, FeedControllerLoadOptions } from './helpers'
    import type { GetPostsResponse, ListingType, PostView, SortType } from "lemmy-js-client"
    
    import { addMBFCResults, filterKeywords, findCrossposts, isNewAccount, lastSeenPost, sleep } from "../post/helpers"
    import { amMod } from '../moderation/moderation'
    import { StorageController } from "$lib/storage-controller"
    
    import { fade } from 'svelte/transition'
    import { getClient } from "$lib/lemmy"
    import {  goto } from '$app/navigation'
    import { instance } from '$lib/instance'
    import { onDestroy, onMount } from "svelte"
    import { page as pageStore } from '$app/stores'
    import { profile } from '$lib/auth';
    import { userIsInstanceBlocked } from '$lib/lemmy/user'
    import { userSettings } from "$lib/settings"
    
    import Button from '$lib/components/input/Button.svelte'
    import InfiniteScrollDiv from "$lib/components/ui/infinitescroll/InfiniteScrollDiv.svelte"
    import Pageination from "$lib/components/ui/Pageination.svelte"
    import Placeholder from "$lib/components/ui/Placeholder.svelte"
    import Post from "../post/Post.svelte";
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    
    import { ArchiveBox, ArrowPath, Icon } from "svelte-hero-icons"
    
    export let community_id: number | undefined     = undefined
    export let community_name: string | undefined   = undefined
    export let disliked_only: boolean|undefined     = undefined
    export let liked_only: boolean|undefined        = undefined
    export let saved_only: boolean|undefined        = undefined
    export let type: ListingType                    = $userSettings.defaultSort.feed ?? 'All'
    export let sort: SortType                       = ($pageStore.url.searchParams.get('sort') as SortType) ?? $userSettings.defaultSort.sort ?? 'New'
    export let actions: boolean                     = false
    export let snapshotValidity:number              = 15    //Number of minutes snapshots are valid
    
    

    $:  debugMode = $userSettings.debugInfo

    if (debugMode) console.log(moduleName, ": Sort method:", sort)
    if (debugMode) console.log(moduleName, ": Listing type:", type)

    let posts: GetPostsResponse = {
        next_page: undefined,
        posts: [] as PostView[]
    }
    let truncatedPosts: PostView[] = []

    // Controller that can be expored and used outside the component. Includes getters/setters for parameters.
    export const controller = {
        bound: true,
        storage: new StorageController({
            ttl: snapshotValidity,
            useCompression: true
        }),
        truncated: false,
        loading: false,
        refreshing: false,
        mounting: false,
        clearingSnapshot: false,
        loadedFromSnapshot: false,
        last_refreshed: Math.round(new Date().getTime() /1000),
        page: 1,
        last_clicked_post: undefined,
        instance: $instance,
        // Keep an array where the index is the page number and the element is the page cursor. Position 0 is a placeholder, 1 is undefined intentionally
        page_cursors: [undefined, undefined] as (string|undefined)[],

        scrollState: {
            loading: false,
            exhausted: false
        },

        invalidate: function() {
            sort = $userSettings.defaultSort.sort
            type = $userSettings.defaultSort.feed
            controller.refresh(true)
        },

        load: async function(opts?:FeedControllerLoadOptions): Promise<void> {
            try {
                if (debugMode) console.log(moduleName, ": Load running.  Opts: ", opts)

                $userSettings.uiState.infiniteScroll
                    ? this.scrollState.loading = true
                    : this.loading = true


                // If this is an initial load and there is snapshot data, return early and don't fetch anything from the API yet.
                if ( opts?.loadSnapshot && await this.loadSnapshot()) {
                    if (debugMode) console.log(moduleName, ": Initial load from snapshot. Not loading from API until requested")

                    $userSettings.uiState.infiniteScroll
                        ? this.scrollState.loading = false
                        : this.loading = false
                    
                    this.loadedFromSnapshot = true
                    this.refreshing = false

                    
                    return
                }

                if (debugMode) console.log(moduleName, ": Running post fetch against the API.")

                const batch = await getClient().getPosts({
                    limit: $userSettings?.uiState?.postsPerPage ?? 20,
                    page_cursor: $userSettings.uiState.infiniteScroll
                        ? posts.next_page
                        : this.page_cursors[this.page],
                    sort: sort,
                    disliked_only: disliked_only,
                    liked_only: liked_only,
                    saved_only: saved_only,
                    type_: type,
                    community_id: community_id,
                    community_name: community_name
                })
                
                batch.posts = [...filterKeywords(batch.posts)]
                batch.posts = [...addMBFCResults(batch.posts)]

                // Omit certain post processors if viewing a community (e.g. don't run xpost detection)
                if (!community_id && !community_name) {
                    batch.posts = [...findCrossposts(batch.posts)]
                }
                        
                // Reset loading values
                $userSettings.uiState.infiniteScroll
                    ? this.scrollState.loading = false
                    : this.loading = false
                
                this.refreshing = false
                
                if (opts?.append && $userSettings.uiState.infiniteScroll) {
                    if (batch.posts.length < 1) this.scrollState.exhausted = true
                    posts = {
                        next_page: batch.next_page,
                        posts: [...posts.posts, ...batch.posts]
                    }
                    
                    
                    
                    /*
                    if (posts.posts.length > 50) {
                        const oldPosts = posts.posts.splice(0, (posts.posts.length-50))
                        truncatedPosts = [...truncatedPosts, ...oldPosts]
                        this.truncated = true
                    }
                    */

                    
                }
                else {
                    this.page_cursors[this.page+1] = batch.next_page
                    posts = {...batch}
                }
                
                posts.posts = [...findCrossposts(posts.posts)]
                posts = posts
                
                this.last_refreshed = Math.round(new Date().getTime() /1000)
                
                // Store the data after each fetch?
                this.takeSnapshot()

                return

                
            }
            catch (err){
                if (debugMode) console.log(err);
            }
        },
        
        reset: async function(clearSnapshot?: boolean): Promise<void> {
            if (debugMode) console.log(moduleName, ": Resetting. Clear snapshot?", clearSnapshot)
            if (clearSnapshot) this.clearSnapshot()
            
            this.page = 1
            this.loading = false
            this.last_clicked_post = -1
            this.loadedFromSnapshot = false
            this.scrollState.loading = false
            this.scrollState.exhausted = false
            this.page_cursors =  [undefined, undefined]
            
            posts.next_page = undefined
            posts.posts = [] as PostView[]

            posts = posts

            return
        },

        refresh: function(clearSnapshot: boolean = false): void {
            if (debugMode) console.log(moduleName, ": Refreshing. Clear snapshot?", clearSnapshot)
            
            this.refreshing = true
            this.reset(clearSnapshot)
                .then(() => this.load({loadSnapshot: false, append: false}))
                .then(() => this.scrollTop())
                .then(() => this.isLoading=false)
            return

        },

        scrollBottom: function(): void {
            this.scrollContainer?.scrollTo(0,this.scrollContainer.scrollHeight)
        },

        scrollTop: function(): void {
            this.scrollContainer?.scrollTo(0,0)
        },

        takeSnapshot: async function(): Promise<void> {
            if (debugMode) console.log(moduleName, ": Taking snapshot: ", community_name)
            await this.storage.store(this.storageKey, this.data)
        },

        clearSnapshot: function(): void {
            if (this.clearingSnapshot) {
                if (debugMode) console.log(moduleName, ": Another clearing snapshot operation is in progress. Returning.")
                return
            }
            
            if (debugMode) console.log(moduleName, ": Clearing snapshot:", this.storageKey)
            this.clearingSnapshot = true
            this.storage.remove(this.storageKey)
            this.clearingSnapshot = false

            return
        },

        loadSnapshot: async function(): Promise<boolean> {
            let pageSnapshot = await this.storage.retrieve(this.storageKey)

            if (pageSnapshot) {
                // Only use snapshots if they're relatively fresh
                let now = Math.round(new Date().getTime() /1000)

                // Check age of snapshot; discard if older than 30 minutes (currently hardcoded)
                if (now - pageSnapshot.last_refreshed > (snapshotValidity * 60)) {
                    if (debugMode) console.log(moduleName, ": Snapshot is expired. Removing.")
                    this.storage.remove(this.storageKey)
                    return false
                }

                this.last_refreshed = pageSnapshot.last_refreshed

                if ('sort' in pageSnapshot)              sort = pageSnapshot.sort
                if ('type' in pageSnapshot)              type = pageSnapshot.type
                if ('posts' in pageSnapshot)             posts = {...pageSnapshot.posts}
                if ('truncatedPosts' in pageSnapshot)    truncatedPosts = [...pageSnapshot.truncatedPosts]
                if ('page' in pageSnapshot)              this.page = pageSnapshot.page
                if ('last_clicked_post' in pageSnapshot) this.last_clicked_post = pageSnapshot.last_clicked_post
                if ('page_cursors' in pageSnapshot)      this.page_cursors = [...pageSnapshot.page_cursors]
                if ('liked_only' in pageSnapshot)        liked_only = pageSnapshot.liked_only
                if ('disliked_only' in pageSnapshot)     disliked_only = pageSnapshot.disliked_only
                if ('saved_only' in pageSnapshot)        saved_only = pageSnapshot.saved_only
                if ('community_id' in pageSnapshot)      community_id = pageSnapshot.community_id
                if ('community_name' in pageSnapshot)    community_name = pageSnapshot.community_name

                if (debugMode) console.log(moduleName, ": Snapshot loaded: ", this.storageKey)
                pageSnapshot = null
                return true
            }
            pageSnapshot = null
            return false
        },

        get busy() {
            return (this.mounting || this.isLoading || this.refreshing || this.clearingSnapshot )
        },

        get isLoading() {
            return (this.loading || this.scrollState.loading)
        },

        set isLoading(val:boolean) {
            this.scrollState.loading = val
            this.refreshing = val
            this.loading = val
        },

        // Getter to get the storage key based on the params
        get storageKey() {
           return `snapshot_feed_${this.instance}_` + (JSON.stringify({
                community_id,
                community_name,
            }))
        },

        // Getter for the component's operational data and state
        get data() {
            return {
                sort: this.sort,
                type: this.type,
                saved_only: this.saved_only,
                liked_only: this.liked_only,
                disliked_only: this.disliked_only,
                community_id: this.community_id,
                community_name: this.community_name,
                last_refreshed: this.last_refreshed,
                page: this.page,
                posts: {...posts},
                truncatedPosts: [...truncatedPosts],
                last_clicked_post: this.last_clicked_post,
                page_cursors: [...this.page_cursors]
            }
        },

        get community_id(): number|undefined {
            return community_id
        },

        set community_id(id:number|undefined) {
            if (debugMode) console.log("Setting community_name from:", community_id, " to ", id)
            community_name = undefined
            community_id = id
            this.refreshing = true
            this.reset(false).then(() => this.load({loadSnapshot: true, append:true}))
            
        },

        get community_name(): string|undefined {
            return community_name
        },

        set community_name(name:string|undefined) {
            if (debugMode) console.log("Setting community_name from:", community_name, " to ", name)
            community_id = undefined
            community_name = name
            this.refreshing = true
            this.reset(false)
                .then(() => this.load({loadSnapshot: true, append:true}))
            
        },

        get disliked_only(): boolean|undefined {
            return disliked_only
        },

        set disliked_only(dlo:boolean | undefined) {
            disliked_only = dlo
            liked_only = undefined
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: true, append:true}))
            
        },
        
        get liked_only(): boolean|undefined {
            return liked_only
        },

        set liked_only(lo:boolean | undefined) {
            liked_only = lo
            disliked_only = undefined
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: true, append:true}))
           
        },

        get saved_only(): boolean | undefined {
            return saved_only
        },

        set saved_only(so:boolean|undefined) {
            saved_only = so
            liked_only = undefined
            disliked_only = undefined
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: true, append:true}))
        },

        get sort():SortType {
            return sort
        },

        set sort(sortType:SortType) {
            if (debugMode) console.log("Setting sort type:", sort, " to ", sortType)
            sort = sortType
            this.refreshing = true
            
            this.reset(true)
                .then(() => this.load({loadSnapshot: false, append: false}))
            return
        },

        get type(): ListingType {
            return type
        },

        set type(t:ListingType) {
            if (debugMode) console.log("Setting listing type:", type, " to ", t)

            type = t
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: false, append: false}))
            return
        }
    } as FeedController

    
 
    // React if the community changes
    $:  $pageStore.params.name, community_name, changeCommunity($pageStore.params.name ?? community_name)
    $:  $instance, changeInstance($instance)

    // Instance change handler
    function changeInstance(instance:string) {
        if (controller.busy || controller.instance == instance) return

        if (debugMode) console.log(moduleName, ": Responding to instance change")
        controller.instance = instance

        // Give the profile a moment to load to hopefully be able to pick up the block lists to avoid a manual refresh of the feed to address
        sleep(50).then(() => controller.refresh())
    }

    // React to community changing in the URL route (/c/community -> /c/community2)
    function changeCommunity(name:string) {
        // Don't do anything if the current community name is the same as the old one.
        if (controller.busy || controller.community_name == name) return
        if (debugMode) console.log(moduleName, ": Responding to community change:", controller.community_name, "->", name)
        controller.community_name = name
    }
    

    // Event Handlers
    const handlers = {
        BanCommunityEvent: function (e:BanCommunityEvent) {
            for (let i:number=0; i < posts.posts.length; i++) {
                
                if (posts.posts[i].creator.id == e.detail.person_id && posts.posts[i].community.id == e.detail.community_id) {
                    posts.posts[i].creator_banned_from_community = e.detail.banned
                    if (e.detail.remove_content) posts.posts[i].post.removed = e.detail.remove_content
                }
            }
            posts = posts
        },
        BanUserEvent: function (e:BanUserEvent) {
            for (let i:number=0; i < posts.posts.length; i++) {
                if (posts.posts[i].creator.id == e.detail.person_id) {
                    posts.posts[i].creator.banned = e.detail.banned
                    if (e.detail.remove_content) posts.posts[i].post.removed = e.detail.remove_content
                }
            }
            posts = posts
        },
        
        BlockCommunityEvent(e:BlockCommunityEvent) {
            for (let i:number=0; i < posts.posts.length; i++) {
                
                if (posts.posts[i].community.id == e.detail.community_id) {
                    // Setting the community to hidden will hide the post; there's no key for `community_blocked`
                    posts.posts[i].community.hidden = e.detail.blocked
                }
            }
            posts = posts
        },

        BlockInstanceEvent(e:BlockInstanceEvent) {
            for (let i:number=0; i < posts.posts.length; i++) {
                
                if (posts.posts[i].creator.instance_id == e.detail.instance_id || posts.posts[i].community.instance_id == e.detail.instance_id) {
                    // Setting the creator_blocked will hide the post; there's no key for `instance_blocked`
                    posts.posts[i].creator_blocked = e.detail.blocked
                }
            }
            posts = posts
        },

        BlockUserEvent(e:BlockUserEvent) {
            for (let i:number=0; i < posts.posts.length; i++) {
                
                if (posts.posts[i].creator?.id == e.detail.person_id) {
                    posts.posts[i].creator_blocked = e.detail.blocked
                }
            }
            posts = posts
        },

        RemovePostEvent(e:RemovePostEvent) {
            for (let i:number=0; i < posts.posts.length; i++) {
                if (posts.posts[i].post.id == e.detail.post_id) {
                    posts.posts[i].post.removed = e.detail.removed
                }
            }
            posts = posts
        },

        HideCommunityEvent(e:HideCommunityEvent) {
            for (let i:number=0; i < posts.posts.length; i++) {
                if (posts.posts[i].community.id == e.detail.community_id) {
                    posts.posts[i].community.hidden = e.detail.hidden
                }
            }
            posts = posts
        },
        
        LastClickedPostEvent: function (e:LastClickedPostEvent) {
            if (debugMode) console.log(moduleName, ": Setting 'last_clicked_post' to ", e.detail.post_id)
            controller.last_clicked_post = e.detail.post_id
        },
        
        RemoveCommunityEvent(e:RemoveCommunityEvent) {
            for (let i:number=0; i < posts.posts.length; i++) {
                if (posts.posts[i].community.id == e.detail.community_id) {
                    posts.posts[i].community.removed = e.detail.removed
                }
            }
            posts = posts
        },

        SetSortTypeEvent(e:SetSortTypeEvent) {
            console.log(moduleName, ": Received sort type event:", e.detail.sort)
            if (e.detail.sort != controller.sort) controller.sort = e.detail.sort;
        }
    }



    // Lifecycle Functions
    onMount(async () => {
        if (debugMode) console.log(moduleName, ": Mounting component and calling loader.")
        controller.mounting = true
        await controller.load({loadSnapshot: true, append: false})
        controller.mounting = false
    })

    onDestroy(() => {
        if (debugMode) console.log(moduleName, ": Component destroyed; saving data")
        controller.takeSnapshot().then( () => {
            controller.reset() 
        })
    })
</script>


<svelte:window 
    on:banUser={handlers.BanUserEvent}
    on:banCommunity={handlers.BanCommunityEvent}
    on:blockUser={handlers.BlockUserEvent} 
    on:blockCommunity={handlers.BlockCommunityEvent} 
    on:blockInstance={handlers.BlockInstanceEvent}
    on:hideCommunity={handlers.HideCommunityEvent}
    on:lastClickedPost={handlers.LastClickedPostEvent}
    on:removeCommunity={handlers.RemoveCommunityEvent}
    on:removePost={handlers.RemovePostEvent}
    

    on:setSortType={handlers.SetSortTypeEvent}

    on:beforeunload={() => {
        if (debugMode) console.log(moduleName, ": Page refresh requested; flushing snapshot")
        controller.clearSnapshot()
    }}
/>


<div bind:this={controller.scrollContainer}  class="flex flex-col w-full gap-4 md:pr-2 overflow-x-hidden overflow-y-scroll h-full {$$props.class}" style={$$props.style}>
    <slot name="banner" />

    <!---Note the last refresh time if using infinite scroll--->
    {#if $userSettings.uiState.infiniteScroll || (!$userSettings.uiState.infiniteScroll && controller.page == 1)}
        <div class="flex flex-row w-full items-end border-b dark:border-zinc-700 p-2 justify-between">
            <span class="text-xs opacity-80">
                Last refreshed <RelativeDate date={(controller.last_refreshed * 1000)} class="lowercase"/>
            </span>

            <Button color="tertiary-border" title="Refresh" side="md" icon={ArrowPath} iconSize={16} 
                loading={controller.busy} disabled={controller.busy}
                on:click={() => {
                    controller.refreshing = true
                    controller.refresh(true) 
                }}
            >
                Refresh
            </Button>
        </div>
    {/if}

    {#if controller.truncated && truncatedPosts.length > 0}
        <Button icon={ArchiveBox} class="w-full" color="tertiary-border" on:click={() => {
            posts.posts = [...truncatedPosts, ...posts.posts]
            truncatedPosts = []
            posts = posts
        }}>
            Show {truncatedPosts.length} Hidden Posts
        </Button>

    {/if}


    <!---Only use this loading spinner if infinite scroll is disabled--->
    {#if controller.isLoading || controller.refreshing} <!--&& !$userSettings.uiState.infiniteScroll}-->
        <span class="flex flex-row w-full h-full items-center">        
            <Spinner width={24} class="mx-auto my-auto"/>
        </span>
    {/if}

    {#if posts?.posts?.length > 0 }

        {#each posts.posts as post, idx (post.post.id)}
            {#if 
                !post.creator_blocked && 
                !post.community.hidden &&
                !post.hidden &&  
                !($userSettings.hidePosts.deleted && post.post.deleted) && 
                !($userSettings.hidePosts.removed && post.post.removed) &&
                //@ts-ignore
                !($userSettings.hidePosts.MBFCLowCredibility && post.post.mbfc?.credibility == 'Low Credibility') &&
                !(
                    // "or" conditions that should qualify the post to be hidden in the feed unless you're a mod of the community it's posted to
                    // or a local admin and the community is local
                    (
                        // Hide posts from new accounts (if they are not your own posts)
                        ($userSettings.hidePosts.newAccounts &&  isNewAccount(post.creator.published) && post.creator.id != $profile?.user?.local_user_view?.person?.id) ||
                        
                        // Hide posts from users whose instances you have blocked
                        ($userSettings.hidePosts.hideUsersFromBlockedInstances && userIsInstanceBlocked($profile?.user, post.creator.instance_id))
                    ) 
                    // Safety check to ensure moderators and local admins will see the posts for moderation purposes
                    && (!amMod($profile?.user, post.community))
                )
            }
                <div transition:fade>
                    <Post {post} scrollTo={controller.last_clicked_post}  {actions} inCommunity={(community_id || community_name) ? true : false} />
                </div>
            {/if}
        {/each}
    {/if}


    
    {#if (!controller.busy && posts?.posts?.length == 0)}
        <div class="mt-2 w-full flex flex-col gap-5 h-full mx-auto">
            <Placeholder icon={ArchiveBox} title="No Posts" description="No posts were returned." />
        </div>
    {/if}

    
    <!---Infinite Scroll or Manual Pagination--->
    {#if posts.posts.length > 0 && $userSettings.uiState.infiniteScroll}
        
        <div class="flex flex-col items-center pt-2 my-auto w-full">
            <InfiniteScrollDiv bind:state={controller.scrollState} bind:element={controller.scrollContainer} threshold={500} bind:disabled={controller.busy}
                on:loadMore={ () => {
                    if (debugMode) console.log(moduleName, ": Received loadMore event from infinite scroll component")
                    controller.page++
                    controller.load({loadSnapshot: false, append: true})
                        .then(() => { controller.isLoading = false })
                }}
            />
        </div>
    
    {:else if !controller.refreshing && !$userSettings.uiState.infiniteScroll}
        <Pageination bind:page={controller.page} class="px-4 mb-4" on:change={async (e) => {
            controller.page = e.detail
            controller.refreshing = true
            controller.clearSnapshot()
            posts.posts = []
            controller.load({loadSnapshot: false, append: false})
                .then(() => controller.scrollTop())
        }}/>
    {/if}
</div>



