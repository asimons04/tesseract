<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { imageSize} from './helpers.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings } from '$lib/settings.js'

    import Link from '$lib/components/input/Link.svelte'

    export let post:PostView | undefined
    export let displayType: PostDisplayType
    
    export let url:string | undefined       = post?.post?.url ?? undefined;

    let thumbnail_url:string | undefined    = post.post.thumbnail_url ?? undefined;
    let nsfw:boolean | undefined            = post.post.nsfw ?? false;
    let title:string | undefined            = post.post.name ?? ''
    let loaded                              = false;
    let size: string                        = imageSize(displayType);
 

    // Show lower-res thumbnails in feed, full-res in posts. Convert both to webp
    if (displayType == 'feed' && thumbnail_url) {
        thumbnail_url += "?format=webp&thumbnail=768"
    }
    else if (thumbnail_url) {
        thumbnail_url += "?format=webp"
    }
</script>

{#if url}
    <Link class="mt-[-0.25rem] text-xs" href={url} newtab={$userSettings.openInNewTab.postLinks} title={url} highlight nowrap domainOnly={!$userSettings.uiState.showFullURL}/>

{/if}

{#if thumbnail_url}
    <Link
        href={url}
        newtab={$userSettings.openInNewTab.postLinks}
        title={title}
    >
        <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full">
            <div class="m-1">
                <div class="ml-auto mr-auto {size ?? 'max-w-3xl'}">
                    <img
                        src="{imageProxyURL(thumbnail_url)}"
                        loading="lazy"
                        class="max-w-full ml-auto mr-auto object-cover rounded-md  z-30 opacity-0 transition-opacity duration-300"
                        
                        class:opacity-100={loaded}
                        on:load={() => (loaded = true)}
                        class:blur-3xl={nsfw && $userSettings.nsfwBlur && displayType==='feed'}
                    />
                </div>
            </div>
            
        </div>
    </Link>
{/if}

