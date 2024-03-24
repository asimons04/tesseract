<script lang="ts">
    import { md, mdInline, photonify } from '$lib/components/markdown/markdown'
    import { userSettings } from '$lib/settings.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import markdown_it_highlightjs from 'markdown-it-highlightjs'

    export let source: string = ''
    export let inline: boolean = false
    export let images:boolean = true;

    function replaceURLs(node: HTMLElement) {
        const links = node.querySelectorAll('a')

        links.forEach((l) => {
            const photonified = photonify(l.href)
            if (photonified) l.href = photonified
            if ($userSettings.openInNewTab.links) l.target = '_blank'
        })

        // If media proxying is enabled, rewrite image urls
        const images = node.querySelectorAll('img');
        images.forEach((i) => {
            i.src = imageProxyURL(i.src)!;
        })
    }

    // Highlight code syntax if user option set
    if ($userSettings.highlightCode) {
        md.use(markdown_it_highlightjs, {
            inline: $userSettings.highlightInlineCode ?? false
        })
    }

    // Disable inline images if user option set
    if (!$userSettings.inlineImages) md.disable(['image'])
    if (!images) md.disable(['image'])

    let div: HTMLElement

    $: if (source && div) {
        replaceURLs(div)
    }

    // Render the markdown in a try/catch since sometimes it randomly fails. I think this is due to truncating it for the feed previews.
    let rendered:string
    
    $: try {
        source 
            ? source = fixLemmyEncodings(source)! 
            : source = ' ';
        if (inline) { rendered = mdInline.render(source) }
        else { rendered = md.render(source) }
    }
    catch {
        try { rendered = mdInline.render(source) }
        catch { rendered = "<p>Failed to render the markdown</p>"; }
    }
</script>

<div bind:this={div} class="break-words flex flex-col markdown gap-2 leading-[1.5]  {$$props.class}">
    {@html rendered}
</div>

<style lang="postcss">
    .markdown :global(h1) {
        @apply text-3xl font-bold;
    }
    .markdown :global(h2) {
        @apply text-2xl font-bold;
    }
    .markdown :global(h3) {
        @apply text-xl font-bold;
    }

    .markdown :global(h4) {
        @apply text-lg font-bold;
    }

    .markdown :global(details) {
        @apply cursor-pointer;
    }

    .markdown :global(hr) {
        @apply w-full mx-auto my-2 border-slate-300 dark:border-zinc-800;
    }

    .markdown :global(img) {
        @apply max-h-[40vh] border rounded-md border-slate-200 dark:border-zinc-800;
    }

    .markdown :global(a) {
        @apply text-sky-500 hover:underline;
    }

    .markdown :global(ul) {
        @apply list-disc pl-4 leading-3 whitespace-normal;
    }

    .markdown :global(ol) {
        @apply list-decimal pl-4 leading-3 whitespace-normal;
    }

    .markdown :global(ul > *) {
        @apply leading-[20px];
    }

    .markdown :global(ol > *) {
        @apply leading-[20px];
    }

    .markdown :global(li) {
        @apply pt-[10px] m-0 leading-[1.5] !important ;
    }

    .markdown :global(li > *) {
        @apply m-0 leading-[1.5] !important;
    }

    .markdown :global(th) {
        text-align: left;
    }

    .markdown :global(tr > th) {
        @apply border-b border-slate-400 dark:border-zinc-600;
    }

    .markdown :global(blockquote) {
        @apply leading-[1px] border-l-2 border-slate-400 dark:border-zinc-600 pl-2 my-1 h-max;
        line-height: unset;
    }

    .markdown :global(p) {
        @apply leading-6 mb-2 max-w-full;
    }



</style>
