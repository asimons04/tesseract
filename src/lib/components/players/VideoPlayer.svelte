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
    export let thumbnail:string = '/img/transparent.png'

    let video: HTMLVideoElement | undefined = undefined
    
    $:  if (!inViewport) if (video) video.pause()
</script>


<ImageContainer image_url={thumbnail}>
    <video bind:this={video} class="relative rounded-2xl z-10 w-full {displayType=='feed' ? 'max-h-[60vh]' : 'max-h-[65vh]'} mx-auto" 
        controls playsinline {muted} {autoplay}  {loop}
        aria-label={alt_text}
    >
        <source src="{source}" type={getMIMEType(source)} />
    </video>
</ImageContainer>