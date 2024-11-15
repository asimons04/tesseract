<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { postType as identifyPostType } from './helpers.js'
    import { userSettings } from '$lib/settings.js'

    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';
    import Link from '$lib/components/input/Link.svelte'
    import MBFC from '$lib/MBFC/MBFC.svelte'
    import NSFWOverlay from './utils/NSFWOverlay.svelte'
    import PostEmbedDescription from './PostEmbedDescription.svelte';
    import ZoomableImage from '$lib/components/ui/ZoomableImage.svelte';

    export let post:PostView
    export let displayType: PostDisplayType
    export let compact: boolean = false

    let postType = 'text'
    $: post, postType = identifyPostType(post)
</script>


{#if compact}
    {#if post.post.url}
        <!---Alt source selector, link, MBFC for desktop compact view--->
        <div class="flex flex-col gap-2 w-full">
            <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail
                description={$userSettings.uiState.hideCompactThumbnails && displayType=='feed' ? undefined : post.post.embed_description} 
                url={post.post.url}
                card
                thumbnail_url={post.post.thumbnail_url}
                showThumbnail={!$userSettings.uiState.hideCompactThumbnails || displayType=='post'}
            >
                <span class="flex flex-row  my-auto w-full gap-2 mb-1">
                    <ArchiveLinkSelector url={post.post?.url} {postType}/>
                    <Link class="text-xs" href={post.post?.url} newtab={$userSettings.openInNewTab.links} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
                    <MBFC post={post} rightJustify={true}/>
                </span>
            </PostEmbedDescription>
        </div>
    {/if}
            
{:else}
    {#if post.post?.url}
    
        <PostEmbedDescription bind:title={post.post.embed_title} bind:description={post.post.embed_description} card url={post.post.url}>
            <span class="flex flex-row w-full gap-2 px-1">
                <ArchiveLinkSelector url={post.post?.url} {postType} />
                <Link class="text-xs" href={post.post?.url} newtab={$userSettings.openInNewTab.links} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
                <MBFC post={post} rightJustify={true}/>
            </span>
        </PostEmbedDescription>
    {/if}


    {#if post.post?.thumbnail_url}
        {#if displayType == 'feed'}
            <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
                <div class="ml-auto mr-auto max-w-full">
                    <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />

                    <ZoomableImage url={post.post.thumbnail_url} 
                        bind:nsfw={post.post.nsfw} altText={post.post.name} zoomable={true}
                        class="ml-auto mr-auto object-cover rounded-md min-h-[min(40vh,800px)] max-h-[min(40vh,800px)] z-20"
                        
                    />
                </div>
            </div>

        {:else if displayType == 'post'}
            <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
                <div class="ml-auto mr-auto max-w-full">
                    <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />

                    <ZoomableImage url={post.post.thumbnail_url}  altText={post.post.name} 
                        class="max-w-full ml-auto mr-auto object-cover rounded-md min-h-[min(40vh,800px)]"
                    />
                </div>
            </div>
        {/if}
    {/if}

{/if}
