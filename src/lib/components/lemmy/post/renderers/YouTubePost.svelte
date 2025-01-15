<script lang="ts">
    import type {PostDisplayType } from '$lib/components/lemmy/post/helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import { buildYouTubeEmbedLink } from '$lib/components/lemmy/post/helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Link from '$lib/components/input/Link.svelte'
    import IFrame from '$lib/components/lemmy/post/utils/IFrame.svelte'
    //import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    
    import ArchiveLinkSelector from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import Crossposts from '../components/Crossposts.svelte'
    import Image from '../components/Image.svelte'
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
    export let postType = 'video'
    export let inViewport = true
    export let compact: boolean = true
    

    let embedURL:   URL | null | undefined
    let clickToPlayClicked = false
    let placeholderImage = '/img/youtube.png'
    
    // Determine whether the video should be an embed or a click to play
    $:  showAsEmbed = (clickToPlayClicked && inViewport)
    
    // Unset click to play when out of viewport (revert to thumbnail)
    $:  if (!inViewport) clickToPlayClicked = false


    function clickToPlay() {
        if (post?.post?.url) embedURL = buildYouTubeEmbedLink(post.post.url, displayType, true)
        clickToPlayClicked = true
    }
</script>

<!---Compact View--->
{#if compact}
    <PostMeta bind:post showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />    

    <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail={() => compact = false}
        description={post.post.embed_description} 
        url={post.post.url}
        thumbnail_url={post.post.thumbnail_url ?? placeholderImage}
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
        <ArchiveLinkSelector url={post.post?.url} postType='youtube' />    
        <Link domainOnly={!$userSettings.uiState.showFullURL} newtab={true} highlight nowrap href={post.post.url} />
    </PostEmbedDescription>

    {#if showAsEmbed && embedURL}
        
        
        <IFrame {embedURL} title={post.post.name} />
        

    <!---IF embeds disabled, show as an image with link + alternate source selector menu--->
    {:else}
        <Image url={post.post.thumbnail_url ?? placeholderImage} clickToPlay {displayType} zoomable={false} class="min-h-[300px]" on:click={clickToPlay} />
    {/if}

    <PostBody bind:post {displayType}  />
    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
    <PostActions  bind:post {displayType} on:reply class="mt-2" />
{/if}