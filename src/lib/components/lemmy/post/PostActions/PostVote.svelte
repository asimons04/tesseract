<script lang="ts">
    import type { 
        PostAggregates,
        PostView 
    } from 'lemmy-js-client'
    
    
    import { getClient } from '$lib/lemmy'
    import { instance } from '$lib/instance'
    import { page } from '$app/stores'
    import { site } from '$lib/lemmy'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import UpvoteIcon from '$lib/components/ui/icons/UpvoteIcon.svelte'

    import {
        Icon,
        Heart,
    } from 'svelte-hero-icons'

    import { profile } from '$lib/auth.js'


    export let post:    PostView
    export let small: boolean = false


    let onHomeInstance: boolean = true
    $: onHomeInstance = ($page.params.instance ?? $instance)  == $instance

    const voteColor = (vote: number) => {
        if (vote == 1) return '!text-blue-500 dark:!text-blue-400 font-bold'
        if (vote == -1) return '!text-red-500 font-bold'
        return ''
    }

    async function vote(vote:number): Promise<PostAggregates> {
        if (!$profile?.jwt) return post.counts
        
        try {
            return (await getClient().likePost({
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


<div class="flex 
        {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} 
        border border-slate-300 dark:border-zinc-800 items-center text-sm gap-0 rounded-lg
    "
>
    <!--size="{small ? 'sm' : 'md'}"-->
    <Button
        disabled={!$profile?.user || !onHomeInstance}
        aria-label="Upvote"
        class="{post.my_vote == 1 ? voteColor(post.my_vote) : ''}"
        
        color="tertiary"
        alignment="center"
        size="sm"
        on:click={async () => {
            post.counts = await vote(post.my_vote == 1 ? 0 : 1)
            post.my_vote = post.my_vote == 1 ? 0 : 1
        }}


    >
        {#if $site?.site_view?.local_site?.enable_downvotes && !$userSettings.uiState.disableDownvotes}
            <UpvoteIcon width={small ? 16 : 18} filled={post.my_vote == 1}/>
        {:else}
            <Icon src={Heart} width={small ? 16 : 18} mini />
        {/if}

        {#if $userSettings.uiState.showScores}
            <FormattedNumber number={post.counts.upvotes} />
        {/if}
    </Button>
    
  
    <!---Hide downvote buttons if site config has globally disabled downvotes--->
    {#if $site?.site_view?.local_site?.enable_downvotes && !$userSettings.uiState.disableDownvotes}
        <Button
            disabled={!$profile?.user || !onHomeInstance}
            aria-label="Downvote"
            class="{post.my_vote == -1 ? voteColor(post.my_vote) : ''}"
            size="sm"
            color="tertiary"
            on:click={async () => {
                post.counts = await vote(post.my_vote == -1 ? 0 : -1)
                post.my_vote = post.my_vote == -1 ? 0 : -1
            }}

        >
            <UpvoteIcon width={small ? 16 : 18} filled={post.my_vote == -1} downvote/>

            {#if $userSettings.uiState.showScores}
                <FormattedNumber number={post.counts.downvotes} />
            {/if}
        </Button>
    {/if}
</div>

