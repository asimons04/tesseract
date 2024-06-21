<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'

    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import CommentMeta from '$lib/components/lemmy/comment/CommentMeta.svelte'
    import Link from '$lib/components/input/Link.svelte'
    
    
    import { fade } from 'svelte/transition'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { getInstance } from '$lib/lemmy'
    import { goto } from '$app/navigation'
    import { lastSeenPost } from '$lib/components/lemmy/post/helpers'
    import { userSettings } from '$lib/settings'
    
    import {
        Icon,
        ArrowTopRightOnSquare
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
            <CommentMeta bind:comment />
            
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
        
        {#if $userSettings.openInNewTab.posts}
            <Link href="/post/{getInstance()}/{comment.post.id}" newtab={true}>
                <span class="text-sm font-bold text-left">{fixLemmyEncodings(comment.post.name)}</span>
            </Link>
        {:else}
            <button on:click={() => goto(`/post/${getInstance()}/${comment.post.id}`)} class="text-sm font-bold text-left">
                {fixLemmyEncodings(comment.post.name)}
            </button>  
        {/if}
        
        <div class="list-none">
            <Comment postId={comment.post.id} replying={false} {actions} {collapseBadges} node={{ children: [], comment_view: comment, depth: 1 }} />
        </div>
    </Card>
</div>
