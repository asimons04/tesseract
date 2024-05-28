<script lang="ts">
    import { userSettings } from '$lib/settings.js'

    import { buildVimeoEmbedLink, imageSize} from './helpers.js'
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import IFrame from './utils/IFrame.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    

    export let post: PostView
    export let displayType: PostDisplayType
    export let autoplay:boolean|undefined = undefined;
    export let postContainer:HTMLDivElement

    let inViewport = false
    let embedURL:   URL | null | undefined
    let size: string = imageSize(displayType);
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


<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed && embedURL}
    <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
    <IFrame bind:embedURL bind:size bind:title={post.post.name} />

{:else if post.post.thumbnail_url}
    <Link href={post.post.url} title={post.post.name} newtab={$userSettings.openInNewTab.links} highlight nowrap />
    <PostImage bind:post={post} displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> {clickToPlayClicked = true }}/>

{:else if !post.post.thumbnail_url}
    <Link href={post.post.url} title={post.post.name} highlight nowrap />
{/if}