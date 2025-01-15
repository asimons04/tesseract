<script lang="ts">
    import type { PostDisplayType } from "../helpers"

    import { getMIMEType } from "../helpers"
    import { userSettings } from "$lib/settings"
    
    import NSFWOverlay from "./NSFWOverlay.svelte"
    import VideoContainer from "./VideoContainer.svelte"

    export let source: string
    export let alt_text: string = ''
    export let displayType: PostDisplayType
    export let inViewport: boolean = false
    export let nsfw: boolean = false
    export let muted: boolean = false
    export let loop: boolean = $userSettings.embeddedMedia.loop
    export let autoplay: boolean = false

    let video: HTMLVideoElement | undefined = undefined
    
    $:  if (!inViewport) {
            if (video) video.pause() 
        }

    
</script>

<VideoContainer>
    <NSFWOverlay bind:nsfw {displayType} />
    
    <video bind:this={video} class="rounded-2xl w-full {displayType=='feed' ? 'max-h-[60vh]' : 'max-h-[65vh]'} mx-auto" 
        class:blur-2xl={(nsfw && displayType=='feed')}    
        controls playsinline {muted} {autoplay}  {loop}
        aria-label={alt_text}
        >
        <source src="{source}" type={getMIMEType(source)} />
    </video>
</VideoContainer>