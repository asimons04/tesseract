<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';

    import { goto } from '$app/navigation'
    import { getClient } from '$lib/lemmy.js'
    import { instance } from '$lib/instance.js'
    import { isImage, postType as getPostType, removeURLParams } from '$lib/components/lemmy/post/helpers.js'
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { removeToast, toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte';
    import CommentSection from '$lib/components/lemmy/post/CommentSection.svelte'
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    import {
        Icon, 
        ArrowTopRightOnSquare,
        ExclamationTriangle,
        Home,
        ExclamationCircle,
    } from 'svelte-hero-icons'
    

    
    export let data
    
    let showCommentForm:boolean = false;
    let imageUploads = [] as UploadImageResponse[]
    
    let expandCompact: boolean = false
    
    $:  onHomeInstance = $page.params.instance.toLowerCase() == $instance.toLowerCase()
    $:  jumpTo = Number($page.url.searchParams.get('thread')?.split('.').pop() ??  "-1")

    //@ts-ignore (Add cross posts to post_view object for sanity)
    $: if (data?.post) data.post.post_view.cross_posts = data.post.cross_posts ?? []

    onMount(async () => {
        if (!data?.post) return
        expandCompact = !(['link', 'thumbLink'].includes(getPostType(data.post.post_view))) ?? false

        // Scroll to top unless jumping to a comment
        if (!$page.url.searchParams.get('thread')) window.scrollTo(0,0);
    })
    

    
    const fetchOnHome = async () => {
        if (!$profile?.jwt || !data.post) return
        const id = toast({
            content: 'Attempting to fetch this post on your home instance...',
            loading: true,
            title: "Please wait..."
        })

        try {
            const res = await getClient().resolveObject({
                q: data.post.post_view.post.ap_id,
            })

            if (res.post) {
                removeToast(id)
                goto(`/post/${$instance}/${res.post.post.id}`, {})
                .then(() => removeToast(id))
            }
        } catch (err) {
            removeToast(id)
        }
    }

    

</script>


<svelte:head>
    {#if data?.post}
        <title>{data.post.post_view.post.name}</title>
        <meta property="og:title" content={data.post.post_view.post.name} />
        <meta property="og:url" content={$page.url.toString()} />
        
        {#if isImage(data.post.post_view.post.url)}
            <meta property="og:image" content={data.post.post_view.post.url} />
        {/if}

        {#if data.post.post_view.post.body}
            <meta property="og:description" content={data.post.post_view.post.body} />
        {/if}
    {:else}
        <title>Unable to Fetch Post</title>
    {/if}
</svelte:head>


{#if data?.post}
    <SubNavbar home back scrollButtons refreshButton postTitle quickSettings toggleCommunitySidebar bind:post={data.post.post_view} 
        refreshPreventDefault on:navRefresh={() => goto(removeURLParams($page.url.toString()), {invalidateAll: true}) }
    />

    <MainContentArea>                   
            
        <!--- Show a warning that this post is not on the home instance and provide button to fetch on home --->
        {#if $profile?.jwt && !onHomeInstance}
            

            <Card  class="py-2 px-4 text-sm flex flex-col flex-wrap gap-2 my-2">
                
                <div class="flex flex-row gap-2 items-center w-full">
                    <span class="items-center">
                        <Icon src={ExclamationTriangle} mini width={22}/>
                    </span>
                    <p class="text-sm">
                        You are viewing this post on a remote instance.  In order to reply or vote,
                        you will need to fetch this post on your home instance.
                    </p>
                </div>

                <div class="flex flex-row flex-wrap gap-2 items-center mx-auto">
                    
                    <Button color="info" size="sm" icon={Home} iconSize={16} on:click={() => { fetchOnHome() }}>
                        <span class="text-xs">Fetch on {$instance}</span>
                    </Button>

                    <Button color="info" size="sm" icon={ArrowTopRightOnSquare} iconSize={16} on:click={() => { 
                            window.open(data.post.post_view.post.ap_id)
                        }}
                    >
                        <span class="text-xs">View on {new URL(data.post.post_view.post.ap_id).hostname}</span>
                    </Button>
                </div>
            </Card>
        {/if}
        

        <div class="flex flex-col gap-2 mx-auto w-full h-full md:w-[90%]">
            <Post 
                post={data.post.post_view} 
                displayType="post" 
                actions={true} 
                {expandCompact}
                {onHomeInstance}
                on:reply={() => {
                    showCommentForm = !showCommentForm
                    
                    if (!showCommentForm) return
                    // Focus the comment form
                    setTimeout(() => {
                        let commentForm = document.getElementById(`commentForm-${data.post.post_view.post.id}`);
                        commentForm?.focus()
                    }, 250);
                }}
            />      

            <CommentSection data={data} bind:showCommentForm bind:imageUploads {onHomeInstance} {jumpTo}/>
        </div>

        <CommunityCard bind:community_view={data.post.community_view} moderators={data.post.moderators} slot="right-panel" class="hidden 2xl:flex"/>

    </MainContentArea>

{:else}
    <MainContentArea>
        <Placeholder title="Unable to Fetch Post" icon={ExclamationCircle}  
            description={
                $page.params.instance.toLowerCase() != $instance.toLowerCase()
                    ? 'There was an error fetching this post from its home instance via the API.'
                    : 'Unable to load this post.  It may have been deleted by its creator or removed by a moderator.'
            }
        >
            
            {#if $page.params.instance.toLowerCase() != $instance.toLowerCase()}
                <Button color="info" size="lg" icon={Home} iconSize={22} class="mt-4"
                    on:click={() => {
                        window.location.href = `https://${$page.params.instance}/post/${$page.params.id}`;
                    }}
                >
                    Go to Post at {$page.params.instance}
                </Button>
            {/if}
        </Placeholder>
    </MainContentArea>
{/if}
