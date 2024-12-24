<script lang="ts">
    interface ShowVoteContainer {
        loading: boolean
        fetchError: boolean
        scrollArea: HTMLDivElement | undefined
        votes: VoteView[] 
        
        page: number
        limit: number
        infiniteScrollState: InfiniteScrollStateVars
        
        init: any 
        listCommentLikes: any
        listPostLikes: any
        loadMore: any
    }

    import type { BanUserEvent } from "$lib/ui/events"
    import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'
    import type { CommentView, PostView, VoteView } from "lemmy-js-client"

    import { getClient } from "$lib/lemmy"
    import { isCommentView } from '$lib/lemmy/item'

    import Placeholder from "$lib/components/ui/Placeholder.svelte"
    import InfiniteScrollDiv from "$lib/components/ui/infinitescroll/InfiniteScrollDiv.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    
    import UserLink from "../../user/UserLink.svelte"

    import {
        Icon,
        ArrowDown,
        ArrowUp,
        ExclamationTriangle
    } from 'svelte-hero-icons'
    import { onMount } from "svelte";
    

    export let item: PostView | CommentView

    // Object to hold the vote viewer components
    let showVotes = {
        loading: false,
        fetchError: false,
        scrollArea: undefined,
        votes: [] as VoteView[],
        page: 1,
        limit: 50,
        
        init:  async function() {
            showVotes.loading = true
            showVotes.page  = 1
            showVotes.votes = []
            showVotes.votes = (isCommentView(item))
                ? await showVotes.listCommentLikes(item.comment.id)
                : await showVotes.listPostLikes(item.post.id)
        
            if (showVotes.page == 1 && showVotes.votes.length < showVotes.limit) {
                showVotes.infiniteScrollState.exhausted = true
            }
        
            showVotes.loading = false
        },

        listCommentLikes: async function(commentID:number):Promise<VoteView[]> {
            try {
                let result = await getClient().listCommentLikes({
                    comment_id: commentID,
                    limit: showVotes.limit,
                    page: showVotes.page
                })
                if (result.comment_likes) return result.comment_likes
                return [] as VoteView[]
            }
            catch {
                showVotes.fetchError = true
                return [] as VoteView[]
            }
        },

        listPostLikes: async function (postID:number):Promise<VoteView[]> {
            try {
                let result = await getClient().listPostLikes({
                    post_id: postID,
                    limit: showVotes.limit,
                    page: showVotes.page
                })
                if (result.post_likes) return result.post_likes
                return [] as VoteView[]
            }
            catch {
                showVotes.fetchError = true
                return [] as VoteView[]
            }
        },

        loadMore: async function() {
            showVotes.page++
            let nextBatch = (isCommentView(item))
                ? await showVotes.listCommentLikes(item.comment.id)
                : await showVotes.listPostLikes(item.post.id)
            
            if (nextBatch.length < 1) { 
                showVotes.page--
                showVotes.infiniteScrollState.exhausted = true
                showVotes.infiniteScrollState.loading = false
                return
            }
            
            nextBatch.forEach((vote:VoteView) => {
                const index = showVotes.votes?.findIndex((v) => v.creator.id == vote.creator.id)
                if (index< 0) showVotes.votes.push(vote)
            })
            showVotes.votes = showVotes.votes
            showVotes.infiniteScrollState.loading = false
        }
    } as ShowVoteContainer

    function handleBanUser(e:BanUserEvent) {
        for (let i=0; i < showVotes.votes.length; i++) {
            if (showVotes.votes[i].creator.id == e.detail.person_id) {
                showVotes.votes[i].creator.banned = e.detail.banned
            }
        }
        showVotes.votes = showVotes.votes
    }

    onMount(() => {
        showVotes.init()
    })
</script>

<svelte:window on:banUser={handleBanUser} />

{#if showVotes.loading}
    <div class="flex w-full">
        <span class="flex flex-col gap-4 mx-auto my-auto">
            <Spinner width={64} />
        </span>
    </div>
{/if}

{#if !showVotes.loading && showVotes.fetchError}
    <Placeholder icon={ExclamationTriangle} title="Fetch Error" description="There was an error during the fetch for this request. Please try again later." />    
{/if}

{#if showVotes.votes}
    <div bind:this={showVotes.scrollArea} class="flex flex-col overflow-y-scroll max-h-[500px] divide-y divide-slate-200 dark:divide-zinc-500 px-1 md:px-4">
        {#each showVotes.votes as vote}
            <div class="flex flex-row w-full items-center gap-2 py-2 text-base">
                
                <span class="flex w-[calc(100%-24px-0.5rem)]">
                    <UserLink bind:user={vote.creator} avatar avatarSize={24} ring />
                </span>
                
                <span class="flex ml-auto {vote.score > 0 ? 'text-sky-500' : 'text-red-500'} font-bold">
                    <Icon mini width={24} src={vote.score > 0 ? ArrowUp : ArrowDown}/>
                </span>
            </div>
        {/each}
        
        
        <div class="flex flex-col items-center pt-2 w-full">
            <InfiniteScrollDiv bind:state={showVotes.infiniteScrollState} bind:element={showVotes.scrollArea} threshold={500}
                on:loadMore={ () => showVotes.loadMore() }
            />
        </div>
    
    </div>
{/if}