<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import { getInstance } from '$lib/lemmy.js'
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import Link from '$lib/components/input/Link.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'


    export let post: PostView
    export let displayType: PostDisplayType
    export let autoplay:boolean|undefined = undefined;
    
    let videoID:    string | null | undefined
    let embedURL:   URL = new URL('https://localhost');
    let clickView:  boolean = false

    $: if (post?.post?.url) {
        // Parse URLs to pick out video IDs to create embed URLs
        videoID = new URL(post.post.url).pathname.replace('/watch','').replace('/shorts/','').replace('/','');
        
        if (!videoID) {
            videoID = new URL(post.post.url).searchParams.get('v');
        }
        
        // Create the embed URL based on the user's preferred YouTube frontend
        if ($userSettings.embeddedMedia.YTFrontend == "YouTube") {
            embedURL.host = 'www.youtube-nocookie.com';
        }

        if ($userSettings.embeddedMedia.YTFrontend == "Invidious" && $userSettings.embeddedMedia.customInvidious !='') {
            embedURL.host = `${$userSettings.embeddedMedia.customInvidious}`;
        }
    
        // Search for valid extra parameters
        if (videoID) {

            // Append the video ID to the embed URL
            embedURL.pathname = `/embed/${videoID}`


            // Enable autoplay videos in post if setting is enabled
            
            if (displayType ==  'post' && (autoplay ?? $userSettings.embeddedMedia.autoplay)) {
                embedURL.searchParams.set('autoplay', '1');
            }
            else {
                embedURL.searchParams.set('autoplay', '0');
            }

            if ($userSettings.embeddedMedia.loop) {
                embedURL.searchParams.set('loop', '1');
            }

            // Start time: Can be either t (legacy) or start
            let startTime = new URL(post.post.url).searchParams.get('t') ?? new URL(post.post.url).searchParams.get('start');
            if (startTime) {
                embedURL.searchParams.set('start', startTime);
            }

            // End time: 
            let endTime = new URL(post.post.url).searchParams.get('end');
            if (endTime) {
                embedURL.searchParams.set('end', endTime);
            }
        }
    }

    $: showAsEmbed = videoID &&
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



{#if showAsEmbed || clickView}
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
    
    <div class="overflow-hidden relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
        <div class="ml-auto mr-auto max-w-[88vw] w-full">
            <div class="flexiframe-container rounded-md max-w-screen mx-auto">
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