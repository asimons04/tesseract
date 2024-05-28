<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import IFrame from './utils/IFrame.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import { imageSize} from './helpers.js'

    export let post: PostView
    export let displayType: PostDisplayType
    export let postContainer: HTMLDivElement
    
    let size: string = imageSize(displayType);
    let inViewport = false
    let embedURL: URL
    let clickToPlayClicked = false

    $:  showAsEmbed = embedURL && 
            (clickToPlayClicked && inViewport) || (
                (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
                (displayType == 'post' && $userSettings.embeddedMedia.post)
            )

    // Add the autoplay flag on click-to-play so you don't have to click play twice        
    $:  if (post.post.embed_video_url && !clickToPlayClicked) {
            embedURL = new URL(post.post.embed_video_url)
        }
        else if (post.post.embed_video_url && clickToPlayClicked) {
            let tempURL = new URL(post.post.embed_video_url)
            tempURL.searchParams.set('autoplay', '1')
            //tempURL.searchParams.set('muted', '1')
            embedURL = tempURL
        }
    
    function clickToPlay() {
        clickToPlayClicked = true
    }
</script>

<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed}
    <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
    <IFrame bind:embedURL bind:size bind:title={post.post.name} />

{:else if post.post.thumbnail_url}
    
    <Link href={post.post.url} title={post.post.name} newtab={$userSettings.openInNewTab.links} highlight nowrap />
    <PostImage bind:post={post} displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> {clickToPlay() }}/>
    
    

{:else if !post.post.thumbnail_url}
    <Link href={post.post.url} title={post.post.name} highlight nowrap />
{/if}