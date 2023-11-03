<script lang="ts">
    import type {
        PersonProfile,
    } from '../lib/types'
    
    import type {
        CommentReportView,
        PostReportView,
        PrivateMessageReportView,
    } from 'lemmy-js-client'

    import { fade } from 'svelte/transition'
    import { isCommentReport } from '$lib/lemmy/item.js'

    import { Icon, PencilSquare } from 'svelte-hero-icons'
    
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    export let creatorProfile:PersonProfile 
    export let display:boolean = true
    export let item:PostReportView | CommentReportView | PrivateMessageReportView
</script>


{#if display}
    <div class="w-full p-2 gap-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}} >
        {#if creatorProfile.loading}
            <span class="flex flex-row w-full items-center">        
                <span class="ml-auto"/>
                <Spinner width={64}/>
                <span class="mr-auto"/>
            </span>
        {:else}
            <h1 class="text-lg font-bold">Posts</h1>
            <p class="text-sm font-normal whitespace-normal">
                Latest 50 posts made by <UserLink user={isCommentReport(item) ? item.comment_creator : item.post_creator} />.
            </p>

            {#if creatorProfile?.posts && creatorProfile?.posts?.length > 0 }
                <div class="mt-2 w-full flex flex-col gap-5 mx-auto">
                    {#each creatorProfile.posts as item (item.counts.id)}
                        <Post post={item} collapseBadges={true} forceCompact={true}/>
                    {/each}
                </div>
            {:else}
                <div class="mt-2 w-full flex flex-col gap-5 mx-auto">
                    <Placeholder icon={PencilSquare} title="No submissions" description="This user has not created any posts." />
                </div>
            {/if}
        {/if}
    </div>`
{/if}