<script lang="ts">
    import type { CommentAggregates, CommentView } from 'lemmy-js-client'
    import {
        ArrowUp,
        ArrowDown,
        Icon,
        Heart,
    } from 'svelte-hero-icons'
    
    
    import { getClient } from '$lib/lemmy'
    import { instance } from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { site } from '$lib/lemmy'
    import { userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'

    export let comment: CommentView

    let onHomeInstance: boolean = true
    $: onHomeInstance = ($page.params.instance ?? $instance)  == $instance

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

<div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} items-center rounded-md gap-0 transition-colors cursor-pointer h-[26px] border border-slate-200 dark:border-zinc-800  border rounded-lg">
    <Button disabled={!$profile?.user || !onHomeInstance} aria-label="Upvote" size="sm" color="tertiary" alignment="center"
        class="{comment.my_vote == 1 ? voteColor() : ''} !gap-0.5"
        on:click={async () => {
            comment.counts = await vote(comment.my_vote == 1 ? 0 : 1)
            comment.my_vote = comment.my_vote == 1 ? 0 : 1
        }}
        
    >
        <Icon width={19} mini src={
            $site?.site_view?.local_site?.enable_downvotes && !$userSettings.uiState.disableDownvotes
                ? ArrowUp
                : Heart
            }  
        />
        {#if $userSettings.uiState.showScores}
            <FormattedNumber number={comment.counts.upvotes} />
        {/if}
    </Button>
    
    <div class="border-l h-6 w-0 !p-0 border-slate-200 dark:border-zinc-800"></div>
    
    <!---Hide downvote buttons if site config has globally disabled downvotes--->
    {#if $site?.site_view?.local_site?.enable_downvotes && !$userSettings.uiState.disableDownvotes}
        <Button disabled={!$profile?.user || !onHomeInstance} aria-label="Downvote" size="sm" color="tertiary" alignment="center"
            class="{comment.my_vote == -1 ? voteColor() : ''} !gap-0.5"
            on:click={async () => {
                comment.counts = await vote(comment.my_vote == -1 ? 0 : -1)
                comment.my_vote = comment.my_vote == -1 ? 0 : -1
            }}
            
        >
            <Icon src={ArrowDown} width={19} mini />
            {#if $userSettings.uiState.showScores}
                <FormattedNumber number={comment.counts.downvotes} />
            {/if}
        </Button>
    {/if}
</div>

