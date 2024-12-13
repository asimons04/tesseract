<script lang="ts">
    import type { PostView } from "lemmy-js-client"
    
    import { isImage, isVideo, scrollToTop, type PostDisplayType } from "../helpers"
    import { imageProxyURL } from "$lib/image-proxy"
    import { userSettings } from "$lib/settings"
    
    import { ArrowsPointingOut, Icon } from "svelte-hero-icons";

    export let post: PostView
    export let expandCompact:boolean = false
    export let postContainer: HTMLDivElement
    export let displayType: PostDisplayType = 'feed'
    export let showThumbnail: boolean = true
    export let float: boolean = false
</script>

{#if showThumbnail}
    <div class="{float ? 'float-right' : ''}  w-[128px] h-[128px] mx-auto mb-auto overflow-hidden">
        
        <!--- Expand the post in place when clicking thumbnail--->
        <button class="cursor-pointer" title="{expandCompact ? 'Collapse' : 'Expand'}" 
            on:click={() => {  
                expandCompact = !expandCompact; 
                scrollToTop(postContainer)
            }}
        >

            {#if post.post.thumbnail_url || isImage(post.post.url)}
                <img
                    src="{
                        post.post.url?.endsWith('.gif')
                            ? imageProxyURL(post.post.url)
                            : post.post.embed_video_url?.endsWith('.gif')
                                ? imageProxyURL(post.post.embed_video_url)
                                : imageProxyURL(post.post.thumbnail_url ?? post.post.url, 256, 'webp')
                    }"
                    loading="lazy"
                    alt={post.post.alt_text ?? post.post.name}
                    class="object-cover bg-slate-100 rounded-md w-[128px] h-[128px]  border border-slate-200 dark:border-zinc-700 mx-auto shadow-lg"
                    class:blur-lg={(post.post.nsfw && $userSettings.nsfwBlur)}
                />
            {:else if post.post.url && isVideo(post.post.url)}
                <video class="object-cover bg-slate-100 rounded-md w-[128px] h-[128px]  border border-slate-200 dark:border-zinc-700 mx-auto shadow-lg" 
                    class:blur-2xl={(post.post.nsfw && $userSettings.nsfwBlur && displayType=='feed')}    
                    playsinline muted={true} autoplay={false}
                    preload="metadata"
                >
                    <source src="{post.post.url}" type="{
                        new URL(post.post.url).pathname.endsWith('mp4') || new URL(post.post.url).pathname.endsWith('m4v')
                            ? 'video/mp4' 
                            : new URL(post.post.url).pathname.endsWith('webm') 
                                ? "video/webm" 
                                : new URL(post.post.url).pathname.endsWith('mov') 
                                    ? "video/mp4"
                                    : ''
                    }" />
                </video>
            {/if}
            
            <span class="flex w-fit p-1 rounded-lg relative left-[5px] bottom-[30px] text-black dark:text-white bg-slate-100/50 dark:bg-zinc-900/60">
                <Icon src={ArrowsPointingOut} width={16} mini />
            </span>
        </button>
    </div>
{/if}