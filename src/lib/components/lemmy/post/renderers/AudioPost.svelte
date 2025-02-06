<script lang="ts">
    import type { PostDisplayType, PostType } from '$lib/components/lemmy/post/helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { imageProxyURL } from '$lib/image-proxy'
    import { isAudio } from '$lib/components/lemmy/post/helpers.js'
    import { onMount } from 'svelte'
    import { userSettings } from '$lib/settings.js'

    import ArchiveLinkSelector  from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import AudioPlayer          from '$lib/components/players/AudioPlayer.svelte'
    import CompactPostThumbnail from '$lib/components/lemmy/post/utils/CompactPostThumbnail.svelte'
    import Crossposts           from '$lib/components/lemmy/post/components/Crossposts.svelte'
    import Image                from '$lib/components/lemmy/post/components/Image.svelte'
    import Link                 from '$lib/components/input/Link.svelte'
    import PostActions          from '$lib/components/lemmy/post/components/PostActions.svelte'
    import PostBody             from '$lib/components/lemmy/post/components/PostBody.svelte'
    import PostEmbedDescription from '$lib/components/lemmy/post/components/PostEmbedDescription.svelte'
    import PostMeta             from '$lib/components/lemmy/post/components/PostMeta.svelte'
    import PostTitle            from '$lib/components/lemmy/post/components/PostTitle.svelte'

    // Standard for all post types
    export let post:PostView
    export let actions: boolean             = true
    export let inCommunity                  = false
    export let inProfile                    = false
    export let displayType: PostDisplayType = 'feed'
    export let postType: PostType           = 'video'
    export let inViewport                   = true
    export let compact: boolean             = true
    export let inModal: boolean             = false
    export let onHomeInstance: boolean      = false

    let source: string | undefined          = post.post.embed_video_url ?? post.post.url!
    let clickToPlayClicked                  = false
    let placeholderIcon                     = '/img/audio-wave-static.webp'
    let expandPreviewText: boolean
    let nsfw = post.post.nsfw

    // Return to thumbnail if collapsed into compact view
    $:  if (compact) clickToPlayClicked = false

    // Finesse the url and thumbnail URL to accommodate GIFs (and not thumbnail webms ugh) or when the thumbnanil is a static image but the embed URL is a GIF (Imgur)
    $:  post.post.id, post.post.url, post.post.embed_video_url, post.post.thumbnail_url, setup()

    function setup() {
        if (post.post.url && isAudio(post.post.url))                         source = imageProxyURL(post.post.url)
        if (post.post.embed_video_url && isAudio(post.post.embed_video_url)) source = imageProxyURL(post.post.embed_video_url)
    }

    onMount(() => setup())
</script>




{#if compact}

    <!---If there is no or a very short body text with the image, display it more compactly since the text won't have to flow around it--->
    {#if !post?.post.body || post.post.body.length < 250}

        <PostMeta bind:post showTitle={false} {postType} {actions} {inCommunity} {inProfile} {inModal} {onHomeInstance} {compact} on:toggleCompact={() => compact = !compact} />    

            <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
                <div class="flex flex-col gap-1 w-full">
                    <PostTitle {postType} bind:post />
                    
                    <PostEmbedDescription {compact} title={post.post.embed_title} on:clickThumbnail={() => compact = false}
                        description={post.post.embed_description} 
                        url={post.post.url}
                        showThumbnail={($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true} 
                        thumbnail_urls={[post.post.thumbnail_url, post.post.url, post.post.embed_video_url, placeholderIcon]}
                        nsfw={nsfw}
                    > 
                        <ArchiveLinkSelector url={post.post?.url} {postType} />    
                        <Link href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
                        
                    </PostEmbedDescription>
                    

                    <PostBody bind:post bind:expandPreviewText {displayType}  />
                    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
                    <PostActions  bind:post {inModal} {displayType}  {onHomeInstance} on:reply class="mt-2" />
                </div>
            </div>
    
    <!---Separate out the components and let the post body flow around the thumbnail image--->
    {:else}
        <PostMeta bind:post showTitle={false} {postType} {actions} {inCommunity} {inModal} {inProfile} {onHomeInstance} {compact} on:toggleCompact={() => compact = !compact} />    
        
        <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
            <div class="flex flex-col w-full gap-1">
                <PostTitle {postType} bind:post />

                <PostBody bind:post bind:expandPreviewText {displayType} class="my-1" >
                    <CompactPostThumbnail bind:post url={placeholderIcon} {displayType} float slot="thumbnail" 
                        showThumbnail = {($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true}
                        on:toggleCompact={() => compact = !compact}
                    />
                </PostBody>

                <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
                
                <div class="mt-2" />
                <PostActions  bind:post {inModal} {displayType}  {onHomeInstance} on:reply />
            </div>
        </div>
    {/if}

<!---Card View--->
{:else}
    <PostMeta bind:post showTitle={true} {postType} {actions} {inCommunity} {inProfile} {inModal} {onHomeInstance} {compact} on:toggleCompact={() => compact = !compact} />

    <PostEmbedDescription {compact} title={post.post.embed_title} description={post.post.embed_description}  url={post.post.url} > 
        <ArchiveLinkSelector url={post.post?.url} {postType} />    
        <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
    </PostEmbedDescription>
    

    <!---Render as Video if Click to Play Has Been Clicked--->
    {#if clickToPlayClicked && source}
        <AudioPlayer url={source} thumbnail_url={post.post.thumbnail_url} alt_text={post.post.alt_text ?? post.post.name} {inViewport} autoplay/>

    <!---Render as a Click-to-Play Thumbnail--->
    {:else}
        <Image url={post.post.thumbnail_url ?? placeholderIcon} clickToPlay {displayType} nsfw={nsfw} zoomable={false} class="min-h-[300px]" 
            on:click={(e)=> clickToPlayClicked = true }
        />
    {/if}

    <PostBody bind:post bind:expandPreviewText {displayType}  />
    <Crossposts bind:post size="xs" {onHomeInstance} class="mb-1 !pl-0"/>
    <PostActions  bind:post {inModal} {displayType} {onHomeInstance} on:reply class="mt-2" />

{/if}












