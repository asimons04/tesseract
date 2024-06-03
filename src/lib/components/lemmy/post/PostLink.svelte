<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { getInstance } from '$lib/lemmy.js'
    import { imageSize } from './helpers.js'
    import { userSettings } from '$lib/settings.js'

    import Link from '$lib/components/input/Link.svelte'
    import NSFWOverlay from './utils/NSFWOverlay.svelte'
    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';
    import ZoomableImage from '$lib/components/ui/ZoomableImage.svelte';

    export let post:PostView
    export let displayType: PostDisplayType

    let size: string    = imageSize(displayType);
    

    
 
</script>

{#if post.post?.url}
    <span class="flex flex-row flex-wrap w-full gap-2 px-1">
        <ArchiveLinkSelector url={post.post?.url} postType='link'/>
        <Link class="text-xs" href={post.post?.url} newtab={$userSettings.openInNewTab.links} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
    </span>
{/if}


{#if post.post?.thumbnail_url}
    {#if displayType == 'feed'}
        <a href="/post/{getInstance()}/{post.post.id}" target={ (displayType== 'feed' && $userSettings.openInNewTab.posts) ? '_blank' : undefined } >
            <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
                <div class="ml-auto mr-auto {size ?? 'max-w-3xl'}">
                    <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />

                    <ZoomableImage url={post.post.thumbnail_url ?? post.post.url} 
                        bind:nsfw={post.post.nsfw} altText={post.post.name} zoomable={false}
                        class="max-w-full ml-auto mr-auto object-cover rounded-md"
                    />
                </div>
                
            </div>
        </a>
    {:else if displayType == 'post'}
        <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
            <div class="ml-auto mr-auto {size ?? 'max-w-3xl'}">
                <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />

                <ZoomableImage url={post.post.thumbnail_url ?? post.post.url}  altText={post.post.name} 
                    class="max-w-full ml-auto mr-auto object-cover rounded-md"
                />
            </div>
        </div>
    {/if}
{/if}

