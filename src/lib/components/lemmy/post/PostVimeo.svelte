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
    export let autoplay:boolean|undefined = undefined;
    
    let videoID:    string | null | undefined
    let embedURL:   string = ""
    let extraParams:string = "autopause=0"
    let size: string = imageSize(displayType);

    
    if (post.post?.url) {
        // Parse URLs to pick out video IDs to create embed URLs
        videoID = new URL(post.post.url).pathname.replace('/','')
        embedURL = "https://player.vimeo.com/video";
        
        // Append the video ID to the embed URL
        embedURL += `/${videoID}`
    }

    if (embedURL) {
        if (displayType ==  'post' && (autoplay ?? $userSettings.embeddedMedia.autoplay)) {
            extraParams += "&autoplay=1";
        }
    }
    $: showAsEmbed = embedURL &&
        (displayType == 'feed' && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
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
    <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full">
        
        <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-md max-w-full">
            
            <div class="ml-auto mr-auto max-w-[88vw] {size}">
                <div class="flexiframe-container rounded-md max-w-screen mx-auto">
                    <iframe 
                        id="video-{post.post.id}"
                        class="flexiframe"
                        src="{embedURL}?{extraParams}" 
                        allow="accelerometer; autoplay; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                        loading="lazy"
                        allowfullscreen
                        title="Vimeo: {post.post.name}"
                    >
                    </iframe>
                </div>
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