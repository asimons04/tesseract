<script context="module">
    const moduleName ='CommentItem.svelte'
</script>

<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'

    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import CommentMeta from '$lib/components/lemmy/comment/CommentMeta.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    
    import { dispatchWindowEvent } from '$lib/ui/events';
    import { fade } from 'svelte/transition'
    import { getPostTitleWithoutFlairs, sleep, type PostDisplayType } from '$lib/components/lemmy/post/helpers'
    import { getInstance } from '$lib/lemmy'
    import { goto } from '$app/navigation'
    import { onMount } from 'svelte';
    import { userSettings } from '$lib/settings'
     
    import {
        Icon,
        ArrowTopRightOnSquare,
        LockClosed,
        NoSymbol,
        Trash
    } from 'svelte-hero-icons'
    
    
    

    export let comment: CommentView
    export let actions:boolean = true
    export let collapseBadges:boolean = false;
    export let scrollTo:number = -1
    export let inProfile:boolean = false
    export let inModal: boolean = false

    let commentContainer:HTMLDivElement
    let lastClickedPost = -1

    const elementID = Number(comment.post.id + '.' + comment.comment.id)

    $:  debugMode = $userSettings.debugInfo

    onMount(async () => await scrollIntoView() )

    async function scrollIntoView(smooth:boolean = false) {
        if (scrollTo == elementID) {
            if (debugMode) console.log(moduleName, ": Scrolling comment " , elementID, "into view via param")
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
            
            <Button
                color="tertiary-border"
                href="/post/{getInstance()}/{comment.post.id}?thread={comment.comment.path}"
                size="sm"
                class="self-start"
                title="Jump to Comment"
                on:click={() => dispatchWindowEvent('clickIntoPost') }
            >
                <Icon src={ArrowTopRightOnSquare} width={16}/>
            </Button>
        </div>
        
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
            
            <div class="flex flex-row gap-1 items-center">
                <!---Indicator Badges--->
                {#if comment.post.removed}
                    <Badge label="Removed" color="red" click={false}>
                        <Icon src={NoSymbol} mini size="14" />
                    </Badge>
                {/if}

                {#if comment.post.locked}
                    <Badge label="Locked" color="yellow" click={false}>
                        <Icon src={LockClosed} mini size="14" />
                    </Badge>
                {/if}

                {#if comment.post.deleted}
                    <Badge label="Deleted" color="red" click={false}>
                        <Icon src={Trash} mini size="14" />
                    </Badge>
                {/if}
            </div>

            
        </div>
       
        <div class="list-none">
            <Comment elevation={-1} postId={comment.post.id} replying={false} {actions} {collapseBadges} node={{ children: [], comment_view: comment, depth: 1 }} />
        </div>
    </Card>
</div>
