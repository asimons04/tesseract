<script lang="ts">
    import type { VoteView } from 'lemmy-js-client'
    
    import { capitalizeFirstLetter } from '$lib/util'
    import { getClient } from '$lib/lemmy';
    import { onMount } from 'svelte'

    
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import Pageination from '$lib/components/ui/Pageination.svelte';
    import Placeholder from '$lib/components/ui/Placeholder.svelte';
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte';

    import { 
        Icon,
        ArrowDown, 
        ArrowUp, 
        ArrowsUpDown,
        ExclamationTriangle
    } from "svelte-hero-icons";

    export let open:boolean = false
    export let type: 'post' | 'comment'
    export let submission_id: number

    let votes:VoteView[] | undefined = undefined
    let loading = false
    let fetchError = false
    let page = 1
    let limit = 10
    let iconSize = 24

    // Load the vote counts
    onMount(async () => {
        await load()
    })

    async function load() {
        loading = true
        votes = []
        votes = (type == 'post')
            ? await listPostLikes(submission_id)
            : await listCommentLikes(submission_id)
        loading = false

    }

    async function listPostLikes(postID:number):Promise<VoteView[]> {
        try {
            let result = await getClient().listPostLikes({
                post_id: postID,
                limit: limit,
                page: page
            })
            if (result.post_likes) return result.post_likes
            return [] as VoteView[]
        }
        catch {
            fetchError = true
            return [] as VoteView[]
        }
    }

    async function listCommentLikes(commentID:number):Promise<VoteView[]> {
        try {
            let result = await getClient().listCommentLikes({
                comment_id: commentID,
                limit: limit,
                page: page
            })
            if (result.comment_likes) return result.comment_likes
            return [] as VoteView[]
        }
        catch {
            fetchError = true
            return [] as VoteView[]
        }
    }

</script>

<Modal bind:open preventCloseOnClickOut title="{capitalizeFirstLetter(type)} Votes" icon={ArrowsUpDown} width="max-w-xl">
    {#if loading}
        <div class="flex flex-col gap-4 mx-auto my-auto">
            <span class="text-sm font-bold">Loading...</span>
            <Spinner width={64} />
        </div>
    {/if}

    {#if !loading && fetchError}
        <Placeholder icon={ExclamationTriangle} title="Fetch Error" description="There was an error during the fetch for this request. Please try again later." />    
    {/if}

    {#if votes}
        <div class="flex flex-col divide-y divide-slate-200 dark:divide-zinc-500 mx-4">
            {#each votes as vote}
                <div class="flex flex-row w-full items-center gap-2 py-2 text-base">
                    <span class="flex">
                        <UserLink bind:user={vote.creator} avatar avatarSize={iconSize} />
                    </span>
                    
                    <span class="flex ml-auto {vote.score > 0 ? 'text-sky-500' : 'text-red-500'} font-bold">
                        <Icon mini width={iconSize} src={vote.score > 0 ? ArrowUp : ArrowDown}/>
                    </span>
                </div>
            {/each}
        </div>
        
        {#if !loading && !fetchError}
            <div class="flex w-full mt-4">
                <Pageination bind:page disableNext={votes.length < limit} 
                    on:change={async (e) => {
                        page = e.detail
                        await load()
                    }}
                />
            </div>
        {/if}
    {/if}




</Modal>