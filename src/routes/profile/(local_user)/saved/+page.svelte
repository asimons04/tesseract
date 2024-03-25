<script lang="ts">
    import type { CommentView, PostView } from 'lemmy-js-client'
    
    import { arrayRange, searchParam } from '$lib/util.js'
    import { goto } from '$app/navigation'
    import { fly } from 'svelte/transition'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'

    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'

    import {
        Icon,
        ArrowSmallRight,
        Bars3,
        ChartBar,
        DocumentDuplicate,
        Home,
        PencilSquare,
        QueueList,
        Window

    } from 'svelte-hero-icons'

    export let data

    const isComment = (item: CommentView | PostView): item is CommentView => 'comment' in item
</script>

<svelte:head>
    <title>Saved</title>
</svelte:head>

<!--
<SubNavbar 
    home back compactSwitch toggleMargins refreshButton toggleCommunitySidebar
    listingType={true} listingTypeOptions={['all', 'posts', 'comments']} listingTypeOptionNames={['All Saved', 'Saved Posts', 'Saved Comments']} bind:selectedListingType={data.type}
    sortMenu={true} sortOptions={['New', 'Old']} sortOptionNames={['New', 'Old']} bind:selectedSortOption={data.sort}
    pageSelection={true} bind:currentPage={data.page}
/>
-->

<div class="flex flex-col-reverse xl:flex-row gap-4 max-w-full w-full py-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        {#if data?.data && data.data.length > 0}
            <div class="w-full flex flex-col gap-5 ml-auto mr-auto {$userSettings.uiState.feedMargins ? 'sm:w-full md:w-[85%] lg:w-[90%] xl:w-[75%]' : ''}">
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
            </div>

        {:else}
            <Placeholder
                icon={PencilSquare}
                title="Nothing here."
                description="You haven't saved any posts."
            />
        {/if}

        <Pageination
            page={data.page}
            on:change={(p) => {
                data.data = [];
                searchParam($page.url, 'page', p.detail.toString())
            }}
        />
    </div>
    <!--
    {#if $profile?.user?.local_user_view}
        <div>
            <UserCard person={$profile.user.local_user_view} />
        </div>
    {/if}
    -->
</div>





