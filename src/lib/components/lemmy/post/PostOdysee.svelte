<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import IFrame from './utils/IFrame.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import { imageSize} from './helpers.js'

    export let post: PostView
    export let displayType: PostDisplayType
    export let autoplay:boolean|undefined = undefined;
    export let postContainer:HTMLDivElement

    let videoID:    string | null | undefined
    let embedURL:   URL 
    let size: string = imageSize(displayType);
    let inViewport = false
    let clickToPlayClicked = false
    
    
    $:  if (post.post?.url) {
            // Parse URLs to pick out video IDs to create embed URLs
            videoID = new URL(post.post.url).pathname.replace('/','')
            
            embedURL = new URL("https://odysee.com")
            embedURL.searchParams.set('autopause', '0')

            // Append the video ID to the embed URL
            embedURL.pathname = `/$/embed/${videoID}`

            
            if (displayType ==  'post' && (autoplay ?? $userSettings.embeddedMedia.autoplay)) {
                embedURL.searchParams.set('autoplay', '1')
            }
        
            // Start time: Can be either t (legacy) or start
            let startTime = new URL(post.post.url!).searchParams.get('t');
            if (startTime) {
                embedURL.searchParams.set('t', startTime)
            }
            
        }

    $:  showAsEmbed = embedURL && (clickToPlayClicked && inViewport) || (
            (displayType == 'feed' && inViewport && $userSettings.embeddedMedia.feed && (!post.post.nsfw || !$userSettings.nsfwBlur)) ||
            (displayType == 'post' && $userSettings.embeddedMedia.post)
        )

    // Unset click to play when out of viewport (revert to thumbnail)
    $:  if (!inViewport) clickToPlayClicked = false

</script>


<PostIsInViewport bind:postContainer bind:inViewport />

{#if showAsEmbed}
    <Link href={post.post.url} newtab={$userSettings.openInNewTab.links}  title={post.post.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
    <IFrame bind:embedURL bind:size bind:title={post.post.name} />

{:else if post?.post?.thumbnail_url}
    
    <Link href={post.post.url} title={post.post.name} newtab={$userSettings.openInNewTab.links} highlight nowrap />
    <PostImage bind:post={post} displayType={displayType} clickToPlay={true} zoomable={false} class="min-h-[300px]" on:click={(e)=> clickToPlayClicked=true}/>

{:else if !post?.post?.thumbnail_url}
    <Link href={post.post.url} title={post.post.name} highlight nowrap />
{/if}