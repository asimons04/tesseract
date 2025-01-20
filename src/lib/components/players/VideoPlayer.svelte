<script lang="ts">
    import { type PostDisplayType, getMIMEType } from "$lib/components/lemmy/post/helpers"
    import { userSettings } from "$lib/settings"
    
    import ImageContainer from '$lib/components/lemmy/post/components/ImageContainer.svelte'

    export let source: string
    export let alt_text: string = ''
    export let displayType: PostDisplayType
    export let inViewport: boolean = false
    export let muted: boolean = false
    export let loop: boolean = $userSettings.embeddedMedia.loop
    export let autoplay: boolean = false
    export let volume: number = $userSettings.embeddedMedia.volume
    export let thumbnail:string = '/img/transparent.png'

    let video: HTMLVideoElement | undefined = undefined
    
    $:  if (!inViewport && video) video.pause()
    
    function saveVolume(e:Event) {
        if (video) $userSettings.embeddedMedia.volume = video.volume
    }
    function setVolume(e:Event) {
        if (video) video.volume = volume
    }
</script>


<ImageContainer image_url={thumbnail}>
    <video bind:this={video} controls playsinline {muted} {autoplay}  {loop} aria-label={alt_text}
        class="relative rounded-2xl z-10 w-full {displayType=='feed' ? 'max-h-[50vh]' : 'max-h-[65vh]'} mx-auto" 
        on:loadstart={setVolume}
        on:volumechange={saveVolume}
    >
        <source src="{source}" type={getMIMEType(source)} />
    </video>
</ImageContainer>