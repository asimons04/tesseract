<script lang="ts">
    import type {PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import { buildYouTubeEmbedLink, imageSize } from './helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Link from '$lib/components/input/Link.svelte'
    import IFrame from './utils/IFrame.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';

    export let post: PostView
    export let displayType: PostDisplayType
    export let autoplay:boolean|undefined = undefined;
    export let postContainer: HTMLDivElement

    
    let embedURL:   URL | null | undefined
    let inViewport = false
    let size: string = imageSize(displayType);

    $: if (post?.post?.url) embedURL = buildYouTubeEmbedLink(post.post.url, displayType, autoplay)

    $: showAsEmbed = embedURL &&
        (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
        (displayType == 'post' && $userSettings.embeddedMedia.post)
</script>


<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed && embedURL}
    <span class="flex flex-row flex-wrap w-full gap-2 px-1">
        <ArchiveLinkSelector url={post.post?.url} postType='youtube'/>    
        
        <Link domainOnly={!$userSettings.uiState.showFullURL} newtab={$userSettings.openInNewTab.links} highlight nowrap 
            href={ embedURL
                    ? embedURL.href.replace('embed','watch').replace('www.youtube-nocookie','youtube')
                    : post.post.url
            }
        />
    </span>

    <IFrame bind:embedURL bind:size bind:title={post.post.name} />

{:else if post.post.thumbnail_url}
    <!---Create image post if user has media embeds enabled for posts but disabled in feed--->    
    {#if $userSettings.embeddedMedia.post}
        <span class="flex flex-row flex-wrap w-full gap-2 px-1">
            <ArchiveLinkSelector url={post.post?.url} postType='youtube'/>    
            
            <Link domainOnly={!$userSettings.uiState.showFullURL} newtab={$userSettings.openInNewTab.links} highlight nowrap 
                href={ embedURL
                        ? embedURL.href.replace('embed','watch').replace('www.youtube-nocookie','youtube')
                        : post.post.url
                }
            />
        </span>

        <PostImage bind:post displayType={displayType} />
    
    <!---Create PostLink to external link if user does not have embeds enaled for posts--->
    {:else}
        <PostLink bind:post displayType={displayType}/>
    {/if}

{:else if !post.post.thumbnail_url}
    <Link title={post.post.name} highlight nowrap href={
            embedURL
            ? embedURL.href.replace('embed','watch').replace('www.youtube-nocookie','youtube')
            : post.post.url
        }
    />
{/if}