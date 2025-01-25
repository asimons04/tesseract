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
    import AudioPlayer from '$lib/components/players/AudioPlayer.svelte';
    import VideoPlayer from '$lib/components/players/VideoPlayer.svelte';

    export let token: Tokens.Image
    export let options: CustomMarkdownOptions

    let inViewport = false
    let container:HTMLDivElement
    let media: HTMLVideoElement | HTMLAudioElement
    let loop = $userSettings.embeddedMedia.loop

    // In Lemmy-land, the markdown "title" attribute is used to denote a custom emoji and is typically the short code for it.
    let isEmoji = isImage(token.href) && (token.title ? true : false)

    $: inViewport, pauseMedia()

    function pauseMedia() {
        if (media && !inViewport) media.pause()
    }

    function isImageURL(url:string|undefined|null): boolean {
        if (!url) return false
        try {
            // If this fails, catch will return false
            let testURL = new URL(url)
            return isImage(url)
        }
        catch { return false }
    }
    
</script>

<PostIsInViewport bind:postContainer={container} bind:inViewport />

{#if !options.custom.noImages && $userSettings.inlineImages}

    <div bind:this={container} class="overflow-hidden {isEmoji ? 'inline-flex' : 'relative bg-slate-300 dark:bg-zinc-800 m-1 rounded-2xl w-full lg:w-[60%] p-1'}">
        <div class="ml-auto mr-auto max-w-full">
            
           
                
            <!--- Audio--->
            {#if token.href && isAudio(token.href) }
                <AudioPlayer url={imageProxyURL(token.href)} alt_text={token.text} thumbnail_url={isImageURL(token.title) ? token.title?.toString() : undefined} />    
            
            <!---Direct Video--->
            {:else if token.href && isVideo(token.href)}
                <VideoPlayer source={imageProxyURL(token.href)} alt_text={token.text} displayType="post"/>    
            
            <!---Image--->
            {:else}
                {#if isEmoji}
                    <ZoomableImage url={token.href} altText={token.text} class="inline-flex {$userSettings.uiState.largeEmojis ? 'h-[48px]' : 'h-[24px]'} mx-1 mt-1"/>
                {:else}
                    <ZoomableImage url={token.href} altText={token.text} class="mx-auto rounded-xl"/>
                {/if}
            {/if}

            <!---Show Alt Text as Caption--->
            {#if !isEmoji && (isImage(token.href) || isVideo(token.href)) && token.text && $userSettings.uiState.showAltText}
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
  