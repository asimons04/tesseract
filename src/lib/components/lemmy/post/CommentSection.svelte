<script lang="ts">
    import type {PageData} from '$types'
    import type { PostView, CommentSortType } from 'lemmy-js-client'


    import { buildCommentsTreeAsync } from '$lib/components/lemmy/comment/comments.js'
    import { getClient } from '$lib/lemmy.js'
    import { instance } from '$lib/instance.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'

    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Comments from '$lib/components/lemmy/comment/Comments.svelte'
    import CommentForm from '$lib/components/lemmy/comment/CommentForm.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'

    import { 
        ArrowPath,
        Icon 
    } from 'svelte-hero-icons'
    

    export let data:PageData

    let post:PostView
    let commentSort: CommentSortType = data.commentSort;
    let commentsPage:number

    $: {
        post = data.post;
        commentsPage = commentsPage || 1
    }

    async function reloadComments() {
        data.singleThread = false
        commentsPage = 1

        data.streamed.comments = getClient().getComments({
            auth: $profile?.jwt,
            page: 1,
            limit: 25,
            type_: 'All',
            post_id: post.post_view.post.id,
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
                <FormattedNumber number={post.post_view.counts.comments} />
            </span>
        </div>

        <MultiSelect
            options={['Hot', 'Top', 'New']}
            bind:selected={commentSort}
            on:select={reloadComments}
            headless={true}
        />

        <Button class="font-normal" title="Reload comments"
            on:click={() => {
                reloadComments();
            }}
        >
            <Icon src={ArrowPath} mini size="16" slot="icon" />
            <span class="hidden md:inline">Reload Comments</span>
        </Button>
    </div>

    {#if data.singleThread}
        <Card class="py-2 px-4 text-sm flex flex-row items-center flex-wrap gap-4">
            <p>You're viewing a single thread.</p>
            <Button on:click={reloadComments}>View full thread</Button>
        </Card>
    {/if}

    {#await data.streamed.comments}
        <div class="h-16 mx-auto grid place-items-center">
            <Spinner width={24} />
        </div>
        {:then comments}
        {#if $profile?.user}
            <CommentForm
                postId={post.post_view.post.id}
                on:comment={ (comment) =>
                    ( comments.comments = [comment.detail.comment_view, ...comments.comments,] )
                }
                locked={post.post_view.post.locked || $page.params.instance.toLowerCase() != $instance.toLowerCase()}
            />
        {/if}
    
        {#await buildCommentsTreeAsync(comments.comments)}
            <div class="h-16 mx-auto grid place-items-center">
                <Spinner width={36} />
            </div>
            {:then comments}
                <Comments post={post.post_view.post} moderators={post.moderators} nodes={comments} isParent={true} />
        {/await}
        {:catch}
            <div class="bg-red-500/10 border border-red-500 rounded-md p-4">
                Failed to load comments.
            </div>
    {/await}
</div>