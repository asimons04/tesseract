<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import CommentMeta from '$lib/components/lemmy/comment/CommentMeta.svelte'
    import Link from '$lib/components/input/Link.svelte'
    //import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    
    import type { CommentView } from 'lemmy-js-client'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { getInstance } from '$lib/lemmy'
    
    import {
        Icon,
        ArrowTopRightOnSquare
    } from 'svelte-hero-icons'

    export let comment: CommentView
    export let actions:boolean = true
    export let collapseBadges:boolean = false;

</script>

<Card class="flex flex-col bg-white rounded-md p-5 flex-1 gap-1" id={comment.post.id}>
    <div class="flex flex-row justify-between gap-1 items-center">
        <CommentMeta bind:comment />
        
        <Button
            color="secondary"
            href="/post/{getInstance()}/{comment.post.id}?thread={comment.comment.path}#{comment.comment.id}"
            size="sm"
            class="self-start"
            title="Jump to Comment"
        >
            <Icon src={ArrowTopRightOnSquare} width={16}/>
        </Button>
    </div>
    
    <Link href="/post/{getInstance()}/{comment.post.id}">
        <span class="text-sm font-bold">{fixLemmyEncodings(comment.post.name)}</span>
    </Link>  
    
    <div class="list-none">
        <Comment
            postId={comment.post.id}
            node={{ children: [], comment_view: comment, depth: 1 }}
            replying={false}
            {actions}
            {collapseBadges}
        />
    </div>
</Card>
