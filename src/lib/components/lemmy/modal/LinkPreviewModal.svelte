<script lang="ts">
    /*
        Issues:

        1.  Clicking a hashtag throws an unhandled exception

        2.  Bandcamp component seems to be in some kind of race condition and does not render the embed (thumbnail only)
            - Solved: Needed to run post type detection _after_ fetching embed URL
        3.  Preview images are too large
            - Changed modal max width to 3xl
        
            4.  Clicking links inside the preview's embed description do not worok
        
    */
    
    import type { 
        GetSiteMetadataResponse,
        PostView
    } from "lemmy-js-client"
    
    import { 
        type PostDisplayType,
        buildYouTubeEmbedLink,
        createFakePostView,
        isImage,
        isAudio,
        isVideo,
        isYoutubeLikeVideo,
        postType as getPostType,

        type PostType

    } from "../post/helpers"

    import { dispatchWindowEvent } from '$lib/ui/events'
    import { getClient } from "$lib/lemmy"
    import { onMount } from "svelte";
    import { fade } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { userSettings } from '$lib/settings'
    
    import Button from "$lib/components/input/Button.svelte"
    import Link from "$lib/components/input/Link.svelte"
    import Markdown from "$lib/components/markdown/Markdown.svelte";
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import Placeholder from "$lib/components/ui/Placeholder.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    
    // Post Media Renderers
    import PostBody from "$lib/components/lemmy/post/PostBody.svelte";
    import PostBandcamp from '$lib/components/lemmy/post/PostBandcamp.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import PostOdysee from '$lib/components/lemmy/post/PostOdysee.svelte'
    import PostPeerTube from '$lib/components/lemmy/post/PostPeerTube.svelte'
    import PostSongLink from '$lib/components/lemmy/post/PostSongLink.svelte'
    import PostSpotify from '$lib/components/lemmy/post/PostSpotify.svelte'
    import PostSoundCloud from '$lib/components/lemmy/post/PostSoundCloud.svelte'
    import PostVideo from '$lib/components/lemmy/post/PostVideo.svelte'
    import PostVimeo from '$lib/components/lemmy/post/PostVimeo.svelte'
    import PostYouTube from '$lib/components/lemmy/post/PostYouTube.svelte'

    import { 
        ArrowLeftCircle,
        ExclamationTriangle,
        Icon,
        Link as LinkIcon,
        XCircle,
    } from "svelte-hero-icons";
    
    
    export let url: string
    export let open: boolean = false

    let loading = false
    let data: GetSiteMetadataResponse|undefined = undefined
    let postContainer:HTMLDivElement
    let post: PostView | undefined  = undefined
    let postType: PostType
    let displayType='post' as PostDisplayType    
    let fetchError = false
    let previewHistory = [] as string[]

    function addToHistory(item:string) {
        if (!previewHistory.includes(item)) {
            previewHistory.push(item)
            previewHistory = previewHistory
        }
    }

    function goBack() {
        previewHistory.pop()
        url = previewHistory[previewHistory.length-1]
        previewHistory = previewHistory
    }
    
    $: loop = $userSettings.embeddedMedia.loop ?? false
    $: url, loadData()

    async function loadData() {
        loading = true
        post = undefined
        
        addToHistory(url)

        if (!url) {
            open = false
            toast({
                title: 'Error',
                type: 'error',
                content: 'No or invalid URL defined'
            })
            return
        }

        // Create a fake post view so the post renderers can be re-used
        post = createFakePostView()
        post.post.url = url
        

        // Don't try to pull metadata for direct media links
        if (isImage(url) || isAudio(url) || isVideo(url)) {
            postType = getPostType(post)
            loading = false
            return
        }
       
        
        try {
            data = await getClient().getSiteMetadata({url: url})

            post.post.embed_video_url = data.metadata.embed_video_url 
            post.post.thumbnail_url = data.metadata.image
            post.post.body = data.metadata.description

            postType = getPostType(post)

            // Build a YT-like embed link if one is not provided (usually if Piped source)
            if (!post.post.embed_video_url && postType == 'youtube') {
                post.post.embed_video_url = isYoutubeLikeVideo(url)
                    ? buildYouTubeEmbedLink(url)?.toString()
                    : undefined
            }
            post = post
        }
        catch {
            fetchError = true
        }
        finally {
            loading = false
        }
    }
</script>

<Modal bind:open icon={LinkIcon} width="max-w-3xl" title={'Preview'}>

    {#if loading}
        <span class="flex mx-auto my-auto" transition:fade>
            <Spinner width={24}/>
        </span>
    {/if}

    {#if fetchError}
        <Placeholder title="Error Fetching Metadata" icon={ExclamationTriangle} 
            description="Unable to load the metadata for {url}" 
        />
    {/if}

    {#if post && !loading && !fetchError}

        <div bind:this={postContainer} class="flex flex-col gap-2 w-full" transition:fade>    

            <!--- Title --->
            <div class="flex flex-row justify-between w-full">
                {#if data?.metadata?.title}
                    <h1 class="!text-base !font-bold">{data.metadata.title}</h1>
                {/if}
            </div>
            
            <!--- Link-style post without thumbnail URL--->
            {#if postType == "link" || postType == "thumbLink"}
                <PostLink bind:post {displayType} />
            {/if}

            <!--- Direct Image Post --->
            {#if postType == "image"}
                <PostImage bind:post {displayType}/>
            {/if}
                
            <!--- Direct Video Post --->
            {#if postType == "video"}
                <PostVideo bind:post bind:postContainer {displayType} loop={loop}/>
            {/if}

            <!--- Bandcamp Embed --->
            {#if postType == "bandcamp"}
                <PostBandcamp bind:post bind:postContainer {displayType}/>
            {/if}

            <!--- YouTube Video Post (or other supported embed: YT, Invidious, Spotify --->
            {#if postType == "youtube"}
                <PostYouTube bind:post bind:postContainer {displayType} />
            {/if}

            <!--- Spotify Embed --->
            {#if postType == "spotify"}
                <PostSpotify bind:post bind:postContainer {displayType} />
            {/if}

            <!--- Soundcloud Embed --->
            {#if postType == "soundcloud"}
                <PostSoundCloud bind:post bind:postContainer {displayType} />
            {/if}

            <!--- Vimeo Embed --->
            {#if postType == "vimeo"}
                <PostVimeo bind:post bind:postContainer {displayType} />
            {/if}

            <!--- Odysee Embed --->
            {#if postType == "odysee"}
                <PostOdysee bind:post bind:postContainer {displayType} />
            {/if}

            <!--- SongLink Embed --->
            {#if postType == "songlink"}
                <PostSongLink bind:post bind:postContainer {displayType} />
            {/if}

            <!---Peertube Embed--->
            {#if postType == 'peertube'}
                <PostPeerTube bind:post bind:postContainer {displayType} />
            {/if}

            <PostBody bind:post bind:postContainer {displayType} />

        </div>

    {/if}
    
    <span class="mt-2" />

    <div class="flex flex-row w-full justify-between">
        <Button color="danger" size="lg" icon={XCircle} iconSize={20} on:click={()=> open = false}>
            Close
        </Button>
        
        
        <Button color="tertiary-border" icon={ArrowLeftCircle} iconSize={20} size="lg" title="Back" on:click={() => goBack() } disabled={previewHistory.length < 2}>
            Back
        </Button>
        

        <Button color="primary" size="lg" icon={LinkIcon} iconSize={20} href={url} newtab={$userSettings.openInNewTab.links}>
            Go to URL
        </Button>
    </div>
</Modal>

