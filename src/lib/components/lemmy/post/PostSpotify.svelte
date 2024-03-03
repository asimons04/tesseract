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
    
    let trackID:    string = ""
    let embedURL:   string = ""
    let extraParams:string = ""

    // Generate the embed URL for the given post URL
    if (post.post && post.post.url) {
        // e.g. https://open.spotify.com/embed/track/2RUs0cO0KpvuZJ0J4hqFFC
        if (post.post.url.startsWith('https://open.spotify.com/embed')) {
            embedURL = post.post.url;
        }

        if (post.post.url.startsWith('https://open.spotify.com/track')) {
            trackID = new URL(post.post.url).pathname.replace('/track/','');
            embedURL = `https://open.spotify.com/embed/track/${trackID}?theme=0&height=100%`
        }

        if (post.post.url.startsWith('https://open.spotify.com/playlist')) {
            trackID = new URL(post.post.url).pathname.replace('/playlist/','');
            embedURL = `https://open.spotify.com/embed/playlist/${trackID}?theme=0&height=100%`
        }

        if (post.post.url.startsWith('https://open.spotify.com/album')) {
            trackID = new URL(post.post.url).pathname.replace('/album/','');
            embedURL = `https://open.spotify.com/embed/album/${trackID}?theme=0&height=100%`
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
        height: 491px;
        width: 100%;
        border:0;
    }
</style>



{#if showAsEmbed}
    <Link href={post.post.url} newtab={$userSettings.openInNewTab.links} title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap />
    <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full {embedURL.includes('/track/') ? 'h-[352px]' : 'h-[500px]'}">
        <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 p-1 rounded-md max-w-full">
            <div class="ml-auto mr-auto w-full">
                <div class="flexiframe-container rounded-md max-w-screen {embedURL.includes('/track/') ? 'h-[352px]' : 'h-[500px]'} mx-auto">
                    <iframe 
                        class="flexiframe"
                        src="{embedURL}?{extraParams}" 
                        allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                        loading="lazy"
                        allowfullscreen
                        height="500"
                        title="Spotify: {post.post.name}"
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
        <PostImage bind:post={post} displayType={displayType} />
    
    <!---Create PostLink to external link if user does not have embeds enaled for posts--->
    {:else}
        <PostLink bind:post={post}  displayType={displayType}/>
    {/if}

{:else if !post.post.thumbnail_url}
<Link
    href={post.post.url}
    title={post.post.name}
    highlight nowrap
/>
{/if}