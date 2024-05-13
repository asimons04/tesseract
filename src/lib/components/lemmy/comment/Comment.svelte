<script lang="ts">
    import type { CommentNodeI } from './comments'
    import {
        ArrowUp,
        Bookmark,
        Cake,
        ChatBubbleLeftEllipsis,
        Icon,
        Minus,
        Pencil,
        Plus,
        ShieldCheck,
        Trash,
    } from 'svelte-hero-icons'
    
    
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CommentActions from '$lib/components/lemmy/comment/CommentActions.svelte'
    import CommentForm from './CommentForm.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { getClient } from '$lib/lemmy.js'
    import { isNewAccount, isThreadComment, scrollToTop } from '../post/helpers'
    import { onMount } from 'svelte'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import { slide } from 'svelte/transition'
    import { amModOfAny } from '../moderation/moderation';
    
    export let node: CommentNodeI
    export let postId: number
    export let op: boolean = false
    export let mod: boolean = false
    export let actions: boolean = true
    export let open = true
    export let replying = false

    let editing = false
    let newComment = node.comment_view.comment.content
    let distinguishedClassSummary = 'border-l border-r rounded-t-md border-t border-green-500/50 bg-green-500/5 p-1'
    let distinguishedClassContent = 'shadow-md border-l border-r rounded-b-md border-b border-green-500/50 bg-green-500/5 p-1'

    let jumpToCommentClassSummary = 'border-l border-r rounded-t-md border-t border-amber-200/50 bg-amber-500/5 p-1'
    let jumpToCommentClassContent = 'shadow-md border-l border-r rounded-b-md border-b border-amber-500/50 bg-amber-500/5 p-1'
    let jumpToComment = false
    let commentContainer: HTMLLIElement

    // If linking to a thread, scroll to the speciic comment and highlight it
    onMount(async() => {
        if (isThreadComment(node.comment_view.comment.id)) {
            jumpToComment = true
            scrollToTop(commentContainer)
        }
                    
    })

</script>

{#if editing}
    <Modal bind:open={editing} title="Editing comment" icon={ChatBubbleLeftEllipsis} action="Save"
        on:action={async () => {
            if (!$profile?.jwt || newComment.length <= 0) return

            try {
                await getClient().editComment({
                    comment_id: node.comment_view.comment.id,
                    content: newComment,
                })

                node.comment_view.comment.content = newComment
                editing = false
                toast({
                    content: 'Successfully edited comment. You may need to refresh to see changes.',
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
        }}
    >
        <CommentForm postId={node.comment_view.comment.id} bind:value={newComment} rows={15} actions={false} />
    </Modal>
{/if}

<li bind:this={commentContainer} class="py-2 {$$props.class}" id="#{node.comment_view.comment.id.toString()}">
    <details bind:open class="flex flex-col gap-1">
        <!--flex-wrap-->
        <summary class="
            {jumpToComment ? jumpToCommentClassSummary : ''}
            {node.comment_view.comment.distinguished ? distinguishedClassSummary : ''} 
            {node.comment_view.comment.distinguished && !open ? 'border-b': ''} 
            flex flex-col md:flex-row flex-wrap w-full cursor-pointer gap-2 group text-xs 
            hover:bg-slate-100 hover:dark:bg-zinc-800 hover:dark:border-zinc-700 hover:rounded-lg
            text-slate-600 dark:text-zinc-400
        ">
            <span class:font-bold={op} class="flex flex-row flex-wrap gap-1 items-start w-full">
                <UserLink avatarSize={20} avatar user={node.comment_view.creator} mod={mod} />
                
                {#if op}
                    <span class="text-sky-500">OP</span>
                {/if}
                
                {#if !open}
                    <span class="flex items-center gap-0.5 mr-1 mb-auto">
                        <Icon src={ArrowUp} mini size="14" title="Score" />
                        {node.comment_view.counts.score}
                    </span>
                {/if}

                <!---If updated, only show edited time on mobile--->
                <span class="{node.comment_view.comment.updated ? 'hidden sm:flex' : 'flex'} flex-row items-center whitespace-nowrap">
                    <RelativeDate date={node.comment_view.comment.published}/>
                </span>

                {#if node.comment_view.comment.updated}
                    <span class="flex flex-row whitespace-nowrap items-center gap-1 ml-1">
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
                    pointer-events-none border-none"
                >
                    <Icon src={open ? Minus : Plus} width={16} height={16} mini />
                    {#if !open && node.children.length > 0}
                        <span class="text-xs opacity-50">+{node.children.length}</span>
                    {/if}
                </Button>
                
                

                <!---
                    <span class="flex flex-row flex-nowrap gap-4 items-center mb-auto w-full">
                </span>
                --->
                
            </span>
        </summary>

        <div class="
            {jumpToComment ? jumpToCommentClassContent : ''}
            {node.comment_view.comment.distinguished ? distinguishedClassContent : ''} flex flex-col gap-1">
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
                <CommentForm {postId} parentId={node.comment_view.comment.id}
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
</li>
