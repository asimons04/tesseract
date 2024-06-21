<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';
    import type { CommentNodeI } from './comments'

    import {
        ArrowUp,
        Bookmark,
        ChatBubbleLeftEllipsis,
        Icon,
        Minus,
        Pencil,
        Plus,
        Trash,
    } from 'svelte-hero-icons'
    
    
    import Button from '$lib/components/input/Button.svelte'
    import CommentActions from '$lib/components/lemmy/comment/CommentActions.svelte'
    import CommentForm from './CommentForm.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { getClient } from '$lib/lemmy.js'
    import { isThreadComment, scrollToTop } from '../post/helpers'
    import { onMount } from 'svelte'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { slide } from 'svelte/transition'
    import { amModOfAny } from '../moderation/moderation';
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte';
    
    
    export let node: CommentNodeI
    export let postId: number
    export let actions: boolean = true
    export let open = true
    export let replying = false
    
    
    let imageUploads              = [] as UploadImageResponse[]
    let editing                   = false
    let newComment                = node.comment_view.comment.content
    let distinguishedClassSummary = 'border-l border-r rounded-t-md border-t border-green-500/50 bg-green-500/5 p-1'
    let distinguishedClassContent = 'shadow-md border-l border-r rounded-b-md border-b border-green-500/50 bg-green-500/5 p-1'

    let jumpToCommentClassSummary = `border-l border-r rounded-t-md border-t border-amber-200/50 bg-amber-500/5 p-1`
    let jumpToCommentClassContent = 'shadow-md border-l border-r rounded-b-md border-b border-amber-500/50 bg-amber-500/5 p-1'
    let jumpToComment             = false
    let commentContainer: HTMLDivElement

    let op = node.comment_view.post.creator_id == node.comment_view.creator.id
    // If linking to a thread, scroll to the speciic comment and highlight it
    onMount(async() => {
        if (isThreadComment(node.comment_view.comment.id)) {
            jumpToComment = true
            await scrollToTop(commentContainer)
        }
                    
    })

</script>

{#if editing}
    <Modal bind:open={editing} title="Editing comment" icon={ChatBubbleLeftEllipsis} width="max-w-4xl">
        <MarkdownEditor rows={7} bind:value={newComment} bind:imageUploads previewButton={true}>
            
            <Button color="primary" slot="actions" on:click={async () => {
                if (!$profile?.jwt || newComment.length <= 0) return
    
                try {
                    await getClient().editComment({
                        comment_id: node.comment_view.comment.id,
                        content: newComment,
                    })
                    node.comment_view.comment.content = newComment
                    editing = false
                    toast({
                        content: 'Successfully edited comment.',
                        type: 'success',
                        title: 'Comment Edited'
                    })
                } catch (err) {
                    toast({
                        content: "Unable to edit comment",
                        type: 'error',
                        title: 'Error'
                    })
                }
            }}>
                Save
            </Button>
        </MarkdownEditor>
    </Modal>
{/if}

<div bind:this={commentContainer} class="py-2 {$$props.class}" id="#{node.comment_view.comment.id.toString()}">
    <details bind:open class="flex flex-col gap-1">
        <summary class="
            {jumpToComment ? jumpToCommentClassSummary : ''}
            {jumpToComment && !open ? 'border-b rounded-b-md' : ''}
            {node.comment_view.comment.distinguished ? distinguishedClassSummary : ''} 
            {node.comment_view.comment.distinguished && !open ? 'border-b rounded-b-md': ''} 
            flex flex-col md:flex-row flex-wrap w-full cursor-pointer gap-2 group text-xs 
            {jumpToComment
                ? 'hover:bg-amber-500/20'
                : node.comment_view.comment.distinguished
                    ? 'hover:bg-green-500/20'
                    : 'hover:bg-slate-100 hover:dark:bg-zinc-800 hover:dark:border-zinc-700'
            }
             hover:rounded-lg
        ">
            <span class:font-bold={op} class="flex flex-row flex-wrap gap-1 items-start w-full">
                <UserLink avatarSize={20} avatar user={node.comment_view.creator} mod={node.comment_view.creator_is_moderator} admin={node.comment_view.creator_is_admin} />
                
                {#if op}
                    <span class="text-sky-500">OP</span>
                {/if}
                
                {#if !open}
                    <span class="flex items-center gap-0.5 mr-1 mb-auto text-slate-600 dark:text-zinc-400">
                        <Icon src={ArrowUp} mini size="14" title="Score" />
                        {node.comment_view.counts.score}
                    </span>
                {/if}

                <!---If updated, only show edited time on mobile--->
                <span class="{node.comment_view.comment.updated ? 'hidden sm:flex' : 'flex'} flex-row items-center whitespace-nowrap text-slate-600 dark:text-zinc-400">
                    <RelativeDate date={node.comment_view.comment.published}/>
                </span>

                {#if node.comment_view.comment.updated}
                    <span class="flex flex-row whitespace-nowrap items-center gap-1 ml-1 text-slate-600 dark:text-zinc-400">
                        <Icon src={Pencil} solid size="12" title="Edited" />
                        <RelativeDate date={node.comment_view.comment.updated}/>
                    </span>
                {/if}

                {#if node.comment_view.comment.deleted || node.comment_view.comment.removed}
                    <Icon src={Trash} solid size="12" title="Deleted" class="text-red-600 dark:text-red-500 mt-1"/>
                {/if}

                {#if node.comment_view.saved}
                    <Icon src={Bookmark} solid size="12" title="Saved" class="text-yellow-600 dark:text-yellow-500 mt-1" />
                {/if}

                <Button color="ghost" size="sm"
                    class="ml-auto translate-x-1 opacity-0 group-hover:translate-x-0 items-center
                    group-hover:opacity-100 text-xs !transition-all
                    pointer-events-none border-none
                    text-slate-600 dark:text-zinc-400
                    "
                >
                    <Icon src={open ? Minus : Plus} width={16} height={16} mini />
                    {#if !open && node.children.length > 0}
                        <span class="text-xs opacity-50">+{node.children.length}</span>
                    {/if}
                </Button>
            </span>
        </summary>

        <div class="
            {jumpToComment ? jumpToCommentClassContent : ''}
            {node.comment_view.comment.distinguished ? distinguishedClassContent : ''} flex flex-col gap-1"
        >
            
            <div class="max-w-full mt-0.5 break-words text-sm">
                <Markdown source={
                    !amModOfAny($profile?.user) && (node.comment_view.comment.removed || node.comment_view.comment.deleted)
                        ? node.comment_view.comment.deleted ? '*Deleted by creator*' : '*Removed by mod*'
                        : node.comment_view.comment.content
                    } />
            </div>
            
            {#if actions}
                <div class="flex flex-row gap-2 items-center">
                    <CommentActions
                        bind:comment={node.comment_view}
                        bind:replying
                        on:edit={() => (editing = true)}
                    />
                </div>
            {/if}
        </div>
        {#if replying}
            <div class="max-w-full my-2">
                <h1 class="font-bold text-sm mb-2">Reply</h1>
                <CommentForm {postId} parentId={node.comment_view.comment.id} bind:imageUploads
                    on:comment={(e) => {
                        node.children = [
                            {
                                children: [],
                                comment_view: e.detail.comment_view,
                                depth: node.depth + 1,
                            },
                            ...node.children,
                        ]
                        replying = false
                    }}
                />
            </div>
        {/if}
        <div class="bg-transparent dark:bg-transparent">
            <slot />
        </div>
    </details>
</div>
