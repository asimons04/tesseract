<script lang="ts">
    import type { Tokens } from 'marked'
    import type { CustomMarkdownOptions } from '../markdown';

    import { imageProxyURL } from '$lib/image-proxy';
    import {
        fixLemmyEncodings,
        isAudio,
        isImage,
        isVideo
    } from '$lib/components/lemmy/post/helpers'
    import { userSettings } from '$lib/settings';


    import Link from '$lib/components/input/Link.svelte';
    import PostIsInViewport from '$lib/components/lemmy/post/utils/PostIsInViewport.svelte'
    import ZoomableImage from '$lib/components/ui/ZoomableImage.svelte';

    export let token: Tokens.Image
    export let options: CustomMarkdownOptions

    let inViewport = false
    let container:HTMLDivElement
    let loop = $userSettings.embeddedMedia.loop

    let video: HTMLVideoElement
    let audio: HTMLAudioElement

    $: inViewport, pauseMedia()

    function pauseMedia() {
        if (audio && !inViewport) audio.pause()
        if (video && !inViewport) video.pause()
    }
</script>

<PostIsInViewport bind:postContainer={container} bind:inViewport />

{#if !options.custom.noImages && $userSettings.inlineImages}

    <div bind:this={container} class="overflow-hidden  relative bg-slate-300 dark:bg-zinc-800 m-1 rounded-2xl w-full lg:w-[60%] p-1">
        <div class="ml-auto mr-auto max-w-full">
            
            <!---Show Text as a Title--->
            {#if token.title && $userSettings.uiState.showAltText}
                <p class="font-bold text-center text-sm">{fixLemmyEncodings(token.title)}</p>
            {/if}
            
                
            <!--- Audio--->
            {#if isAudio(token.href) }
                <audio bind:this={audio} controls preload="auto">
                    <source src={imageProxyURL(token.href)} type="{
                        new URL(token.href).pathname.endsWith('mp3')
                            ? 'audio/mpeg'
                            : new URL(token.href).pathname.endsWith('aac')
                                ? 'audio/aac'
                                : new URL(token.href).pathname.endsWith('oga')
                                    ? 'audio/ogg'
                                    : new URL(token.href).pathname.endsWith('opus')
                                        ? 'audio/opus'
                                        : undefined

                        }
                    " 
                />
                </audio>
            
            <!---Direct Video--->
            {:else if isVideo(token.href)}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video bind:this={video} class="rounded-xl max-w-full max-h-[65vh] max-w-[88vw] mx-auto" controls playsinline {loop}>
                    <source src="{imageProxyURL(token.href)}" 
                        type="{
                            new URL(token.href).pathname.endsWith('mp4') || new URL(token.href).pathname.endsWith('m4v')
                                ? 'video/mp4' 
                                : new URL(token.href).pathname.endsWith('webm') 
                                    ? "video/webm" 
                                    : new URL(token.href).pathname.endsWith('mov') 
                                        ? "video/mp4"
                                        : ''
                        }"
                    />
                </video>    
            
            <!---Image--->
            {:else}
                <!---<img src={imageProxyURL(token.href)} title={token.title} alt={token.text} loading="lazy" class="mx-auto rounded-xl" />--->
                <ZoomableImage url={token.href} altText={token.text} class="mx-auto rounded-xl"/>
            {/if}

            <!---Show Alt Text as Caption--->
            {#if token.text && $userSettings.uiState.showAltText}
                <!---<p class="pt-2 text-xs">{fixLemmyEncodings(token.text)}</p>--->
                <p class="background-blur-3xl bg-white/50 dark:bg-black/50 rounded-xl p-2 mt-2 text-xs text-center">{fixLemmyEncodings(token.text)}</p>
            {/if}
        </div>
    </div>

{:else}
    <Link highlight preview
        href={token.href} 
        title={token.text && token.text.trim() != '' ? token.text : token.href} 
        text={token.text && token.text.trim() != '' ? token.text : token.href}  
        newtab={true} 
    />
{/if}
  