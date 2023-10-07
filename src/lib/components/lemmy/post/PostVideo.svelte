<script lang="ts">
    import type { PostView } from 'lemmy-js-client'

    export let post: PostView | undefined = undefined

    let url = post.post.url;

    if (url) {
        url = url.replace('https://', '/image_proxy/');
    }
</script>


<div class="ml-auto mr-auto mt-1 mb-1 max-w-4xl">
    <video class="rounded-md max-w-full max-h-[80svh] mx-auto" controls>
        <source src={url} />
    </video>
</div>