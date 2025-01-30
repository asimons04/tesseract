<script lang="ts">
    import type { PostDisplayType, PostType } from '$lib/components/lemmy/post/helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { isVideo } from '$lib/components/lemmy/post/helpers.js'
    import { userSettings } from '$lib/settings.js'

    import ArchiveLinkSelector  from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import CompactPostThumbnail from '$lib/components/lemmy/post/utils/CompactPostThumbnail.svelte'
    import Crossposts           from '$lib/components/lemmy/post/components/Crossposts.svelte'
    import Image                from '$lib/components/lemmy/post/components/Image.svelte'
    import Link                 from '$lib/components/input/Link.svelte'
    import PostActions          from '$lib/components/lemmy/post/components/PostActions.svelte'
    import PostBody             from '$lib/components/lemmy/post/components/PostBody.svelte'
    import PostEmbedDescription from '$lib/components/lemmy/post/components/PostEmbedDescription.svelte'
    import PostMeta             from '$lib/components/lemmy/post/components/PostMeta.svelte'
    import PostTitle            from '$lib/components/lemmy/post/components/PostTitle.svelte'
    import VideoPlayer          from '$lib/components/players/VideoPlayer.svelte'
    
    
    import { imageProxyURL } from '$lib/image-proxy';
    import { onMount } from 'svelte';
    

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

    let source: string = post.post.embed_video_url ?? post.post.url!
    let clickToPlayClicked = false
    let expandPreviewText: boolean
    
    // Return to thumbnail if collapsed into compact view
    $:  if (compact) clickToPlayClicked = false

    // Finesse the url and thumbnail URL to accommodate GIFs (and not thumbnail webms ugh) or when the thumbnanil is a static image but the embed URL is a GIF (Imgur)
    $:  post.post.id, post.post.url, post.post.embed_video_url, post.post.thumbnail_url, setup()

    function setup() {
        if (post.post.url && isVideo(post.post.url))                            source = imageProxyURL(post.post.url)!
        if (post.post.embed_video_url && isVideo(post.post.embed_video_url))    source = imageProxyURL(post.post.embed_video_url)!
    }

    onMount(() => setup())
</script>




{#if compact}

    <!---If there is no or a very short body text with the image, display it more compactly since the text won't have to flow around it--->
    {#if !post?.post.body || post.post.body.length < 250}

        <PostMeta bind:post showTitle={false} {postType} {actions} {inCommunity} {inProfile} {inModal} {compact} on:toggleCompact={() => compact = !compact} />    

            <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
                <div class="flex flex-col gap-1 w-full">
                    <PostTitle bind:post {postType} />

                    <PostEmbedDescription {compact} title={post.post.embed_title} on:clickThumbnail={() => compact = false}
                        description={post.post.embed_description} 
                        url={post.post.url}
                        showThumbnail={($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true} 
                        thumbnail_urls={[post.post.thumbnail_url, post.post.url, post.post.embed_video_url]}
                    > 
                        <ArchiveLinkSelector url={post.post?.url} {postType} />    
                        <Link href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
                        
                    </PostEmbedDescription>


                    <PostBody bind:post bind:expandPreviewText {displayType}  />
                    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
                    <PostActions  bind:post {inModal} {displayType} on:reply class="mt-2" />
                </div>
            </div>
    
    <!---Separate out the components and let the post body flow around the thumbnail image--->
    {:else}
        <PostMeta bind:post showTitle={false} {postType} {actions} {inCommunity} {inProfile} {inModal} {compact} on:toggleCompact={() => compact = !compact} />    
        
        <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
            <div class="flex flex-col w-full gap-1">
                <PostTitle bind:post {postType} />

                <PostBody bind:post bind:expandPreviewText {displayType} class="my-1" >
                    <CompactPostThumbnail bind:post {displayType} float slot="thumbnail" 
                        showThumbnail = {($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true}
                        on:toggleCompact={() => compact = !compact}
                    />
                </PostBody>

                <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
                
                <div class="mt-2" />
                <PostActions  bind:post {inModal} {displayType} on:reply />
            </div>
        </div>
    {/if}

<!---Card View--->
{:else}
    <PostMeta bind:post showTitle={true} {postType} {actions} {inCommunity} {inProfile} {inModal} {compact} on:toggleCompact={() => compact = !compact} />

    <PostEmbedDescription {compact} title={post.post.embed_title} description={post.post.embed_description}  url={post.post.url} > 
        <ArchiveLinkSelector url={post.post?.url} {postType} />    
        <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
    </PostEmbedDescription>
    

    <!---Render as Video if Click to Play Has Been Clicked--->
    {#if clickToPlayClicked}
        <VideoPlayer {source} {displayType} {inViewport} autoplay={true}/>

    <!---Render as a Click-to-Play Thumbnail--->
    {:else}
        <Image url={post.post.thumbnail_url ?? source ?? '/img/loops.png'} clickToPlay {displayType} nsfw={post.post.nsfw} zoomable={false} class="min-h-[300px]" 
            on:click={(e)=> clickToPlayClicked = true }
        />
    {/if}

    <PostBody bind:post bind:expandPreviewText {displayType}  />
    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
    <PostActions  bind:post {inModal} {displayType} on:reply class="mt-2"/>

{/if}












