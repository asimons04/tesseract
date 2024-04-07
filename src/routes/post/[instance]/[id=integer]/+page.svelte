<script lang="ts">
    import type { PostType, PostDisplayType } from '$lib/components/lemmy/post/helpers.js'
    import type { CommunityModeratorView, PostView, CommunityView} from 'lemmy-js-client'

    

    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
    import { getClient } from '$lib/lemmy.js'
    import {  setSessionStorage } from '$lib/session.js'
    import { instance } from '$lib/instance.js'
    import { isImage, postType } from '$lib/components/lemmy/post/helpers.js'
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { removeToast, toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    // Post Components
    import CommentSection from '$lib/components/lemmy/post/CommentSection.svelte'
    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'

    import {
        Icon, 
        ExclamationTriangle,
        Home
    } from 'svelte-hero-icons'

    
    export let data
   
    let showCommentForm:boolean = false;
    let postContainer: HTMLDivElement
    
    let post_view = data.post.post_view
    let community_view = data.post.community_view
    let moderators = data.post.moderators
    
    //@ts-ignore (Add cross posts to post_view object for sanity
    data.post.post_view.cross_posts = data.post.cross_posts;

    onMount(async () => {
        setSessionStorage('lastSeenCommunity', { id: community_view.community.id, name: `${community_view.community.name}@${new URL(community_view.community.actor_id).hostname}` })
        
        // Mark post as read when viewed
        try {
            if (!post_view.read && $profile?.jwt) {
                getClient().markPostAsRead({
                    auth: $profile.jwt,
                    read: true,
                    post_id: post_view.post.id,
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
                auth: $profile.jwt,
                q: post_view.post.ap_id,
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
    <title>{post_view.post.name}</title>
    <meta property="og:title" content={post_view.post.name} />
    <meta property="og:url" content={$page.url.toString()} />
    
    {#if isImage(post_view.post.url)}
        <meta property="og:image" content={post_view.post.url} />
    {/if}

    {#if post_view.post.body}
        <meta property="og:description" content={post_view.post.body} />
    {/if}
</svelte:head>

<SubNavbar iconSize={28} back scrollButtons refreshButton postTitle toggleCommunitySidebar bind:post={post_view} />
    


<div class="flex flex-col md:flex-row gap-4 w-full h-full">
    <div class="flex flex-col gap-3 sm:gap-4 max-w-full w-full min-w-0">                    
        
        <!--- Show a warning that this post is not on the home instance and provide button to fetch on home --->
        {#if $profile?.jwt && $page.params.instance.toLowerCase() != $instance.toLowerCase() }
            
            <div class="flex flex-col p-2 gap-4 bg-amber-500/30 text-zinc-950 dark:text-slate-100 rounded-md">
                <span class="text-sm font-normal">
                    <span class="flex flex-row gap-2 items-center">
                        <Icon src={ExclamationTriangle} mini width={28}/>
                        <p class="font-bold">You are viewing this post on a remote instance</p>
                    </span>
                    
                    <span class="flex flex-row gap-1 pl-[2.3rem]">
                        <p>
                            You are viewing this post on a remote instance, and you will not be able to interact with it.  In order to reply or vote,
                            you will need to fetch this post on your home instance.
                        </p>
                        
                        <span class="ml-auto"/>
                        
                        <Button on:click={() => { fetchOnHome() }} color="warning" class="whitespace-nowrap">
                            <span class="flex flex-col items-center">
                                <Icon src={Home} mini size="18" title="Posts" />
                                <span class="text-xs">Fetch on Home</span>
                            </span>
                        </Button>

                    </span>
                </span>
            </div>
        {/if}
        

        <div class="flex flex-col gap-2 sm:gap-2 ml-auto mr-auto w-full sm:w-full md:w-[90%]" bind:this={postContainer}>
            <!---Post--->
            <PostCardStyle 
                bind:post={post_view} 
                bind:showCommentForm={showCommentForm}
                bind:postContainer
                displayType="post" 
                actions={true} 
                moderators={moderators} 
                autoplay={$userSettings.embeddedMedia.autoplay}
                loop={$userSettings.embeddedMedia.loop}
            
            />      

            <!--- Comments --->
            <CommentSection bind:data={data} bind:showCommentForm={showCommentForm}/>
        </div>

    </div>
    
    <!--- Community Sidebar--->
    <div class="hidden xl:block w-auto">
        <CommunityCard bind:community_view={data.post.community_view} moderators={moderators}/>
    </div>
</div>  
