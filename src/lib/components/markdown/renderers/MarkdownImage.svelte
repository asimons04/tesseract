<script lang="ts">
    import type { Tokens } from 'marked'
    
    import { imageProxyURL } from '$lib/image-proxy';
    import {
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

<div bind:this={container} class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-2xl w-fit p-2">
    <div class="ml-auto mr-auto max-w-full">
        
        <!---Show Text as a Title--->
        {#if token.title}
            <p class="font-bold text-center text-sm">{token.title}</p>
        {/if}
        
        <!---Image--->
        {#if isImage(token.href)}
            <img src={imageProxyURL(token.href)} title={token.title} alt={token.text} class="rounded-xl" />
        
        <!--- Audio--->
        {:else if isAudio(token.href) && inViewport}
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
        {/if}

        <!---Show Alt Text as Descriptioin--->
        {#if token.text}
            <p class="pt-2 text-xs">{token.text}</p>
        {/if}
    </div>
</div>

{:else}
    <Link highlight href={token.href} title={token.title} text={token.text} newtab={$userSettings.openInNewTab.links}/>
{/if}
  