<script lang="ts">
    import type { PostType, PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import PostAudio from '$lib/components/lemmy/post/PostAudio.svelte'
    import PostBandcamp from '$lib/components/lemmy/post/PostBandcamp.svelte'
    import PostDailymotion from '$lib/components/lemmy/post/PostDailymotion.svelte'
    import PostOdysee from '$lib/components/lemmy/post/PostOdysee.svelte'
    import PostSongLink from '$lib/components/lemmy/post/PostSongLink.svelte'
   
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


<!--- Odysee Embed --->
{#if postType == "odysee"}
    <PostOdysee bind:post bind:inViewport {displayType} />
{/if}

<!--- SongLink Embed --->
{#if postType == "songlink"}
    <PostSongLink bind:post bind:inViewport {displayType} />
{/if}


<!---Dailymotion Embed--->
{#if postType == 'dailymotion'}
    <PostDailymotion bind:post bind:inViewport {displayType} />
{/if}