<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    import { userSettings } from '$lib/settings.js'
    
    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'
    import PostCompactStyle from '$lib/components/lemmy/post/PostCompactStyle.svelte';

    export let post: PostView
    export let actions: boolean = true
    export let autoplay:boolean|undefined = undefined;
    export let displayType: PostDisplayType = "feed"
    export let forceCompact:boolean = false;
    export let disablePostLinks:boolean = false

    let expandCompact: boolean;
    let expandPreviewText:boolean
   
</script>



<!--- Compact Posts --->
{#if  (forceCompact || ($userSettings.showCompactPosts && !expandCompact && displayType=='feed')) }
    <PostCompactStyle 
        bind:post={post} 
        actions={actions} 
        bind:expandCompact={expandCompact} 
        bind:expandPreviewText 
        displayType={displayType}
        {disablePostLinks}
    />


<!--- Card Posts --->
{:else}
    <PostCardStyle 
        bind:post={post} 
        actions={actions} 
        bind:expandCompact={expandCompact} 
        bind:expandPreviewText 
        displayType={displayType} 
        autoplay={false}
        loop={$userSettings.embeddedMedia.loop}
    />
{/if}






