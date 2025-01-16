<script lang="ts">
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { isVideo } from '$lib/components/lemmy/post/helpers.js'
    import { userSettings } from '$lib/settings.js'

    import ArchiveLinkSelector from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import Image from '$lib/components/lemmy/post/components/Image.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import NSFWOverlay from '$lib/components/lemmy/post/components/NSFWOverlay.svelte'

    import VideoContainer from '../components/VideoContainer.svelte'
    import VideoPlayer from '../components/VideoPlayer.svelte'

    import PostActions from '$lib/components/lemmy/post/components/PostActions.svelte'
    import PostBody from '$lib/components/lemmy/post/components/PostBody.svelte'
    import PostEmbedDescription from '$lib/components/lemmy/post/components/PostEmbedDescription.svelte'
    import PostMeta from '$lib/components/lemmy/post/components/PostMeta.svelte'
    import PostTitle from '$lib/components/lemmy/post/components/PostTitle.svelte'
    
    import CompactPostThumbnail from '../utils/CompactPostThumbnail.svelte';
    import { imageProxyURL } from '$lib/image-proxy';
    import { onMount } from 'svelte';
    

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

    let source: string = post.post.embed_video_url ?? post.post.url!
    let clickToPlayClicked = false
    
    // Return to thumbnail if collapsed into compact view
    $:  if (compact) clickToPlayClicked = false

    // Finesse the url and thumbnail URL to accommodate GIFs (and not thumbnail webms ugh) or when the thumbnanil is a static image but the embed URL is a GIF (Imgur)
    $:  post.post.id, post.post.url, post.post.embed_video_url, post.post.thumbnail_url, setup()

    function setup() {
        if (isVideo(post.post.url))             source = imageProxyURL(post.post.url)!
        if (isVideo(post.post.embed_video_url)) source = imageProxyURL(post.post.embed_video_url)!
    }

    onMount(() => setup())

    $: showEmbedDescription = (post.post.embed_title && post.post.embed_description)
</script>




{#if compact}

    <!---If there is no or a very short body text with the image, display it more compactly since the text won't have to flow around it--->
    {#if !post?.post.body || post.post.body.length < 250}

        <PostMeta bind:post showTitle={false} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />    

            <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
                <div class="flex flex-col gap-1 {showEmbedDescription ? 'w-full' : 'w-[calc(100%-68px)] sm:w-[calc(100%-100px)]  md:w-[calc(100%-132px)]'}">
                    <PostTitle {post} />
                    
                    <!---Mostly used if Posting a Link to Another Lemmy Post--->
                    {#if showEmbedDescription}
                        <PostEmbedDescription {compact} title={post.post.embed_title} on:clickThumbnail={() => compact = false}
                            description={post.post.embed_description} 
                            url={post.post.url}
                            showThumbnail={($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true} 
                            thumbnail_urls={[post.post.embed_video_url, post.post.thumbnail_url, post.post.url]}
                        > 
                            <ArchiveLinkSelector url={post.post?.url} {postType} />    
                            <Link href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
                           
                        </PostEmbedDescription>
                    {/if}

                    <PostBody bind:post {displayType}  />
                    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
                    <PostActions  bind:post {displayType} on:reply class="mt-2" />
                </div>
                
                <!---If the Embed Description is Shown, the thumbnail will go there--->
                {#if !showEmbedDescription}
                    <CompactPostThumbnail bind:post bind:displayType 
                        showThumbnail = {($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true} 
                        on:toggleCompact={() => compact = !compact}
                    />
                {/if}
            </div>
    
    <!---Separate out the components and let the post body flow around the thumbnail image--->
    {:else}
        <PostMeta bind:post showTitle={false} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />    
        
        <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
            <div class="flex flex-col w-full gap-1">
                <PostTitle bind:post />

                <PostBody bind:post {displayType} class="my-1" >
                    <CompactPostThumbnail {post} {displayType} float slot="thumbnail" 
                        showThumbnail = {($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true}
                        on:toggleCompact={() => compact = !compact}
                    />
                </PostBody>

                <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
                
                <div class="mt-2" />
                <PostActions  bind:post {displayType} on:reply />
            </div>
        </div>
    {/if}

<!---Card View--->
{:else}
    <PostMeta bind:post showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />

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

    <PostBody bind:post {displayType}  />
    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
    <PostActions  bind:post {displayType} on:reply class="mt-2"/>

{/if}












