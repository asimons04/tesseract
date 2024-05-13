<script lang="ts">
    import type { GetPostResponse, CommentSortType } from 'lemmy-js-client'


    import { buildCommentsTreeAsync } from '$lib/components/lemmy/comment/comments.js'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation';
    import { instance } from '$lib/instance.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { removeURLParams} from '$lib/components/lemmy/post/helpers'

    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Comments from '$lib/components/lemmy/comment/Comments.svelte'
    import CommentForm from '$lib/components/lemmy/comment/CommentForm.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte';
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'

    import { 
        ArrowPath,
        ChatBubbleLeftRight,
        ExclamationTriangle,
        Icon 
    } from 'svelte-hero-icons'
    

    export let data:any
    export let showCommentForm:boolean = true;

    let commentSort: CommentSortType = data.commentSort;

    async function reloadComments() {
        data.singleThread = false
        data.streamed.comments = getClient().getComments({
            type_: 'All',
            post_id: data.post.post_view.post.id,
            sort: commentSort,
            max_depth: 3,
        })
    }
</script>

<div id="comments" class="mt-4 flex flex-col gap-2 w-full">
    

    <div class="flex flex-row justify-between items-center">
        
        <div class="font-bold text-lg">
            Comments 
            <span class="text-sm font-normal ml-2 opacity-80">
                <FormattedNumber number={data.post.post_view.counts.comments} />
            </span>
        </div>

        <MultiSelect options={['Hot', 'Top', 'New']} bind:selected={commentSort} on:select={reloadComments} headless={true} />

        <Button class="font-normal" title="{$page.url.searchParams.get('thread') ? 'Reload comment thread' : 'Reload comments'}" color="tertiary-border"
            on:click={() => {
                reloadComments();
            }}
        >
            <Icon src={ArrowPath} mini size="16" slot="icon" />
            <span class="hidden md:inline">{$page.url.searchParams.get('thread') ? 'Reload comment thread' : 'Reload comments'}</span>
        </Button>
    </div>

    {#if data.singleThread}
        <Card class="py-2 px-4 text-sm flex flex-row items-center flex-wrap justify-between">
            <p>You're viewing a single thread.</p>
            <Button on:click={() => goto(removeURLParams($page.url.toString()), {invalidateAll: true}) }>View full thread</Button>
        </Card>
    {/if}

    {#await data.streamed.comments}
        <div class="h-16 mx-auto grid place-items-center">
            <Spinner width={24} />
        </div>
        {:then comments}
        
        {#if $profile?.user && showCommentForm}
            <CommentForm postId={data.post.post_view.post.id}
                locked={data.post.post_view.post.locked || $page.params.instance.toLowerCase() != $instance.toLowerCase()}
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
                    <Comments post={data.post.post_view.post} moderators={data.post.moderators} nodes={comments} isParent={true} />
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