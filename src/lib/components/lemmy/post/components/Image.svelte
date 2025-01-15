<script lang="ts">
    import type { PostDisplayType } from '../helpers'

    import { createEventDispatcher } from 'svelte'
    import { getMIMEType, isImage, isVideo } from '../helpers'

    import ClickToPlayOverlay from './ClickToPlayOverlay.svelte';
    import ImageContainer from './ImageContainer.svelte'
    import ZoomableImage from '$lib/components/ui/ZoomableImage.svelte';
    


    export let url: string
    export let alt_text:string      = ''
    export let clickToPlay: boolean = false
    export let loading: boolean     = false
    export let nsfw: boolean        = false
    export let zoomable: boolean    = true
    export let displayType: PostDisplayType = 'feed'

    const dispatcher = createEventDispatcher()
</script>

<ImageContainer>
    
    {#if clickToPlay}
        <ClickToPlayOverlay bind:show={clickToPlay} bind:loading  on:click={(e)=> dispatcher('click', e)}/>
        
        {#if isImage(url)}
            <ZoomableImage bind:url={url} bind:nsfw={nsfw} altText={alt_text} zoomable={zoomable}
                class="ml-auto mr-auto object-cover rounded-md min-h-[min(40vh,800px)] max-h-[min(50vh,800px)] z-20 {$$props.class}"
                on:click={(e)=> dispatcher('click', e)}
            />
        {:else if isVideo(url)}
            <video class="ml-auto mr-auto object-cover rounded-md min-h-[min(40vh,800px)] max-h-[min(50vh,800px)] z-20 {$$props.class}"
                class:blur-2xl={(nsfw && displayType=='feed')}    
                playsinline muted=true preload="metadata"
                aria-label={alt_text}
            >
                <source src="{url}" type={getMIMEType(url)} />
            </video>
        {/if}
    
    <!---Rendering in post page--->
    {:else}
        {#if isImage(url)}
            <ZoomableImage url={url} altText={alt_text} {zoomable}
                class="ml-auto mr-auto object-contain rounded-md min-h-[min(40vh,800px)] {displayType=='feed' ? 'max-h-[min(50vh,800px)]' : ''} z-30"
            />

        {:else if isVideo(url)}
            <video class="ml-auto mr-auto object-contain rounded-md min-h-[min(40vh,800px)] {displayType=='feed' ? 'max-h-[min(50vh,800px)]' : ''} z-30"
                class:blur-2xl={(nsfw && displayType=='feed')}    
                playsinline muted=true preload="metadata"
                aria-label={alt_text}
            >
                <source src="{url}" type={getMIMEType(url)} />
            </video>
        {/if}
    {/if}
</ImageContainer>