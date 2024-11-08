<script lang="ts">
    import type { GetPostsResponse, PostView } from "lemmy-js-client"

    import { getClient } from "$lib/lemmy"
    import {  isCommentView } from "$lib/lemmy/item";
    import { onMount } from "svelte";
    

    import Post from "../../post/Post.svelte";
    import Placeholder from "$lib/components/ui/Placeholder.svelte";
    import Pageination from "$lib/components/ui/Pageination.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte";
    
    import { PencilSquare } from "svelte-hero-icons";
    import { addMBFCResults, filterKeywords } from "../../post/helpers";
    
    export let community_id: number | undefined = undefined
    export let community_name: string | undefined = undefined

    let loading = false
    let page_cursor:string | undefined  = undefined
    let page = 1
    
    let posts:GetPostsResponse = {
        next_page: undefined,
        posts: [] as PostView[]
    } as GetPostsResponse
    
    let scrollContainer: HTMLDivElement

    onMount(() => load())

       
    
    // Fetch the user details by person ID
    async function load():Promise<void> {
        if (!community_id && !community_name) return

        try {
            loading = true;

            posts = await getClient().getPosts({
                limit: 10,
                page_cursor: page_cursor,
                sort: 'New',
                community_id: community_id,
                community_name: community_name
            })
            
            posts.posts = addMBFCResults(posts.posts)
            posts.posts = filterKeywords(posts.posts)
            page_cursor = posts.next_page
                        
            loading = false;
            posts = posts
        }
        catch (err){
            console.log(err);
        }
    }

</script>

<div bind:this={scrollContainer} class="flex flex-col w-full mt-2 gap-4 overflow-x-hidden max-h-[60vh] overflow-y-scroll" >
    {#if loading}
        <span class="flex flex-row w-full items-center">        
            <span class="ml-auto"/>
            <Spinner width={64}/>
            <span class="mr-auto"/>
        </span>
    {:else}

        {#if posts?.posts?.length > 0 }
            
            {#each posts.posts as item, idx (item.post.id)}
                <Post bind:post={item} actions={false} inCommunity={true}/>
            {/each}
            
        {:else}
            <div class="mt-2 w-full flex flex-col gap-5 mx-auto">
                <Placeholder icon={PencilSquare} title="No Posts" description="No posts were returned for this community." />
            </div>
        {/if}

    {/if}
</div>

<div class="mt-4" />

<Pageination bind:page class="px-4 mb-4" on:change={(e) => {
    page = e.detail
    load()
    scrollContainer.scrollTo(0,0)
}}/>