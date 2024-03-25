<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    import { fade } from 'svelte/transition'

    import { setLastSeenPost } from './helpers.js'
    import { userSettings } from '$lib/settings.js'

    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'
    import PostCompactStyle from '$lib/components/lemmy/post/PostCompactStyle.svelte';

    export let post: PostView
    export let actions: boolean = true
    export let autoplay:boolean|undefined = undefined;
    export let displayType: PostDisplayType = "feed"
    export let forceCompact:boolean = false;
    export let disablePostLinks:boolean = false
    export let collapseBadges:boolean = false;
    
    let expandCompact: boolean;
    let expandPreviewText:boolean
</script>

{#if post?.post?.id}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div on:mouseover={() => setLastSeenPost(post.post.id)} on:touchstart={() => setLastSeenPost(post.post.id)} transition:fade>
    <!--- Compact Posts --->
    {#if  (forceCompact || ($userSettings.showCompactPosts && !expandCompact && displayType=='feed')) }
        <PostCompactStyle bind:post {actions}  bind:expandCompact bind:expandPreviewText  {displayType} {disablePostLinks} {collapseBadges} />


    <!--- Card Posts --->
    {:else}
        <PostCardStyle  bind:post {actions}  bind:expandCompact bind:expandPreviewText  {displayType}  autoplay={false} loop={$userSettings.embeddedMedia.loop} {collapseBadges} />
    {/if}
</div>
{/if}