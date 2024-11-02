<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import { userSettings } from '$lib/settings.js'

    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';
    import IFrame from './utils/IFrame.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import PostEmbedDescription from './PostEmbedDescription.svelte';
    

    export let post: PostView
    export let displayType: PostDisplayType
    export let postContainer:HTMLDivElement

    let videoID:    string | null | undefined
    let embedURL:   URL 
    
    let inViewport = false
    let clickToPlayClicked = false
    
    
    $:  if (post.post?.url) {
            // Parse URLs to pick out video IDs to create embed URLs
            let url = new URL(post.post.url)
            
            videoID = url.pathname.includes('/video/')
                ? url.pathname.replace('/video/', '')
                : url.pathname.replace('/', '')

            // https://geo.dailymotion.com/player.html?video=x2e42ed
            embedURL = new URL("https://geo.dailymotion.com/player.html")
            embedURL.searchParams.set('video', videoID)
        }

    // The player autoplays by default with no way to disable, so always render it click-to-play
    $:  showAsEmbed = embedURL && clickToPlayClicked && inViewport

    // Unset click to play when out of viewport (revert to thumbnail)
    $:  if (!inViewport) clickToPlayClicked = false

    // Need a thumbnail for click-to-play to work
    $:  if (!post.post.thumbnail_url) post.post.thumbnail_url = '/img/transparent.png'
</script>


<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed}
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
            <ArchiveLinkSelector url={post.post?.url} postType='dailymotion'/>   
            <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
        </span>
    </PostEmbedDescription>
    
    <IFrame bind:embedURL bind:title={post.post.name} />

{:else}
    
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
            <ArchiveLinkSelector url={post.post?.url} postType='dailymotion'/>   
            <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
        </span>
    </PostEmbedDescription>
    <PostImage bind:post={post} displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> clickToPlayClicked=true}/>
{/if}