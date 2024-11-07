<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'

    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import CommentMeta from '$lib/components/lemmy/comment/CommentMeta.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    
    
    import { fade } from 'svelte/transition'
    import { getPostTitleWithoutFlairs } from '$lib/components/lemmy/post/helpers'
    import { getInstance } from '$lib/lemmy'
    import { goto } from '$app/navigation'
    import { lastSeenPost } from '$lib/components/lemmy/post/helpers'
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

    let commentContainer:HTMLDivElement
    const elementID = Number(comment.post.id + '.' + comment.comment.id)

</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div id={elementID.toString()} on:mouseover={() => lastSeenPost.set(elementID)} on:touchstart={() => lastSeenPost.set(elementID)}  bind:this={commentContainer} transition:fade>
    <Card class="flex flex-col rounded-md p-3 flex-1 gap-1">
        
        <div class="flex flex-row justify-between gap-1 items-center">
            <CommentMeta bind:comment noClick={!actions}/>
            
            <Button
                color="tertiary-border"
                href="/post/{getInstance()}/{comment.post.id}?thread={comment.comment.path}"
                size="sm"
                class="self-start"
                title="Jump to Comment"
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
                        }
                    }} 
                class="text-sm font-bold text-left"
            >
                <Markdown source={getPostTitleWithoutFlairs(comment.post.name)} noUserCommunityLink noHashtags/>
            </a> 
            
            <!---Indicator Badges--->
            {#if comment.post.removed}
                <Badge label="Removed" color="red">
                    <Icon src={NoSymbol} mini size="14" />
                </Badge>
            {/if}

            {#if comment.post.locked}
                <Badge label="Locked" color="yellow">
                    <Icon src={LockClosed} mini size="14" />
                </Badge>
            {/if}

            {#if comment.post.deleted}
                <Badge label="Deleted" color="red">
                    <Icon src={Trash} mini size="14" />
                </Badge>
            {/if}

            
        </div>
       
        <div class="list-none">
            <Comment postId={comment.post.id} replying={false} {actions} {collapseBadges} node={{ children: [], comment_view: comment, depth: 1 }} />
        </div>
    </Card>
</div>
