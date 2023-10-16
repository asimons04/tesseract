<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import Markdown from '$lib/components/markdown/Markdown.svelte'

    export let post:PostView;
</script>

<div class="bg-slate-100 border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 p-2 text-sm rounded-md leading-[22px]">
    {#if post.post.body || post.post.embed_description}    
        {#if post.post.body}                
            <Markdown source={post.post.body} />
        {:else if post.post.embed_description}
            <Markdown source={post.post.embed_description} />
        {/if}
    {/if}
    
    <slot />
    
</div>