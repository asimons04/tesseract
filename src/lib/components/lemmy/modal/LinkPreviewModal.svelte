<script lang="ts">
    /*
        Issues:
        1.  Clicking a hashtag throws an unhandled exception
        4.  Clicking links inside the preview's embed description do not worok
        
    */
    
    import type { 
        GetSiteMetadataResponse,
        PostView
    } from "lemmy-js-client"
    
    import { 
        type PostDisplayType,
        type PostType,
        buildYouTubeEmbedLink,
        createFakePostView,
        isImage,
        isAudio,
        isVideo,
        isYoutubeLikeVideo,
        postType as getPostType,
    } from "../post/helpers"

    import { getClient } from "$lib/lemmy"
    import { fade, slide } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { userSettings } from '$lib/settings'
    
    import ArchiveLinkSelector  from "$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte"
    import AudioPlayer          from "$lib/components/players/AudioPlayer.svelte"
    import BandcampPlayer       from "$lib/components/players/BandcampPlayer.svelte"
    import Button               from "$lib/components/input/Button.svelte"
    import DailyMotionPlayer    from '$lib/components/players/DailyMotionPlayer.svelte'
    import IFrame               from "$lib/components/lemmy/post/utils/IFrame.svelte"
    import Image                from "$lib/components/lemmy/post/components/Image.svelte"
    import Link                 from "$lib/components/input/Link.svelte"
    import LoopsPlayer          from "$lib/components/players/LoopsPlayer.svelte"
    import MBFC                 from "$lib/MBFC/MBFC.svelte"
    import Modal                from "$lib/components/ui/modal/Modal.svelte"
    import OdyseePlayer         from "$lib/components/players/OdyseePlayer.svelte"
    import PeerTubePlayer       from '$lib/components/players/PeerTubePlayer.svelte'
    import Placeholder          from "$lib/components/ui/Placeholder.svelte"
    import PostEmbedDescription from "$lib/components/lemmy/post/components/PostEmbedDescription.svelte"
    import SongLinkPlayer       from '$lib/components/players/SongLinkPlayer.svelte'
    import SoundCloudPlayer     from '$lib/components/players/SoundCloudPlayer.svelte'
    import Spinner              from "$lib/components/ui/loader/Spinner.svelte"
    import SpotifyPlayer        from '$lib/components/players/SpotifyPlayer.svelte'
    import TidalPlayer          from "$lib/components/players/TidalPlayer.svelte"
    import VideoPlayer          from '$lib/components/players/VideoPlayer.svelte'
    import VimeoPlayer          from '$lib/components/players/VimeoPlayer.svelte'
    import YouTubePlayer        from "$lib/components/players/YouTubePlayer.svelte"

    import { 
        ArrowLeftCircle,
        ArrowTopRightOnSquare,
        ExclamationTriangle,
        Eye,
        Link as LinkIcon,
        Share,
        Window,
        XCircle,
    } from "svelte-hero-icons";
    
    
    
    
    
    
    
    
    
    export let url: string
    export let open: boolean = false
    export let iframe: boolean = false

    let loading = false
    let data: GetSiteMetadataResponse|undefined = undefined
    let post: PostView | undefined  = undefined
    let postType: PostType
    let displayType='feed' as PostDisplayType    
    let fetchError = false
    
    let iframeView: boolean = false
    let iframeURL: URL | undefined = undefined
    let compact = true
    let title = "Preview"
    let noPreview = false

    async function setIframeURL() {
        try {
            //Test that the URL is valid
            iframeURL = new URL(url)
            
            // PDF Links
            if (iframe || url.endsWith('.pdf')) {
                title = "Document Viewer"
                iframeView = true
                noPreview = true
            }

            // Wikipedia
            if (iframeURL.hostname.includes('wikipedia.org')) {
                title = "Wikipedia"
                iframeView = true
                noPreview = true
            }
        }
        catch {
            iframeURL = undefined
        }
    }

    $: url, loadData()
    

    async function loadData() {
        // Some links should always be an iframe (PDF, Wikipedia so far).  If the link is iframe-able, stop processing
        setIframeURL()
        if (iframeView) return
        

        loading = true
        post = undefined
        
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
            post = post
            loading = false
            return
        }
       
        
        try {
            data = await getClient().getSiteMetadata({url: url})

            post.post.embed_video_url = data.metadata.embed_video_url 
            post.post.thumbnail_url = data.metadata.image
            post.post.embed_description = data.metadata.description
            post.post.embed_title = data.metadata.title

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

<Modal bind:open preventCloseOnClickOut icon={LinkIcon} height="max-h-full" width="max-w-3xl" {title} allowMaximize>

    <!---Show link/mbfc while loading.  If Metadata fails to fetch, sill show the URL and MBFC (if available)--->
    {#if !iframeView && (loading || fetchError)}
        <div class="flex flex-col {post ? 'min-h-[45vh]' : 'h-auto'}">

            
            {#if post}
                <PostEmbedDescription url={post.post.url} compact>
                    <ArchiveLinkSelector url={post.post?.url} {postType}/>
                    <Link class="text-xs" href={post.post?.url} newtab={true} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
                    <MBFC bind:post rightJustify={true}/>
                </PostEmbedDescription>
            {/if}

            {#if loading && !iframeView}
                <span class="flex mx-auto my-auto" transition:fade>
                    <Spinner width={24}/>
                </span>
            {/if}

            {#if fetchError}
                <Placeholder title="Error Fetching Metadata" icon={ExclamationTriangle} 
                    description="Unable to load the metadata for {url}" 
                />
            {/if}
        </div>
    {/if}

    <!---Render the Link Preview--->
    {#if post && !loading && !fetchError && !iframeView}

        <div class="flex flex-col gap-2 w-full max-h-full {['link', 'thumbLink'].includes(postType) ? 'min-h-[450px]' : ''}" transition:slide>    
            <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail={() => compact = !compact}
                description={post.post.embed_description} 
                url={post.post.url}
                showThumbnail
                thumbnail_url={post.post.thumbnail_url}
                {compact}
                expandDetails={['link', 'thumbLink'].includes(postType)}
            >
                
                <ArchiveLinkSelector url={post.post?.url} {postType}/>
                <Link class="text-xs" href={post.post?.url} newtab={true} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
                <MBFC bind:post rightJustify={true}/>
                
    
            </PostEmbedDescription>
            
            <!---Audio File--->
            {#if post.post.url && postType == 'audio'}
                <AudioPlayer url={post.post.url} />
            {/if}
            
            <!---Bandcamp--->
            {#if post.post.embed_video_url && postType == 'bandcamp'}
                <BandcampPlayer embed_url={post.post.embed_video_url} thumbnail_url={post.post.thumbnail_url} alt_text={post.post.name} {displayType}  />
            {/if}

            <!---DailyMotion--->
            {#if post.post.url && postType == 'dailymotion'}
                <DailyMotionPlayer {displayType}  url={post.post.url}  thumbnail_url={post.post.thumbnail_url} />
            {/if}

            <!---Image--->
            {#if post.post.url && postType == 'image'}
                <Image url={post.post.url} zoomable {displayType} />
            {/if}

            <!---Link with Thumbnail--->
            {#if !compact && postType=='thumbLink' && post.post.thumbnail_url}
                <Image url={post.post.thumbnail_url} zoomable {displayType} />
            {/if}

            <!---Loops--->
            {#if post.post.url && postType=='loops'}
                <LoopsPlayer url={post.post.url} thumbnail_url={post.post.thumbnail_url} {displayType} />
            {/if}

            <!----Odysee--->
            {#if post.post.url && postType=='odysee'}
                <OdyseePlayer url={post.post.url}  />
            {/if}

            <!---Peertube--->
            {#if post.post.embed_video_url && postType=='peertube'}
                <PeerTubePlayer url={post.post.embed_video_url}  />
            {/if}

            <!---SongLink--->
            {#if post.post.url && postType=='songlink'}
                <SongLinkPlayer url={post.post.url} {displayType} />
            {/if}

            <!---Soundcloud--->
            {#if post.post.url && postType=='soundcloud'}
                <SoundCloudPlayer url={post.post.url} embed_video_url={post.post.embed_video_url}  />
            {/if}

            <!---Spotify--->
            {#if post.post.url && postType=='spotify'}
                <SpotifyPlayer url={post.post.url}  />
            {/if}
            
            {#if post.post.url && postType=='tidal'}
                <TidalPlayer url={post.post.url} />
            {/if}
            
            <!---Video--->
            {#if post.post.url && postType=='video'}
                <VideoPlayer source={post.post.embed_video_url ?? post.post.url} thumbnail={post.post.thumbnail_url} {displayType}/>
            {/if}

            <!---Vimeo--->
            {#if post.post.url && postType=='vimeo'}
                <VimeoPlayer url={post.post.url} {displayType}  />
            {/if}

            <!---YouTube--->
            {#if post.post.url && postType == 'youtube'}
                <YouTubePlayer url={post.post.url}/>
            {/if}
            
        </div>
    {/if}

    {#if iframeView}
        <div class="flex flex-col gap-2 w-full min-h-[250px]" transition:slide>
            <IFrame embedURL={iframeURL ?? new URL(url)} maximized={true} />
        </div>
    {/if}
    

    <div class="flex flex-row w-full justify-between" slot="buttons">
        <Button color="danger" size="lg" icon={XCircle} iconSize={20} on:click={()=> open = false}>
            <span class="hidden md:flex">Close</span>
        </Button>
        
        <span class="flex flex-row gap-2">
            <!---Copy Link to Clipboard--->
            <Button color="tertiary-border" icon={Share} iconSize={20} size="lg" title="Copy Link" 
                on:click={() => {
                    navigator.clipboard.writeText(url)
                    toast({
                        type: 'success',
                        content: `Copied current URL to clipboard.`,
                        title: 'Copied'
                    })
                }}
            >
                <span class="hidden md:flex">Copy Link</span>
            </Button>

            <!---Try to View Link in iFrame--->
            {#if !noPreview}
                <Button color="tertiary-border" size="lg" iconSize={20} icon={iframeView ? Eye : Window}
                    disabled={!iframeURL}
                    on:click={() => iframeView = !iframeView}
                >
                    <span class="hidden md:flex">
                        {iframeView ? 'Preview' : 'IFrame'}
                    </span>
                </Button>
            {/if}
        </span>
        
        

        <Button color="primary" size="lg" icon={ArrowTopRightOnSquare} iconSize={20} href={url} newtab={true}
            on:click={() => open = false }
        >
            Go
        </Button>
    </div>
</Modal>

