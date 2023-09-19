<script lang="ts">
    import type { CommentView, PostView } from 'lemmy-js-client'
    import InboxItem from '../inbox/InboxItem.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import { fly } from 'svelte/transition'
    import { userSettings } from '$lib/settings.js'

    export let data

    const isComment = (item: CommentView | PostView): item is CommentView =>
        'comment' in item
</script>

<svelte:head>
    <title>Saved</title>
</svelte:head>


<h1 class="p-2 text-2xl font-bold">Saved</h1>
<div class="flex flex-row justify-between">
    <div>
        <MultiSelect
            options={['Cards', 'Compact']}
            selected={$userSettings.showCompactPosts
                ? 'Compact'
                : 'Cards'
            }
            on:select={(e) => {
                $userSettings.showCompactPosts = !$userSettings.showCompactPosts
            }}
            headless={true}
        />
    </div>

</div>

<div class="flex flex-col gap-4 list-none p-2 sm:max-w-full md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] mx-auto">
    {#if !data.data || (data.data?.length ?? 0) == 0}
        <p class="text-center opacity-60 text-lg mx-4">
            Wow, it's quite empty in here.
        </p>
    {:else}

        {#each data.data as item, index}
            <div in:fly={{ opacity: 0, y: -4, delay: index * 50 }}>
                {#if isComment(item)}
                    <Card class="flex flex-col bg-white rounded-md p-5 flex-1">
                        <div class="flex flex-row items-center">
                            <PostMeta post={item}/>
                        </div>
                        <div class="list-none">
                            <Comment
                                postId={item.post.id}
                                node={{ children: [], comment_view: item, depth: 1 }}
                                replying={false}
                            />
                        </div>
                        <Button class="ml-auto" href="/comment/{item.comment.id}">
                            Jump
                        </Button>
                    </Card>
                {:else}
                    <Post post={item} />
                {/if}
            </div>
        {/each}
    {/if}
    
</div>
