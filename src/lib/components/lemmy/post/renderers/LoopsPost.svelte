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

<!---Common for Compact and Card Views.  Compact view is only this, so no special if block for it--->
<PostMeta {post} showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />

{#key compact}
    <PostEmbedDescription  on:clickThumbnail={() => compact = false}
        title={post.post.embed_title}
        description={post.post.embed_description} 
        url={post.post.url}
        thumbnail_url={post.post.thumbnail_url}
        showThumbnail={compact}
        nsfw={post.post.nsfw}
        compact={compact}
    > 
        <ArchiveLinkSelector url={post.post?.url} {postType} />    
        <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
    </PostEmbedDescription>
{/key}

<!---Card View--->
{#if !compact}
    <!---Render as Video if Click to Play Has Been Clicked--->
    {#if source && clickToPlayClicked}
        <VideoPlayer {source} {displayType} {inViewport} autoplay={true}/>

    <!---Render as a Click-to-Play Thumbnail--->
    {:else}
        <Image url={post.post.thumbnail_url ?? '/img/loops.png'} clickToPlay bind:loading {displayType} nsfw={post.post.nsfw} zoomable={false} class="min-h-[300px]" 
            on:click={(e)=> {
                loading = true
                clickToPlay() 
            }}
        />
    {/if}
{/if}

<PostBody {post} {displayType}  />
<Crossposts {post} size="xs" class="mb-1 !pl-0"/>
<PostActions {post} {displayType} on:reply class="mt-2" />

