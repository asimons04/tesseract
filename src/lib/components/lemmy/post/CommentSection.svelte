<script lang="ts">
    import type { CommentSortType, UploadImageResponse } from 'lemmy-js-client'

    import { buildCommentsTreeAsync } from '$lib/components/lemmy/comment/comments.js'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'


    import Button           from '$lib/components/input/Button.svelte'
    import Card             from '$lib/components/ui/Card.svelte'
    import Comments         from '$lib/components/lemmy/comment/Comments.svelte'
    import CommentForm      from '$lib/components/lemmy/comment/CommentForm.svelte'
    import FormattedNumber  from '$lib/components/util/FormattedNumber.svelte'
    import Placeholder      from '$lib/components/ui/Placeholder.svelte';
    import SelectMenu       from '$lib/components/input/SelectMenu.svelte'
    import Spinner          from '$lib/components/ui/loader/Spinner.svelte'

    import { 
        BarsArrowDown,
        ChatBubbleLeftRight,
        ExclamationTriangle,
    } from 'svelte-hero-icons'
    
    export let data:any
    export let showCommentForm:boolean  = true;
    export let imageUploads             = [] as UploadImageResponse[]
    export let onHomeInstance: boolean  = true
    export let inThread:boolean         = false
    export let jumpTo:number            = -1 

    let commentSort: CommentSortType    = data.commentSort;
    let commentSectionContainer: HTMLDivElement

    async function reloadComments() {
        data.singleThread = false
        jumpTo = -1
        commentSectionContainer.scrollTop = 0
        data.streamed.comments = getClient().getComments({
            type_: 'All',
            post_id: data.post.post_view.post.id,
            sort: commentSort,
            max_depth: 3,
        })
    }
</script>

<div bind:this={commentSectionContainer} id="comments" class="mt-4 flex flex-col gap-2 w-full h-full">
    

    <div class="flex flex-row justify-between items-center px-2">
        
        <div class="font-bold text-lg h-[40px] mt-auto">
            Comments 
            <span class="text-sm font-normal ml-2 opacity-80">
                <FormattedNumber number={data.post.post_view.counts.comments} />
            </span>
        </div>

        
        <span class="flex flex-col gap-1">
            <span class="font-bold text-sm opacity-80">Sort Direction</span>
            <SelectMenu
                title="Sort Direction"
                alwaysShowSelectedLabel
                icon={BarsArrowDown}
                alignment="bottom-right"
                options={['Hot', 'Top', 'New', 'Old', 'Controversial']} 
                bind:selected={commentSort} 
                on:select={reloadComments} items={5} headless={true} 
            />
        </span>
        
    </div>

    {#if data.singleThread}
        <Card class="py-2 px-4 text-sm flex flex-row items-center flex-wrap justify-between">
            <p>You're viewing a single thread.</p>
            <Button on:click={() => reloadComments() }>View full thread</Button>
        </Card>
    {/if}

    {#await data.streamed.comments}
        <div class="h-16 mx-auto grid place-items-center">
            <Spinner width={24} />
        </div>
        {:then comments}
        
        {#if $profile?.user && showCommentForm}
            <CommentForm postId={data.post.post_view.post.id} bind:imageUploads
                locked={data.post.post_view.post.locked || !onHomeInstance}
                on:comment={ (comment) =>
                    {
                        comments.comments = [comment.detail.comment_view, ...comments.comments,];
                        showCommentForm = !showCommentForm;
                    }
                }
            />
        {/if}
    
        {#await buildCommentsTreeAsync(comments.comments)}
            <div class="h-16 mx-auto grid place-items-center">
                <Spinner width={36} />
            </div>
            {:then comments}
                {#if comments.length > 0}
                    <Comments post={data.post.post_view.post} moderators={data.post.moderators} nodes={comments} isParent={true} {onHomeInstance} {jumpTo}/>
                {:else}
                    <!---Hide placeholder if you have the comment form open--->
                    {#if !showCommentForm}
                        <Placeholder icon={ChatBubbleLeftRight} class="mt-4 mb-4" title="No Comments" description="No one has commented here yet" />
                    {/if}
                {/if}
        {/await}

        {:catch}
            <Placeholder icon={ExclamationTriangle} class="mt-4 mb-4" title="An Error Has Occurred" description="Unable to fetch comments for this post." />
    {/await}
</div>