<script context="module">
    const moduleName = 'PostFeed.svelte';
</script>

<script lang="ts">
    import type {
        ChangeProfileEvent, 
        ClickIntoPostEvent, 
        LastClickedPostEvent, 
        SetSortTypeEvent,
    } from "$lib/ui/events"
    
    import type { GetPostsResponse, ListingType, PostView, SortType } from "lemmy-js-client"
    
    import { 
        type FeedController,
        type FeedControllerLoadOptions,
        parseSortType,   
    } from './helpers'
    
    
    import { addMBFCResults, findCrossposts, sleep } from "../post/helpers"
    import { amModOfAny } from '../moderation/moderation'
    import { getClient, minAPIVersion } from "$lib/lemmy"
    import {  goto } from '$app/navigation'
    import { instance } from '$lib/instance'
    import { onDestroy, onMount } from "svelte"
    import { page as pageStore } from '$app/stores'
    import { profile } from '$lib/auth'
    import { 
        sortOptions, 
        sortOptionNames
    } from '$lib/lemmy'
    import { StorageController } from "$lib/storage-controller"
    import { userSettings } from "$lib/settings"
    
    import Button                   from '$lib/components/input/Button.svelte'
    import CollapseButton           from "$lib/components/ui/CollapseButton.svelte"
    import InfiniteScrollDiv        from "$lib/components/ui/infinitescroll/InfiniteScrollDiv.svelte"
    import Pageination              from "$lib/components/ui/Pageination.svelte"
    import Placeholder              from "$lib/components/ui/Placeholder.svelte"
    import Post                     from "../post/Post.svelte"
    import RelativeDate             from '$lib/components/util/RelativeDate.svelte'
    import SelectMenu               from "$lib/components/input/SelectMenu.svelte"
    import SettingToggle            from "$lib/components/ui/settings/SettingToggle.svelte"
    import SettingToggleContainer   from "$lib/components/ui/settings/SettingToggleContainer.svelte"
    import Spinner                  from "$lib/components/ui/loader/Spinner.svelte"
    
    import { ArchiveBox, ArrowPath, Bars3, BarsArrowDown, Bookmark, ExclamationCircle, Eye, EyeSlash, Funnel, HandThumbDown, HandThumbUp } from "svelte-hero-icons"
    
    
    
    export let community_id: number | undefined     = undefined
    export let community_name: string | undefined   = undefined
    export let disliked_only: boolean|undefined     = undefined
    export let liked_only: boolean|undefined        = undefined
    export let saved_only: boolean|undefined        = undefined
    export let show_hidden: boolean|undefined       = !$userSettings.hidePosts.hidden
    export let show_read: boolean | undefined       = !$userSettings.hidePosts.read
    export let show_nsfw: boolean | undefined       = !$userSettings.hidePosts.nsfw
    export let type: ListingType                    = $userSettings.defaultSort.feed ?? 'All'
    export let sort: SortType                       = $userSettings.defaultSort.sort ?? 'New'
    export let actions: boolean                     = false
    export let snapshotValidity:number              = $userSettings.feedSnapshotValidity ?? 15    //Number of minutes snapshots are valid
    export let feedName: string                     = 'default'
    export let inModal:boolean                      = false // Prevents changing community from URL param

    if ($userSettings.debugInfo) console.log(moduleName, ": Sort method:", sort)
    if ($userSettings.debugInfo) console.log(moduleName, ": Listing type:", type)

    let posts: GetPostsResponse = {
        next_page: undefined,
        posts: [] as PostView[]
    }
    let truncatedPostCount = 0
    let listingTypeOptions:string[] = ['Subscribed', 'Local', 'All'] as ListingType[]
    let listingTypeOptionNames      = [...listingTypeOptions]

    // Controller that can be expored and used outside the component. Includes getters/setters for parameters.
    export const controller = {
        bound: true,
        storage: new StorageController({
            type: 'local',
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
        profileID: $profile?.id ?? -1,
        // Keep an array where the index is the page number and the element is the page cursor. Position 0 is a placeholder, 1 is undefined intentionally
        page_cursors: [undefined, undefined] as (string|undefined)[],

        scrollState: {
            loading: false,
            exhausted: false
        },

        invalidate: function() {
            sort = $userSettings.defaultSort.sort
            type = $userSettings.defaultSort.feed
            this.refresh(true)
        },

        load: async function(opts?:FeedControllerLoadOptions): Promise<void> {
            try {
                if ($userSettings.debugInfo) console.log(moduleName, ": Load running.  Opts: ", opts)

                $userSettings.uiState.infiniteScroll
                    ? this.scrollState.loading = true
                    : this.loading = true


                // If this is an initial load and there is snapshot data, return early and don't fetch anything from the API yet.
                if ( opts?.loadSnapshot &&  await this.loadSnapshot()) {
                    if ($userSettings.debugInfo) console.log(moduleName, ": Initial load from snapshot. Not loading from API until requested")

                    $userSettings.uiState.infiniteScroll
                        ? this.scrollState.loading = false
                        : this.loading = false
                    
                    this.loadedFromSnapshot = true
                    this.refreshing = false

                    
                    return
                }

                if ($userSettings.debugInfo) console.log(moduleName, ": Running post fetch against the API.")

                const batch = await getClient().getPosts({
                    limit: $userSettings?.uiState?.postsPerPage ?? 20,
                    page_cursor: $userSettings.uiState.infiniteScroll
                        ? posts.next_page
                        : this.page_cursors[this.page],
                    sort: sort,
                    disliked_only: disliked_only,
                    liked_only: liked_only,
                    saved_only: saved_only,
                    show_hidden: show_hidden,
                    show_read: show_read,
                    show_nsfw: show_nsfw,
                    type_: type,
                    community_id: community_id,
                    community_name: community_name
                })
                
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
                    
                    
                    if (posts.posts.length > $userSettings.uiState.maxScrollPosts) {
                        let truncateCount = posts.posts.length - $userSettings.uiState.maxScrollPosts

                        posts.posts.splice(0, truncateCount)
                        truncatedPostCount += truncateCount
                        this.truncated = true
                    }
                    
                    
                }
                else {
                    this.page_cursors[this.page+1] = batch.next_page
                    posts = {...batch}
                }
                
                //posts.posts = [...findCrossposts(posts.posts)]
                posts = posts
                
                // Reset the clock on the last refresh time to keep the snapshot alive
                this.last_refreshed = Math.round(new Date().getTime() /1000)
                
                // Store the data after each fetch?
                this.takeSnapshot()

                return

                
            }
            catch (err){
                if ($userSettings.debugInfo) console.log(err);
                this.clearSnapshot()
            }
        },
        
        reset: async function(clearSnapshot?: boolean): Promise<void> {
            if ($userSettings.debugInfo) console.log(moduleName, ": Resetting. Clear snapshot?", clearSnapshot)
            if (clearSnapshot) this.clearSnapshot()
            
            this.page = 1
            this.loading = false
            this.last_clicked_post = -1
            this.loadedFromSnapshot = false
            this.scrollState.loading = false
            this.scrollState.exhausted = false
            this.page_cursors =  [undefined, undefined]
            
            posts.next_page = undefined
            
            for (let i=0; i < posts.posts.length; i++) {
                //@ts-ignore
                posts.posts[i] = null
            }

            
            posts.posts = [] as PostView[]
            truncatedPostCount = 0
            this.truncated = false
            posts = posts

            return
        },

        refresh: async function(clearSnapshot: boolean = false): Promise<void> {
            if ($userSettings.debugInfo) console.log(moduleName, ": Refreshing. Clear snapshot?", clearSnapshot)
            
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
            if ($userSettings.debugInfo) console.log(moduleName, ": Taking snapshot: ", this.storageKey)
            await this.storage.store(this.storageKey, this.data)
        },

        clearSnapshot: function(): void {
            if (this.clearingSnapshot) {
                if ($userSettings.debugInfo) console.log(moduleName, ": Another clearing snapshot operation is in progress. Returning.")
                return
            }
            
            if ($userSettings.debugInfo) console.log(moduleName, ": Clearing snapshot:", this.storageKey)
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
                /*
                if (now - pageSnapshot.last_refreshed > (snapshotValidity * 60)) {
                    if ($userSettings.debugInfo) console.log(moduleName, ": Snapshot is expired. Removing.")
                    this.storage.remove(this.storageKey)
                    return false
                }
                */
                

                this.last_refreshed = pageSnapshot.last_refreshed

                if ('sort' in pageSnapshot)              sort = pageSnapshot.sort
                if ('type' in pageSnapshot)              type = pageSnapshot.type
                if ('posts' in pageSnapshot)             posts = {...pageSnapshot.posts}
                if ('show_hidden' in pageSnapshot)       show_hidden = pageSnapshot.show_hidden
                if ('show_read' in pageSnapshot)         show_read = pageSnapshot.show_read
                if ('show_nsfw' in pageSnapshot)         show_nsfw = pageSnapshot.show_nsfw

                if ('truncated' in pageSnapshot)         this.truncated = pageSnapshot.truncated
                if ('truncatedPostCount' in pageSnapshot)    truncatedPostCount = pageSnapshot.truncatedPostCount
                if ('page' in pageSnapshot)              this.page = pageSnapshot.page
                if ('last_clicked_post' in pageSnapshot) this.last_clicked_post = pageSnapshot.last_clicked_post
                
                if ('page_cursors' in pageSnapshot)      this.page_cursors = [...pageSnapshot.page_cursors]
                if ('liked_only' in pageSnapshot)        liked_only = pageSnapshot.liked_only
                if ('disliked_only' in pageSnapshot)     disliked_only = pageSnapshot.disliked_only
                if ('saved_only' in pageSnapshot)        saved_only = pageSnapshot.saved_only
                if ('community_id' in pageSnapshot)      community_id = pageSnapshot.community_id
                if ('community_name' in pageSnapshot)    community_name = pageSnapshot.community_name

                if ($userSettings.debugInfo) console.log(moduleName, ": Snapshot loaded: ", this.storageKey)
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
           return `snapshot_feed_${feedName}_${this.instance}_${this.type}_${this.sort}` + (JSON.stringify({
                community_id,
                community_name,
                profileID: $profile?.id
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
                show_hidden:    this.show_hidden,
                show_read:      this.show_read,
                show_nsfw:      this.show_nsfw,
                community_name: this.community_name,
                last_refreshed: this.last_refreshed,
                page: this.page,
                posts: {...posts},
                truncatedPostCount: truncatedPostCount,
                truncated: this.truncated,
                last_clicked_post: this.last_clicked_post,
                page_cursors: [...this.page_cursors]
            }
        },

        get community_id(): number|undefined {
            return community_id
        },

        set community_id(id:number|undefined) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Setting community_id from:", community_id, " to ", id)
            this.takeSnapshot().then(() => {
                community_name = undefined
                community_id = id
                this.refreshing = true
                this.reset(false).then(() => this.load({loadSnapshot: true, append:true}))
            })
            
        },

        get community_name(): string|undefined {
            return community_name
        },

        set community_name(name:string|undefined) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Setting community_name from:", community_name, " to ", name)
            this.takeSnapshot().then(() => {
                community_id = undefined
                community_name = name
                this.refreshing = true
                this.reset(false)
                    .then(() => this.load({loadSnapshot: true, append:true}))
            })
            
        },

        get disliked_only(): boolean|undefined {
            return disliked_only
        },

        set disliked_only(dlo:boolean | undefined) {
            disliked_only = dlo
            liked_only = undefined
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: false, append:false}))
            
        },
        
        get liked_only(): boolean|undefined {
            return liked_only
        },

        set liked_only(lo:boolean | undefined) {
            liked_only = lo
            disliked_only = undefined
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: false, append:false}))
           
        },

        get saved_only(): boolean | undefined {
            return saved_only
        },

        set saved_only(so:boolean|undefined) {
            saved_only = so
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: false, append:false}))
        },

        get show_hidden(): boolean | undefined {
            return show_hidden
        },

        set show_hidden(val:boolean) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Setting show hidden to:", val)
            show_hidden = val
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: false, append: false}))
        },

        get show_nsfw(): boolean | undefined {
            return show_nsfw
        },

        set show_nsfw(val:boolean) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Setting show NSFW to:", val)
            show_nsfw = val
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: false, append: false}))
        },

        get show_read(): boolean |undefined {
            return show_read
        },

        set show_read(val:boolean) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Setting show read to:", val)
            show_read = val
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: false, append: false}))
        },

        get sort():SortType {
            return sort
        },

        set sort(sortType:SortType) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Setting sort type:", sort, " to ", sortType)
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
            if ($userSettings.debugInfo) console.log(moduleName, ": Setting listing type:", type, " to ", t)

            type = t
            this.refreshing = true
            this.reset(true)
                .then(() => this.load({loadSnapshot: false, append: false}))
            return
        }
    } as FeedController

    // React if the community changes
    $:  $pageStore.params.community_name, community_name, changeCommunity($pageStore.params.community_name ?? community_name)

    $:  inCommunity = (community_name || community_id) ? true : false

    // React to community changing in the URL route (/c/community -> /c/community2)
    function changeCommunity(name:string) {
        // Don't do anything if the current community name is the same as the old one.
        if (inModal || controller.busy || controller.community_name == name) return
        if ($userSettings.debugInfo) console.log(moduleName, ": Responding to community change:", controller.community_name, "->", name)
        controller.community_name = name
    }
    

    // Event Handlers
    const handlers = {
        ChangeProfileEvent(e:ChangeProfileEvent) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Responding to profile change")
            if ($profile?.instance) controller.instance = $profile.instance
            controller.reset()
                .then(() => controller.load({loadSnapshot: true, append:false}))
        },

       
        LastClickedPostEvent: function (e:LastClickedPostEvent) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Setting 'last_clicked_post' to ", e.detail.post_id)
            controller.last_clicked_post = e.detail.post_id
        },

        RequestSnapshotEvent(e:ClickIntoPostEvent) {
            controller.takeSnapshot()
        },

        SetSortTypeEvent(e:SetSortTypeEvent) {
            console.log(moduleName, ": Received sort type event:", e.detail.sort)
            if (e.detail.sort != controller.sort) controller.sort = e.detail.sort;
        },
    }
    

    async function mount() {
        if ($userSettings.debugInfo) console.log(moduleName, ": Mounting component and calling loader.")
        
        controller.storage.housekeep()

        controller.mounting = true
        
        const invalidate = $pageStore.url.searchParams.has('invalidate')
        
        if (invalidate) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Detected invalidate parameter. Clearing state...")
            
            controller.invalidate()
            sleep(25).then(() => {
                $pageStore.url.searchParams.delete('invalidate')
                goto($pageStore.url)
            })
            
            //goto($pageStore.url).then(() => controller.invalidate())
        }
        else {
            await controller.load({loadSnapshot: true, append: false})
        }
       
        controller.mounting = false
    }


    // Lifecycle Functions
    onMount(async () => {
        if ($userSettings.debugInfo) console.log(moduleName, ": onMount invoked.")
        await mount() 
    })
        
    

    onDestroy(() => {
        if ($userSettings.debugInfo) console.log(moduleName, ": Component destroyed; saving data")
        controller.takeSnapshot().then(() => {
            controller.reset()
            controller.scrollContainer?.remove()
            //@ts-ignore
            controller.scrollContainer = null
        })
    })

    // Conditionally add/remove "Moderator View" to the listing types if the user is a mod or admin
    $:  if ($profile?.user && amModOfAny($profile.user)) {
            if (!listingTypeOptions.includes('ModeratorView'))      listingTypeOptions.push('ModeratorView')
            if (!listingTypeOptionNames.includes('Moderator View')) listingTypeOptionNames.push("Mod View")
        }
        else {
            if (listingTypeOptions.includes('ModeratorView'))       listingTypeOptions.splice(listingTypeOptions.indexOf('ModeratorView'), 1)
            if (listingTypeOptionNames.includes('ModeratorView'))   listingTypeOptionNames.splice(listingTypeOptionNames.indexOf('Mod View'), 1)
        }
