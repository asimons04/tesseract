<script lang="ts">
    import type { PostType, PostDisplayType } from '$lib/components/lemmy/post/helpers.js'
    import type { PostView, CommunityView} from 'lemmy-js-client'

    

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
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'

    // Post Components
    import CommentSection from '$lib/components/lemmy/post/CommentSection.svelte'
    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'

    import {
        Icon,
        ArrowLeftCircle,
        ChevronDoubleDown,
        ChevronDoubleUp,
        Home
    } from 'svelte-hero-icons'
    
    export let data

    let post:PostView;
    let community:CommunityView
    
    // Defined here and bound to both PostCardStyle (to pass to post actions for the reply button) and CommentSection (to control visibility of the comment form)
    let showCommentForm:boolean = false;
    
    $: {
        post = data.post;
        // Add the crossposts to the post_view object for use in the PostCardStyle component since we're passing post_view to it.
        post.post_view.cross_posts = data.post.cross_posts;
        community = data.post.community_view.community;
        setSessionStorage('lastSeenCommunity', { id: community.id, name: `${community.name}@${new URL(community.actor_id).hostname}` })
        setSessionStorage('lastClickedPost', { postID: post.post_view.post.id} );
    }
    
    
    
    onMount(async () => {
        if (!post.post_view.read && $profile?.jwt) {
            getClient().markPostAsRead({
                auth: $profile.jwt,
                read: true,
                post_id: post.post_view.post.id,
            })
        }

        window.scrollTo(0,0);
    })

    afterNavigate(async () => {
        // reactivity hack
        post = data.post

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
                q: post.post_view.post.ap_id,
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
    <title>{post.post_view.post.name}</title>
    <meta property="og:title" content={post.post_view.post.name} />
    <meta property="og:url" content={$page.url.toString()} />
    {#if isImage(post.post_view.post.url)}
        <meta property="og:image" content={post.post_view.post.url} />
    {/if}

    {#if post.post_view.post.body}
        <meta property="og:description" content={post.post_view.post.body} />
    {/if}
</svelte:head>

   
<div class="flex flex-col md:flex-row gap-4 w-full py-2">
    <div class="flex flex-col gap-3 sm:gap-4 max-w-full w-full min-w-0">                    
        
        <header class="sticky top-16 w-full rounded-md bg-white/25 dark:bg-black/25 backdrop-blur-3xl z-20 mt-[-1.2rem] px-2">
            <span class="flex flex-row gap-2 items-center font-bold text-sm text-center mx-auto my-2 mr-2">
                
                <!--Home Button-->
                <span class="mt-[-6px] mr-2 cursor-pointer" title="Home"
                    on:click={() => {
                        goto('/', {invalidateAll: true});
                    }}
                >
                    <Icon src={Home} width={24} />
                </span>

                <!--Return to Feed Button-->
                <span class="mt-[-6px] mr-2 cursor-pointer" title="Return to Feed"
                    class:hidden={history.length<2}
                    on:click={() => {
                        history.back();
                    }}
                >
                    <Icon src={ArrowLeftCircle} width={24} />
                </span>
                
                <div class="mx-auto" />

                <!--Jump to Bottom-->
                <span class="mt-[-6px] mr-2 cursor-pointer" title="Scroll to Bottom"
                    on:click={() => {
                        window.scrollTo(0,document.body.scrollHeight);
                    }}
                >
                    <Icon src={ChevronDoubleDown} width={24} />
                </span>

                <!--Jump to Top-->
                <span class="mt-[-6px] mr-2 cursor-pointer" title="Scroll to Top"
                    on:click={() => {
                        window.scrollTo(0,0);
                    }}
                >
                    <Icon src={ChevronDoubleUp} width={24} />
                </span>
            
            </span>
        </header>
        
        <div class="flex flex-col gap-2 sm:gap-2 ml-auto mr-auto w-full sm:w-full md:w-[90%]">
            <!---Post--->
            <PostCardStyle post={post.post_view} displayType="post" action={true} moderators={post.moderators} bind:showCommentForm={showCommentForm}/>      

            <!--- Comments --->
            <CommentSection bind:data={data} bind:showCommentForm={showCommentForm}/>
        </div>

    </div>
    
    <!--- Community Sidebar--->
    <div class="hidden xl:block w-auto mt-[-8px]">
        <CommunityCard community_view={data.post.community_view} moderators={post.moderators}/>
    </div>
</div>  
