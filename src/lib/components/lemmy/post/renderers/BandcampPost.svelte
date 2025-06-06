<script lang="ts">
    import { 
        type PostDisplayType,
        type PostType,
        isImage
    }                           from '$lib/components/lemmy/post/helpers.js'
    
    import type { PostView }    from 'lemmy-js-client'

    import { userSettings }     from '$lib/settings.js'
    
    import ArchiveLinkSelector  from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import BandcampPlayer       from '$lib/components/players/BandcampPlayer.svelte'
    import Crossposts           from '../components/Crossposts.svelte'
    import Image                from '../components/Image.svelte'
    import Link                 from '$lib/components/input/Link.svelte'
    import PostActions          from '../components/PostActions.svelte'
    import PostBody             from '../components/PostBody.svelte'
    import PostEmbedDescription from '../components/PostEmbedDescription.svelte'
    import PostMeta             from '../components/PostMeta.svelte'
    

    // Standard for all post types
    export let post:PostView
    export let actions: boolean             = true
    export let inCommunity                  = false
    export let inProfile                    = false
    export let displayType: PostDisplayType = 'feed'
    export let postType:PostType            = 'vimeo'
    export let inViewport                   = true
    export let compact: boolean             = true
    export let inModal: boolean             = false
    export let onHomeInstance: boolean      = false

    let placeholderImage    = '/img/peertube.webp'
    let clickToPlayClicked  = false
    let expandPreviewText: boolean 
    let nsfw = post.post.nsfw

    // Unset click to play when out of viewport or collapsed (revert to thumbnail)
    $:  if (!inViewport || compact) clickToPlayClicked = false
    
    $:  thumbnail_url = ((post.post.thumbnail_url && isImage(post.post.thumbnail_url)) 
            ? post.post.thumbnail_url 
            : placeholderImage 
        ) ?? placeholderImage

    function clickToPlay() {
        clickToPlayClicked = true
    }
</script>


<!---Compact View and Common Header--->
<PostMeta bind:post showTitle={true} {postType} {actions} {inCommunity} {inProfile} {inModal} {onHomeInstance} {compact} on:toggleCompact={() => compact = !compact} />    

{#key compact }
    <PostEmbedDescription {compact} title={post.post.embed_title} on:clickThumbnail={() => compact = false}
        description={post.post.embed_description} 
        url={post.post.url}
        thumbnail_url={thumbnail_url}
        showThumbnail={compact}
        nsfw={nsfw}
    > 
        <ArchiveLinkSelector url={post.post?.url} {postType} />    
        <Link href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
    </PostEmbedDescription>
{/key}


<!---Card View with Media--->
{#if !compact}
    
    {#if clickToPlayClicked && inViewport && post.post.embed_video_url}
        <BandcampPlayer embed_url={post.post.embed_video_url} thumbnail_url={post.post.thumbnail_url} alt_text={post.post.name} {displayType}  />
    {:else}
        <Image url={thumbnail_url} clickToPlay={post.post.embed_video_url ? true : false} {displayType} nsfw={nsfw} zoomable={false} class="min-h-[300px]" on:click={clickToPlay} />
    {/if}
{/if}

<!---Common Footer--->
<PostBody bind:post bind:expandPreviewText {displayType}  {compact} />
<Crossposts bind:post {onHomeInstance} class="mb-1 !pl-0"/>
<PostActions bind:post {displayType} {inModal} {onHomeInstance} on:reply class="mt-2" />

