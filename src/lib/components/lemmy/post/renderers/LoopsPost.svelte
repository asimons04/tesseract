<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import { isImage, type PostDisplayType } from '$lib/components/lemmy/post/helpers.js'

    import { userSettings } from '$lib/settings'

    // New Components
    import ArchiveLinkSelector      from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import Crossposts               from '$lib/components/lemmy/post/components/Crossposts.svelte'
    import Link                     from '$lib/components/input/Link.svelte'
    import LoopsPlayer              from '$lib/components/players/LoopsPlayer.svelte'
    import PostActions              from '../components/PostActions.svelte'
    import PostBody                 from '$lib/components/lemmy/post/components/PostBody.svelte'
    import PostEmbedDescription     from '$lib/components/lemmy/post/components/PostEmbedDescription.svelte'
    import PostMeta                 from '$lib/components/lemmy/post/components/PostMeta.svelte'
    

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

    $:  thumbnail_url = (post.post.thumbnail_url && isImage(post.post.thumbnail_url)) 
            ? post.post.thumbnail_url 
            : undefined

</script>

<!---Common for Compact and Card Views.  Compact view is only this, so no special if block for it--->
<PostMeta bind:post showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />

{#key compact}
    <PostEmbedDescription  on:clickThumbnail={() => compact = false}
        title={post.post.embed_title}
        description={post.post.embed_description} 
        url={post.post.url}
        thumbnail_url={thumbnail_url}
        showThumbnail={compact}
        nsfw={post.post.nsfw}
        compact={compact}
    > 
        <ArchiveLinkSelector url={post.post?.url} {postType} />    
        <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
    </PostEmbedDescription>
{/key}

<!---Card View--->
{#if !compact && post.post.url}
    <LoopsPlayer {displayType}  {inViewport}    {compact}
        url={post.post.url}     thumbnail_url={thumbnail_url}   nsfw={post.post.nsfw} 
        alt_text={post.post.alt_text ?? post.post.name}    
     />
{/if}

<PostBody bind:post {displayType}  />
<Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
<PostActions bind:post {displayType} on:reply class="mt-2" />

