<script context="module">
    const moduleName ='CommentItem.svelte'
</script>

<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'

    import Badge        from '$lib/components/ui/Badge.svelte'
    import Button       from '$lib/components/input/Button.svelte'
    import Card         from '$lib/components/ui/Card.svelte'
    import Comment      from '$lib/components/lemmy/comment/Comment.svelte'
    import CommentMeta  from '$lib/components/lemmy/comment/CommentMeta.svelte'
    import Markdown     from '$lib/components/markdown/Markdown.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'

    import { dispatchWindowEvent } from '$lib/ui/events'
    import { fade } from 'svelte/transition'
    import { getPostTitleWithoutFlairs, isNewAccount, sleep } from '$lib/components/lemmy/post/helpers'
    import { getInstance } from '$lib/lemmy'
    import { goto } from '$app/navigation'
    import { instance } from '$lib/instance'
    import { onMount } from 'svelte'
    import { postViewerModal } from '../moderation/moderation'
    import { userSettings } from '$lib/settings'
     
    import {
        ArrowTopRightOnSquare,
        Bookmark,
        Cake,
        LockClosed,
        NoSymbol,
        Trash,
        Window,
    } from 'svelte-hero-icons'

    export let comment: CommentView
    export let actions:boolean          = true
    export let collapseBadges:boolean   = false;
    export let scrollTo:number          = -1
    export let inProfile:boolean        = false
    export let inModal: boolean         = false
    export let onHomeInstance: boolean  = true

    let commentContainer:HTMLDivElement
    let lastClickedPost = -1

    // A concat of the post and comment id used for scroll into view
    const elementID = Number(comment.post.id + '.' + comment.comment.id)

    async function scrollIntoView(smooth:boolean = false) {
        if (scrollTo == elementID) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Scrolling comment " , elementID, "into view via param")
            await sleep(50)
            commentContainer.scrollIntoView({
                behavior: smooth ? 'smooth' : 'instant',
                block: 'start'
            })
        }
    }

    function announceLastClickedPost(comment:CommentView|undefined|null) {
        if (!comment || lastClickedPost == elementID) return
        lastClickedPost = elementID
        dispatchWindowEvent('lastClickedPost', {post_id: elementID})
    }

    onMount(async () => await scrollIntoView() )
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div id={elementID.toString()}  bind:this={commentContainer} transition:fade
    on:mouseover={() => announceLastClickedPost(comment) } 
    on:touchstart={() => announceLastClickedPost(comment) }

>
    <Card class="flex flex-col p-2 flex-1 gap-1 mx-auto {($userSettings.uiState.feedMargins && !inModal) ? 'max-w-3xl' : 'w-full'}">
        
        <div class="flex flex-row justify-between gap-1 items-center">
            <CommentMeta bind:comment bind:inProfile noClick={!actions} />
            
            <!---Row with badges and jump to comment buttons--->
            <div class="flex flex-col gap-1">
                <!---Badges--->
                <div class="flex flex-row ml-auto mb-auto gap-2 items-center">
                
                    <!---Badge accounts less than 5 days old (1440 minutes = 24 hours * 5)-->
                    {#if comment?.creator?.published && isNewAccount(comment.creator.published)}
                        <Badge label="New Account" color="gray" icon={Cake} iconSize={12} click={false}>
                            <RelativeDate date={comment.creator.published} />
                        </Badge>
                    {/if}
                    
                    {#if comment.post.locked}
                        <Badge label="Locked" color="yellow" click={false} icon={LockClosed} iconSize={14}/>
                    {/if}
    
                    {#if comment.saved}
                        <Badge label="Saved" color="yellow" icon={Bookmark} iconSize={14} click={false}/>
                    {/if}
                    
                    
                    {#if comment.comment.removed}
                        <Badge label="Removed" color="red" icon={NoSymbol} iconSize={14} click={false}/>
                    {/if}
                    
                    {#if comment.comment.deleted}
                        <Badge label="Deleted" color="red" icon={Trash} iconSize={14} click={false}/>
                    {/if}
                    
                </div>

                <!---Jump to Comment Buttons--->
                <div class="flex flex-row gap-1 items-center">
                    <Button 
                        color="tertiary-border" 
                        size="md"
                        icon={Window} 
                        iconSize={18}
                        hidden={inModal}
                        title="Open Comment Thread in Modal" 
                        on:click={() => {
                            postViewerModal($instance, undefined, comment.comment.id)
                        }}
                    />

                    <Button
                        color="tertiary-border"
                        href="/post/{getInstance()}/{comment.post.id}?thread={comment.comment.path}"
                        size="md"
                        icon={ArrowTopRightOnSquare}
                        iconSize={18}
                        title="Jump to Comment"
                        on:click={() => dispatchWindowEvent('clickIntoPost') }
                    />
                </div>
            </div>
        </div>
        
        <!---Post Title--->
        <div class="flex flex-row justify-between gap-1 items-center">
            <a 
                href="/post/{getInstance()}/{comment.post.id}"
                target="_blank"
                on:click={
                    (
                        //@ts-ignore
                        e
                    ) => {
                        // Use goto instead of href to avoid occasionally reloading the whole app on page transition
                        if (!$userSettings.openInNewTab.posts) { 
                            e.preventDefault()
                            e.stopPropagation()
                            goto(`/post/${getInstance()}/${comment.post.id}`)
                            dispatchWindowEvent('clickIntoPost')
                        }
                    }} 
                class="text-sm font-bold text-left"
            >
                <Markdown source={getPostTitleWithoutFlairs(comment.post.name)} noUserCommunityLink  noHashtags noLink />
            </a> 

        </div>
       
        <div class="list-none">
            <Comment elevation={-1} postId={comment.post.id} replying={false} {actions} {collapseBadges} {onHomeInstance} node={{ children: [], comment_view: comment, depth: 1 }} />
        </div>
    </Card>
</div>
