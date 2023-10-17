<script lang="ts">
    import type { PostType, PostDisplayType } from '$lib/components/lemmy/post/helpers.js'
    import type { PostView, CommunityView} from 'lemmy-js-client'

    import { afterNavigate, beforeNavigate, goto } from '$app/navigation'
    import { getClient } from '$lib/lemmy.js'
    import { setSessionStorage } from '$lib/session.js'
    import { instance } from '$lib/instance.js'
    import { isImage, postType } from '$lib/components/lemmy/post/helpers.js'
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { removeToast, toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte'
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    
    // Post Components
    import CommentSection from '$lib/components/lemmy/post/CommentSection.svelte'
    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'

    import { 
        ArrowSmallLeft,
        ChevronDoubleUp,
        ChevronDoubleDown,
        Icon 
    } from 'svelte-hero-icons'
    
    export let data

    let post:PostView;
    let community:CommunityView
    
    
    // Add the crossposts to the post_view object for use in the PostCardStyle component since we're passing post_view to it.
    $: {
        post = data.post;
        post.post_view.cross_posts = data.post.cross_posts;
        community = data.post.community_view.community;
        setSessionStorage('lastSeenCommunity', { id: community.id, name: `${community.name}@${new URL(community.actor_id).hostname}` })
    }
    
    
    
    onMount(async () => {
        if (!post.post_view.read && $profile?.jwt) {
            getClient().markPostAsRead({
                auth: $profile.jwt,
                read: true,
                post_id: post.post_view.post.id,
            })
        }
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
        
        <!--- Menu bar above post content --->
        <div class="flex flex-row gap-2 w-full mb-2 justify-between" class:hidden={!$userSettings.uiState.showPWAButtons}>
            
            <!--- Button to Return to Feed --->
            <Button class="font-normal w-full" title="Go back to feed"
                on:click={() => {
                    history.back();
                }}
                hidden={history.length<2}
            >
                <Icon src={ArrowSmallLeft} mini size="16" slot="icon" />
                <span class="hidden md:inline">Return to Feed</span>
            </Button>
            
            <!--- Button to Scroll to the Bottom --->
            <Button class="font-normal w-full" title="Scroll to Top"
                on:click={() => {
                    window.scrollTo(0,document.body.scrollHeight);
                }}
            >
                <Icon src={ChevronDoubleDown} mini size="16" slot="icon" />
                <span class="hidden md:inline">Scroll to Bottom</span>
            </Button>
            
        </div>
        
        <div class="flex flex-col gap-2 sm:gap-2 ml-auto mr-auto w-full sm:w-full md:w-[90%]">
            <!---Post--->
            <PostCardStyle post={post.post_view} displayType="post" action={true} />      

            <!--- Comments --->
            <CommentSection bind:data={data} />

            <!--- Menu bar below post/comments content --->
            <div class="flex flex-row gap-2 w-full mb-2 justify-between" class:hidden={!$userSettings.uiState.showPWAButtons}>
                <!--- Button to Return to Feed --->
                <Button class="font-normal w-full" title="Go back to feed"
                    on:click={() => {
                        history.back();
                    }}
                    hidden={history.length<2}
                >
                    <Icon src={ArrowSmallLeft} mini size="16" slot="icon" />
                    <span class="hidden md:inline">Return to Feed</span>
                </Button>

                <!--- Button to Scroll to the Top --->
                <Button class="font-normal w-full" title="Scroll to Top"
                    on:click={() => {
                        window.scrollTo(0,0);
                    }}
                >
                    <Icon src={ChevronDoubleUp} mini size="16" slot="icon" />
                    <span class="hidden md:inline">Scroll to Top</span>
                </Button>

            </div>
        </div>

    </div>
    
    <!--- Community Sidebar--->
    <div class="hidden xl:block w-auto mt-[-8px]">
        <CommunityCard community_view={data.post.community_view} moderators={post.moderators}/>
    </div>
</div>  
