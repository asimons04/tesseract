<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers.js'

    import { userSettings } from '$lib/settings'

    import ArchiveLinkSelector from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import NSFWOverlay from '$lib/components/lemmy/post/utils/NSFWOverlay.svelte'
    
    
    
    

    // New Components
    import Image from '$lib/components/lemmy/post/components/Image.svelte'
    import PostBody from '$lib/components/lemmy/post/components/PostBody.svelte'
    import PostEmbedDescription from '$lib/components/lemmy/post/components/PostEmbedDescription.svelte'
    import PostMeta from '$lib/components/lemmy/post/components/PostMeta.svelte'
    import VideoContainer from '$lib/components/lemmy/post/components/VideoContainer.svelte'
    import VideoPlayer from '$lib/components/lemmy/post//components/VideoPlayer.svelte'
    
    
    
    import PostActions from '../components/PostActions.svelte';
    
    import Crossposts from '../Crossposts.svelte';


    // Standard for all post types
    export let post:PostView
    export let actions: boolean = true
    export let inCommunity = false
    export let inProfile = false
    export let displayType: PostDisplayType = 'feed'
    export let collapseBadges = false
    export let postType = 'image'
    export let inViewport = true
    export let compact: boolean = true


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

    // Return to thumbnail if collapsed into compact view
    $:  if (compact) clickToPlayClicked = false

</script>

<!---Compact View--->
{#if compact}
    <PostMeta bind:post showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />    

    <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail={() => compact = false}
        description={post.post.embed_description} 
        url={post.post.url}
        thumbnail_url={post.post.thumbnail_url}
    > 
        <ArchiveLinkSelector url={post.post?.url} {postType} />    
        <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
    </PostEmbedDescription>

    <PostBody bind:post {displayType}  />
    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
    <PostActions  bind:post {displayType} on:reply class="mt-2" />

<!---Card View--->
{:else}
    <PostMeta bind:post showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />    
    
    <PostEmbedDescription title={post.post.embed_title} description={post.post.embed_description}  url={post.post.url} > 
        <ArchiveLinkSelector url={post.post?.url} postType='video' />    
        <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap class="text-xs" />
    </PostEmbedDescription>

    <!---Render as Video if Click to Play Has Been Clicked--->
    {#if source && clickToPlayClicked}
        <VideoContainer>
            <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />
            <VideoPlayer {source} nsfw={post.post.nsfw} {displayType} {inViewport} autoplay={true}/>
        </VideoContainer>

    <!---Render as a Click-to-Play Thumbnail--->
    {:else}
        <Image url={post.post.thumbnail_url ?? '/img/loops.png'} clickToPlay bind:loading {displayType} zoomable={false} class="min-h-[300px]" 
            on:click={(e)=> {
                loading = true
                clickToPlay() 
            }}
        />
    {/if}

    <PostBody bind:post {displayType}  />
    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
    <PostActions  bind:post {displayType} on:reply class="mt-2" />


{/if}

