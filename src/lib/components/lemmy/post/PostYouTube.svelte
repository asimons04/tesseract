<script lang="ts">
    import Link from '$lib/components/input/Link.svelte'
    import { userSettings } from '$lib/settings.js'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'

    export let url: string
    export let post: object

    let videoID:    string | null | undefined
    let embedURL:   string = ""
    let extraParams:string = ""
    

    
    if (post.post && post.post.url) {
        // Parse URLs to pick out video IDs to create embed URLs
        videoID = new URL(post.post.url).pathname.replace('/','')
        if (videoID == "watch") {
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
            // Disable autoplay
            extraParams += "&autoplay=0";

            // Start time: Can be either t (legacy) or start
            let startTime = new URL(post.post.url).searchParams.get('t') ?? new URL(post.post.url).searchParams.get('start');
            if (startTime) {
                extraParams += `&start=${startTime}`
            }
        }
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



{#if $userSettings.embeddedMedia.enable && embedURL}
<Link href={post.post.url} newtab={$userSettings.openInNewTab.postLinks} highlight nowrap />
<div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full">
    <div class="ml-auto mr-auto mt-1 mb-1 max-w-4xl">
        <div class="flexiframe-container rounded-md max-w-screen max-h-[480px] mx-auto">
            <iframe 
                class="flexiframe"
                src="{embedURL}?{extraParams}" 
                allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                loading="lazy"
                allowfullscreen 
            >
            </iframe>
        </div>
    </div>
</div>

{:else if !$userSettings.embeddedMedia.enable || !embedURL}
<PostLink
    url={post.post.url}
    thumbnail_url="{post.post.thumbnail_url}?format=webp&thumbnail=768"
    nsfw={post.post.nsfw}
/>
{/if}