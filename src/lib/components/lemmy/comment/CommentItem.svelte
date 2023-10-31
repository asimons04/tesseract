<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import type { CommentView } from 'lemmy-js-client'

    import {
        Icon,
        ArrowTopRightOnSquare
    } from 'svelte-hero-icons'

  export let comment: CommentView
  export let actions:boolean = true
</script>

<Card class="flex flex-col bg-white rounded-md p-5 flex-1 gap-1" id={comment.post.id}>
    <div class="flex flex-row justify-between items-center">
        <PostMeta post={comment} showFediseer={false}/>
    
        <Button
            color="secondary"
            href="/post/{comment.post.id}?thread={comment.comment.path}#{comment.comment.id}"
            size="sm"
            class="self-start"
            title="Jump to Comment"
        >
            <Icon src={ArrowTopRightOnSquare} width={16}/>
        </Button>
    </div>
  
    <div class="list-none">
        <Comment
            postId={comment.post.id}
            node={{ children: [], comment_view: comment, depth: 1 }}
            replying={false}
            {actions}
        />
    </div>
</Card>
