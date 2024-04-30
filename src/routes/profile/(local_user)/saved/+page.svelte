<script lang="ts">
    import type { CommentView, PostView } from 'lemmy-js-client'

    import { fly } from 'svelte/transition'
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'

    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'

    import {
        PencilSquare,
    } from 'svelte-hero-icons'

    export let data

    const isComment = (item: CommentView | PostView): item is CommentView => 'comment' in item
</script>

<svelte:head>
    <title>Saved</title>
</svelte:head>

<h1 class="flex flex-row justify-between">
    <span class="font-bold text-2xl">Saved</span>
</h1>

<div class="flex flex-col-reverse xl:flex-row gap-4 max-w-full w-full h-full py-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        {#if data?.data && data.data.length > 0}
            <div class="w-full flex flex-col gap-5 ml-auto mr-auto {$userSettings.uiState.feedMargins ? 'sm:w-full md:w-[85%] lg:w-[90%] xl:w-[75%]' : ''}">
                {#each data.data as item, index}
                    <div in:fly={{ opacity: 0, y: -4, delay: index * 50 }}>
                        {#if isComment(item)}
                            <CommentItem bind:comment={item} />
                        {:else}
                            <Post post={item} />
                        {/if}
                    </div>
                {/each}
            </div>

        {:else}
            <Placeholder icon={PencilSquare} title="Nothing here." description="You haven't saved any posts."/>
        {/if}

        {#if data.page}
        <Pageination page={data.page}
            on:change={(p) => {
                data.data = [];
                searchParam($page.url, 'page', p.detail.toString())
            }}
        />
        {/if}
    </div>
</div>





