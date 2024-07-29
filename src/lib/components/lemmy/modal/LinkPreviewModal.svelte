<script lang="ts">
    import type { GetSiteMetadataResponse } from "lemmy-js-client"

    import { 
        type PostType,
        buildYouTubeEmbedLink,
        createFakePostView,
        isYoutubeLikeVideo, 
        postType as getPostType
    } from '$lib/components/lemmy/post/helpers'

    import { dispatchWindowEvent } from '$lib/ui/events'
    import { getClient } from "$lib/lemmy"
    import { imageProxyURL } from "$lib/image-proxy"
    import { onMount } from "svelte";
    import { profile } from '$lib/auth'
    import { fade } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { userSettings } from '$lib/settings'
    
    import Button from "$lib/components/input/Button.svelte"
    import IFrame from "$lib/components/lemmy/post/utils/IFrame.svelte"
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    
    import { 
        Icon,
        Link as LinkIcon,
    } from "svelte-hero-icons";
    import ZoomableImage from "$lib/components/ui/ZoomableImage.svelte";
    
    
    export let url: string
    export let title: string | undefined | null= undefined
    export let text:string | undefined = undefined


    let loading = false
    let open = false
    let data: GetSiteMetadataResponse|undefined = undefined
    
    // Create a fake PostView object so we can use the post components for embed media
    let post = createFakePostView()
    let postContainer: HTMLDivElement
    
    post.post.url = url
    post.post.name = text ?? 'Dummy'

    let postType = getPostType(post)

    console.log(postType)

    let embedURL: URL | undefined = isYoutubeLikeVideo(url)
        ? buildYouTubeEmbedLink(url)
        : undefined

    async function loadData() {
        open = true
        if (!url) {
            open = false
            return
        }

        loading = true
        
        try {
            data = await getClient().getSiteMetadata({url: url})
            post.post.embed_video_url = data.metadata.embed_video_url
        }
        catch {
            toast({
                type: 'error',
                title: 'Error',
                content: 'Failed to fetch preview for that URL.'
            })
            open = false
        }
        finally {
            loading = false
        }
    }
</script>

<Modal bind:open icon={LinkIcon} width="max-w-4xl" title={'Preview'}>

    {#if loading}
        <span class="flex mx-auto my-auto" transition:fade>
            <Spinner width={24}/>
        </span>
    {/if}

    <div bind:this={postContainer} class="flex flex-col gap-2 w-full" transition:fade>    

        <!--- Title --->
        {#if data?.metadata?.title}
            <h1 class="!text-base !font-bold">{data.metadata.title}</h1>
        {/if}

        
        {#if embedURL}
            <IFrame embedURL={embedURL} title="YouTube Embed" size="max-w-full" />
        
        {:else if data?.metadata?.embed_video_url}
            <IFrame embedURL={new URL(data.metadata.embed_video_url)} title={data.metadata.title ?? "Embed Video"} size="max-w-full" />
        
        {:else if data?.metadata?.image}
            <ZoomableImage url={data.metadata.image} />
        {/if}
        
    
        {#if data?.metadata?.description}
            <p class="text-base font-normal">
                {data.metadata.description}
            </p>
        {/if}
        <span class="mt-2" />

    </div>

</Modal>

<button 
    class="text-sky-700 dark:text-sky-500 hover:underline max-w-full"
    rel="nofollow"
    title = "{title ?? url}"
    on:click={() => loadData()}
>
    <slot>
        <span class="flex gap-0 {$$props.class}" >
            {text ?? url}
        </span>
    </slot>
  
</button>