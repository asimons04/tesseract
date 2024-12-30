<script context="module">
    const moduleName = "UserSubmissionFeed.svelte"
</script>

<script lang="ts">
    import type { CommentView, GetPersonDetailsResponse, PostView } from "lemmy-js-client"
    import type { ChangeProfileEvent, LastClickedPostEvent } from "$lib/ui/events"
    import type { UserSubmissionFeedController, UserSubmissionFeedControllerLoadOptions } from '$lib/components/lemmy/feed/helpers'

    import { fade } from "svelte/transition"
    import { getClient } from "$lib/lemmy"
    import { hrColors } from "$lib/ui/colors"
    import { instance } from "$lib/instance";
    import { profile } from '$lib/auth'
    import { getItemPublished, isCommentView, isPostView } from "$lib/lemmy/item"
    import { onDestroy, onMount } from "svelte";
    import { StorageController } from "$lib/storage-controller"
    import { userSettings } from "$lib/settings";

    import Button from "$lib/components/input/Button.svelte"
    import CommentItem from "$lib/components/lemmy/comment/CommentItem.svelte"
    import Post from "$lib/components/lemmy/post/Post.svelte"
    import Placeholder from "$lib/components/ui/Placeholder.svelte"
    import Pageination from "$lib/components/ui/Pageination.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"
    import SelectMenu from "$lib/components/input/SelectMenu.svelte"
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    import TextInput from "$lib/components/input/TextInput.svelte"

    import { ArrowLeft, ArrowPath, Bars3, BarsArrowDown, ExclamationTriangle, MagnifyingGlass, PencilSquare, XCircle } from "svelte-hero-icons"
    
    
    
    export let person_id: number | undefined = undefined
    export let person_name: string | undefined = undefined
    export let community_id: number | undefined = undefined
    export let type: 'all' | 'posts' | 'comments' = 'all'
    export let sort: 'New' | 'TopAll' | 'Old' = 'New'
    export let actions: boolean = false
    export let limit:number = $userSettings.uiState.postsPerPage ?? 10
    export let snapshotValidity:number              = 15    //Number of minutes snapshots are valid
    export let inProfile = true

    let page = 1
    let loading = false
    let loadError = false
    let submissions = [] as (PostView|CommentView)[]
    let searchResults = [] as (PostView|CommentView)[]
    let searchTerm: string
    let scrollContainer: HTMLDivElement
    let user: GetPersonDetailsResponse | undefined
    let old = {
        person_id: person_id,
        person_name: person_name,
        community_id: community_id
    }
    let last_item: number | undefined
    let last_refreshed:number = Math.round(new Date().getTime() /1000)

    let panel: 'submissions' | 'search' = 'submissions'

    onMount(async () => {
        if ($userSettings.debugInfo) console.log(moduleName, ": Mounting component")
        loading = true
        controller.load({loadSnapshot: true})
    })
    
    onDestroy(() => {
        if ($userSettings.debugInfo) console.log(moduleName, ": Component destroyed; saving data")
        controller.takeSnapshot().then( () => {
            controller.reset() 
            scrollContainer?.remove()
        })
    })

    $:  person_id,      controller.person_id = person_id
    $:  person_name,    controller.person_name = person_name

    export const controller: UserSubmissionFeedController = {
        loadedFromSnapshot: false,
        storage: new StorageController({
            ttl: snapshotValidity,
            useCompression: true
        }),
        
        clearSearch: function() {
            searchResults = []
        },

        clearSnapshot: function() {
            if ($userSettings.debugInfo) console.log(moduleName, ": Clearing snapshot:", this.storageKey)
            this.storage.remove(this.storageKey)
            return
        },

        load: async function(opts?:any):Promise<void> {
            try {
                if ($userSettings.debugInfo) console.log(moduleName, ": Loader running")
                loading = true;

                if (opts?.loadSnapshot && await this.loadSnapshot()) {
                    if ($userSettings.debugInfo) console.log(moduleName, ": Loading data from snapshot:", this.storageKey)
                    this.loadedFromSnapshot = true
                    loading = false
                    return
                }
                
                if ($userSettings.debugInfo) console.log(moduleName, ": Loading data from API.")
                
                user = await getClient().getPersonDetails({
                    limit: limit,
                    page: page,
                    person_id: person_id,
                    username: person_name,
                    sort: sort,
                    community_id: community_id
                })
                
                submissions = [...user.posts, ...user.comments]

                if (sort.startsWith('Top')) {
                    submissions.sort( (a, b) => b.counts.upvotes - b.counts.downvotes - (a.counts.upvotes - a.counts.downvotes) )
                } 
                
                else if (sort == 'New') {
                    submissions.sort( (a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)) )
                }
                
                else if (sort == 'Old') {
                    submissions.sort( (a, b) => Date.parse(getItemPublished(a)) - Date.parse(getItemPublished(b)) )
                }
                
                last_refreshed = Math.round(new Date().getTime() /1000)
                
                await this.takeSnapshot()        
                
                loading = false;
            }
            catch (err) {
                loading = false
                loadError = true
                console.log(err);
                this.clearSnapshot()
            }
        },

        loadSnapshot: async function() {
            let pageSnapshot = await this.storage.retrieve(this.storageKey)

            if (pageSnapshot) {
                // Only use snapshots if they're relatively fresh
                let now = Math.round(new Date().getTime() /1000)

                // Check age of snapshot; discard if older than 30 minutes (currently hardcoded)
                if (now - pageSnapshot.last_refreshed > (snapshotValidity * 60)) {
                    if ($userSettings.debugInfo) console.log(moduleName, ": Snapshot is expired. Removing.")
                    this.storage.remove(this.storageKey)
                    return false
                }

                last_refreshed = pageSnapshot.last_refreshed

                // Load values
                if ('sort' in pageSnapshot)              sort = pageSnapshot.sort
                if ('type' in pageSnapshot)              type = pageSnapshot.type
                if ('page' in pageSnapshot)              page = pageSnapshot.page
                if ('panel' in pageSnapshot)             panel = pageSnapshot.panel
                if ('submissions' in pageSnapshot)       submissions = pageSnapshot.submissions
                if ('searchResults' in pageSnapshot)     searchResults = pageSnapshot.searchResults
                if ('searchTerm' in pageSnapshot)        searchTerm = pageSnapshot.searchTerm
                if ('person_id' in pageSnapshot)         person_id = pageSnapshot.person_id
                if ('person_name' in pageSnapshot)       person_name = pageSnapshot.person_name
                if ('last_item' in pageSnapshot)         last_item =  pageSnapshot.last_item
                if ('user' in pageSnapshot)              user = pageSnapshot.user

                pageSnapshot = null
                return true
            }
            pageSnapshot = null
            return false
        },

        refresh: function(clearSnapshot?:boolean) {
            this.reset(clearSnapshot)
            if (panel == 'submissions') this.load({loadSnapshot: false}).then(()=> this.scrollTop())
            if (panel == 'search') {
                // Need to re-populate the user if it gets cleared since the search result doesn't provide that.
                getClient().getPersonDetails({
                    limit: 1,
                    page: 1,
                    person_id: person_id,
                    username: person_name,
                })
                    .then((result) => user = result)
                    .then(() => this.search({loadSnapshot: false}))
                    .then(() => this.scrollTop())
            }
        },

        reset: function(clearSnapshot?:boolean) {
            if (clearSnapshot) this.clearSnapshot()
            last_item = -1
            submissions = submissions = []
            loadError = false
            page = 1
            user = undefined
            this.loadedFromSnapshot = false
        },

        scrollBottom: function() {
            scrollContainer?.scrollTo(0,scrollContainer.scrollHeight)
        },
        
        scrollTop: function() {
            scrollContainer?.scrollTo(0,0)
        },

        search: async function(opts?:UserSubmissionFeedControllerLoadOptions) {
            try {
                if ($userSettings.debugInfo) console.log(moduleName, ": Searching...")
                loading = true;

                if (opts?.loadSnapshot && await this.loadSnapshot()) {
                    if ($userSettings.debugInfo) console.log(moduleName, ": Loading search data from snapshot:", this.storageKey)
                    this.loadedFromSnapshot = true
                    loading = false
                    return
                }
                
                if ($userSettings.debugInfo) console.log(moduleName, ": Searching via the API.")
                
                const results = await getClient().search({
                    listing_type: 'All',
                    type_: type == 'comments' ? 'Comments' : type == 'posts' ? 'Posts' : 'All',
                    limit: limit,
                    page: page,
                    creator_id: user?.person_view.person.id,
                    sort: sort,
                    community_id: community_id,
                    q: searchTerm
                })
                
                searchResults = [...results.posts, ...results.comments]

                if (sort.startsWith('Top')) {
                    searchResults.sort( (a, b) => b.counts.upvotes - b.counts.downvotes - (a.counts.upvotes - a.counts.downvotes) )
                } 
                
                else if (sort == 'New') {
                    searchResults.sort( (a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)) )
                }
                
                else if (sort == 'Old') {
                    searchResults.sort( (a, b) => Date.parse(getItemPublished(a)) - Date.parse(getItemPublished(b)) )
                }
                
                last_refreshed = Math.round(new Date().getTime() /1000)
                
                await this.takeSnapshot()        
                
                loading = false;
            }
            catch (err){
                console.log(err);
            }
        },

        takeSnapshot: async function() {
            if ($userSettings.debugInfo) console.log(moduleName, ": Taking snapshot: ", this.storageKey)
            await this.storage.store(this.storageKey, this.data)
        },

        get storageKey() {
            return `snapshot_userfeed_${$instance}_` + (JSON.stringify({
                person_id: old.person_id,
                person_name: old.person_name,
                community_id: old.community_id,
                profileID: $profile?.id
            }))
        },

        get data() {
            return {
                submissions: submissions,
                searchResults: searchResults,
                searchTerm: searchTerm,
                panel: panel,
                person_id: person_id,
                person_name: person_name,
                sort: sort,
                type: type,
                page: page,
                last_item: last_item,
                last_refreshed: last_refreshed,
                user: user,
            }
        },

        get last_refreshed() {
            return last_refreshed
        },

        set last_refreshed(val:number) {
            last_refreshed = val
        },

        get person_id() {
            return person_id
        },

        set person_id(id:number|undefined) {
            if (!loading && id && id != old.person_id) {
                if ($userSettings.debugInfo) console.log(moduleName, ": Person id changed.", old.person_id, id)
                old.person_id = id
                this.refresh()
            }
        },

        get person_name() {
            return person_name
        },

        set person_name(name:string|undefined) {
            if (!loading && name && name != old.person_name) {
                if ($userSettings.debugInfo) console.log(moduleName, ": Person name changed.", old.person_name, name)
                old.person_name = name
                this.refresh()
            }
        },
        
        get sort() {
            return sort
        },

        set sort(val:'New' | 'TopAll' | 'Old') {
            sort = val

        },

        get type() {
            return type
        },

        set type(val:'all' | 'posts' | 'comments') {
            type = val
        }
    }

    const handlers = {
        ChangeProfileEvent(e:ChangeProfileEvent) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Responding to profile change")

            controller.reset()
            controller.load({loadSnapshot: true})
        },
        
        LastClickedPostEvent(e:LastClickedPostEvent) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Setting 'last_item' to ", e.detail.post_id)
            last_item = e.detail.post_id
        }
    }

