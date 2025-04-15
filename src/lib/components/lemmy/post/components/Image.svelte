<!--Image URL can be an image or a video--->

<script lang="ts">
    import type { PostDisplayType } from '../helpers'

    import { createEventDispatcher } from 'svelte'
    import { getMIMEType, isImage, isVideo } from '../helpers'
    import { userSettings }     from '$lib/settings'

    import ClickToPlayOverlay   from './ClickToPlayOverlay.svelte'
    import ImageContainer       from './ImageContainer.svelte'
    import ZoomableImage        from '$lib/components/ui/ZoomableImage.svelte'
    import NSFWOverlay          from './NSFWOverlay.svelte'
    


    export let url: string
    export let thumbnail_url: string|undefined = undefined
    export let alt_text:string      = ''
    export let clickToPlay: boolean = false
    export let loading: boolean     = false
    export let nsfw: boolean        = false
    export let zoomable: boolean    = true
    export let displayType: PostDisplayType = 'feed'

    const dispatcher = createEventDispatcher()

    $:  blur = (nsfw && displayType == 'feed' && $userSettings.nsfwBlur)
</script>

<ImageContainer image_url={thumbnail_url ?? url}>
    <NSFWOverlay bind:nsfw {displayType} />
    
    <!---Click to Play Image--->
    {#if clickToPlay}

        <!---Don't show this overlay if NSFW overlay is active--->
        {#if !blur}
            <ClickToPlayOverlay bind:show={clickToPlay} bind:loading  on:click={(e)=> dispatcher('click', e)}/>
        {/if}
        
        {#if isImage(url)}
            <ZoomableImage {thumbnail_url} {url} nsfw={blur} altText={alt_text} {zoomable} on:click={()=> dispatcher('click')}
                class="relative ml-auto mr-auto object-cover rounded-md min-h-[min(40vh,800px)] max-h-[min(50vh,800px)] z-10 {$$props.class}"
            />
        {:else if isVideo(url)}
            <video playsinline muted=true preload="metadata" aria-label={alt_text} on:click={() => dispatcher('click')}
                class="relative ml-auto mr-auto object-cover rounded-md min-h-[min(40vh,800px)] max-h-[min(50vh,800px)] z-10 {blur ? 'blur-2xl' : ''} {$$props.class}"
            >
                <source src="{url}" type={getMIMEType(url)} />
            </video>
        {/if}
    
    <!---Not a Click to Play Image--->
    {:else}
        {#if isImage(url)}
            <ZoomableImage {thumbnail_url} {url} altText={alt_text} {zoomable} nsfw={blur}
                class="relative ml-auto mr-auto object-contain rounded-md min-h-[min(40vh,800px)] {displayType=='feed' ? 'max-h-[min(50vh,800px)]' : ''} z-10 {$$props.class}"
            />

        {:else if isVideo(url)}
            <video playsinline muted=true preload="metadata" aria-label={alt_text}
                class="relative ml-auto mr-auto object-contain rounded-md min-h-[min(40vh,800px)] {displayType=='feed' ? 'max-h-[min(50vh,800px)]' : ''} z-10 
                    {blur ? 'blur-2xl' : ''} 
                    {$$props.class}
                "
            >
                <source src="{url}" type={getMIMEType(url)} />
            </video>
        {/if}
    {/if}

    <slot />
</ImageContainer>