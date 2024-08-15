<script lang="ts">
    
    import type { PostType, PostDisplayType } from './helpers.js'
    import type { CommunityModeratorView, PostView } from 'lemmy-js-client'

    import { postType as identifyPostType } from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    
    import Card from '$lib/components/ui/Card.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
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
    export let postContainer: HTMLDivElement
    
   
    // Determine post type based on its attributes
    let postType: PostType
    $: post, postType = identifyPostType(post)

</script>

<Card class="flex flex-col w-full p-3 gap-1 {displayType == 'post' ? 'min-h-[230px]' : ''}">
    <div class="flex flex-row w-full gap-2.5">
        <PostMeta bind:post moderators={moderators} {collapseBadges}/>
    </div>

    <PostMediaRenderers bind:post bind:postContainer bind:displayType bind:postType bind:autoplay bind:loop />

    {#if (displayType == 'feed' && $userSettings.uiState.postBodyPreviewLength  >= 0) || displayType=='post'}
        <PostBody bind:post bind:postContainer {displayType} bind:expandPreviewText />
    {/if}

    <!--- Crossposts --->
    <Crossposts bind:post size={displayType=='feed' ? 'xs' : 'sm'} class="mb-1"/>

    {#if actions}
        <PostActions  bind:post bind:expandCompact bind:postContainer {displayType}
            on:reply
            on:edit={(e) => {
                post = post
                toast({
                    title: 'Confirmation',
                    content: 'The post was edited successfully.',
                    type: 'success',
                })
            }}
        />
    {/if}
</Card>