</script>

<svelte:window 
    on:lastClickedPost={handlers.LastClickedPostEvent}
    on:changeProfile={handlers.ChangeProfileEvent}
    on:beforeunload={() => {
        if ($userSettings.debugInfo) console.log(moduleName, ": Page refresh requested; flushing snapshot")
        controller.clearSnapshot()
    }}
/>


<div bind:this={scrollContainer} class="flex flex-col w-full h-full mt-2 md:pr-2 gap-4 overflow-x-hidden overflow-y-scroll" >
    
    <slot name="banner" {user} />
    
    <!---Last Refreshed Indicator and Refresh Button--->
    {#if page == 1 && panel == 'submissions'}
        <div class="flex flex-row w-full items-end justify-between mb-1" transition:fade>
            <div class="flex flex-col gap-1 text-xs opacity-80">
                <span>
                    Last refreshed <RelativeDate date={(last_refreshed * 1000)} class="lowercase"/>. 
                </span>
            </div>

            <Button color="tertiary-border" title="Refresh" side="md" icon={ArrowPath} iconSize={16} 
                loading={loading} disabled={loading}
                on:click={() => {
                    if ($userSettings.debugInfo) console.log(moduleName, ": Refresh button clicked")
                    controller.refresh(true) 
                }}
            >
                Refresh
            </Button>
        </div>
    {/if}
    
    <!---Sort, Type, and User Search Bars--->
    <div class="flex flex-row w-full items-center justify-between" transition:fade>
        <!---Sort--->
        <SelectMenu 
            title="Sort"
            icon={BarsArrowDown}
            options={['New', 'TopAll', 'Old']} 
            optionNames={['New', 'Top', 'Old']}
            selected={sort}
            alignment="bottom-left"
            on:select={(e) => {
                if (loading) return
                if ($userSettings.debugInfo) console.log(moduleName, ": Sort selected.", e.detail)
                submissions = submissions = []
                last_item = -1
                //@ts-ignore
                sort = e.detail
                page = 1
                if (panel == 'submissions') controller.load({loadSnapshot: false})
                if (panel == 'search') controller.search({loadSnapshot: false})
            }}
        />

        <!---Item Type--->
        <SelectMenu
            title="Submission Type"
            icon={Bars3}
            options={['all', 'posts', 'comments']}
            optionNames={['All', 'Posts', 'Comments']}
            selected={type}
            alignment="bottom-right"
            on:select={(e) => {
                if (loading) return
                if ($userSettings.debugInfo) console.log(moduleName, ": Type selected.", e.detail)

                last_item = -1
                //@ts-ignore
                type = e.detail
                if (panel == 'search') controller.search({loadSnapshot: false})

            }}
        />
    </div>

    <!---Search Form--->
    {#if user}
        <form class="flex flex-row gap-2 items-center w-full" on:submit|preventDefault={() => {
                if (searchTerm) {
                    last_item =  -1
                    page = 1
                    panel = 'search'
                    controller.search({loadSnapshot: false})
                }
            }}
        >    
            <TextInput type="search" name="search_input" placeholder="Search {user.person_view.person.display_name ?? user.person_view.person.name}" bind:value={searchTerm} class="w-full"/>
            <Button icon={MagnifyingGlass} iconSize={24} color="tertiary-border" title="Search" submit />
            
            {#if panel == 'search'}
                <Button icon={XCircle} iconSize={24} color="tertiary-border" title="Reset" on:click={() => {
                    last_item = -1
                    page = 1
                    searchTerm = ''
                    searchResults = []
                }}/>
            {/if}
        </form>
    {/if}

    

    
    <!---Loading Indicator--->
    {#if loading}
        <span class="flex flex-row w-full h-full items-center" transition:fade>        
            <span class="mx-auto my-auto">
                <Spinner width={24}/>
            </span>
        </span>
    {/if}
    
    <!---Load Error Indicator--->
    {#if loadError}
        <span class="flex flex-row w-full h-full items-center" transition:fade>        
            <span class="mx-auto my-auto">
                <Placeholder icon={ExclamationTriangle} title="Load Error" description="Unable to load details for this user: {person_id ?? person_name}" />
            </span>
        </span>
    {/if}

    <!---Modal Contents after Successful Load--->
    {#if !loading && !loadError}   
        
        <!---User Posts/Comments--->
        {#if panel == 'submissions'}
            {#if submissions?.length > 0 }

                {#each submissions as item, idx (isCommentView(item) ? item.comment.id : item.post.id) }
                    
                    {#if (type == 'all' || type == 'comments') && isCommentView(item) }
                        <CommentItem comment={item} {actions} scrollTo={last_item} {inProfile}/>
                    
                    {:else if (type == 'all' || type == 'posts') && isPostView(item)}
                        <Post post={item} {actions} {inProfile} scrollTo={last_item} />
                    {/if}

                {/each}
                
                
            {:else}
                <div class="mt-2 w-full h-full flex flex-col gap-5 mx-auto">
                    <Placeholder icon={PencilSquare} 
                        title="{page == 1 ? 'No Submissions' : 'No More Submissions'}" 
                        description="{page == 1 ? 'This user has not posted or commented anything' : 'There are no more posts or comments for this user'}."
                    />
                </div>
            {/if}
        {/if}

        <!---Inline Search Results--->
        {#if panel == 'search'}
            <!---Section Header--->
            <div class="flex flex-row gap-4 items-center" transition:fade>
                <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back to Submissions" 
                    on:click={(e)=> {
                        e.preventDefault()
                        e.stopPropagation()
                        searchTerm = ''
                        searchResults =  []
                        last_item = -1
                        page = 1
                        panel = 'submissions'
                        controller.load({loadSnapshot: false})
                    }}
                />
                
                <div class="flex flex-row w-full items-center justify-between">
                    <span class="text-lg">
                        Search Results
                        {#if community_id}
                            in Community
                        {/if}
                    </span>
                </div>
            </div>
            <hr class="{hrColors}" />
            
            {#if searchResults.length > 0 }
                {#each searchResults as item, idx (isCommentView(item) ? item.comment.id : item.post.id) }
                    
                    {#if (type == 'all' || type == 'comments') && isCommentView(item) }
                        <CommentItem comment={item} {actions} scrollTo={last_item} {inProfile} />
                    
                    {:else if (type == 'all' || type == 'posts') && isPostView(item)}
                        <Post post={item} {actions} {inProfile} scrollTo={last_item} />
                    {/if}
                    
                {/each}
            {:else}
                <div class="mt-2 w-full h-full flex flex-col gap-5 mx-auto">
                    <Placeholder icon={MagnifyingGlass} 
                        title="{page == 1 ? 'No Results' : 'No More Results'}" 
                        description="{page == 1 ? 'There are no search results for the provided query.' : 'There are no more search results for the provided query.'}."
                    />
                </div>
            {/if}

        {/if}

    {/if}
    
    <Pageination bind:page class="px-4 mb-4" on:change={(e) => {
        page = e.detail
        if (panel == 'search')      controller.search({loadSnapshot: false})
        if (panel == 'submissions') controller.load({loadSnapshot: false})
        scrollContainer.scrollTo(0,0)
    }}/>
</div>

