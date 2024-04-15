<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'

    import { isVideo } from './helpers'
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings } from '$lib/settings'

    import Link from '$lib/components/input/Link.svelte'
    import NSFWOverlay from '$lib/components/lemmy/post/utils/NSFWOverlay.svelte'
    
    export let post: PostView 
    export let autoplay:boolean = false;
    export let loop:boolean = false;
    export let displayType:PostDisplayType = 'feed'
    export let postContainer: HTMLDivElement

    $: source = isVideo(post.post.url) 
                    ? imageProxyURL(post.post.url)
                    : imageProxyURL(post.post.embed_video_url)
    
    let muted = autoplay

    // Determine if the post is in the viewport and use that to determine whether to render it as an embed in the feed.
    // Should reduce memory consumption by a lot on video-heavy feeds.
    let inViewport = false
    const observer = new window.IntersectionObserver( ([entry]) => {
        if (entry.isIntersecting) {
            inViewport = true
            return
        }
        inViewport = false
        }, 
        { root: null, threshold: 0,}
    )
    $: if (postContainer) observer.observe(postContainer);


</script>

{#if post && source}
<Link 
    href={post.post.url}
    title={post.post.url}
    newtab={$userSettings.openInNewTab.links}  
    domainOnly={!$userSettings.uiState.showFullURL}
    highlight nowrap 
        
/>
<div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-2xl max-w-full p-1">
    <div class="ml-auto mr-auto mt-1 mb-1 max-w-full">
        
        <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />
        {#if inViewport}
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
        {/if}
    </div>
</div>
{/if}
