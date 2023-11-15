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
    let muted = autoplay
    let nsfwAcknowledge:boolean             = false

    $: showAsEmbed = (
        (displayType == 'feed' && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
        (displayType == 'post')
    )
</script>

<Link 
    href={post.post.url}
    title={post.post.url}
    newtab={$userSettings.openInNewTab.links}  
    domainOnly={!$userSettings.uiState.showFullURL}
    highlight nowrap 
        
/>
<div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-md max-w-full">
    <div class="ml-auto mr-auto mt-1 mb-1 max-w-full">
        
        {#if post.post.nsfw && $userSettings.nsfwBlur && displayType=='feed'}
            <!---Click to Remove Blur--->    
            <div class="absolute z-20 left-0 top-0 w-full h-full bg-white/75 dark:bg-black/75">  
                <div class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-lg font-bold border border-slate-500 whitespace-nowrap shadow-lg p-4 cursor-pointer"
                    on:click={(e)=> {
                        if (post.post.nsfw && !nsfwAcknowledge) {
                            e.preventDefault();
                            e.stopPropagation();
                            nsfwAcknowledge = true;
                            post.post.nsfw = false;
                        }
                    }}
                >
                    [Reveal NSFW Content]
                </div>
            </div>
        {/if}

        <video class="rounded-md max-w-full max-h-[75vh] max-w-[88vw] mx-auto" 
            class:blur-2xl={(post.post.nsfw && $userSettings.nsfwBlur && displayType=='feed')}    
            controls playsinline {muted} {autoplay}  {loop}
        >
            <source src="{source}" type="{
                new URL(source).pathname.endsWith('mp4') || new URL(source).pathname.endsWith('m4v')
                    ? 'video/mp4' 
                    : new URL(source).pathname.endsWith('webm') 
                        ? "video/webm" 
                        : new URL(source).pathname.endsWith('mov') 
                            ? "video/quicktime"
                            : ''
            }" />
        </video>
    </div>
</div>
