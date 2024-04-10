<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { userSettings,  } from '$lib/settings.js'
    import { getInstance } from '$lib/lemmy.js'
    import { imageSize} from './helpers.js'

    import Link from '$lib/components/input/Link.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    

    export let post: PostView
    export let displayType: PostDisplayType

    let embedURL:   string = ""
    
    let size: string = imageSize(displayType);

    // Check for a defined embed URL and use that if available
    $: if (post.post && post.post.embed_video_url) {
        embedURL = post.post.embed_video_url;
    }
    // If embed URL isn't provided, make our own!
    else if (post.post && post.post.url && !post.post.url.includes("/discover/")) {
        embedURL = `https://w.soundcloud.com/player/?visual=true&url=${post.post.url.replace('m.soundcloud.com', 'soundcloud.com')}`
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



<!--{#if showAsEmbed()}-->
{#if showAsEmbed}
    

<Link href={post.post.url} newtab={$userSettings.openInNewTab.links} title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
<div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-2xl max-w-full p-1">
        
    <div class="ml-auto mr-auto {size ?? 'max-w-3xl'}">
        <div class="flexiframe-container rounded-2xl max-w-screen max-h-[480px] mx-auto">
            <iframe 
                class="flexiframe"
                src="{embedURL}" 
                allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                loading="lazy"
                allowfullscreen 
                title="Sound Cloud: {post.post.name}"
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
        <PostLink post={post} displayType={displayType}/>
    {/if}

{:else if !post.post.thumbnail_url}
<Link
    href={post.post.url}
    title={post.post.name}
    highlight nowrap
/>
{/if}