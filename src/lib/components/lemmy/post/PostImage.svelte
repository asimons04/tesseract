<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { getInstance } from '$lib/lemmy.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings } from '$lib/settings.js'

    import NSFWOverlay from './utils/NSFWOverlay.svelte'
    import ZoomableImage from '$lib/components/ui/ZoomableImage.svelte'

    export let post:PostView 
    export let displayType: PostDisplayType
    export let zoomable:boolean = true

    $: url           = post.post.url as string
    $: thumbnail_url = post.post.thumbnail_url as string ?? post.post.url as string
    $: name          = post.post.name
    
    let instance     = getInstance()
    let id           = post.post.id ?? undefined

    // Hack to get Imgur gifs to render without having to click through to the site.
    $: if (!url?.endsWith('.gif') && post.post.embed_video_url && post.post.embed_video_url.endsWith('.gif')) {
        url = post.post.embed_video_url
    }

    // Hack to get GIFs to play in the feed.  Lemmy converts them to weird webm at best.
    $: if (displayType == 'feed' && url?.endsWith('.gif')) {
        thumbnail_url = url;
    }

    
</script>



{#if displayType == 'feed'}
<a href="/post/{instance}/{id}"
    data-sveltekit-preload-data="off"
    aria-label={name}
    title={name}
>
    <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
        <div class="ml-auto mr-auto {$userSettings.imageSize.feed ?? 'max-w-3xl'}"> 
            <picture class="rounded-md overflow-hidden w-full max-h-[min(50vh,500px)]  max-w-full"> 
                <source srcset="{imageProxyURL(thumbnail_url, 768, 'webp') ?? imageProxyURL(url, 768, 'webp')}"
                    media="(max-width: 768px)"
                />

                <source
                    srcset="{imageProxyURL(thumbnail_url, undefined, 'webp') ?? imageProxyURL(url, undefined, 'webp')}"
                    media="(max-width: 1024px)"
                />
                
                <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />
                
                <ZoomableImage url={thumbnail_url ?? url} limitHeight={true} bind:nsfw={post.post.nsfw} altText={name} zoomable={false}
                    class="ml-auto mr-auto object-cover rounded-md max-h-[min(80vh,800px)] z-20"
                />

            </picture>
        </div>
    </div>
</a>

{/if}

{#if displayType =='post'}
<div
    class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1"
    data-sveltekit-preload-data="off"
    aria-label={name}
>
    <div class="ml-auto mr-auto {$userSettings.imageSize.post ?? 'max-w-3xl'}">
        <picture class="rounded-md overflow-hidden  max-w-full"> 
            <ZoomableImage url={thumbnail_url ?? url} limitHeight={false} bind:nsfw={post.post.nsfw} altText={name} {zoomable}
                class="ml-auto mr-auto object-contain rounded-md h-auto xl:min-h-[500px] z-30"
            />
        </picture>
    </div>
</div>

{/if}

