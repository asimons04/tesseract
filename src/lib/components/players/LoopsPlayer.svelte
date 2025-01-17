<script lang="ts">
    import type { PostDisplayType } from "../lemmy/post/helpers"
    
    import Image        from '$lib/components/lemmy/post/components/Image.svelte'
    import VideoPlayer  from "./VideoPlayer.svelte"

    export let url: string
    export let thumbnail_url: string        = '/img/loops.png'
    export let nsfw: boolean                = false
    export let displayType:PostDisplayType  = 'feed'
    export let inViewport: boolean          = true
    export let alt_text: string             = ''
    export let compact: boolean             = false


    let videoURL: string
    let clickToPlayClicked  = false
    let loading             = false
    
    function clickToPlay() {
        getEmbedVideoURL(url).then((video_url) => {
            videoURL = video_url
            loading = false
            if (videoURL) clickToPlayClicked = true
            else loading = false
        })
    }

    async function getEmbedVideoURL(loops_url:string) {
        try {
            const response = await fetch(`/tesseract/api/loops/lookup?loops_url=${loops_url}`)
            const result = await response.json()
            if (result?.video_url) { return result.video_url }
        }
        catch { return undefined }
    }

    // Return to thumbnail if switching back to compact view
    $:  if (compact) clickToPlayClicked = false
</script>

{#if videoURL && clickToPlayClicked}
    <VideoPlayer source={videoURL} {displayType} {inViewport} {alt_text} autoplay/>

<!---Render as a Click-to-Play Thumbnail--->
{:else}
    <Image url={thumbnail_url} clickToPlay bind:loading {displayType} {nsfw} zoomable={false} class="min-h-[300px]" 
        on:click={(e)=> {
            loading = true
            clickToPlay() 
        }}
    />
{/if}

