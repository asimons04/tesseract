<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    export let post: PostView | undefined = undefined
</script>


<div class="ml-auto mr-auto mt-1 mb-1 max-w-4xl">
    <video class="rounded-md max-w-full max-h-[80svh] mx-auto" controls>
        <source src={post.post.url} />
    </video>
</div>