<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import { getInstance } from '$lib/lemmy.js'
    import type { postDisplayType } from './helpers.js'
    
    import Link from '$lib/components/input/Link.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'

    export let post: object
    export let displayType: postDisplayType

    let embedURL:   string = ""
    
    // Check for a defined embed URL and use that if available
    if (post.post && post.post.embed_video_url) {
        embedURL = post.post.embed_video_url;
    }
    // If embed URL isn't provided, make our own!
    else if (post.post && post.post.url && !post.post.url.includes("/discover/")) {
        embedURL = `https://w.soundcloud.com/player/?visual=true&url=${post.post.url}`
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
<Link href={post.post.url} newtab={$userSettings.openInNewTab.postLinks} title={post.post.name} highlight nowrap />
<div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full">
    <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-md max-w-full">
        
        <div class="ml-auto mr-auto {$userSettings.videoSize ?? 'max-w-3xl'}">
            <div class="flexiframe-container rounded-md max-w-screen max-h-[480px] mx-auto">
                <iframe 
                    class="flexiframe"
                    src="{embedURL}" 
                    allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                    loading="lazy"
                    allowfullscreen 
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