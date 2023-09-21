<script lang="ts">
    import type { Post } from 'lemmy-js-client'
    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'

    import {
        ArrowUp,
        ArrowDown,
        ChevronDown,
        ChevronUp,
        Icon,
    } from 'svelte-hero-icons'

    import { profile } from '$lib/auth.js'
    import { vote as voteItem } from '$lib/lemmy/contentview.js'

    export let post:    Post
    export let vote:    number = 0
    export let score:   number

    const voteColor = (vote: number) => {
        if (vote == 1) return '!text-blue-500 dark:!text-blue-400'
        if (vote == -1) return '!text-red-500'
        return ''
    }
</script>

<slot {vote} {score}>
    <div class="flex items-center text-sm gap-1 rounded-md border border-slate-200 dark:border-zinc-700 px-1 h-full duration-200 border-none">
        <Button
            disabled={!$profile?.user}
            aria-label="Upvote"
            class={vote == 1 ? voteColor(vote) : ''}
            on:click={async () => {
                if (!$profile?.jwt) return
                score = await voteItem(post, vote == 1 ? 0 : 1, $profile.jwt)
                vote = vote == 1 ? 0 : 1
            }}
            size="square-sm"
            color="tertiary"
            alignment="center"
        >
            <Icon src={ArrowUp} mini size="18" />
        </Button>
      
        <span class="font-medium transition-colors duration-200 {voteColor(vote)}">
            <FormattedNumber number={score} />
        </span>
      
        <Button
            disabled={!$profile?.user}
            aria-label="Downvote"
            class={vote == -1 ? voteColor(vote) : ''}
            on:click={async () => {
                if (!$profile?.jwt) return
                score = await voteItem(post, vote == -1 ? 0 : -1, $profile.jwt)
                vote = vote == -1 ? 0 : -1
            }}
            size="square-sm"
            color="tertiary"
        >
            <Icon src={ArrowDown} mini size="18" />
        </Button>
    </div>
</slot>
