<script lang="ts">
    interface ItemHistoryEntry {
        instance?: string,
        post_id?: number,
        comment_id?: number
        data?: any
    }
    
    import type { ClickIntoPostEvent } from "$lib/ui/events"
    import type { UploadImageResponse } from "lemmy-js-client"
    

    import { getClient } from '$lib/lemmy'
    import { instance as defaultInstance } from "$lib/instance"
    import { load as PostLoader } from '$routes/post/[instance]/[id=integer]/+page.js'
    import { page } from '$app/stores'
    import { postType as getPostType} from '$lib/components/lemmy/post/helpers'
    import { profile } from "$lib/auth"
    import { replaceState } from "$app/navigation"

    import Button           from "$lib/components/input/Button.svelte"
    import Card             from "$lib/components/ui/Card.svelte"
    import CommentSection   from "$lib/components/lemmy/post/CommentSection.svelte"
    import Modal            from "$lib/components/ui/modal/Modal.svelte"
    import ModalScrollArea  from "$lib/components/lemmy/modal/components/ModalScrollArea.svelte"
    import Placeholder      from "$lib/components/ui/Placeholder.svelte"
    import Post             from "$lib/components/lemmy/post/Post.svelte"
    import Spinner          from "$lib/components/ui/loader/Spinner.svelte"

    import { 
        ArrowLeft, 
        ArrowPath, 
        ArrowRight, 
        ArrowTopRightOnSquare, 
        ChatBubbleLeftRight, 
        ChevronDoubleDown, 
        ChevronDoubleUp, 
        ExclamationCircle, 
        ExclamationTriangle, 
        Home, 
        Icon, 
        Window 
    } from "svelte-hero-icons"
    
    export let open: boolean                    = false
    export let instance: string | undefined     = undefined
    export let post_id: number | undefined      = undefined
    export let comment_id: number |undefined    = undefined

    let data:any                        = undefined
    
    let loading: boolean                = false
    let showCommentForm:boolean         = false
    let imageUploads                    = [] as UploadImageResponse[]
    let expandCompact: boolean          = false
    let onHomeInstance: boolean         = false
    let loadError: boolean              = false
    let scrollArea: HTMLDivElement
    let viewHistory: ItemHistoryEntry[] = []
    let historyPosition: number         = 0
    let commentsDisabled                = false

    // Set initial history element to current values at load
    viewHistory[0] = {
        instance,
        post_id,
        comment_id
    }

    // When any of the values change, call postHistory.init() to process the changes.
    $:  instance, post_id, comment_id,  postHistory.init()
    $:  historyPosition, onHomeInstance = (viewHistory[historyPosition].instance == $defaultInstance)

    
    
   const postHistory = {
        get length() {
            return viewHistory.length
        },
    
        get onFirstPage() {
            return historyPosition == 0
        },

        get onLastPage() {
            return historyPosition == viewHistory.length -1
        },

        back: async function() {
            if (this.onFirstPage) return
            historyPosition--
            await load()
        },

        forward: async function() {
            if (this.onLastPage) return
            historyPosition++
            await load()
        },
    
        init: async function () {
            if (!instance || (!comment_id && !post_id) ) return

            let find = viewHistory.findIndex((i) =>  i.instance == instance &&  i.post_id == post_id && i.comment_id == comment_id)

            if (find >= 0) {
                historyPosition = find
            }
            else {
                viewHistory.push({
                    instance,
                    post_id,
                    comment_id
                })
                historyPosition++
                viewHistory = viewHistory
            }
            // Reset the outer params after they've been found or added to the local history
            comment_id  = viewHistory[historyPosition].comment_id
            post_id     = viewHistory[historyPosition].post_id
            instance    = viewHistory[historyPosition].instance
            
            await load()
        },
    }

    function close() {
        history.back()
    }

    async function load(refresh:boolean=false) {
        const options               = viewHistory[historyPosition]
        
        if (!options.instance || loading || (!options.comment_id && !options.post_id) ) return

        // Use cached data from history if present and refresh not requested
        if (!refresh && options.data) {
            loadError = false
            data = options.data
            // (Add cross posts to post_view object for sanity)    
            if (data?.post) data.post.post_view.cross_posts = data.post.cross_posts ?? []

            expandCompact = !(['link', 'thumbLink'].includes(getPostType(data?.post?.post_view))) ?? false
            return
        }
        
        const client                = getClient(options.instance)    
        const dataURL               = new URL(`https://localhost`)
        let comment_path: string    = ''
        const dataParams            = {} as {[key:string]: string}

        data                        = undefined
        loading                     = true
        loadError                   = false

        try {

            // Passing a comment ID takes precedence over a post ID
            if (options.comment_id) {
                const commentResponse = await client.getComment({id: options.comment_id})
                
                options.post_id     = commentResponse.comment_view.post.id
                comment_path        = commentResponse.comment_view.comment.path
            }

            if (!options.post_id) throw new Error('Failed to resolve post ID from comment ID')
            if (comment_path) dataURL.searchParams.set('thread', comment_path)
            
            dataParams.instance = options.instance
            dataParams.id       = options.post_id?.toString()

            data = await PostLoader({params: dataParams, url: dataURL})
            if (!data) {
                loadError = true
                throw new Error("Failed to retrieve post/comment")
            }

            // (Add cross posts to post_view object for sanity)    
            if (data?.post) data.post.post_view.cross_posts = [...data.post.cross_posts] ?? []

            expandCompact = !(['link', 'thumbLink'].includes(getPostType(data?.post?.post_view))) ?? false
            options.data = data            
        } 
        
        catch (err) {
            console.log(err)
            loadError = true
        }

        loading = false
    }

    async function fetchOnHome () {
        if (!$profile?.jwt || !data.post) return
        
        loading = true
        try {
            const res = await getClient().resolveObject({
                q: data.post.post_view.post.ap_id,
            })

            if (res.post) {
                instance    = $defaultInstance
                post_id     = res.post.post.id
                comment_id  = undefined
            }
        } catch (err) {
            loadError   = true
        }
        loading = false
    }

    const handlers = {
        ClickIntoPostEvent: function (e?:ClickIntoPostEvent) {
            open = false
            data = null
            replaceState('', { 
                modals: { 
                    ...$page.state.modals,
                    PostViewModal: false 
                } 
            })
        }
    }

