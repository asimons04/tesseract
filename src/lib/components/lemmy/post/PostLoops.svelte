<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from './helpers.js'

    import { userSettings } from '$lib/settings'

    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import NSFWOverlay from '$lib/components/lemmy/post/utils/NSFWOverlay.svelte'
    
    import PostImage from './PostImage.svelte'
    import PostEmbedDescription from '$lib/components/lemmy/post/PostEmbedDescription.svelte'
    
    import VideoContainer from '$lib/components/lemmy/post/components/VideoContainer.svelte'
    import VideoPlayer from '$lib/components/lemmy/post//components/VideoPlayer.svelte'
    
    
    export let post: PostView 
    export let displayType:PostDisplayType = 'feed'
    export let inViewport = false

    let clickToPlayClicked = false
    let source: string | undefined = undefined
    let loading = false

    async function getEmbedVideoURL() {
        try {
            const response = await fetch(`/tesseract/api/loops/lookup?loops_url=${post.post.url}`)
            const result = await response.json()
            if (result?.video_url) { return result.video_url }
        }
        catch { return undefined }
    }
    
    async function clickToPlay() {
        getEmbedVideoURL().then((video_url) => {
            source = video_url
            loading = false
            if (source) clickToPlayClicked = true
            else loading = false
        })
    }

</script>




{#if source && clickToPlayClicked}
    <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail
        description={$userSettings.uiState.hideCompactThumbnails && displayType=='feed' ? undefined : post.post.embed_description} 
        url={post.post.url}
        card={
            (
                (post.post.embed_description && !$userSettings.uiState.hideCompactThumbnails) || 
                (post.post.embed_description && displayType=='post') ||
                (post.post.thumbnail_url && !$userSettings.uiState.hideCompactThumbnails)
            ) ? true : false
        } 
        > 
        <span class="flex flex-row w-full gap-2 px-1">
            <ArchiveLinkSelector url={post.post?.url} postType='video' />    
            <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap class="text-xs" />
        </span>
    </PostEmbedDescription>

    <VideoContainer>
        <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />
        <VideoPlayer {source} nsfw={post.post.nsfw} {displayType} {inViewport} />
    </VideoContainer>

            
        

{:else if post.post.thumbnail_url}
    <PostImage bind:post bind:loading {displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> {
        loading = true
        clickToPlay() 
    }}/>
{/if}

