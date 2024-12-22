<script lang="ts">
    import { userSettings } from '$lib/settings.js'

    import { buildVimeoEmbedLink} from './helpers.js'
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte'
    import IFrame from './utils/IFrame.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import PostEmbedDescription from './PostEmbedDescription.svelte';
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    
    
    export let post: PostView
    export let displayType: PostDisplayType
    export let autoplay:boolean|undefined = undefined;
    export let inViewport = false

    let embedURL:   URL | null | undefined
    let clickToPlayClicked = false

    $: if (post?.post?.url) embedURL = buildVimeoEmbedLink(post.post.url, displayType, autoplay)

    $: showAsEmbed = embedURL && embedURL.pathname != '/' &&
            (clickToPlayClicked && inViewport) || (
                (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
                (displayType == 'post' && $userSettings.embeddedMedia.post)
            )

    // Unset click to play when out of viewport (revert to thumbnail)
    $:  if (!inViewport) clickToPlayClicked = false
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
            <ArchiveLinkSelector url={post.post?.url} postType='vimeo' />    
            <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
        </span>
    </PostEmbedDescription>
    
    <IFrame bind:embedURL bind:title={post.post.name} />

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
            <ArchiveLinkSelector url={post.post?.url} postType='vimeo' />    
            <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
        </span>    
    </PostEmbedDescription>

    <PostImage bind:post={post} displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> {clickToPlayClicked = true }}/>

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
            <ArchiveLinkSelector url={post.post?.url} postType='vimeo' />    
            <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
        </span>
    </PostEmbedDescription>
{/if}