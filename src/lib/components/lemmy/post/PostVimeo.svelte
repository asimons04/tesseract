<script lang="ts">
    import { userSettings } from '$lib/settings.js'

    import { buildVimeoEmbedLink, imageSize} from './helpers.js'
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import IFrame from './utils/IFrame.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    

    export let post: PostView
    export let displayType: PostDisplayType
    export let autoplay:boolean|undefined = undefined;
    export let postContainer:HTMLDivElement

    let inViewport = false
    let embedURL:   URL | null | undefined
    let size: string = imageSize(displayType);
    
    $: if (post?.post?.url) embedURL = buildVimeoEmbedLink(post.post.url, displayType, autoplay)

    $: showAsEmbed = embedURL && embedURL.pathname != '/' &&
        (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
        (displayType == 'post' && $userSettings.embeddedMedia.post)
</script>


<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed && embedURL}
    <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
    <IFrame bind:embedURL bind:size bind:title={post.post.name} />

{:else if post.post.thumbnail_url}
    
    <!---Create image post if user has media embeds enabled for posts--->    
    {#if $userSettings.embeddedMedia.post}
        <Link href={post.post.url} title={post.post.name} newtab={$userSettings.openInNewTab.links} highlight nowrap />
        <PostImage bind:post={post} displayType={displayType}/>
    
    <!---Create PostLink to external link if user does not have embeds enaled for posts--->
    {:else}
        <PostLink bind:post={post} displayType={displayType}/>
    {/if}

{:else if !post.post.thumbnail_url}
    <Link href={post.post.url} title={post.post.name} highlight nowrap />
{/if}