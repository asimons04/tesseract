<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { userSettings,  } from '$lib/settings.js'
    import { imageSize} from './helpers.js'

    import Link from '$lib/components/input/Link.svelte'
    import IFrame from './utils/IFrame.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    
    export let post: PostView
    export let displayType: PostDisplayType
    export let postContainer: HTMLDivElement

    let inViewport = false
    let embedURL:   URL
    let clickToPlayClicked = false
    let size: string = imageSize(displayType);
    
    // Check for a defined embed URL and use that if available
    $:  if (post.post && post.post.embed_video_url) {
            embedURL = new URL(post.post.embed_video_url);
        }
        // If embed URL isn't provided, make our own!
        else if (post.post && post.post.url && !post.post.url.includes("/discover/")) {
            embedURL = new URL(`https://w.soundcloud.com/player/?visual=true&url=${post.post.url.replace('m.soundcloud.com', 'soundcloud.com')}`)
        }

    $:  showAsEmbed = embedURL && (clickToPlayClicked && inViewport) || (
            (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
            (displayType == 'post' && $userSettings.embeddedMedia.post)
        )
    
        // Unset click to play when out of viewport (revert to thumbnail)
    $:  if (!inViewport) clickToPlayClicked = false

</script>


<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed}
    <Link href={post.post.url} newtab={$userSettings.openInNewTab.links} title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
    <IFrame bind:embedURL bind:size bind:title={post.post.name} />

{:else if post.post.thumbnail_url}
    <Link href={post.post.url} title={post.post.name} newtab={$userSettings.openInNewTab.links} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
    <PostImage bind:post={post} displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> clickToPlayClicked = true }/>

{:else if !post.post.thumbnail_url}
    <Link href={post.post.url} title={post.post.name} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
{/if}