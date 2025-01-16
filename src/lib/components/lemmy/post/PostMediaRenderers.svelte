<script lang="ts">
    import type { PostType, PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import PostAudio from '$lib/components/lemmy/post/PostAudio.svelte'
    import PostBandcamp from '$lib/components/lemmy/post/PostBandcamp.svelte'
    import PostDailymotion from '$lib/components/lemmy/post/PostDailymotion.svelte'
    //import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    //import PostLoops from './PostLoops.svelte'
    //import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import PostOdysee from '$lib/components/lemmy/post/PostOdysee.svelte'
    import PostPeerTube from '$lib/components/lemmy/post/PostPeerTube.svelte'
    import PostSongLink from '$lib/components/lemmy/post/PostSongLink.svelte'
    import PostSpotify from '$lib/components/lemmy/post/PostSpotify.svelte'
    import PostSoundCloud from '$lib/components/lemmy/post/PostSoundCloud.svelte'
    //import PostVideo from '$lib/components/lemmy/post/PostVideo.svelte'
    import PostVimeo from '$lib/components/lemmy/post/PostVimeo.svelte'
    //import PostYouTube from '$lib/components/lemmy/post/PostYouTube.svelte'
    

    
    export let post: PostView
    export let postType: PostType
    export let displayType: PostDisplayType
    export let inViewport: boolean = false
</script>


<!--- Direct Audio FIle Post --->
{#if postType == "audio"}
    <PostAudio bind:post bind:inViewport {displayType}/>
{/if}






<!--- Bandcamp Embed --->
{#if postType == "bandcamp"}
    <PostBandcamp bind:post bind:inViewport {displayType}/>
{/if}


<!--- Spotify Embed --->
{#if postType == "spotify"}
    <PostSpotify bind:post bind:inViewport  {displayType} />
{/if}

<!--- Soundcloud Embed --->
{#if postType == "soundcloud"}
    <PostSoundCloud bind:post bind:inViewport {displayType} />
{/if}

<!--- Vimeo Embed --->
{#if postType == "vimeo"}
    <PostVimeo bind:post bind:inViewport {displayType} />
{/if}

<!--- Odysee Embed --->
{#if postType == "odysee"}
    <PostOdysee bind:post bind:inViewport {displayType} />
{/if}

<!--- SongLink Embed --->
{#if postType == "songlink"}
    <PostSongLink bind:post bind:inViewport {displayType} />
{/if}

<!---Peertube Embed--->
{#if postType == 'peertube'}
    <PostPeerTube bind:post bind:inViewport {displayType} />
{/if}

<!---Dailymotion Embed--->
{#if postType == 'dailymotion'}
    <PostDailymotion bind:post bind:inViewport {displayType} />
{/if}