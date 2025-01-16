<script lang="ts">
    import type { PostView } from "lemmy-js-client"
    
    import { createEventDispatcher } from "svelte"
    import { isImage, isVideo, type PostDisplayType } from "../helpers"
    import { imageProxyURL } from "$lib/image-proxy"
    import { userSettings } from "$lib/settings"
    
    import { ArrowsPointingOut, Icon } from "svelte-hero-icons";

    export let post: PostView | undefined = undefined
    export let url: string | undefined = undefined
    export let expandCompact:boolean = false
    export let displayType: PostDisplayType = 'feed'
    export let showThumbnail: boolean = true
    export let float: boolean = false
    export let alt_text: string |undefined = post?.post.alt_text
    export let nsfw: boolean = post?.post.nsfw ?? false

    let thumbnail_url: string | undefined = getThumbnailURL()
    const heightWidthClass = "w-[64px] h-[128px] sm:w-[96px] md:w-[128px]"
    const dispatcher = createEventDispatcher()

    $: post?.post.url, post?.post.thumbnail_url, post?.post.embed_video_url, url, thumbnail_url = getThumbnailURL()

    function getThumbnailURL(): string | undefined {
        if (post?.post.url?.endsWith('.gif')) return post.post.url
        if (post?.post.embed_video_url?.endsWith('.gif')) return post.post.embed_video_url
        if (post?.post.thumbnail_url) return post.post.thumbnail_url
        if (isVideo(post?.post.url)) return post!.post.url
        if (isVideo(post?.post.embed_video_url)) return post!.post.embed_video_url
        if (isImage(post?.post.url)) return post!.post.url
        if (url) return url
        return undefined
    }

    function getMIMEType(url:string) {
        if (new URL(url).pathname.endsWith('mp4') || new URL(url).pathname.endsWith('m4v') || new URL(url).pathname.endsWith('mov') ) return 'video/mp4'
        if (new URL(url).pathname.endsWith('webm') ) return 'video/webm'
        return 'video/mp4'
    }

</script>

{#if showThumbnail}
    <div class="{heightWidthClass} mx-auto mb-auto overflow-hidden" style={float ? 'float: right; margin-left: 0.5rem; margin-bottom: 0.5rem;' : ''} >
        
        <!--- Expand the post in place when clicking thumbnail--->
        <button class="cursor-pointer" title="{expandCompact ? 'Collapse' : 'Expand'}" 
            on:click={() => {  
                dispatcher('toggleCompact')
                expandCompact = !expandCompact; 
            }}
        >

            {#if thumbnail_url && isImage(thumbnail_url)}
                <img src="{
                        thumbnail_url.endsWith('.gif')
                            ? imageProxyURL(thumbnail_url)
                            : imageProxyURL(thumbnail_url, 256, 'webp')
                    }"
                    loading="lazy"
                    alt={alt_text}
                    class="object-cover bg-slate-100 rounded-md {heightWidthClass}  border border-slate-200 dark:border-zinc-700 mx-auto shadow-lg"
                    class:blur-lg={(nsfw && $userSettings.nsfwBlur)}
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