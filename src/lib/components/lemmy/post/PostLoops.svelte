<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'

    import { isVideo } from './helpers.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings } from '$lib/settings'

    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import NSFWOverlay from '$lib/components/lemmy/post/utils/NSFWOverlay.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostImage from './PostImage.svelte'
    
    
    export let post: PostView 
    export let autoplay:boolean = false;
    export let loop:boolean = false;
    export let displayType:PostDisplayType = 'feed'
    export let postContainer: HTMLDivElement

    let clickToPlayClicked = false
    let muted = autoplay
    let inViewport = false
    let video: HTMLVideoElement | undefined = undefined
    let source: string | undefined = undefined
    let loading = false

    async function getEmbedVideoURL() {
        try {
            const response = await fetch(`/tesseract/api/loops/lookup?loops_url=${post.post.url}`)
            const result = await response.json()
            if (result?.video_url) return result.video_url
        }
        catch { return undefined }
    }

    $:  showAsEmbed = clickToPlayClicked && inViewport
            
        
    // Unset click to play when out of viewport (revert to thumbnail or pause)
    $:  if (!inViewport) {
            clickToPlayClicked = false
            if (video) {
                video.pause() 
                video.remove()
            }
        }
    
    async function clickToPlay() {
        getEmbedVideoURL().then((video_url) => {
            source = video_url
            loading = false
            if (source) clickToPlayClicked = true
            else loading = false
        })
    }

</script>

<PostIsInViewport bind:postContainer bind:inViewport />
<span class="flex flex-row w-full gap-2 px-1">
    <ArchiveLinkSelector url={post.post?.url} postType='video' />    
    <Link  href={post.post.url} title={post.post.url} newtab={$userSettings.openInNewTab.links}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  />
</span>


{#if source && (showAsEmbed || !post.post.thumbnail_url)}
    <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-2xl max-w-full p-1">
        <div class="ml-auto mr-auto mt-1 mb-1 max-w-full">
            
            <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />
            
            <video bind:this={video} class="rounded-2xl w-full {displayType=='feed' ? 'max-h-[60vh]' : 'max-h-[65vh]'} mx-auto" 
                class:blur-2xl={(post.post.nsfw && $userSettings.nsfwBlur && displayType=='feed')}    
                controls playsinline {muted} autoplay={true}  {loop}
                aria-label={post.post.alt_text ?? post.post.name}
            >
                <source src="{source}" type="{
                    new URL(source).pathname.endsWith('mp4') || new URL(source).pathname.endsWith('m4v')
                        ? 'video/mp4' 
                        : new URL(source).pathname.endsWith('webm') 
                            ? "video/webm" 
                            : new URL(source).pathname.endsWith('mov') 
                                ? "video/mp4"
                                : ''
                }" />
            </video>
        </div>
    </div>

{:else if post.post.thumbnail_url}
    <PostImage bind:post bind:loading {displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> {
        loading = true
        clickToPlay() 
    }}/>
{/if}

