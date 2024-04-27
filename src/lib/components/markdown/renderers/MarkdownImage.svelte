<script lang="ts">
    import type { Tokens } from 'marked'
    
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

    export let token: Tokens.Image

    let inViewport = false
    let container:HTMLDivElement

    //$: src = imageProxyURL(token.href)
    $: loop = $userSettings.embeddedMedia.loop
</script>

<PostIsInViewport bind:postContainer={container} bind:inViewport />

{#if $userSettings.inlineImages}

<div bind:this={container} class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-2xl w-fit lg:max-w-[75%] p-2">
    <div class="ml-auto mr-auto max-w-full">
        
        <!---Show Text as a Title--->
        {#if token.title && $userSettings.uiState.showAltText}
            <p class="font-bold text-center text-sm">{fixLemmyEncodings(token.title)}</p>
        {/if}
        
               
        <!--- Audio--->
        {#if isAudio(token.href) && inViewport}
            <audio controls preload="auto">
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
        {:else if isVideo(token.href) && inViewport}
            <!-- svelte-ignore a11y-media-has-caption -->
            <video class="rounded-xl max-w-full max-h-[65vh] max-w-[88vw] mx-auto" controls playsinline {loop}>
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
            <img src={imageProxyURL(token.href)} title={token.title} alt={token.text} loading="lazy" class="mx-auto rounded-xl" />
        {/if}

        <!---Show Alt Text as Caption--->
        {#if token.text && $userSettings.uiState.showAltText}
            <!---<p class="pt-2 text-xs">{fixLemmyEncodings(token.text)}</p>--->
            <p class="background-blur-3xl bg-white/50 dark:bg-black/50 rounded-xl p-2 mt-2 text-xs text-center">{fixLemmyEncodings(token.text)}</p>
        {/if}
    </div>
</div>

{:else}
    <Link highlight href={token.href} title={token.title} text={token.text} newtab={$userSettings.openInNewTab.links}/>
{/if}
  