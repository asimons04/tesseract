<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings  } from '$lib/settings.js'

    import Link from '$lib/components/input/Link.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'

    export let post: PostView
    export let displayType: PostDisplayType
    export let postContainer: HTMLDivElement
    
    let clickToPlayClicked = false
    let embedURL:   string = ""
    let inViewport = false

    // Generate the embed URL for the given post URL
    $:  if (post.post && post.post.embed_video_url) {
            embedURL = post.post.embed_video_url
            let opts = "/bgcol=1F1F24/";
            opts += "/linkcol=F4F4F5/";
            //opts += "/transparent=true/"
            embedURL += opts;
        }

    $:  showAsEmbed = embedURL && (clickToPlayClicked && inViewport) || (
            (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
            (displayType == 'post' && $userSettings.embeddedMedia.post)
        )
    
    // Unset click to play when out of viewport (revert to thumbnail)
    $:  if (!inViewport) clickToPlayClicked = false

</script>

<style>
    .flexiframe-container {
        position: relative;
        overflow: hidden;
        padding-top: 56.25%;
        max-width: 627px;
    }

    .flexiframe {
        position: absolute;
        top: 0;
        left: 0;
        height: 120px;
        width: 100%;
        border:0;
    }
</style>

<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed}
    <Link href={post.post.url} newtab={$userSettings.openInNewTab.links} title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>

    <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
        
        <!--- Album Art from Thumbnail --->
        {#if post.post.thumbnail_url}
        <div class="max-w-full">
            <div class="ml-auto mr-auto h-auto} max-w-[627px]">
                <picture class="rounded-md overflow-hidden  max-h-[min(50vh,500px)] max-w-full"> <!--max-h-[min(50vh,500px)]--->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <img
                        src="{imageProxyURL(post.post.thumbnail_url)}"
                        alt="{post.post.name}"
                        loading="lazy"
                        class="object-cover rounded-md h-auto z-30"
                    />
                </picture>
            </div>
        </div>
        {/if}
        <!--- End Album Art from Thumbnail--->
        
        <!---Iframe with player--->
        <div class="overflow-hidden  relative mt-[-120px]  max-w-full max-h-[128px]">
            <div class="ml-auto mr-auto w-full}">
                <div class="flexiframe-container  max-w-screen max-h-[128px] mx-auto">
                    <iframe 
                        class="flexiframe rounded-b-md"
                        src="{embedURL}" 
                        allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                        loading="lazy"
                        allowfullscreen
                        title="Bandcamp: {post.post.name}"
                    >
                    </iframe>
                </div>
            </div>
        </div>
        <!---End Iframe with Player--->
        
        
    </div>

{:else if post.post.thumbnail_url}
    <!---Create image post if user has media embeds enabled for posts--->    
    <Link
        href={post.post.url}
        title={post.post.name}
        newtab={$userSettings.openInNewTab.links}
        highlight nowrap
        domainOnly={!$userSettings.uiState.showFullURL}
    />
    <PostImage bind:post={post}  displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> clickToPlayClicked=true}/>
    


{:else if !post.post.thumbnail_url}
    <Link
        domainOnly={!$userSettings.uiState.showFullURL}    
        href={post.post.url}
        title={post.post.name}
        highlight nowrap
    />
{/if}