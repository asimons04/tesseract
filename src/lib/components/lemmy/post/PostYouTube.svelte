<script lang="ts">
    import type {PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import { buildYouTubeEmbedLink } from './helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Link from '$lib/components/input/Link.svelte'
    import IFrame from './utils/IFrame.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';
    import PostEmbedDescription from './PostEmbedDescription.svelte';

    export let post: PostView
    export let displayType: PostDisplayType
    export let autoplay:boolean|undefined = undefined;
    export let inViewport = false

    let embedURL:   URL | null | undefined
    let clickToPlayClicked = false

    
    // Determine whether the video should be an embed or a click to play
    $:  showAsEmbed = (
            (clickToPlayClicked && inViewport) ||
            (   displayType == 'feed' && 
                $userSettings.embeddedMedia.YTFrontend == 'YouTube' && 
                inViewport && 
                $userSettings.embeddedMedia.feed && 
                (!post.post.nsfw || !$userSettings.nsfwBlur)
            ) ||
            (displayType == 'post' && $userSettings.embeddedMedia.post)
        )
    
    // Build the embed URL basing it on the user's preferred YT frontend. *Attempt* to autoplay the video on click to play (some Invidious/Piped instances don't allow/support this
    $:  if (post?.post?.url && !clickToPlayClicked) {
            embedURL = buildYouTubeEmbedLink(post.post.url, displayType, autoplay)
        }
        else if (post?.post.url && clickToPlayClicked) {
            embedURL = buildYouTubeEmbedLink(post.post.url, displayType, true)
        }
    
    // Unset click to play when out of viewport (revert to thumbnail)
    $:  if (!inViewport) clickToPlayClicked = false

    // Give a generic placehodler thumbnail so click to play can work for videos that don't provide thumbanil url
    $:  if (!post?.post?.thumbnail_url) post.post.thumbnail_url = "/img/transparent.png"

    function clickToPlay() {
        if (post?.post?.url) embedURL = buildYouTubeEmbedLink(post.post.url, displayType, true)
        clickToPlayClicked = true
    }
</script>


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
            <ArchiveLinkSelector url={post.post?.url} postType='youtube' />    

            <Link domainOnly={!$userSettings.uiState.showFullURL} newtab={true} highlight nowrap 
                bind:href={post.post.url}
            />
            
        </span>
    </PostEmbedDescription>
    
    <IFrame bind:embedURL bind:title={post.post.name} />
    

<!---IF embeds disabled, show as an image with link + alternate source selector menu--->
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
            <ArchiveLinkSelector url={post.post?.url} postType='youtube'/>    
            
            <Link highlight nowrap 
                domainOnly={!$userSettings.uiState.showFullURL} 
                newtab={true} 
                bind:href={post.post.url}
            />
        </span>
    </PostEmbedDescription>

    <PostImage bind:post displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> {clickToPlay() }}/>

<!---If embeds disabled and no thumbnail image is available, show as a bare link--->
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
            <ArchiveLinkSelector url={post.post?.url} postType='youtube'/>    
            <Link title={post.post.name} highlight nowrap bind:href={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} />
        </span>
    </PostEmbedDescription>
{/if}