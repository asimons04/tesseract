<script lang="ts">
    import type {PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import { buildYouTubeEmbedLink, imageSize } from './helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Link from '$lib/components/input/Link.svelte'
    import IFrame from './utils/IFrame.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';

    export let post: PostView
    export let displayType: PostDisplayType
    export let autoplay:boolean|undefined = undefined;
    export let postContainer: HTMLDivElement

    
    let embedURL:   URL | null | undefined
    let inViewport = false
    let size: string = imageSize(displayType);
    let clickToPlayClicked = false

    $: if (post?.post?.url) embedURL = buildYouTubeEmbedLink(post.post.url, displayType, autoplay)

    $:  showAsEmbed = embedURL && (
            (clickToPlayClicked && inViewport) ||
            (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
            (displayType == 'post' && $userSettings.embeddedMedia.post)
        )

    $: if (!inViewport) clickToPlayClicked = false
</script>


<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed && embedURL}
    <span class="flex flex-row flex-wrap w-full gap-2 px-1">
        <ArchiveLinkSelector url={post.post?.url} postType='youtube' />    

        <Link domainOnly={!$userSettings.uiState.showFullURL} newtab={$userSettings.openInNewTab.links} highlight nowrap 
            bind:href={post.post.url}
        />
        
    </span>
    
    <IFrame bind:embedURL bind:size bind:title={post.post.name} />
    

<!---IF embeds disabled, show as an image with link + alternate source selector menu--->
{:else if post.post.thumbnail_url}
    <span class="flex flex-row flex-wrap w-full gap-2 px-1">
        <ArchiveLinkSelector url={post.post?.url} postType='youtube'/>    
        
        <Link highlight nowrap 
            domainOnly={!$userSettings.uiState.showFullURL} 
            newtab={$userSettings.openInNewTab.links} 
            bind:href={post.post.url}
        />
    </span>
    <PostImage bind:post displayType={displayType} clickToPlay={true} zoomable={false} on:click={(e)=> {
            e.preventDefault()
            e.stopPropagation()
            clickToPlayClicked = true
        }}
    />

<!---If embeds disabled and no thumbnail image is available, show as a bare link--->
{:else if !post.post.thumbnail_url}
    <span class="flex flex-row flex-wrap w-full gap-2 px-1">
        <ArchiveLinkSelector url={post.post?.url} postType='youtube'/>    
        <Link title={post.post.name} highlight nowrap bind:href={post.post.url} />
    </span>
{/if}