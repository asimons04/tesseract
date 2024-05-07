<script lang="ts">
    import type { StandardReport } from './helpers';
    import { 
        isCommentReport, 
        isPrivateMessageReport,
        isPostReport,
        isComment, 
    } from '$lib/lemmy/item.js'

    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte';
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import PrivateMessageItem from '$lib/components/lemmy/private_message/PrivateMessageItem.svelte';
    import { report } from '$lib/components/lemmy/moderation/moderation';

    export let display:boolean = true;
    export let item: StandardReport
    
</script>

{#if display}
    <div class="flex flex-col gap-4 xl:flex-row w-full">
        <!--- Preview of content being reported--->
        <details open class="flex flex-col gap-2 w-full xl:w-2/3">
            <summary class="text-base font-bold dark:text-zinc-400 text-slate-600 mb-4 cursor-pointer">
                Reported {item.type_friendly}
            </summary>
            
            {#if item.type=='comment' && item.comment_view}
                <CommentItem comment={item.comment_view} actions={false} collapseBadges={true} />
            {/if}
            
            {#if item.type == 'post' && item.post_view}
                <Post forceCompact={true} disablePostLinks={false} actions={false} collapseBadges={true} post={item.post_view} />
            {/if}

            {#if item.type=='private_message' && item.private_message_view}
                <PrivateMessageItem item={item.private_message_view} /> 
            {/if}

        </details>
        
        
        <!--- Report from the User--->
        <details open class="flex flex-col gap-2  w-full xl:w-1/3">
            <summary class="text-base font-bold dark:text-zinc-400 text-slate-600 mb-4 cursor-pointer">
                Report Details
            </summary>
            
            <Markdown source={item.reason}
             />
        </details>   
        
        
    </div>
{/if}