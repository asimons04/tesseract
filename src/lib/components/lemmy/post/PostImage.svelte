<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { createEventDispatcher } from 'svelte'

    import ImageContainer from './utils/ImageContainer.svelte'
    import NSFWOverlay from './utils/NSFWOverlay.svelte'
    import ZoomableImage from '$lib/components/ui/ZoomableImage.svelte'
    import ClickToPlayOverlay from './utils/ClickToPlayOverlay.svelte';

    export let post:PostView 
    export let displayType: PostDisplayType
    export let zoomable:boolean = true
    export let clickToPlay:boolean = false

    let dispatcher = createEventDispatcher()

    $: url           = post.post.url as string
    $: thumbnail_url = post.post.thumbnail_url as string ?? post.post.url as string
    $: name          = post.post.name

    // Hack to get Imgur gifs to render without having to click through to the site.
    $: if (!url?.endsWith('.gif')  && post?.post?.embed_video_url?.endsWith('.gif')) {
        url = post.post.embed_video_url
    }

    // Hack to get GIFs to play in the feed.  Lemmy converts them to weird webm at best.
    $: if (displayType == 'feed' && url?.endsWith('.gif')) {
        thumbnail_url = url;
    }

    
</script>

<ImageContainer>
    {#if displayType == 'feed'}
        <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />
        
        <ClickToPlayOverlay bind:show={clickToPlay} displayType={displayType} on:click={(e)=> dispatcher('click', e)}/>
        
        <ZoomableImage url={thumbnail_url ?? url} bind:nsfw={post.post.nsfw} altText={name} zoomable={zoomable}
            class="ml-auto mr-auto object-cover rounded-md max-h-[min(80vh,800px)] z-20"
            on:click={(e)=> dispatcher('click', e)}
        />
    
    <!---Rendering in post page--->
    {:else}
        <ZoomableImage url={url} altText={name} {zoomable}
            class="ml-auto mr-auto object-contain rounded-md h-auto xl:min-h-[500px] z-30"
        />

    {/if}
</ImageContainer>