</script>

<svelte:window 
    on:changeProfile    = {handlers.ChangeProfileEvent}
    on:lastClickedPost  = {handlers.LastClickedPostEvent}
    on:refreshFeed      = {() => {
        if ($userSettings.debugInfo) console.log(moduleName, ": Responding to refresh feed event.")
        controller.refreshing = true
        controller.refresh(true) 
    }}
    on:requestSnapshot  = {handlers.RequestSnapshotEvent}
    on:setSortType      = {handlers.SetSortTypeEvent}
    on:beforeunload     = {() => {
        if ($userSettings.debugInfo) console.log(moduleName, ": Page refresh requested; flushing snapshot")
        controller.clearSnapshot()
        controller.reset()
        controller.scrollContainer?.remove()
    }}
/>


<div bind:this={controller.scrollContainer} id="feed" class="flex flex-col w-full gap-4 md:pr-2 overflow-x-hidden  h-full {$$props.class}" style={$$props.style}>
    <slot name="banner" />

    <!---Type and Sort Selectors--->
    <div class="flex flex-row p-2 w-full mx-auto items-center justify-between {($userSettings.uiState.feedMargins && !inModal)  ? 'max-w-3xl' : 'w-full'}">
    
        <!---Listing Type--->
        {#if !inCommunity}
            <span class="flex flex-col gap-1">
            
                <span class="font-bold text-sm opacity-80">Listing Type</span>
                <SelectMenu alwaysShowSelectedLabel
                    alignment="bottom-left"
                    options={listingTypeOptions}
                    optionNames={listingTypeOptionNames}
                    selected={type}
                    title="Listing Type"
                    icon={Bars3}
                    iconSize={18}
                    on:select={(e) => {
                        if (!inModal && $pageStore.url.pathname.includes('/home/')) {
                            goto(`/home/${e.detail.toLowerCase()}/${sort.toLowerCase()}`)
                        }
                        else {
                            //@ts-ignore
                            controller.type = e.detail
                        }
                    }}

                />
            </span>
        {/if}
        
        <!---Refresh Feed
        <span class="flex flex-col h-full gap-1">
            <Button color="tertiary-border" title="Refresh" size="lg" class="h-[40px] mt-auto font-bold" icon={ArrowPath} iconSize={16} 
                loading={controller.busy} disabled={controller.busy}
                on:click={() => {
                    if ($userSettings.debugInfo) console.log(moduleName, ": Refresh button clicked")
                    controller.refreshing = true
                    controller.refresh(true) 
                }}
            >
                <span class="hidden lg:flex">Refresh</span>
            </Button>
        </span>
        --->
        <!---Sort Direction--->
        <span class="flex flex-col ml-auto gap-1">
            <span class="font-bold text-sm opacity-80">Sort Direction</span>
            <SelectMenu alwaysShowSelectedLabel
                rightJustify
                alignment="bottom-right"
                options={sortOptions}
                optionNames={sortOptionNames}
                selected={sort}
                title="Sort Direction"
                icon={BarsArrowDown}
                iconSize={18}
                on:select={(e) => {
                    if (!inModal) {
                        if ($pageStore.url.pathname.includes('/home/')) goto(`/home/${type.toLowerCase()}/${e.detail.toLowerCase()}`)
                        else if ($pageStore.url.pathname.includes('/c/') && community_name) goto(`/c/${community_name}/${e.detail.toLowerCase()}`)
                        else controller.sort = parseSortType(e.detail)
                    }
                    else {
                        controller.sort = parseSortType(e.detail)
                    }
                }}
            />
        </span>

    </div>

    <!---Note the last refresh time if using infinite scroll--->
    {#if $userSettings.uiState.infiniteScroll || (!$userSettings.uiState.infiniteScroll && controller.page == 1)}
        
        <div class="flex flex-col w-full items-start border-b dark:border-zinc-700 mx-auto {($userSettings.uiState.feedMargins && !inModal)  ? 'max-w-3xl' : 'w-full'}">
            {#if $profile?.user}
                <CollapseButton icon={Funnel} title="Feed Filters" bottomBorder={false} class="w-full">
                    <SettingToggleContainer>
                        <SettingToggle small bind:value={liked_only} icon={HandThumbUp} title="Show Only Liked Posts" on:change={(e) => {
                            controller.liked_only = e.detail  
                        }}/>
                        
                        <SettingToggle small bind:value={disliked_only} icon={HandThumbDown} title="Show Only Disliked Posts" on:change={(e) => {
                            controller.disliked_only = e.detail  
                        }}/>
            
                        <SettingToggle small bind:value={saved_only} icon={Bookmark} title="Show Only Saved Posts {community_name || community_id ? 'in This Community' : ''}" on:change={(e) => {
                            controller.saved_only = e.detail  
                        }}/>

                        <!---Show Hidden Posts: Requires at least 0.19.4--->
                        <SettingToggle small bind:value={show_hidden} icon={EyeSlash} title="Show Hidden Posts" 
                            condition={minAPIVersion('0.19.4')}
                            on:change={(e) => {
                                controller.show_hidden = e.detail
                                $userSettings.hidePosts.hidden = !e.detail
                            }}
                        />

                        <!---Show Read Posts: Requires at least 0.19.6--->
                        <SettingToggle small bind:value={show_read} icon={Eye} title="Show Read Posts" 
                            condition={minAPIVersion('0.19.6')}
                            on:change={(e) => {
                                controller.show_read = e.detail
                                $userSettings.hidePosts.read = !e.detail
                            }}
                        />

                        <!---Show NSFW Posts: Requires at least 0.19.6--->
                        <SettingToggle small bind:value={show_nsfw} icon={ExclamationCircle} title="Show NSFW Posts" 
                            condition={minAPIVersion('0.19.6')}
                            on:change={(e) => {
                                controller.show_nsfw = e.detail
                                $userSettings.hidePosts.nsfw = !e.detail
                            }}
                        />


                    </SettingToggleContainer>
                </CollapseButton>
            {/if}


            <div class="flex flex-row w-full items-end justify-between">
                
                <div class="flex flex-col gap-1 text-xs opacity-80">
                    <span>
                        Last refreshed <RelativeDate date={(controller.last_refreshed * 1000)} class="lowercase"/>
                    </span>
                    {#if controller.truncated && truncatedPostCount > 0}
                        <span>
                            {truncatedPostCount} older posts have been hidden. Refresh to see them.
                        </span>
                    {/if}

                    
                </div>

                
            </div>
        </div>
       
    {/if}




    <!---Only use this loading spinner if infinite scroll is disabled--->
    {#if controller.isLoading || controller.refreshing} 
        <span class="flex flex-row w-full h-full items-center">        
            <Spinner width={24} class="mx-auto my-auto"/>
        </span>
    {/if}

    {#if posts?.posts?.length > 0 }

        {#each posts.posts as post, idx (post.post.id)}
            <Post bind:post scrollTo={controller.last_clicked_post} inCommunity={(community_id || community_name) ? true : false}  {inModal} {actions} />
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
                    if ($userSettings.debugInfo) console.log(moduleName, ": Received loadMore event from infinite scroll component")
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



