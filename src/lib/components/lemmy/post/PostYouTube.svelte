<script lang="ts">
    import type {PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import { buildYouTubeEmbedLink } from './helpers'
    import { getInstance } from '$lib/lemmy.js'
    import { userSettings } from '$lib/settings.js'
    
    import Link from '$lib/components/input/Link.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'


    export let post: PostView
    export let displayType: PostDisplayType
    export let autoplay:boolean|undefined = undefined;
    export let postContainer: HTMLDivElement

    
    let embedURL:   URL | null | undefined
    let inViewport = false

    $: if (post?.post?.url) embedURL = buildYouTubeEmbedLink(post.post.url, displayType, autoplay)

    $: showAsEmbed = embedURL &&
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

<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed && embedURL}
    <Link 
        href={
            embedURL
                ? embedURL.href.replace('embed','watch').replace('www.youtube-nocookie','youtube')
                : post.post.url
        }
        title={
            embedURL
                ? embedURL.href.replace('embed','watch').replace('www.youtube-nocookie','youtube')
                : post.post.url
        }
        highlight nowrap 
        domainOnly={!$userSettings.uiState.showFullURL}
        newtab={$userSettings.openInNewTab.links}  
        
    />
    
    <div class="overflow-hidden relative bg-slate-200 dark:bg-zinc-800 rounded-2xl max-w-full p-1">
        <div class="ml-auto mr-auto max-w-[88vw] w-full">
            <div class="flexiframe-container rounded-2xl max-w-screen mx-auto">
                <iframe 
                    id="video-{post.post.id}"
                    class="flexiframe"
                    src="{embedURL.href}" 
                    allow="accelerometer; autoplay; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                    loading="lazy"
                    allowfullscreen
                    title="YouTube: {post.post.name}"
                >
                </iframe>
            </div>
        </div>
    </div>

{:else if post.post.thumbnail_url}
    <!---Create image post if user has media embeds enabled for posts but disabled in feed--->    
    {#if $userSettings.embeddedMedia.post}
        <Link
            href={
                embedURL
                ? embedURL.href.replace('embed','watch').replace('www.youtube-nocookie','youtube')
                : post.post.url
            }
            title={post.post.name}
            newtab={$userSettings.openInNewTab.links}
            highlight nowrap
        />

        <PostImage bind:post displayType={displayType} />
    
    <!---Create PostLink to external link if user does not have embeds enaled for posts--->
    {:else}
        <PostLink bind:post displayType={displayType}/>
    {/if}

{:else if !post.post.thumbnail_url}
    <Link
        href={
            embedURL
            ? embedURL.href.replace('embed','watch').replace('www.youtube-nocookie','youtube')
            : post.post.url
        }
        title={post.post.name}
        highlight nowrap
    />
{/if}