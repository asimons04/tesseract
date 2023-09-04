<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import { getInstance } from '$lib/lemmy.js'

    import Link from '$lib/components/input/Link.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'

    type displayType = 'post'|'feed'
    
    export let post: object
    export let displayType: displayType
    
    let videoID:    string | null | undefined
    let embedURL:   string = ""
    let extraParams:string = ""
    
    
  
    if (post.post && post.post.url) {
        // Spotify -- Consider moving to dedicated component to better size the iframe
        // e.g. https://open.spotify.com/embed/track/2RUs0cO0KpvuZJ0J4hqFFC
        if (post.post.url.startsWith('https://open.spotify.com/embed')) {
            embedURL = post.post.url;
        }

        if (post.post.url.startsWith('https://open.spotify.com/track')) {
            let trackID = new URL(post.post.url).pathname.replace('/track/','');
            embedURL = `https://open.spotify.com/embed/track/${trackID}?theme=0`
        }

        if (post.post.url.startsWith('https://open.spotify.com/playlist')) {
            let trackID = new URL(post.post.url).pathname.replace('/playlist/','');
            embedURL = `https://open.spotify.com/embed/playlist/${trackID}?theme=0`
        }

        if (post.post.url.startsWith('https://open.spotify.com/album')) {
            let trackID = new URL(post.post.url).pathname.replace('/album/','');
            embedURL = `https://open.spotify.com/embed/album/${trackID}?theme=0`
        }
    }

    function showAsEmbed() {
        if (!embedURL) { return false;}
        if (displayType == 'feed' && $userSettings.embeddedMedia.enableFeed) { return true;}
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
        height: 352px;
        width: 100%;
        border:0;
    }
</style>



{#if showAsEmbed()}
<Link href={post.post.url} newtab={$userSettings.openInNewTab.postLinks} highlight nowrap />
<div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full h-[352px]">
    <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 m-1 rounded-md max-w-full">
        <div class="ml-auto mr-auto max-w-4xl">
            <div class="flexiframe-container rounded-md max-w-screen h-[352px] mx-auto">
                <iframe 
                    class="flexiframe"
                    src="{embedURL}?{extraParams}" 
                    allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                    loading="lazy"
                    allowfullscreen
                    height="352"
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
        nsfwBlur = {userSettings.nsfwBlur}
        link = {true}
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