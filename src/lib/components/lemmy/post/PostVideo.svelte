<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import { isVideo } from './helpers'
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings } from '$lib/settings'

    import Link from '$lib/components/input/Link.svelte'

    export let post: PostView | undefined = undefined

    let source = isVideo(post.post.url) 
                    ? imageProxyURL(post.post.url)
                    : imageProxyURL(post.post.embed_video_url)
</script>

<Link 
        href={post.post.url}
        newtab={$userSettings.openInNewTab.postLinks}  
        highlight nowrap 
/>

<div class="ml-auto mr-auto mt-1 mb-1 max-w-4xl">
    <video controls playsinline class="rounded-md max-w-full max-h-[80svh] mx-auto" >
        <source src="{source}" />
    </video>
</div>
