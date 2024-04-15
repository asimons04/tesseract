<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    import { fade } from 'svelte/transition'

    import { lastSeenPost } from './helpers.js'
    import { userSettings } from '$lib/settings.js'

    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'
    import PostCompactStyle from '$lib/components/lemmy/post/PostCompactStyle.svelte';

    export let post: PostView
    export let actions: boolean = true
    export let autoplay:boolean = false;
    export let displayType: PostDisplayType = "feed"
    export let forceCompact:boolean = false;
    export let disablePostLinks:boolean = false
    export let collapseBadges:boolean = false;
    
    let expandCompact: boolean;
    let expandPreviewText:boolean
    let postContainer: HTMLDivElement

</script>

{#if post?.post?.id}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <div id={post.post.id.toString()} on:mouseover={() => lastSeenPost.set(post.post.id)} on:touchstart={() => lastSeenPost.set(post.post.id)} bind:this={postContainer} transition:fade>
        
        <!--- Compact Posts --->
        {#if  (forceCompact || ($userSettings.showCompactPosts && !expandCompact && displayType=='feed')) }
            <PostCompactStyle bind:post {actions}  bind:expandCompact bind:expandPreviewText  bind:postContainer {displayType} {disablePostLinks} {collapseBadges} />


        <!--- Card Posts --->
        {:else}
            <PostCardStyle  bind:post {actions}  bind:expandCompact bind:expandPreviewText  bind:postContainer {displayType}  {autoplay} loop={$userSettings.embeddedMedia.loop} {collapseBadges} />
        {/if}
    </div>
{/if}