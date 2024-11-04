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
    
    import Button from "$lib/components/input/Button.svelte"
    import IFrame from "../post/utils/IFrame.svelte"
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import Placeholder from "$lib/components/ui/Placeholder.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    
    // Post Media Renderers
    import PostBody from "$lib/components/lemmy/post/PostBody.svelte";
    import PostMediaRenderers from "$lib/components/lemmy/post/PostMediaRenderers.svelte";
    

    import { 
        ArrowLeftCircle,
        ArrowTopRightOnSquare,
        ExclamationTriangle,
        Eye,
        Icon,
        Link as LinkIcon,
        Share,
        Window,
        XCircle,
    } from "svelte-hero-icons";
    import PostLink from "../post/PostLink.svelte";
    
    
    export let url: string
    export let open: boolean = false
    export let iframe: boolean = false

    let loading = false
    let data: GetSiteMetadataResponse|undefined = undefined
    let postContainer:HTMLDivElement
    let post: PostView | undefined  = undefined
    let postType: PostType
    let displayType='post' as PostDisplayType    
    let fetchError = false
    let previewHistory = [] as string[]
    
    let iframeView: boolean = false
    let iframeURL: URL | undefined = undefined

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

    async function setIframeURL() {
        try {
            iframeURL = new URL(url)
            if (iframe || url.endsWith('.pdf')) iframeView = true
        }
        catch {
            iframeURL = undefined
        }
    }
    
    $: loop = $userSettings.embeddedMedia.loop ?? false
    $: autoplay = $userSettings.embeddedMedia.autoplay ?? false
    $: url, loadData()
    $: url, setIframeURL()

    

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
            post = post
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

<Modal bind:open icon={LinkIcon} width="max-w-3xl" title={'Preview'} allowMaximize>

    <!---Show link/mbfc while loading.  If Metadata fails to fetch, sill show the URL and MBFC (if available)--->
    {#if !iframeView && (loading || fetchError)}
        <div class="flex flex-col {post ? 'min-h-[45vh]' : 'h-auto'}">

            
            {#if post}
                <PostLink bind:post {displayType} />
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

    {#if post && !loading && !fetchError && !iframeView}

        <div bind:this={postContainer} class="flex flex-col gap-2 w-full min-h-[250px]" transition:slide>    

            <!--- Title --->
            <div class="flex flex-row justify-between w-full">
                {#if data?.metadata?.title}
                    <h1 class="!text-base !font-bold">{data.metadata.title}</h1>
                {/if}
            </div>
            <PostMediaRenderers bind:post bind:postContainer bind:displayType bind:postType bind:autoplay bind:loop />
            <PostBody bind:post bind:postContainer {displayType} />
        </div>
    {/if}

    {#if iframeView}
        <div class="flex flex-col gap-2 w-full min-h-[250px]" transition:slide>
            <IFrame embedURL={new URL(url)} />
        </div>
    {/if}
    

    <div class="flex flex-row w-full justify-between" slot="buttons">
        <Button color="danger" size="lg" icon={XCircle} iconSize={20} on:click={()=> open = false}>
            <span class="hidden md:flex">Close</span>
        </Button>
        
        <span class="flex flex-row gap-2">
            <!---Go  Back to previos preview--->
            <Button color="tertiary-border" icon={ArrowLeftCircle} iconSize={20} size="lg" title="Back" on:click={() => goBack() } disabled={previewHistory.length < 2}>
                <span class="hidden md:flex">Back</span>
            </Button>

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
            <span class="hidden md:flex">
                <Button color="tertiary-border" size="lg" iconSize={20} icon={iframeView ? Eye : Window}
                    disabled={!iframeURL}
                    on:click={() => iframeView = !iframeView}
                >
                    <span class="hidden md:flex">
                        {iframeView ? 'Preview' : 'IFrame'}
                    </span>
                </Button>
            </span>
        </span>
        
        

        <Button color="primary" size="lg" icon={ArrowTopRightOnSquare} iconSize={20} href={url} newtab={$userSettings.openInNewTab.links}
            on:click={() => open = false }
        >
            Go
        </Button>
    </div>
</Modal>

