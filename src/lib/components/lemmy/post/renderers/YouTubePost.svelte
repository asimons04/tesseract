<script lang="ts">
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import { buildYouTubeEmbedLink } from '$lib/components/lemmy/post/helpers'
    import { userSettings } from '$lib/settings.js'
    
    import ArchiveLinkSelector from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import Crossposts from '../components/Crossposts.svelte'
    import IFrame from '../utils/IFrame.svelte'
    import Image from '../components/Image.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import PostActions from '../components/PostActions.svelte'
    import PostBody from '../components/PostBody.svelte'
    import PostEmbedDescription from '../components/PostEmbedDescription.svelte'
    import PostMeta from '../components/PostMeta.svelte'

    // Standard for all post types
    export let post:PostView
    export let actions: boolean = true
    export let inCommunity = false
    export let inProfile = false
    export let displayType: PostDisplayType = 'feed'
    export let collapseBadges = false
    export let postType = 'youtube'
    export let inViewport = true
    export let compact: boolean = true
    

    let embedURL:   URL | null | undefined
    let clickToPlayClicked = false
    let placeholderImage = '/img/youtube.png'
    
    
    // Unset click to play when out of viewport or switched back to compact (revert to thumbnail)
    $:  if (!inViewport || compact) clickToPlayClicked = false

    function clickToPlay() {
        if (post?.post?.url) embedURL = buildYouTubeEmbedLink(post.post.url, displayType, true)
        clickToPlayClicked = true
    }
</script>

<!---Compact View and Common Header--->
<PostMeta {post} showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />    
{#key compact}
    <PostEmbedDescription {compact} title={post.post.embed_title} on:clickThumbnail={() => compact = false}
        description={post.post.embed_description} 
        url={post.post.url}
        thumbnail_url={post.post.thumbnail_url ?? placeholderImage}
        showThumbnail={compact}
        nsfw={post.post.nsfw}
    > 
        <ArchiveLinkSelector url={post.post?.url} {postType} />    
        <Link href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
    </PostEmbedDescription>
{/key}

<!---Card View with Media--->
{#if !compact}
    {#if clickToPlayClicked && inViewport && embedURL}
        <IFrame {embedURL} title={post.post.name} />
    {:else}
        <Image url={post.post.thumbnail_url ?? placeholderImage} clickToPlay {displayType} nsfw={post.post.nsfw} zoomable={false} class="min-h-[300px]" on:click={clickToPlay} />
    {/if}
{/if}

<!---Common Footer--->
<PostBody {post} {displayType}  />
<Crossposts {post} size="xs" class="mb-1 !pl-0"/>
<PostActions {post} {displayType} on:reply class="mt-2" />