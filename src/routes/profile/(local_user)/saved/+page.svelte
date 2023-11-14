<script lang="ts">
    import type { CommentView, PostView } from 'lemmy-js-client'
    
    import { arrayRange, searchParam } from '$lib/util.js'
    import { goto } from '$app/navigation'
    import { fly } from 'svelte/transition'
    import { page } from '$app/stores'
    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'

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

<header class="sticky top-16 w-full backdrop-blur-3xl z-20 mt-[-0.5rem] px-2">
    <span class="flex flex-row gap-2 items-center font-bold text-sm text-center mx-auto my-2 mr-2">
            <!--Home Button-->
            <span class="mt-[-6px] mr-2 cursor-pointer" title="Frontpage"
                on:click={() => {
                    goto('/', {invalidateAll: true});
                    window.scrollTo(0,0);
                }}
            >
                <Icon src={Home} width={24} />
            </span>
            
            <!---Listing Type--->
            <SelectMenu
                alignment="bottom-left"
                options={['all', 'posts', 'comments']}
                optionNames={['All Saved', 'Saved Posts', 'Saved Comments']}
                selected={data.type}
                title="Listing Type"
                icon={Bars3}
                on:select={(e) => {
                    // @ts-ignore
                    data.data = [];
                    searchParam($page.url, 'type', e.detail, 'page')
                }}
            />
            
            <Icon src={ArrowSmallRight} mini width={24} />
            
            <!---Sort Menu--->
            <SelectMenu
                alignment="bottom-left"
                options={['New', 'Old']}
                selected={data.sort}
                title="Sort Direction"
                icon={ChartBar}
                on:select={(e) => {
                    // @ts-ignore
                    data.data = [];
                    searchParam($page.url, 'sort', e.detail, 'page')
                }}
            />
            
            <Icon src={ArrowSmallRight} mini width={24} />
            
            <!---Page Selection--->
            <SelectMenu
                alignment="bottom-left"
                options={arrayRange(1, data.page +1)}
                selected={data.page}
                title="Page"
                icon={DocumentDuplicate}
                on:select={(e) => {
                    // @ts-ignore
                    data.data = [];
                    searchParam($page.url, 'page', e.detail.toString())
                }}
            />

            <span class="ml-auto"/>
            
            <!---Card/Compact Selection--->
            <span class="mr-2 cursor-pointer" title="Switch to {$userSettings.showCompactPosts ? 'card view' : 'compact view'}."
                on:click={() => {
                    $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                    //window.scrollTo(0,0);
                }}
            >
                <Icon src={$userSettings.showCompactPosts ? Window : QueueList} width={24} />
            </span>

        </span>
</header>

<div class="w-full sm:w-full md:w-[80%] lg:w-[80%] xl:w-[80%] flex flex-col gap-5 ml-auto mr-auto">
    {#if data.data?.length > 0}
        
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





