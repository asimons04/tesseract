<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import { getInstance } from '$lib/lemmy.js'
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import Link from '$lib/components/input/Link.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import { imageSize} from './helpers.js'

    export let post: PostView
    export let displayType: PostDisplayType
    export let postContainer: HTMLDivElement
    
    let size: string = imageSize(displayType);
    
    // Determine if the post is in the viewport and use that to determine whether to render it as an embed in the feed.
    // Should reduce memory consumption by a lot on video-heavy feeds.
    let inViewport = false
    const observer = new window.IntersectionObserver( ([entry]) => {
        if (entry.isIntersecting) {
            inViewport = true
            return
        }
        inViewport = false
        }, 
        { root: null, threshold: 0,}
    )
    $: if (postContainer) observer.observe(postContainer)

    $: showAsEmbed = post.post.embed_video_url &&
        (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
        (displayType == 'post' && $userSettings.embeddedMedia.post)
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
        height: 100%;
        width: 100%;
        border:0;
    }
</style>



{#if showAsEmbed}
    <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
    <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-2xl max-w-full p-1">
        <div class="ml-auto mr-auto max-w-[88vw] {size}">
            <div class="flexiframe-container rounded-2xl max-w-screen mx-auto">
                <iframe 
                    id="video-{post.post.id}"
                    class="flexiframe"
                    src="{post.post.embed_video_url}" 
                    allow="accelerometer; autoplay; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                    loading="lazy"
                    allowfullscreen
                    title="PeerTube: {post.post.name}"
                >
                </iframe>
            </div>
        </div>
    </div>

{:else if post.post.thumbnail_url}
    
    <!---Create image post if user has media embeds enabled for posts--->    
    {#if $userSettings.embeddedMedia.post}
        <Link
            href={post.post.url}
            title={post.post.name}
            newtab={$userSettings.openInNewTab.links}
            highlight nowrap
        />
        <PostImage bind:post={post} displayType={displayType}/>
    
    <!---Create PostLink to external link if user does not have embeds enaled for posts--->
    {:else}
        <PostLink bind:post={post} displayType={displayType}/>
    {/if}

{:else if !post.post.thumbnail_url}
    <Link
        href={post.post.url}
        title={post.post.name}
        highlight nowrap
    />
{/if}