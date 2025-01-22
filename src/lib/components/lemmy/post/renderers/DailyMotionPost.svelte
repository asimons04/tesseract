<script lang="ts">
    import type { PostDisplayType, PostType } from '$lib/components/lemmy/post/helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import {  isImage } from '$lib/components/lemmy/post/helpers'
    import { userSettings } from '$lib/settings.js'
    
    import ArchiveLinkSelector  from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import Crossposts           from '$lib/components/lemmy/post/components/Crossposts.svelte'
    import DailyMotionPlayer    from '$lib/components/players/DailyMotionPlayer.svelte'
    import Link                 from '$lib/components/input/Link.svelte'
    import PostActions          from '$lib/components/lemmy/post/components/PostActions.svelte'
    import PostBody             from '$lib/components/lemmy/post/components/PostBody.svelte'
    import PostEmbedDescription from '$lib/components/lemmy/post/components/PostEmbedDescription.svelte'
    import PostMeta             from '$lib/components/lemmy/post/components/PostMeta.svelte'
    
    

    // Standard for all post types
    export let post:PostView
    export let actions: boolean             = true
    export let inCommunity                  = false
    export let inProfile                    = false
    export let displayType: PostDisplayType = 'feed'
    export let postType: PostType           = 'dailymotion'
    export let inViewport                   = true
    export let compact: boolean             = true

    let clickToPlayClicked = false
    let placeholderImage = '/img/dailymotion.png'

    $:  if (!inViewport || compact) clickToPlayClicked = false
    
    $:  thumbnail_url = ((post.post.thumbnail_url && isImage(post.post.thumbnail_url)) 
            ? post.post.thumbnail_url 
            : placeholderImage 
        ) ?? placeholderImage
    
</script>

<!---Compact View and Common Header--->
<PostMeta bind:post showTitle={true} {postType} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />    

{#key compact}
    <PostEmbedDescription {compact} title={post.post.embed_title} on:clickThumbnail={() => compact = false}
        description={post.post.embed_description} 
        url={post.post.url}
        thumbnail_url={thumbnail_url}
        showThumbnail={compact}
        nsfw={post.post.nsfw}
    > 
        <ArchiveLinkSelector url={post.post?.url} {postType} />    
        <Link href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
    </PostEmbedDescription>
{/key}

<!---Card View with Media--->
{#if !compact && post.post.url}
   <DailyMotionPlayer {displayType} {compact} {inViewport}
        url={post.post.url} 
        nsfw={post.post.nsfw} 
        thumbnail_url={post.post.thumbnail_url}
        alt_text={post.post.alt_text ?? post.post.name}  
    />
{/if}

<!---Common Footer--->
<PostBody bind:post {displayType}  />
<Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
<PostActions bind:post {displayType} on:reply class="mt-2" />