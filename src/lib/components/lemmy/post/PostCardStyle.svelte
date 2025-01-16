<script lang="ts">
    
    import type { PostType, PostDisplayType } from './helpers.js'
    import type { CommunityModeratorView, PostView } from 'lemmy-js-client'

    import { postType as identifyPostType, postEditConfirmation } from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    
    import Card from '$lib/components/ui/Card.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import NSFWOverlay from './utils/NSFWOverlay.svelte'
    import PostActions from '$lib/components/lemmy/post/components/PostActions.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'
    import PostMediaRenderers from './PostMediaRenderers.svelte'
    
    export let actions: boolean = true
    export let autoplay:boolean|undefined = undefined;
    export let loop:boolean | undefined = undefined
    export let displayType: PostDisplayType = "feed"
    export let expandCompact: boolean = false;
    export let post: PostView
    export let moderators: Array<CommunityModeratorView> = [];
    export let expandPreviewText:boolean = false
    export let collapseBadges:boolean = false;
    export let inCommunity:boolean = false
    export let inProfile: boolean = false
    export let inViewport: boolean = false
    
    // Determine post type based on its attributes
    let postType: PostType
    $: post, postType = identifyPostType(post)
    
</script>



<Card class="flex flex-col w-full p-2 gap-1 {displayType == 'post' ? 'min-h-[230px]' : ''} " >
    <PostMeta bind:post bind:expandCompact moderators={moderators} {collapseBadges} {actions} {inCommunity} {inProfile} on:edit={postEditConfirmation}/>

    <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType}>    
        <PostMediaRenderers bind:post bind:displayType bind:postType bind:autoplay bind:loop bind:inViewport/>

        {#if (displayType == 'feed' && $userSettings.uiState.postBodyPreviewLength  >= 0) || displayType=='post'}
            <PostBody bind:post {displayType} bind:expandPreviewText />
        {/if}
    </NSFWOverlay>
    

    <!--- Crossposts --->
    <Crossposts bind:post size={displayType=='feed' ? 'xs' : 'sm'} class="my-1"/>
    <div class="mt-2" />
    <PostActions  bind:post  {displayType} on:reply />
    
</Card>