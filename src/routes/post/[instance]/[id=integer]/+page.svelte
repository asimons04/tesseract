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
    import { setLastSeenCommunity } from '$lib/components/lemmy/community/helpers.js';
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte';
    import CommentSection from '$lib/components/lemmy/post/CommentSection.svelte'
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    import {
        Icon, 
        ArrowTopRightOnSquare,
        ExclamationTriangle,
        Home,
    } from 'svelte-hero-icons'

    
    export let data
   
    let showCommentForm:boolean = false;
    let imageUploads = [] as UploadImageResponse[]
    
    let expandCompact: boolean = !(['link', 'thumbLink'].includes(getPostType(data.post.post_view))) ?? false

    //@ts-ignore (Add cross posts to post_view object for sanity)
    $: data.post.post_view.cross_posts = data.post.cross_posts

    onMount(async () => {
        setLastSeenCommunity(data.post.community_view.community)
        
        // Mark post as read when viewed on home instance
        try {
            if (!data.post.post_view.read && $profile?.jwt && $page.params.instance == $profile?.instance) {
                getClient().markPostAsRead({
                    read: true,
                    //@ts-ignore 
                    post_id: data.post.post_view.post.id,
                })
            }
        }
        // Do nothing.  Just don't throw an error if fail to mark as read
        catch {}

        // Scroll to top unless jumping to a comment
        if (!$page.url.searchParams.get('thread')) window.scrollTo(0,0);
    })
    

    
    const fetchOnHome = async () => {
        if (!$profile?.jwt) return
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
    <title>{data.post.post_view.post.name}</title>
    <meta property="og:title" content={data.post.post_view.post.name} />
    <meta property="og:url" content={$page.url.toString()} />
    
    {#if isImage(data.post.post_view.post.url)}
        <meta property="og:image" content={data.post.post_view.post.url} />
    {/if}

    {#if data.post.post_view.post.body}
        <meta property="og:description" content={data.post.post_view.post.body} />
    {/if}
</svelte:head>

<SubNavbar back scrollButtons refreshButton postTitle quickSettings toggleCommunitySidebar bind:post={data.post.post_view} 
    refreshPreventDefault on:navRefresh={() => goto(removeURLParams($page.url.toString()), {invalidateAll: true}) }
/>

<MainContentArea>                   
        
    <!--- Show a warning that this post is not on the home instance and provide button to fetch on home --->
    {#if $profile?.jwt && $page.params.instance.toLowerCase() != $instance.toLowerCase() }
        

        <Card  class="py-2 px-4 text-sm flex flex-col flex-wrap gap-2">
            
            <div class="flex flex-row gap-2 items-center w-full">
                <span class="items-center">
                    <Icon src={ExclamationTriangle} mini width={22}/>
                </span>
                <p class="text-xs">
                    You are viewing this post on a remote instance, and you will not be able to interact with it.  In order to reply or vote,
                    you will need to fetch this post on your home instance.
                </p>
            </div>

            <div class="flex flex-row flex-wrap gap-2 items-center mx-auto">
                
                <Button color="info" size="sm" icon={Home} iconSize={16} on:click={() => { fetchOnHome() }}>
                    <span class="text-xs">Fetch on {$instance}</span>
                </Button>

                <Button color="info" size="sm" icon={ArrowTopRightOnSquare} iconSize={16} on:click={() => { 
                        $userSettings.openInNewTab.links
                            ? window.open(data.post.post_view.post.ap_id)
                            : window.location.href = data.post.post_view.post.ap_id
                    }}
                >
                    <span class="text-xs">View on {new URL(data.post.post_view.post.ap_id).hostname}</span>
                </Button>
            </div>
        </Card>
    {/if}
    

    <div class="flex flex-col gap-2 sm:gap-2 ml-auto mr-auto w-full sm:w-full md:w-[90%]">
        <Post 
            bind:post={data.post.post_view} 
            displayType="post" 
            actions={true} 
            expandCompact={expandCompact}
            on:reply={() => {
                showCommentForm = !showCommentForm
                
                if (!showCommentForm) return
                // Focus the comment form
                setTimeout(() => {
                    let commentForm = document.getElementById(`commentForm-${data.post.post_view.post.id}`);
                    commentForm?.focus()
                }, 250);
            }}
            autoplay={$userSettings.embeddedMedia.autoplay}
            
        
        />      

        <CommentSection data={data} bind:showCommentForm={showCommentForm} bind:imageUploads/>
    </div>

    <CommunityCard bind:community_view={data.post.community_view} moderators={data.post.moderators} slot="right-panel" class="hidden xl:flex"/>

</MainContentArea>
