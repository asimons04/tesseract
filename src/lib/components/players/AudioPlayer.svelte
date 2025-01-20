<script lang="ts">
    import { userSettings } from '$lib/settings'

    import ImageContainer from '$lib/components/lemmy/post/components/ImageContainer.svelte'

    let placeholderIcon                 = '/img/audio-wave.gif'
    let audio: HTMLAudioElement
    
    export let url: string
    export let thumbnail_url: string| undefined
    export let loop: boolean            = $userSettings.embeddedMedia.loop
    export let autoplay: boolean        = false
    export let volume: number           = $userSettings.embeddedMedia.volume
    export let inViewport: boolean      = false

    $:  if (!inViewport && audio) audio.pause()
    
    function saveVolume(e:Event) {
        if (audio) $userSettings.embeddedMedia.volume = audio.volume
    }
    function setVolume(e:Event) {
        if (audio) audio.volume = volume
    }
</script>

<ImageContainer image_url={thumbnail_url ?? placeholderIcon} blur={thumbnail_url ? true : false} class="{thumbnail_url ? '' : 'blur-sm'}">
    <div class="flex relative z-10 min-h-[200px] w-full">
        <audio bind:this={audio} class="rounded-2xl my-auto mx-auto" 
            controls playsinline  {autoplay}  {loop}
            on:loadstart={setVolume}
            on:volumechange={saveVolume}
        >
            <source src={url} />
        </audio>
    </div>
</ImageContainer>