</script>

<svelte:window on:clickIntoPost={handlers.ClickIntoPostEvent} />

<Modal bind:open width="max-w-5xl"  icon={comment_id ? ChatBubbleLeftRight : Window}  iconImage={data?.post?.post_view?.community.icon} 
    title="{commentsDisabled ? 'Post Unavailable' : data?.post?.post_view?.post?.name ?? 'Post Viewer'}" card={false} allowMaximize 
    on:close={() => { close() }} 
>
    
    <!---Modal Title Bar Buttons--->
    <div class="flex flex-row gap-2 items-center" slot="title-bar-buttons">
        <span class="ml-auto" />    
        
        <!---Back to Previous Item--->
        <div class="flex flex-row w-full items-center gap-2">
            <Button color="tertiary" icon={ArrowLeft} iconSize={20}  size="square-lg"
                disabled={historyPosition == 0}    
                hidden={viewHistory.length == 1}
                title="Back"
                on:click={async () => await postHistory.back() }
            />
            
            <!---Forward to Next Item--->
            <Button color="tertiary" icon={ArrowRight} iconSize={20} size="square-lg"
                disabled={historyPosition == viewHistory.length -1}
                hidden={viewHistory.length == 1} 
                title="Forward"
                on:click={async () => await postHistory.forward() }
            />

            
            <Button color="tertiary" icon={ArrowPath} iconSize={20} {loading} size="square-lg" 
                title="Refresh"
                on:click={() => load(true) }
            />
            
            <Button color="tertiary" icon={ChevronDoubleDown} iconSize={20} size="square-lg" 
                title="Scroll Bottom"
                on:click={() => scrollArea?.scrollTo(0, scrollArea.scrollHeight) }
            />

            <Button color="tertiary" icon={ChevronDoubleUp} iconSize={20} size="square-lg" 
                title="Scroll Top"
                on:click={() => scrollArea?.scrollTo(0,0) }
            />
        </div>
    </div>

    <ModalScrollArea bind:div={scrollArea} card={false} class="pr-2">    
        {#if loading}
            <div class="flex w-full h-full">
                <Spinner width={64} class="mx-auto my-auto"/>
            </div>
        {/if}

        

        <!--- Show a warning that this post is not on the home instance and provide button to fetch on home --->
        {#if !loading && data && !onHomeInstance}
        <Card  class="py-2 px-4 text-sm flex flex-col flex-wrap gap-2 my-2">
            
            <div class="flex flex-row gap-2 items-center w-full">
                <span class="items-center">
                    <Icon src={ExclamationTriangle} mini width={22}/>
                </span>
                <p class="text-sm">
                    You are viewing this post on a remote instance.  In order to reply or vote,
                    you will need to fetch this post on your home instance.
                </p>
            </div>

            <div class="flex flex-row flex-wrap gap-2 items-center mx-auto">
                
                <Button color="info" size="sm" icon={Home} iconSize={16} on:click={async () => { await fetchOnHome() }}>
                    <span class="text-xs">Fetch on {$defaultInstance}</span>
                </Button>

                <Button color="info" size="sm" icon={ArrowTopRightOnSquare} iconSize={16} on:click={() => { 
                        window.open(data.post.post_view.post.ap_id)
                    }}
                >
                    <span class="text-xs">View on {new URL(data.post.post_view.post.ap_id).hostname}</span>
                </Button>
            </div>
        </Card>
        {/if}

        {#if loadError}
            <Placeholder title="Unable to Fetch Post" icon={ExclamationCircle}  iconSize={64}
                description="Failed to fetch the post details."
            >
                {#if !onHomeInstance}
                    <Button color="info" size="lg" icon={Home} iconSize={22} class="mt-4"
                        on:click={() => {
                            comment_id
                                ? window.open(`https://${instance}/comment/${comment_id}`)
                                : window.open(`https://${instance}/post/${post_id}`)
                            close()
                        }}
                    >
                        Go to Post at {instance}
                    </Button>
                {/if}
            </Placeholder>
        {/if}

    
        {#if !loading && data}
            {#key onHomeInstance}
                <Post post={data.post.post_view} displayType="post" actions={true} inModal={true} {expandCompact} {onHomeInstance}
                    on:disableComments={(e) => {
                        commentsDisabled = e.detail
                    }}
                    on:reply={() => {
                        showCommentForm = !showCommentForm
                        
                        if (!showCommentForm) return
                        // Focus the comment form
                        setTimeout(() => {
                            let commentForm = document.getElementById(`commentForm-${data.post.post_view.post.id}`);
                            commentForm?.focus()
                        }, 250);
                    }}
                />      

                <CommentSection bind:data bind:showCommentForm bind:imageUploads {onHomeInstance} {commentsDisabled} jumpTo={viewHistory[historyPosition].comment_id}/>
            {/key}
        {/if}
    </ModalScrollArea>
</Modal>