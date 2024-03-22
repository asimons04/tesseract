<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'
    import {
        ArrowUp,
        ArrowDown,
        Icon,
    } from 'svelte-hero-icons'
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth.js'
    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'

    export let comment: CommentView

    const voteColor = () => {
        if (comment.my_vote == 1) return '!text-blue-500 dark:!text-blue-400'
        if (comment.my_vote == -1) return '!text-red-500'
        return ''
    }

    async function vote(vote:number) {
        if (!$profile?.jwt) return comment.counts
        
        try {
            return (await getClient().likeComment({
                    auth: $profile.jwt,
                    comment_id: comment.comment.id,
                    score: vote,
                })
                ).comment_view.counts
        }
        catch (err) {
            return comment.counts
        }
    }

</script>

<div class="flex flex-row items-center rounded-md gap-1 transition-colors cursor-pointer h-[26px] border border-slate-200 dark:border-zinc-800 border-none">
    <Button disabled={!$profile?.user} aria-label="Upvote" size="sm" color="tertiary" alignment="center"
        class="px-1.5 {comment.my_vote == 1 ? voteColor() : ''}"
        on:click={async () => {
            comment.counts = await vote(comment.my_vote == 1 ? 0 : 1)
            comment.my_vote = comment.my_vote == 1 ? 0 : 1
        }}
        
    >
        <Icon src={ArrowUp} width={19} mini />
        <FormattedNumber number={comment.counts.upvotes} />
    </Button>
    
    <!--
    <span class="text-sm font-medium {voteColor(vote)}">
        <FormattedNumber number={comment.counts.score} />
    </span>
    -->

    <Button disabled={!$profile?.user} aria-label="Downvote" size="sm" color="tertiary" alignment="center"
        class="px-1.5 {comment.my_vote == -1 ? voteColor() : ''}"
        on:click={async () => {
            comment.counts = await vote(comment.my_vote == -1 ? 0 : -1)
            comment.my_vote = comment.my_vote == -1 ? 0 : -1
        }}
        
    >
        <Icon src={ArrowDown} width={19} mini />
        <FormattedNumber number={comment.counts.downvotes} />
    </Button>
</div>

