<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { createEventDispatcher } from 'svelte'

    import ImageContainer from './utils/ImageContainer.svelte'
    import ZoomableImage from '$lib/components/ui/ZoomableImage.svelte'
    import ClickToPlayOverlay from './utils/ClickToPlayOverlay.svelte';

    export let post:PostView 
    export let displayType: PostDisplayType
    export let zoomable:boolean = true
    export let clickToPlay:boolean = false
    export let loading: boolean = false

    let thumbnail_url:string
    let url:string
    
    let dispatcher = createEventDispatcher()
    


    // Finesse the url and thumbnail URL to accommodate GIFs (and not thumbnail webms ugh) or when the thumbnanil is a static image but the embed URL is a GIF (Imgur)
    $:  post.post.id, setup()
    
    function setup() {
        url = post.post.url as string

        // Get Imgur gifs to render without having to click through to the site.
        if (!url?.endsWith('.gif')  && post?.post?.embed_video_url?.endsWith('.gif')) {
            url = post.post.embed_video_url
        }

        // Hack to get GIFs to play in the feed.  Lemmy converts them to weird webm at best.
        if (displayType == 'feed' && url?.endsWith('.gif')) {
            thumbnail_url = url;
        }
        else {
            thumbnail_url = (post.post.thumbnail_url as string ?? post.post.url as string)
        }
    }
   
</script>

<ImageContainer>
    {#if clickToPlay}
        <ClickToPlayOverlay bind:show={clickToPlay} bind:loading  on:click={(e)=> dispatcher('click', e)}/>
        
        <ZoomableImage bind:url={thumbnail_url} bind:nsfw={post.post.nsfw} altText={post.post.alt_text ?? post.post.name} zoomable={zoomable}
            class="ml-auto mr-auto object-cover rounded-md min-h-[min(40vh,800px)] max-h-[min(50vh,800px)] z-20 {$$props.class}"
            on:click={(e)=> dispatcher('click', e)}
        />
    
    <!---Rendering in post page--->
    {:else}
        <ZoomableImage url={url} altText={post.post.alt_text ?? post.post.name} {zoomable}
            class="ml-auto mr-auto object-contain rounded-md min-h-[min(40vh,800px)] {displayType=='feed' ? 'max-h-[min(50vh,800px)]' : ''} z-30"
        />

    {/if}
</ImageContainer>




