<script lang="ts">
    import type { PostView } from "lemmy-js-client"
    
    import { createEventDispatcher } from "svelte"
    import { getMIMEType, getOptimalThumbnailURL, isImage, isVideo, type PostDisplayType } from "../helpers"
    import { imageProxyURL } from "$lib/image-proxy"
    import { userSettings } from "$lib/settings"
    
    import { ArrowsPointingOut, Icon } from "svelte-hero-icons";

    export let post: PostView | undefined = undefined
    export let url: string | undefined = undefined
    export let urls: (string|undefined)[] | undefined = undefined
    export let expandCompact:boolean = false
    export let displayType: PostDisplayType = 'feed'
    export let showThumbnail: boolean = true
    export let float: boolean = false
    export let alt_text: string |undefined = post?.post.alt_text
    export let nsfw: boolean = post?.post.nsfw ?? false

    let thumbnail_url: string | undefined = getOptimalThumbnailURL({post:post, url:url, urls:urls})
    let retryCount = 1
    let img: HTMLImageElement
    let resolution = 256
    let placeholder = '/img/placeholder.png'
    const heightWidthClass = "flex flex-shrink-0 w-[64px] h-[128px] sm:w-[96px] md:w-[128px]"
    const dispatcher = createEventDispatcher()

    $: post?.post.url, post?.post.thumbnail_url, post?.post.embed_video_url, url, expandCompact, thumbnail_url = getOptimalThumbnailURL({post:post, url:url, urls:urls})

</script>

{#if showThumbnail}
    <div class="{heightWidthClass} mb-auto overflow-hidden" style={float ? 'float: right; margin-left: 0.5rem; margin-bottom: 0.5rem;' : ''} >
        
        <!--- Expand the post in place when clicking thumbnail--->
        <button class="cursor-pointer" title="{expandCompact ? 'Collapse' : 'Expand'}" 
            on:click={() => {  
                dispatcher('toggleCompact')
                expandCompact = !expandCompact; 
            }}
        >

            {#if thumbnail_url && isImage(thumbnail_url)}
                <img bind:this={img} 
                    src="{
                        thumbnail_url.endsWith('.gif')
                            ? imageProxyURL(thumbnail_url)
                            : imageProxyURL(thumbnail_url, resolution, 'webp')
                    }"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    alt={alt_text}
                    class="object-cover bg-slate-100 rounded-md {heightWidthClass}  border border-slate-200 dark:border-zinc-700 mx-auto shadow-lg"
                    class:blur-lg={(nsfw && $userSettings.nsfwBlur)}
                    on:error={() => {
                        // If the image errors, try the proxy URL without format, then without resolution, and finally fallback to either original URL or use a placeholder.
                        switch (retryCount) {
                            case 1:
                                img.src = (imageProxyURL(thumbnail_url, resolution, undefined) ?? ($userSettings.proxyMedia.fallback ? thumbnail_url ?? placeholder : '/img/placeholder.png'))
                                retryCount++
                                break
            
                            case 2:
                                img.src = imageProxyURL(thumbnail_url) ?? ($userSettings.proxyMedia.fallback ? thumbnail_url ?? placeholder : '/img/placeholder.png')
                                retryCount++
                                break
                             
                            case 3:
                                img.src = $userSettings.proxyMedia.fallback ? thumbnail_url ?? placeholder : '/img/placeholder.png'
                                retryCount++
                                break
            
                            default:
                                console.log("ZoomableImage.svelte : Max retries to fetch image failed; using placeholder")
                                img.src = '/img/placeholder.png'
                                retryCount++
                                break
            
                        }
                        
                    }}
                />
            
            {:else if thumbnail_url && isVideo(thumbnail_url)}
                <video class="object-cover bg-slate-100 rounded-md {heightWidthClass}  border border-slate-200 dark:border-zinc-700 mx-auto shadow-lg" 
                    class:blur-2xl={(nsfw && $userSettings.nsfwBlur && displayType=='feed')}    
                    playsinline muted={true} autoplay={false}
                    preload="metadata"
                >
                    <source src="{thumbnail_url}" type="{getMIMEType(thumbnail_url)}" />
                </video>
            {/if}
            
            <span class="flex w-fit p-1 rounded-lg relative left-[5px] bottom-[30px] text-black dark:text-white bg-slate-100/50 dark:bg-zinc-900/60">
                <Icon src={ArrowsPointingOut} width={16} mini />
            </span>
        </button>
    </div>
{/if}