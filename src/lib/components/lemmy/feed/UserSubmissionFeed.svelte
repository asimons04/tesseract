<script context="module">
    const moduleName = "UserSubmissionFeed.svelte"
</script>

<script lang="ts">
    import type { CommentView, GetPersonDetailsResponse, Person, PostView } from "lemmy-js-client"
    import type { UserSubmissionFeedController } from '$lib/components/lemmy/feed/helpers'

    import { getClient } from "$lib/lemmy"
    import { instance } from "$lib/instance";
    import { profile } from '$lib/auth'
    import { getItemPublished, isCommentView, isPostView } from "$lib/lemmy/item"
    import { onDestroy, onMount } from "svelte";
    import { page as pageStore} from "$app/stores"
    import { StorageController } from "$lib/storage-controller"
    import { userSettings } from "$lib/settings";

    import CommentItem from "$lib/components/lemmy/comment/CommentItem.svelte"
    import Post from "$lib/components/lemmy/post/Post.svelte"
    import Placeholder from "$lib/components/ui/Placeholder.svelte"
    import Pageination from "$lib/components/ui/Pageination.svelte"
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    
    import { ArrowPath, PencilSquare } from "svelte-hero-icons";
    import MultiSelect from "$lib/components/input/MultiSelect.svelte";
    import type { LastClickedPostEvent } from "$lib/ui/events";
    import SiteSearch from "$lib/components/ui/subnavbar/SiteSearch.svelte";
    import RelativeDate from "$lib/components/util/RelativeDate.svelte";
    import Button from "$lib/components/input/Button.svelte";
    
    
    export let person_id: number | undefined = undefined
    export let person_name: string | undefined = undefined
    export let community_id: number | undefined = undefined
    export let type: 'all' | 'posts' | 'comments' = 'all'
    export let sort: 'New' | 'TopAll' | 'Old' = 'New'
    export let actions: boolean = false
    export let limit:number = $userSettings.uiState.postsPerPage ?? 10
    export let snapshotValidity:number              = 15    //Number of minutes snapshots are valid


    $:  debugMode = $userSettings.debugInfo

    let page = 1
    let loading = false
    let submissions = [] as (PostView|CommentView)[]
    let scrollContainer: HTMLDivElement
    let user: GetPersonDetailsResponse | undefined
    let old = {
        person_id: person_id,
        person_name: person_name
    }
    let last_item: number | undefined
    let last_refreshed:number = Math.round(new Date().getTime() /1000)

    onMount(async () => {
        if (debugMode) console.log(moduleName, ": Mounting component")
        loading = true
        controller.load({loadSnapshot: true})
    })
    
    onDestroy(() => {
        if (debugMode) console.log(moduleName, ": Component destroyed; saving data")
        controller.takeSnapshot().then( () => {
            controller.reset() 
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
        
        clearSnapshot: function() {
            if (debugMode) console.log(moduleName, ": Clearing snapshot:", this.storageKey)
            this.storage.remove(this.storageKey)
            return
        },

        load: async function(opts?:any):Promise<void> {
            try {
                if (debugMode) console.log(moduleName, ": Loader running")
                loading = true;

                if (opts?.loadSnapshot && await this.loadSnapshot()) {
                    if (debugMode) console.log(moduleName, ": Loading data from snapshot:", this.storageKey)
                    this.loadedFromSnapshot = true
                    loading = false
                    return
                }
                
                if (debugMode) console.log(moduleName, ": Loading data from API.")
                
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
            catch (err){
                console.log(err);
            }
        },

        loadSnapshot: async function() {
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

                last_refreshed = pageSnapshot.last_refreshed

                // Load values
                if ('sort' in pageSnapshot)              sort = pageSnapshot.sort
                if ('type' in pageSnapshot)              type = pageSnapshot.type
                if ('page' in pageSnapshot)              page = pageSnapshot.page
                if ('submissions' in pageSnapshot)       submissions = pageSnapshot.submissions
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
            this.load({loadSnapshot: false}).then(()=> this.scrollTop())
        },

        reset: function(clearSnapshot?:boolean) {
            if (clearSnapshot) this.clearSnapshot()
            last_item = -1
            submissions = submissions = []
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

        takeSnapshot: async function() {
            if (debugMode) console.log(moduleName, ": Taking snapshot: ", this.storageKey)
            await this.storage.store(this.storageKey, this.data)
        },

        get storageKey() {
            return `snapshot_userfeed_${$instance}_` + (JSON.stringify({
                person_id,
                person_name,
            }))
        },

        get data() {
            return {
                submissions: submissions,
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
            if (!loading && id != old.person_id) {
                if (debugMode) console.log(moduleName, ": Person id changed.", old.person_id, id)
                old.person_id = id
                this.refresh()
            }
        },
        get person_name() {
            return person_name
        },

        set person_name(name:string|undefined) {
            if (!loading && name != old.person_name) {
                if (debugMode) console.log(moduleName, ": Person name changed.", old.person_name, name)
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
        LastClickedPostEvent(e:LastClickedPostEvent) {
            if (debugMode) console.log(moduleName, ": Setting 'last_item' to ", e.detail.post_id)
            last_item = e.detail.post_id
        }
    }

</script>

<svelte:window 
    on:lastClickedPost={handlers.LastClickedPostEvent}
    on:beforeunload={() => {
        if (debugMode) console.log(moduleName, ": Page refresh requested; flushing snapshot")
        controller.clearSnapshot()
    }}
/>


<div bind:this={scrollContainer} class="flex flex-col w-full h-full mt-2 md:pr-2 gap-4 overflow-x-hidden overflow-y-scroll" >
    
    <slot name="banner" {user} />
    
    {#if page == 1}
    <div class="flex flex-row w-full items-end justify-between">
        <div class="flex flex-col gap-1 text-xs opacity-80">
            <span>
                Last refreshed <RelativeDate date={(last_refreshed * 1000)} class="lowercase"/>. 
            </span>
        </div>

        <Button color="tertiary-border" title="Refresh" side="md" icon={ArrowPath} iconSize={16} 
            loading={loading} disabled={loading}
            on:click={() => {
                if (debugMode) console.log(moduleName, ": Refresh button clicked")
                controller.refresh(true) 
            }}
        >
            Refresh
        </Button>
    </div>
    {/if}
    
    
    
    {#if loading}
        <span class="flex flex-row w-full h-full items-center">        
            <span class="mx-auto my-auto">
                <Spinner width={24}/>
            </span>
        </span>
    {:else}

        {#if submissions?.length > 0 }
            
            <!---Sort, Type, and User Search Bars--->
            <div class="flex flex-row w-full items-center justify-between">
                <!---Sort--->
                <MultiSelect 
                    options={['New', 'TopAll', 'Old']} 
                    optionNames={['New', 'Top', 'Old']}
                    selected={sort}
                    items={0}
                    headless
                    on:select={(e) => {
                        if (loading) return
                        if (debugMode) console.log(moduleName, ": Sort selected.", e.detail)
                        submissions = submissions = []
                        last_item = -1
                        //@ts-ignore
                        sort = e.detail
                        page = 1
                        controller.load({loadSnapshot: false})
                    }}
                />
        
                <!---Item Type--->
                <MultiSelect
                    options={['all', 'posts', 'comments']}
                    optionNames={['All', 'Posts', 'Comments']}
                    selected={type}
                    items={3}
                    class="ml-auto pr-2"
                    on:select={(e) => {
                        if (loading) return
                        if (debugMode) console.log(moduleName, ": Type selected.", e.detail)

                        last_item = -1
                        //@ts-ignore
                        type = e.detail

                    }}
                />
            </div>
            
            {#if user}
                <SiteSearch fullWidth person_id={user.person_view.person.id}
                    placeholder="Search {$userSettings.displayNames ? (user.person_view.person.display_name ?? user.person_view.person.name) : user.person_view.person.name }" 
                />
            {/if}

            {#each submissions as item, idx (isCommentView(item) ? item.comment.id : item.post.id) }
                {#if (type == 'all' || type == 'comments') && isCommentView(item) }
                    <CommentItem comment={item} {actions} scrollTo={last_item}/>
                {:else if (type == 'all' || type == 'posts') && isPostView(item)}
                    <Post post={item} {actions} inProfile scrollTo={last_item} />
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
    
    <div class="mt-4" />

    <Pageination bind:page class="px-4 mb-4" on:change={(e) => {
        page = e.detail
        controller.load({loadSnapshot: false})
        scrollContainer.scrollTo(0,0)
    }}/>
</div>

