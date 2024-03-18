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

    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    // Post Components
    import CommentSection from '$lib/components/lemmy/post/CommentSection.svelte'
    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'


    
    export let data

    let post_view:PostView;
    let community_view:CommunityView
    let moderators: CommunityModeratorView[]
    
    // Defined here and bound to both PostCardStyle (to pass to post actions for the reply button) and CommentSection (to control visibility of the comment form)
    let showCommentForm:boolean = false;
    
    $: {
        post_view = data.post.post_view;
        // @ts-ignore Add the crossposts to the post_view object for use in the PostCardStyle component since we're passing post_view to it.
        post_view.cross_posts = data.post.cross_posts;
        community_view = data.post.community_view;
        moderators = data.post.moderators
        
    }
    
    
    
    onMount(async () => {
        setSessionStorage('lastSeenCommunity', { id: community_view.community.id, name: `${community_view.community.name}@${new URL(community_view.community.actor_id).hostname}` })
        //setSessionStorage('lastClickedPost', { postID: post_view.post.id} );
        try {
            if (!post_view.read && $profile?.jwt) {
                getClient().markPostAsRead({
                    auth: $profile.jwt,
                    read: true,
                    post_id: post_view.post.id,
                })
            }
        }
        catch {
            // Do nothing.  Just don't throw an error if fail to mark as read
        }

        window.scrollTo(0,0);
    })

    afterNavigate(async () => {

        if ($page.params.instance.toLowerCase() != $instance.toLowerCase()) {
            if (!$profile?.jwt) return
            toast({
                content: 'Do you want to open this post on your home instance?',
                action: () => {
                    if ($profile?.jwt) fetchOnHome($profile.jwt)
                },
                duration: 9999 * 1000,
            })
        }
    })

    const fetchOnHome = async (jwt: string) => {
        const id = toast({
            content: 'Attempting to fetch this post on your home instance...',
            loading: true,
        })

        try {
            const res = await getClient().resolveObject({
                auth: jwt,
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

<SubNavbar iconSize={28} back scrollButtons refreshButton toggleCommunitySidebar postActionsMenu communityActionsMenu moderationMenu bind:post={post_view}/>
<div class="flex flex-col md:flex-row gap-4 w-full py-2">
    <div class="flex flex-col gap-3 sm:gap-4 max-w-full w-full min-w-0">                    
        
        
        <div class="flex flex-col gap-2 sm:gap-2 ml-auto mr-auto w-full sm:w-full md:w-[90%]">
            <!---Post--->
            <PostCardStyle 
                bind:post={post_view} 
                bind:showCommentForm={showCommentForm}
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
