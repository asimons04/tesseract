<script lang="ts">
    import type { CommentAggregates, CommentView } from 'lemmy-js-client'
    import {
        Icon,
        Heart,
    } from 'svelte-hero-icons'
    
    
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { site } from '$lib/lemmy'
    import { userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import UpvoteIcon from '$lib/components/ui/icons/UpvoteIcon.svelte'

    export let comment: CommentView
    export let onHomeInstance: boolean = false

    

    const voteColor = () => {
        if (comment.my_vote == 1) return '!text-blue-500 dark:!text-blue-400 font-bold'
        if (comment.my_vote == -1) return '!text-red-500 font-bold'
        return ''
    }

    async function vote(vote:number): Promise<CommentAggregates> {
        if (!$profile?.jwt) return comment.counts
        try {
            return (await getClient().likeComment({
                    comment_id: comment.comment.id,
                    score: vote,
                })
                ).comment_view.counts
        }
        catch (err) {
            toast({
                type: 'error',
                title: "Error",
                content: `Unable to process your vote.`,
            })
            return comment.counts
        }
    }

</script>

<div class="flex flex-row items-center gap-0 cursor-pointer border border-slate-300 dark:border-zinc-700 items-center text-sm gap-0 rounded-lg">
    <Button disabled={!$profile?.user || !onHomeInstance} aria-label="Upvote" size="sm" color="tertiary" alignment="center"
        class="{comment.my_vote == 1 ? voteColor() : ''} !gap-0.5"
        on:click={async () => {
            comment.counts = await vote(comment.my_vote == 1 ? 0 : 1)
            comment.my_vote = comment.my_vote == 1 ? 0 : 1
        }}
        
    >
        {#if $site?.site_view?.local_site?.enable_downvotes && !$userSettings.uiState.disableDownvotes}
            <UpvoteIcon width={19} filled={comment.my_vote == 1}/>
        {:else}
            <Icon src={Heart} width={19} mini />
        {/if}

        {#if $userSettings.uiState.showScores}
            <FormattedNumber number={comment.counts.upvotes} />
        {/if}
    </Button>
    
    
    <!---Hide downvote buttons if site config has globally disabled downvotes--->
    {#if $site?.site_view?.local_site?.enable_downvotes && !$userSettings.uiState.disableDownvotes}
        <Button disabled={!$profile?.user || !onHomeInstance} aria-label="Downvote" size="sm" color="tertiary" alignment="center"
            class="{comment.my_vote == -1 ? voteColor() : ''} !gap-0.5"
            on:click={async () => {
                comment.counts = await vote(comment.my_vote == -1 ? 0 : -1)
                comment.my_vote = comment.my_vote == -1 ? 0 : -1
            }}
            
        >
            <UpvoteIcon width={19} filled={comment.my_vote == -1} downvote/>

            {#if $userSettings.uiState.showScores}
                <FormattedNumber number={comment.counts.downvotes} />
            {/if}
        </Button>
    {/if}
</div>

