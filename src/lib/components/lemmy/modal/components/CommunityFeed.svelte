<script lang="ts">
    import type { GetPostsResponse, PostView } from "lemmy-js-client"
    import type { InfiniteScrollStateVars } from "$lib/components/ui/infinitescroll/helpers"

    import { addMBFCResults, filterKeywords } from "../../post/helpers";
    import { getClient } from "$lib/lemmy"
    import { onMount } from "svelte";
    
    import InfiniteScrollDiv from "$lib/components/ui/infinitescroll/InfiniteScrollDiv.svelte";
    import Post from "../../post/Post.svelte";
    import Placeholder from "$lib/components/ui/Placeholder.svelte";
    import Pageination from "$lib/components/ui/Pageination.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte";
    
    import { Bars3BottomRight, PencilSquare } from "svelte-hero-icons";
    import { userSettings } from "$lib/settings";
    
    
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
    let scrollState:InfiniteScrollStateVars

    onMount(() => load())

       
    
    // Fetch the user details by person ID
    async function load():Promise<void> {
        if (!community_id && !community_name) return

        try {
            $userSettings.uiState.infiniteScroll
                ? scrollState.loading = true
                : loading = true

            let batch = await getClient().getPosts({
                limit: $userSettings.uiState.postsPerPage,
                page_cursor: page_cursor,
                sort: 'New',
                community_id: community_id,
                community_name: community_name
            })
            
            batch.posts = addMBFCResults(batch.posts)
            batch.posts = filterKeywords(batch.posts)
            
            page_cursor = batch.next_page
                        
            $userSettings.uiState.infiniteScroll
                ? scrollState.loading = false
                : loading = false
            
            if ($userSettings.uiState.infiniteScroll) {
                if (batch.posts.length < 1) scrollState.exhausted = true
                posts = {
                    next_page: batch.next_page,
                    posts: [...posts.posts, ...batch.posts]
                }
            }
            else {
                posts = batch
            }

            posts = posts
        }
        catch (err){
            console.log(err);
        }
    }

</script>

<div bind:this={scrollContainer} class="flex flex-col w-full mt-2 gap-4 overflow-x-hidden max-h-[75vh] overflow-y-scroll" >
    <!---Only use this loading spinner if infinite scroll is disabled--->
    {#if loading && !$userSettings.uiState.infiniteScroll}
        <span class="flex flex-row w-full items-center">        
            <span class="ml-auto"/>
            <Spinner width={64}/>
            <span class="mr-auto"/>
        </span>
    {/if}

    {#if posts?.posts?.length > 0 }
        
        {#each posts.posts as item, idx (item.post.id)}
            <Post bind:post={item} actions={false} inCommunity={true}/>
        {/each}
        
    <!---Only use this placeholder if infinite scroll is disabled--->
    {:else if (!loading && !$userSettings.uiState.infiniteScroll)}
        <div class="mt-2 w-full flex flex-col gap-5 mx-auto">
            <Placeholder icon={PencilSquare} title="No Posts" description="No posts were returned for this community." />
        </div>
    {/if}

    
    
    {#if $userSettings.uiState.infiniteScroll}
        <div class="flex flex-col items-center pt-2 w-full">
            <InfiniteScrollDiv bind:state={scrollState} bind:element={scrollContainer} threshold={500}
                on:loadMore={ () => {
                    load()
                }}
            />
        </div>
    {/if}
</div>

{#if !$userSettings.uiState.infiniteScroll}
    <Pageination bind:page class="px-4" on:change={(e) => {
        page = e.detail
        load()
        scrollContainer.scrollTo(0,0)
    }}/>
{/if}