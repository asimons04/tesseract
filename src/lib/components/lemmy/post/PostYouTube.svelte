<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import { getInstance } from '$lib/lemmy.js'
    import type { postDisplayType } from './helpers.js'

    import Link from '$lib/components/input/Link.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    
    export let post: object
    export let displayType: postDisplayType

    let videoID:    string | null | undefined
    let embedURL:   string = ""
    let extraParams:string = ""
    

    
    if (post.post && post.post.url) {
        // Parse URLs to pick out video IDs to create embed URLs
        videoID = new URL(post.post.url).pathname.replace('/watch','').replace('/shorts/','')
        
        if (!videoID) {
            videoID = new URL(post.post.url).searchParams.get('v');
        }
        
        // Create the embed URL based on the user's preferred YouTube frontend
        if ($userSettings.embeddedMedia.YTFrontend == "YouTube") {
            embedURL = "https://www.youtube-nocookie.com/embed";
        }

        if ($userSettings.embeddedMedia.YTFrontend == "Invidious" && $userSettings.embeddedMedia.customInvidious !='') {
            embedURL = `https://${$userSettings.embeddedMedia.customInvidious}/embed`;
        }
        
        // Append the video ID to the embed URL
        embedURL += `/${videoID}`
    
        // Search for valid extra parameters
        if (videoID) {
            // Enable autoplay videos in post if setting is enabled
            if (displayType ==  'post' && $userSettings.embeddedMedia.autoplayPost) {
                extraParams += "&autoplay=1";
            }
            else {
                extraParams += "&autoplay=0";
            }

            // Start time: Can be either t (legacy) or start
            let startTime = new URL(post.post.url).searchParams.get('t') ?? new URL(post.post.url).searchParams.get('start');
            if (startTime) {
                extraParams += `&start=${startTime}`
            }

            // End time: 
            let endTime = new URL(post.post.url).searchParams.get('end');
            if (startTime) {
                extraParams += `&end=${endTime}`
            }
        }
    }

    function showAsEmbed() {
        if (!embedURL) { return false;}
        if (displayType == 'feed' && $userSettings.embeddedMedia.enableFeed && (!post.post.nsfw || !$userSettings.nsfwBlur)) { return true;}
        if (displayType == 'post' && $userSettings.embeddedMedia.enablePost) { return true;}
        
        return false;
    }
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



{#if showAsEmbed()}
<Link href={post.post.url} newtab={$userSettings.openInNewTab.postLinks} highlight nowrap />
<div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full">
    
    <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-md max-w-full">
        
        <div class="ml-auto mr-auto {$userSettings.videoSize ?? 'max-w-4xl'}">
            <div class="flexiframe-container rounded-md max-w-screen max-h-[480px] mx-auto">
                <iframe 
                    class="flexiframe"
                    src="{embedURL}?{extraParams}" 
                    allow="accelerometer; autoplay; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                    loading="lazy"
                    allowfullscreen
                    title="YouTube: {post.post.name}"
                >
                </iframe>
            </div>
        </div>
    </div>
</div>

{:else if post.post.thumbnail_url}
    <!---Create image post if user has media embeds enabled for posts--->    
    {#if $userSettings.embeddedMedia.enablePost}
    <Link
        href={post.post.url}
        title={post.post.title}
        newtab={$userSettings.openInNewTab.postLinks}
        highlight nowrap
    />
    <PostImage
        instance = {getInstance()}
        name = {post.post.name}
        url = {post.post.thumbnail_url}
        id = {post.post.id}
        nsfw = {post.post.nsfw}
        displayType={displayType}
    />
    
    <!---Create PostLink to external link if user does not have embeds enaled for posts--->
    {:else}
    <PostLink
        url={post.post.url}
        thumbnail_url="{post.post.thumbnail_url}?format=webp&thumbnail=768"
        nsfw={post.post.nsfw}
    />
    {/if}

{:else if !post.post.thumbnail_url}
<Link
    href={post.post.url}
    title={post.post.title}
    highlight nowrap
/>
{/if}