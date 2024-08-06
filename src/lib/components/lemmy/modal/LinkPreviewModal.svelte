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
    import { fade } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { userSettings } from '$lib/settings'
    
    import Button from "$lib/components/input/Button.svelte"
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
        Icon,
        Link as LinkIcon,
        Share,
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
    $: autoplay = $userSettings.embeddedMedia.autoplay ?? false
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
            
            <PostMediaRenderers bind:post bind:postContainer bind:displayType bind:postType bind:autoplay bind:loop />

            <PostBody bind:post bind:postContainer {displayType} />

        </div>

    {/if}
    
    <span class="mt-2" />

    <div class="flex flex-row w-full justify-between">
        <Button color="danger" size="lg" icon={XCircle} iconSize={20} on:click={()=> open = false}>
            <span class="hidden md:flex">Close</span>
        </Button>
        
        <span class="flex flex-row gap-2">
            <Button color="tertiary-border" icon={ArrowLeftCircle} iconSize={20} size="lg" title="Back" on:click={() => goBack() } disabled={previewHistory.length < 2}>
                <span class="hidden md:flex">Back</span>
            </Button>

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
        </span>
        

        <Button color="primary" size="lg" icon={ArrowTopRightOnSquare} iconSize={20} href={url} newtab={$userSettings.openInNewTab.links}
            on:click={() => open = false }
        >
            Go
        </Button>
    </div>
</Modal>

