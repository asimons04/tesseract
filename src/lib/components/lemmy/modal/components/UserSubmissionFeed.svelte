<script lang="ts">
    import type { CommentView, Person, PostView } from "lemmy-js-client"

    import { getClient } from "$lib/lemmy"
    import { profile } from '$lib/auth'
    import { getItemPublished, isCommentView } from "$lib/lemmy/item";
    import { onMount } from "svelte";
    

    import CommentItem from "../../comment/CommentItem.svelte";
    import Post from "../../post/Post.svelte";
    import Placeholder from "$lib/components/ui/Placeholder.svelte";
    import Pageination from "$lib/components/ui/Pageination.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte";
    
    import { PencilSquare } from "svelte-hero-icons";
    
    export let person_id: number
    export let community_id: number | undefined = undefined
    export let type: 'all' | 'posts' | 'comments' = 'all'

    let page = 1
    let loading = false
    let submissions = [] as (PostView|CommentView)[]
    
    let scrollContainer: HTMLDivElement

    onMount(() => load())

    $: type, onTypeChange()
    
    function onTypeChange() {
        submissions = submissions = []
        page = 1
        load()
    }
    // Fetch the user details by person ID
    async function load():Promise<void> {
        try {
            loading = true;

            const user = await getClient().getPersonDetails({
                limit: 10,
                page: page,
                person_id: person_id,
                sort: 'New',
                community_id: community_id
            })
            
            switch(type) {
                case 'all':
                    submissions = [...user.posts, ...user.comments]
                    break
                case 'comments':
                    submissions = [...user.comments]
                    break
                case 'posts':
                    submissions = [...user.posts]
                    break
            }
            
            submissions.sort((a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)))
            
                        
            loading = false;
        }
        catch (err){
            console.log(err);
        }
    }

</script>

<div bind:this={scrollContainer} class="flex flex-col w-full mt-2 gap-4 overflow-x-hidden overflow-y-scroll" >
    {#if loading}
        <span class="flex flex-row w-full items-center">        
            <span class="ml-auto"/>
            <Spinner width={64}/>
            <span class="mr-auto"/>
        </span>
    {:else}

        {#if submissions?.length > 0 }
            
            {#each submissions as item, idx (isCommentView(item) ? item.comment.id : item.post.id)}
                {#if item && isCommentView(item) && (type == 'all' || type == 'comments')}
                    <CommentItem bind:comment={item} actions={false}/>
                
                {:else if item && !isCommentView(item) && (type == 'all' || type == 'posts')}
                    <Post bind:post={item} actions={false}/>
                {/if}
            {/each}
            
        {:else}
            <div class="mt-2 w-full flex flex-col gap-5 mx-auto">
                <Placeholder icon={PencilSquare} title="No submissions" description="This user has not created any posts." />
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