<script lang="ts">
    import type { PostType, PostDisplayType } from '$lib/components/lemmy/post/helpers.js'
    
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
    import Card from '$lib/components/ui/Card.svelte'
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    
    // Post Components
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import CommentSection from '$lib/components/lemmy/post/CommentSection.svelte'
    
    import { 
        ArrowSmallLeft,
        ChevronDoubleUp,
        ChevronDoubleDown,
        ExclamationTriangle, 
        Icon 
    } from 'svelte-hero-icons'
    
    export let data
    let post = data.post;
    let community = data.post.community_view.community;
    
    let pType:PostType = postType(post.post_view)
    let pDisplayType:PostDisplayType = "post"
    
    
    setSessionStorage('lastSeenCommunity', { id: community.id, name: `${community.name}@${new URL(community.actor_id).hostname}` })
    
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

   
<div class="flex flex-col md:flex-row gap-4 w-full px-2 py-2">
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
        
        <!--- Post and Comments-->
        <div class="flex flex-col gap-2 sm:gap-2 
            w-full sm:w-full md:w-[85%]
            ml-auto mr-auto
        ">
            {#if $page.params.instance.toLowerCase() != $instance.toLowerCase()}
                <Card cardColor="warning" class="p-4 flex flex-col gap-1">
                    <Icon
                        src={ExclamationTriangle}
                        width={24}
                        solid
                        class="text-yellow-500"
                    />
                    <h1 class="font-bold">Warning</h1>
                    <p class="text-sm">
                        This URL is for a different instance than you're logged into. You
                        probably won't be able to vote or comment.
                    </p>
                </Card>
            {/if}

            <PostMeta post={post.post_view} moderators={post.moderators} displayType={pDisplayType}/>
            
            {#if pType == "link" || pType == "thumbLink"}
                {#await import('$lib/components/lemmy/post/PostLink.svelte') then { default: PostLink }}    
                    <PostLink post={post.post_view} displayType={pDisplayType} />
                {/await}
            {/if}
            
            {#if pType == "image"}
                {#await import('$lib/components/lemmy/post/PostImage.svelte') then { default: PostImage }}
                    <PostImage post={post.post_view} displayType={pDisplayType} />
                {/await}
            {/if}

            {#if pType == "video"}
                {#await import('$lib/components/lemmy/post/PostVideo.svelte') then { default: PostVideo }}
                    <PostVideo post = {post.post_view} />
                {/await}
            {/if}
        
            {#if pType == "youtube"}
                {#await import('$lib/components/lemmy/post/PostYouTube.svelte') then { default: PostYouTube }}
                    <PostYouTube post = {post.post_view} displayType={pDisplayType} />
                {/await}
            {/if}

            {#if pType == "spotify"}
                {#await import('$lib/components/lemmy/post/PostSpotify.svelte') then { default: PostSpotify }}
                    <PostSpotify post = {post.post_view} displayType={pDisplayType} />
                {/await}
            {/if}

            <!--- Bandcamp Embed --->
            {#if pType == "bandcamp"}
                {#await import('$lib/components/lemmy/post/PostBandcamp.svelte') then {default: PostBandcamp }}
                    <PostBandcamp post = {post.post_view} displayType={pDisplayType} />
                {/await}
            {/if}

            {#if pType == "soundcloud"}
                {#await import('$lib/components/lemmy/post/PostSoundCloud.svelte') then { default: PostSoundCloud }}
                    <PostSoundCloud post = {post.post_view} displayType={pDisplayType} />
                {/await}
            {/if}

            <!--- Vimeo Embed --->
            {#if pType == "vimeo"}
                {#await import('$lib/components/lemmy/post/PostVimeo.svelte') then { default: PostVimeo }}
                    <PostVimeo post={post.post_view} displayType={pDisplayType} />
                {/await}
            {/if}

            <!--- Odysee Embed --->
            {#if pType == "odysee"}
                {#await import('$lib/components/lemmy/post/PostOdysee.svelte') then { default: PostOdysee }}
                    <PostOdysee post={post.post_view} displayType={pDisplayType} />
                {/await}
            {/if}

            <!--- SongLink Embed --->
            {#if pType == "songlink"}
                {#await import('$lib/components/lemmy/post/PostSongLink.svelte') then { default: PostSongLink }}
                    <PostSongLink post={post.post_view} displayType={pDisplayType} />
                {/await}
            {/if}

            <!--- Post Body --->
            <PostBody post={post.post_view}>
                
                <!--- Post Action Buttons --->
                <PostActions bind:post={post.post_view} postType={pType} displayType={pDisplayType}
                    on:edit={() =>
                        toast({
                            content: 'The post was edited successfully.',
                            type: 'success',
                    })}
                />
                
            </PostBody>
            
            <!--- Crosspost Bar --->
            <Crossposts post={post} size="sm"/>
            
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
