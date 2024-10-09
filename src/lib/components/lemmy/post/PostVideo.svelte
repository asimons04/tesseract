<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'

    import { isVideo } from './helpers'
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings } from '$lib/settings'

    import Link from '$lib/components/input/Link.svelte'
    import NSFWOverlay from '$lib/components/lemmy/post/utils/NSFWOverlay.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostImage from './PostImage.svelte';
    
    export let post: PostView 
    export let autoplay:boolean = false;
    export let loop:boolean = false;
    export let displayType:PostDisplayType = 'feed'
    export let postContainer: HTMLDivElement

    let clickToPlayClicked = false
    let muted = autoplay
    let inViewport = false


    $: source = post.post.url && isVideo(post.post.url) 
                ? imageProxyURL(post.post.url)
                : post.post.embed_video_url && isVideo(post.post.embed_video_url)
                    ? imageProxyURL(post.post.embed_video_url)
                    : undefined
    
    $:  showAsEmbed = (
        (clickToPlayClicked && inViewport) ||
        (   displayType == 'feed' && 
            inViewport && 
            $userSettings.embeddedMedia.feed && 
            (!post.post.nsfw || !$userSettings.nsfwBlur)
        ) ||
        (displayType == 'post' && $userSettings.embeddedMedia.post)
    )

    // If there is no thumbnail URL, use a transparent PNG that will have the play button overlaid onto it.
    $:  post.post.thumbnail_url = post.post.thumbnail_url ?? '/img/transparent.png'
    
    // Unset click to play when out of viewport (revert to thumbnail)
    $:  if (!inViewport) clickToPlayClicked = false
    
    function clickToPlay() {
        if (source) { 
            clickToPlayClicked = true
            autoplay = true
        }
    }


</script>

<PostIsInViewport bind:postContainer bind:inViewport />

<Link  href={post.post.url} title={post.post.url} newtab={$userSettings.openInNewTab.links}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  />

{#if source && showAsEmbed}
    <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-2xl max-w-full p-1">
        <div class="ml-auto mr-auto mt-1 mb-1 max-w-full">
            
            <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />
            
            <video class="rounded-2xl max-w-full max-h-[75vh] max-w-[88vw] mx-auto" 
                class:blur-2xl={(post.post.nsfw && $userSettings.nsfwBlur && displayType=='feed')}    
                controls playsinline {muted} {autoplay}  {loop}
            >
                <source src="{source}" type="{
                    new URL(source).pathname.endsWith('mp4') || new URL(source).pathname.endsWith('m4v')
                        ? 'video/mp4' 
                        : new URL(source).pathname.endsWith('webm') 
                            ? "video/webm" 
                            : new URL(source).pathname.endsWith('mov') 
                                ? "video/mp4"
                                : ''
                }" />
            </video>
        </div>
    </div>

{:else}
    <PostImage bind:post displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> {clickToPlay() }}/>
{/if}

