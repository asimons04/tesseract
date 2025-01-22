<script lang="ts">
    import { type PostDisplayType } from '$lib/components/lemmy/post/helpers'

    import IFrame   from '$lib/components/lemmy/post/utils/IFrame.svelte'
    import Image    from '$lib/components/lemmy/post/components/Image.svelte'

    export let url: string
    export let thumbnail_url: string        = '/img/loops.png'
    export let nsfw: boolean                = false
    export let displayType:PostDisplayType  = 'feed'
    export let inViewport: boolean          = true
    export let alt_text: string             = ''
    export let compact: boolean             = false

    let embedURL: URL | undefined
    let clickToPlayClicked = false
    
    // Parse URLs to pick out video IDs to create embed URLs
    let videoURL = new URL(url)
    
    let videoID = videoURL.pathname.includes('/video/')
        ? videoURL.pathname.replace('/video/', '')
        : videoURL.pathname.replace('/', '')

    // https://geo.dailymotion.com/player.html?video=x2e42ed
    embedURL = new URL("https://geo.dailymotion.com/player.html")
    embedURL.searchParams.set('video', videoID)
    
    
    // Return to thumbnail if switching back to compact view
    $:  if (compact || !inViewport) clickToPlayClicked = false

    
</script>

{#if embedURL && clickToPlayClicked}
    <IFrame {embedURL} title={alt_text} />
{:else}
    <Image url={thumbnail_url} clickToPlay {displayType} {nsfw} zoomable={false} class="min-h-[300px]"  on:click={(e)=> clickToPlayClicked = true } />
{/if}

