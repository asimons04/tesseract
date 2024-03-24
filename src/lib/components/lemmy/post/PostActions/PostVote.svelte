<script lang="ts">
    import type { 
        PostAggregates,
        PostView 
    } from 'lemmy-js-client'
    
    
    import { getClient } from '$lib/lemmy'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'

    import {
        ArrowUp,
        ArrowDown,
        Icon,
    } from 'svelte-hero-icons'

    import { profile } from '$lib/auth.js'


    export let post:    PostView

    const voteColor = (vote: number) => {
        if (vote == 1) return '!text-blue-500 dark:!text-blue-400 font-bold'
        if (vote == -1) return '!text-red-500 font-bold'
        return ''
    }

    async function vote(vote:number): Promise<PostAggregates> {
        if (!$profile?.jwt) return post.counts
        
        try {
            return (await getClient().likePost({
                    auth: $profile.jwt,
                    post_id: post.post.id,
                    score: vote,
                })
                ).post_view.counts
        }
        catch (err) {
            toast({
                type: 'error',
                title: "Error",
                content: `Unable to process your vote.`,
            })
            return post.counts
        }
    }
</script>


<div class="flex items-center text-sm gap-0 rounded-lg border border-slate-200 dark:border-zinc-800 h-full duration-200">
    <Button
        disabled={!$profile?.user}
        aria-label="Upvote"
        class="{post.my_vote == 1 ? voteColor(post.my_vote) : ''}"
        on:click={async () => {
            post.counts = await vote(post.my_vote == 1 ? 0 : 1)
            post.my_vote = post.my_vote == 1 ? 0 : 1
        }}
        size="sm"
        color="tertiary"
        alignment="center"
    >
        <Icon src={ArrowUp} mini size="18" />
        <FormattedNumber number={post.counts.upvotes} />
    </Button>
    
    <div class="border-l h-6 w-0 !p-0 border-slate-200 dark:border-zinc-800"></div>
   
    <Button
        disabled={!$profile?.user}
        aria-label="Downvote"
        class="{post.my_vote == -1 ? voteColor(post.my_vote) : ''}"
        on:click={async () => {
            post.counts = await vote(post.my_vote == -1 ? 0 : -1)
            post.my_vote = post.my_vote == -1 ? 0 : -1
        }}
        size="sm"
        color="tertiary"
    >
        <Icon src={ArrowDown} mini size="18" />
        <FormattedNumber number={post.counts.downvotes} />
    </Button>
</div>

