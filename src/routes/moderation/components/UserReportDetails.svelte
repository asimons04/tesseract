<script lang="ts">
    import type {
        CommentReportView,
        PostReportView,
        PrivateMessageReportView,
    } from 'lemmy-js-client'

    import { 
        isCommentReport, 
        isPrivateMessageReport,
        isPostReport, 
    } from '$lib/lemmy/item.js'

    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte';
    import Post from '$lib/components/lemmy/post/Post.svelte'
    
    export let display:boolean = true;
    export let item: PostReportView | CommentReportView | PrivateMessageReportView

</script>

{#if display}
    <div class="flex flex-col gap-4 xl:flex-row w-full">
        <!--- Preview of content being reported--->
        <details open class="flex flex-col gap-2 w-full xl:w-2/3">
            <summary class="text-base font-bold dark:text-zinc-400 text-slate-600 mb-4 cursor-pointer">
                Reported {isCommentReport(item) ? 'Comment' : isPostReport(item) ? 'Post' : 'Content'}
            </summary>
            
            {#if isCommentReport(item)}
                <CommentItem
                    comment={
                        {
                            ...item,
                            subscribed: 'NotSubscribed',
                            creator_blocked: false,
                            saved: false,
                            creator: item.comment_creator,
                        }
                    }
                    actions={false}
                    collapseBadges={true}
                />
            {:else if isPostReport(item)}
                <Post
                    post={
                        {
                            ...item,
                            saved: false,
                            subscribed: 'NotSubscribed',
                            unread_comments: 0,
                            read: false,
                            creator_blocked: false,
                            creator: item.post_creator,
                        }
                    }
                    forceCompact={true}
                    disablePostLinks={false}
                    actions={false}
                    collapseBadges={true}
                />
            {/if}

        </details>
        
        
        <!--- Report from the User--->
        <details open class="flex flex-col gap-2  w-full xl:w-1/3">
            <summary class="text-base font-bold dark:text-zinc-400 text-slate-600 mb-4 cursor-pointer">
                Report Details
            </summary>
            
            <Markdown source={isCommentReport(item) ? item.comment_report.reason : isPostReport(item) ? item.post_report.reason : 'No reason provided'} />
        </details>   
        
        
    </div>
{/if}