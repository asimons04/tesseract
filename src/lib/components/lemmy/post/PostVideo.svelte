<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'

    import { isVideo } from './helpers'
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings } from '$lib/settings'

    import Link from '$lib/components/input/Link.svelte'

    export let post: PostView | undefined = undefined
    export let autoplay:boolean = false;
    export let loop:boolean = false;
    export let displayType:PostDisplayType = 'feed'
    
    let source = isVideo(post.post.url) 
                    ? imageProxyURL(post.post.url)
                    : imageProxyURL(post.post.embed_video_url)
    let videoElement:HTMLVideoElement
</script>

<Link 
    href={post.post.url}
    title={post.post.url}
    newtab={$userSettings.openInNewTab.postLinks}  
    domainOnly={!$userSettings.uiState.showFullURL}
    highlight nowrap 
        
/>
<div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-md max-w-full">
    <div class="ml-auto mr-auto mt-1 mb-1 max-w-full">
        <video class="rounded-md max-w-full max-h-[85vh] max-w-[88vw] mx-auto" 
            bind:this={videoElement}
            on:loadedmetadata={()=>{ 
                
                if (displayType =='post') {
                    videoElement.muted = autoplay;
                    videoElement.autoplay = autoplay;
                }
                videoElement.loop = loop;
            }}
            controls playsinline
        >
            <source src="{source}" />
        </video>
    </div>
</div>
