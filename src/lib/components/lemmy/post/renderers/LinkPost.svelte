<script lang="ts">
    import type { PostDisplayType, PostType } from '../helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { userSettings } from '$lib/settings.js'

    import ArchiveLinkSelector  from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import Crossposts           from '$lib/components/lemmy/post/components/Crossposts.svelte'
    import Image                from '$lib/components/lemmy/post/components/Image.svelte'
    import Link                 from '$lib/components/input/Link.svelte'
    import MBFC                 from '$lib/MBFC/MBFC.svelte'
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
    export let postType: PostType           = 'thumbLink'
    export let compact: boolean             = true
    export let inModal: boolean             = false
    export let onHomeInstance: boolean      = false
    
    let nsfw = post.post.nsfw
    let expandPreviewText: boolean
</script>

<PostMeta bind:post showTitle={true} {postType} {actions} {inCommunity} {inProfile} {inModal} {onHomeInstance} {compact} on:toggleCompact={() => compact = !compact} />

{#if compact && post.post.url}
    
    <!---Alt source selector, link, MBFC for desktop compact view--->
    <div class="flex flex-col gap-2 w-full">
        <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail={() => compact = false}
            description={post.post.embed_description} 
            url={post.post.url}
            thumbnail_url={post.post.thumbnail_url}
            showThumbnail={!$userSettings.uiState.hideCompactThumbnails || displayType=='post'}
            nsfw={nsfw}
            {compact}
        >
            <div class="flex flex-row w-full items-center mb-1 gap-2">
                <ArchiveLinkSelector url={post.post?.url} {postType}/>
                <Link class="text-xs" href={post.post?.url} newtab={true} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
                <MBFC bind:post rightJustify={true}/>
            </div>

        </PostEmbedDescription>
    </div>
    

{:else if !compact && post.post.url}
    
    <PostEmbedDescription title={post.post.embed_title} description={post.post.embed_description} {compact} url={post.post.url}>
        <span class="flex flex-row w-full gap-2 px-1">
            <ArchiveLinkSelector url={post.post?.url} {postType} />
            <Link class="text-xs" href={post.post?.url} newtab={true} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
            <MBFC bind:post rightJustify={true}/>
        </span>
    </PostEmbedDescription>
{/if}

{#if !compact && post.post.thumbnail_url}
    <Image url={post.post.thumbnail_url} nsfw={nsfw} alt_text={post.post.alt_text ?? post.post.name} {displayType} zoomable />
{/if}



<PostBody bind:post bind:expandPreviewText {displayType}  />
<Crossposts bind:post size="xs" {onHomeInstance} class="mb-1 !pl-0"/>
<PostActions bind:post {inModal} {displayType} {onHomeInstance} on:reply class="mt-2" />