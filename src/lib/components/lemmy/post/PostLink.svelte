<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { getInstance } from '$lib/lemmy.js'
    import { imageSize} from './helpers.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings } from '$lib/settings.js'

    import Link from '$lib/components/input/Link.svelte'
    import NSFWOverlay from './utils/NSFWOverlay.svelte'

    export let post:PostView | undefined
    export let displayType: PostDisplayType

    let loaded                              = false;
    let size: string                        = imageSize(displayType);
 
</script>

{#if post.post?.url}
    <Link class="text-xs" href={post.post?.url} newtab={$userSettings.openInNewTab.links} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
{/if}


{#if post.post?.thumbnail_url}
    <!--href={post.post?.url || undefined}-->
    <a 
        href={displayType == 'feed' ? `/post/${getInstance()}/${post.post.id}` : `${post.post.url}`}
        target={
            (displayType== 'feed' && $userSettings.openInNewTab.posts) || (displayType == 'post' && $userSettings.openInNewTab.links)
                ? '_blank'
                : undefined
        }
    >
        <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full">
            <div class="m-1">
                <div class="ml-auto mr-auto {size ?? 'max-w-3xl'}">
                    <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />
                    <img
                        src="{imageProxyURL(post.post?.thumbnail_url, (displayType=='feed' ? 768 : undefined), 'webp')}"
                        class="max-w-full ml-auto mr-auto object-cover rounded-md opacity-0 transition-opacity duration-300"
                        class:opacity-100={loaded}
                        on:load={() => (loaded = true)}
                        class:blur-3xl={post.post.nsfw && $userSettings.nsfwBlur && displayType==='feed'}
                        alt="{post.post.name}"
                    />
                </div>
            </div>
            
        </div>
    </a>
{/if}

