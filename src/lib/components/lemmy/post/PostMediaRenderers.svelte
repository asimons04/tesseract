<script lang="ts">
    import type { PostType, PostDisplayType } from './helpers.js'
    import type { CommunityModeratorView, PostView } from 'lemmy-js-client'
    
    import PostAudio from '$lib/components/lemmy/post/PostAudio.svelte'
    import PostBandcamp from '$lib/components/lemmy/post/PostBandcamp.svelte'
    import PostDailymotion from '$lib/components/lemmy/post/PostDailymotion.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostLoops from './PostLoops.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import PostOdysee from '$lib/components/lemmy/post/PostOdysee.svelte'
    import PostPeerTube from '$lib/components/lemmy/post/PostPeerTube.svelte'
    import PostSongLink from '$lib/components/lemmy/post/PostSongLink.svelte'
    import PostSpotify from '$lib/components/lemmy/post/PostSpotify.svelte'
    import PostSoundCloud from '$lib/components/lemmy/post/PostSoundCloud.svelte'
    import PostVideo from '$lib/components/lemmy/post/PostVideo.svelte'
    import PostVimeo from '$lib/components/lemmy/post/PostVimeo.svelte'
    import PostYouTube from '$lib/components/lemmy/post/PostYouTube.svelte'
    

    
    export let post: PostView
    export let postType: PostType
    export let displayType: PostDisplayType
    export let postContainer: HTMLDivElement
    export let autoplay:boolean|undefined = undefined;
    export let loop:boolean | undefined = undefined

</script>

<!--- Link-style post without thumbnail URL--->
{#if postType == "link" || postType == "thumbLink"}
    <PostLink bind:post {displayType} />
{/if}

<!--- Direct Image Post --->
{#if postType == "image"}
    <PostImage bind:post {displayType}/>
{/if}

<!--- Direct Audio FIle Post --->
{#if postType == "audio"}
    <PostAudio bind:post bind:postContainer {displayType}/>
{/if}

<!--- Direct Video Post --->
{#if postType == "video"}
    <PostVideo bind:post bind:postContainer {displayType} {autoplay} loop={loop}/>
{/if}

<!--- Loops Post --->
{#if postType == "loops"}
    <PostLoops bind:post bind:postContainer {displayType} {autoplay} loop={loop}/>
{/if}


<!--- Bandcamp Embed --->
{#if postType == "bandcamp"}
    <PostBandcamp bind:post bind:postContainer {displayType}/>
{/if}

<!--- YouTube Video Post (or other supported embed: YT, Invidious, Spotify --->
{#if postType == "youtube"}
    <PostYouTube bind:post bind:postContainer {displayType} {autoplay}/>
{/if}

<!--- Spotify Embed --->
{#if postType == "spotify"}
    <PostSpotify bind:post bind:postContainer {displayType} />
{/if}

<!--- Soundcloud Embed --->
{#if postType == "soundcloud"}
    <PostSoundCloud bind:post bind:postContainer {displayType} />
{/if}

<!--- Vimeo Embed --->
{#if postType == "vimeo"}
    <PostVimeo bind:post bind:postContainer {displayType} />
{/if}

<!--- Odysee Embed --->
{#if postType == "odysee"}
    <PostOdysee bind:post bind:postContainer {displayType} />
{/if}

<!--- SongLink Embed --->
{#if postType == "songlink"}
    <PostSongLink bind:post bind:postContainer {displayType} />
{/if}

<!---Peertube Embed--->
{#if postType == 'peertube'}
    <PostPeerTube bind:post bind:postContainer {displayType} />
{/if}

<!---Dailymotion Embed--->
{#if postType == 'dailymotion'}
    <PostDailymotion bind:post bind:postContainer {displayType} />
{/if}