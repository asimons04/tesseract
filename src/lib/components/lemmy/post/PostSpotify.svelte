<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import Link from '$lib/components/input/Link.svelte'
    import PostEmbedDescription from './PostEmbedDescription.svelte';
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';
    

    export let post: PostView
    export let displayType: PostDisplayType
    export let inViewport = false
    
    let trackID:    string = ""
    let embedURL:   string | undefined = undefined
    let extraParams:string = ""
    
    let clickToPlayClicked = false
    

    // Generate the embed URL for the given post URL
    $:  if (post?.post?.url) {
            // e.g. https://open.spotify.com/embed/track/2RUs0cO0KpvuZJ0J4hqFFC
            if (post.post.url.startsWith('https://open.spotify.com/embed')) {
                embedURL = post.post.url;
            }

            if (post.post.url.startsWith('https://open.spotify.com/track')) {
                trackID = new URL(post.post.url).pathname.replace('/track/','');
                embedURL = `https://open.spotify.com/embed/track/${trackID}?theme=0&height=100%`
            }

            if (post.post.url.startsWith('https://open.spotify.com/playlist')) {
                trackID = new URL(post.post.url).pathname.replace('/playlist/','');
                embedURL = `https://open.spotify.com/embed/playlist/${trackID}?theme=0&height=100%`
            }

            if (post.post.url.startsWith('https://open.spotify.com/album')) {
                trackID = new URL(post.post.url).pathname.replace('/album/','');
                embedURL = `https://open.spotify.com/embed/album/${trackID}?theme=0&height=100%`
            }

            if (post.post.url.startsWith('https://open.spotify.com/episode')) {
                trackID = new URL(post.post.url).pathname.replace('/episode/','');
                embedURL = `https://open.spotify.com/embed/episode/${trackID}?theme=0&height=100%`
            }
        }

    $:  showAsEmbed = embedURL && (clickToPlayClicked && inViewport) || (
            (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
            (displayType == 'post' && $userSettings.embeddedMedia.post)
        )

    // Set height differently for track versus album
    $:  height = embedURL && (embedURL.includes('/track') || embedURL.includes('/episode/'))
            ? 'h-[352px]'
            : 'h-[500px]'
    
    // Unset click to play when out of viewport (revert to thumbnail)
    $:  if (!inViewport) clickToPlayClicked = false

</script>


<style>
    .flexiframe-container {
        position: relative;
        overflow: hidden;
        padding-top: 56.25%;
    }

    .flexiframe {
        position: absolute;
        top: 0;
        left: 0;
        height: 491px;
        width: 100%;
        border:0;
    }
</style>



{#if showAsEmbed && embedURL}
    <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail
        description={$userSettings.uiState.hideCompactThumbnails && displayType=='feed' ? undefined : post.post.embed_description} 
        url={post.post.url}
        card={
            (
                (post.post.embed_description && !$userSettings.uiState.hideCompactThumbnails) || 
                (post.post.embed_description && displayType=='post') ||
                (post.post.thumbnail_url && !$userSettings.uiState.hideCompactThumbnails)
            ) ? true : false
        } 
    >     
        <span class="flex flex-row w-full gap-2 px-1">
            <ArchiveLinkSelector url={post.post?.url} postType='spotify' /> 
            <Link bind:href={post.post.url} newtab={$userSettings.openInNewTab.links} title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
        </span>
    </PostEmbedDescription>
    
    <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-2xl max-w-full {height}">
        <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 p-1 rounded-2xl max-w-full">
            <div class="ml-auto mr-auto w-full">
                <div class="flexiframe-container rounded-2xl max-w-screen {height} mx-auto">
                    <iframe 
                        class="flexiframe"
                        src="{embedURL}?{extraParams}" 
                        allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                        loading="lazy"
                        allowfullscreen
                        height="500"
                        title="Spotify: {post.post.name}"
                    >
                    </iframe>
                </div>
            </div>

        </div>
    </div>

{:else if post.post.thumbnail_url}
    <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail
        description={$userSettings.uiState.hideCompactThumbnails && displayType=='feed' ? undefined : post.post.embed_description} 
        url={post.post.url}
        card={
            (
                (post.post.embed_description && !$userSettings.uiState.hideCompactThumbnails) || 
                (post.post.embed_description && displayType=='post') ||
                (post.post.thumbnail_url && !$userSettings.uiState.hideCompactThumbnails)
            ) ? true : false
        } 
    > 
        <span class="flex flex-row w-full gap-2 px-1">
            <ArchiveLinkSelector url={post.post?.url} postType='spotify' />    
            
            <Link
                bind:href={post.post.url}
                domainOnly={!$userSettings.uiState.showFullURL}
                title={post.post.name}
                newtab={$userSettings.openInNewTab.links}
                highlight nowrap
            />
        </span>
    </PostEmbedDescription>
    <PostImage bind:post={post} displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> clickToPlayClicked=true}/>
    


{:else if !post.post.thumbnail_url}
    <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail
        description={$userSettings.uiState.hideCompactThumbnails && displayType=='feed' ? undefined : post.post.embed_description} 
        url={post.post.url}
        card={
            (
                (post.post.embed_description && !$userSettings.uiState.hideCompactThumbnails) || 
                (post.post.embed_description && displayType=='post') ||
                (post.post.thumbnail_url && !$userSettings.uiState.hideCompactThumbnails)
            ) ? true : false
        } 
    > 
        <span class="flex flex-row w-full gap-2 px-1">
            <ArchiveLinkSelector url={post.post?.url} postType='spotify' /> 
            <Link
                bind:href={post.post.url}
                title={post.post.name}
                highlight nowrap
            />
        </span>
    </PostEmbedDescription>
{/if}