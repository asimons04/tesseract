<script lang="ts">
    import {
        ArrowUp,
        ArrowDown,
        ChevronDown,
        ChevronUp,
        Icon,
    } from 'svelte-hero-icons'
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth.js'
    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'

    export let vote: number = 0
    export let score: number
    export let commentId: number

    async function upvote() {
        if (!$profile?.jwt) return
        const upvoted = vote == 1

        if (vote == -1) {
            score += 2
        } else if (vote == 1) {
            score -= 1
        } else if (vote == 0) {
            score += 1
        }

        vote = Number(!upvoted)

        await getClient()
        .likeComment({
            score: upvoted ? 0 : 1,
            auth: $profile.jwt,
            comment_id: commentId,
        })
        .catch((_) => undefined)
    }

    async function downvote() {
        if (!$profile?.jwt) return
        const upvoted = vote == -1

        if (vote == -1) {
            score += 1
        } else if (vote == 1) {
            score -= 2
        } else if (vote == 0) {
            score -= 1
        }

        vote = -Number(!upvoted)

        await getClient()
        .likeComment({
            score: upvoted ? 0 : -1,
            auth: $profile.jwt,
            comment_id: commentId,
        })
        .catch((_) => undefined)
    }

    const voteColor = (vote: number) => {
        if (vote == 1) return '!text-blue-500 dark:!text-blue-400'
        if (vote == -1) return '!text-red-500'
        return ''
    }

</script>

<div class="flex flex-row items-center rounded-md transition-colors cursor-pointer h-[26px] border border-slate-200 dark:border-zinc-800 border-none">
    <button
        disabled={!$profile?.user}
        on:click={upvote}
        class="px-1.5 {vote == 1 ? voteColor(vote) : ''}"
        aria-label="Upvote"
    >
        <Icon src={ArrowUp} width={19} mini />
    </button>
    
    <span class="text-sm font-medium {voteColor(vote)}">
        <FormattedNumber number={score} />
    </span>

    <button
        disabled={!$profile?.user}
        on:click={downvote}
        class="px-1.5 {vote == -1 ? voteColor(vote) : ''}"
        aria-label="Downvote"
    >
        <Icon src={ArrowDown} width={19} mini />
    </button>
</div>

