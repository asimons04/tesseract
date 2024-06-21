<script lang="ts">
    interface SwipeEvent extends CustomEvent {
        detail: {
            direction: 'top' | 'right' | 'bottom' | 'left',
            target: EventTarget
        }
    }
    import type { VoteView } from 'lemmy-js-client'
    import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'
    
    import { capitalizeFirstLetter } from '$lib/util'
    import { getClient } from '$lib/lemmy';
    import { onMount } from 'svelte'
    import { swipe } from 'svelte-gestures'
    
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import InfiniteScrollDiv from '$lib/components/ui/infinitescroll/InfiniteScrollDiv.svelte';
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

    let votes:VoteView[] = []
    let loading = false
    let fetchError = false
    let page = 1
    let limit = 50
    let iconSize = 24
    
    let scrollArea: HTMLDivElement
    let infiniteScrollState:InfiniteScrollStateVars
    
    // Load the vote counts
    onMount(async () => {
        loading = true
        votes = []
        votes = (type == 'post')
            ? await listPostLikes(submission_id)
            : await listCommentLikes(submission_id)
        
        if (page == 1 && votes.length < limit) {
            infiniteScrollState.exhausted = true
        }
        
        loading = false
    })

    async function loadMore() {
        page++
        let nextBatch = (type == 'post')
            ? await listPostLikes(submission_id)
            : await listCommentLikes(submission_id)
        
        if (nextBatch.length < 1) { 
            page--
            infiniteScrollState.exhausted = true
            infiniteScrollState.loading = false
            return
        }
        
        nextBatch.forEach((vote) => {
            const index = votes?.findIndex((v) => v.creator.id == vote.creator.id)
            if (index< 0) votes.push(vote)
        })
        votes = votes
        infiniteScrollState.loading = false
        
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

    function onSwipe(e:SwipeEvent) {
        if (['left', 'right'].includes(e.detail.direction)) open = false
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
        <div bind:this={scrollArea} class="flex flex-col overflow-y-scroll max-h-[500px] divide-y divide-slate-200 dark:divide-zinc-500 px-4"
            use:swipe={{touchAction: 'pan-y'}} 
            on:swipe={(e) => onSwipe(e)   }
        >
            {#each votes as vote}
                <div class="flex flex-row w-full items-center gap-2 py-2 text-base">
                    <span class="flex">
                        <UserLink bind:user={vote.creator} avatar avatarSize={iconSize} ring />
                    </span>
                    
                    <span class="flex ml-auto {vote.score > 0 ? 'text-sky-500' : 'text-red-500'} font-bold">
                        <Icon mini width={iconSize} src={vote.score > 0 ? ArrowUp : ArrowDown}/>
                    </span>
                </div>
            {/each}
            
            
            <div class="flex flex-col items-center pt-2 w-full">
                <InfiniteScrollDiv bind:state={infiniteScrollState} bind:element={scrollArea} threshold={500}
                    on:loadMore={ () => loadMore() }
                />
            </div>
        
        </div>
    {/if}
</Modal>