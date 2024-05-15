<script lang="ts">
    import type { VoteView } from 'lemmy-js-client'
    
    import { capitalizeFirstLetter } from '$lib/util'
    import { getClient } from '$lib/lemmy';
    import { onMount } from 'svelte'

    
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import Pageination from '$lib/components/ui/Pageination.svelte';
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte';

    import { 
        Icon,
        ArrowDown, 
        ArrowUp, 
        ArrowsUpDown 
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
        if (type == 'post')     votes = await listPostLikes(submission_id)
        if (type == 'comment')  votes = await listCommentLikes(submission_id)
        loading = false
    }

    async function listPostLikes(postID:number):Promise<VoteView[]> {
        let result = await getClient().listPostLikes({
            post_id: postID,
            limit: limit,
            page: page
        })
        if (result.post_likes) return result.post_likes
        return [] as VoteView[]
    }

    async function listCommentLikes(commentID:number):Promise<VoteView[]> {
        let result = await getClient().listCommentLikes({
            comment_id: commentID,
            limit: limit,
            page: page
        })
        if (result.comment_likes) return result.comment_likes
        return [] as VoteView[]
    }

</script>

<Modal bind:open preventCloseOnClickOut title="{capitalizeFirstLetter(type)} Votes" icon={ArrowsUpDown} width="min-w-full sm:min-w-[475px]">
    {#if loading}
        <div class="flex flex-col gap-4 mx-auto my-auto">
            <span class="text-sm font-bold">Loading...</span>
            <Spinner width={64} />
        </div>
    {/if}

    {#if !loading && fetchError}
        <p class="p-8">Unable to fetch votes for this submission.</p>
    {/if}

    {#if votes}
        <div class="flex flex-col divide-between gap-2">
            {#each votes as vote}
                <div class="flex flex-row w-full items-center gap-2 text-sm">
                    <UserLink bind:user={vote.creator} avatar avatarSize={iconSize} />
                    
                    <span class="flex ml-auto {vote.score > 0 ? 'text-sky-500' : 'text-red-500'} font-bold">
                        <Icon mini width={iconSize} src={vote.score > 0 ? ArrowUp : ArrowDown}/>
                    </span>
                </div>
            {/each}
        </div>
        
        <div class="flex w-full mt-4">
            <Pageination bind:page disableNext={votes.length < 1} 
                on:change={async (e) => {
                    page = e.detail
                    await load()
                }}
            />
        </div>
    {/if}




</Modal>