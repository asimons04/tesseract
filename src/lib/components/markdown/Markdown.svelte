<script lang="ts">
    
    
    import Markdown, {
        extensions,
        type TokenExtractionParameters
         
    } from '@magidoc/plugin-svelte-marked'
    
    import {
        filterAnnoyingCCLicenseOnComments,
        findUserCommunityLinks,
        hashtagsToMDLinks
    } from './markdown'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { marked } from 'marked';
    
    import MarkdownCode from './renderers/MarkdownCode.svelte'
    import MarkdownImage from './renderers/MarkdownImage.svelte'
    import MarkdownLink from './renderers/MarkdownLink.svelte';
    import MarkdownSpoiler from './renderers/MarkdownSpoiler.svelte';
    
    export let source: string = ''
    export let inline: boolean = false

    marked.use({
        extensions: [
            extensions.containerExtension((params: TokenExtractionParameters) => {
                if (params.type === 'spoiler') {
                    return {
                        type: 'spoiler',
                        raw: params.raw,
                        title: params.options,
                        tokens: []
                    }
                }
                return null
            })
        ]
    })
    
    function preProcess(text:string) {
        let temp = fixLemmyEncodings(text)
        temp = findUserCommunityLinks(temp)
        temp = filterAnnoyingCCLicenseOnComments(temp)
        temp = hashtagsToMDLinks(temp)
        temp = temp.replaceAll("::: spoiler", ":::spoiler")
        return temp
    }

    $:  mdText = preProcess(source)

</script>

{#if mdText}
<div class="markdown {$$props.class}">
    {#if inline}
        {mdText}
    {:else}
        <Markdown bind:source={mdText} 
            renderers={{
                code: MarkdownCode,
                image: MarkdownImage,
                link: MarkdownLink,
                spoiler: MarkdownSpoiler,
              
            }}

        />
    {/if}
</div>
{/if}
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
        @apply cursor-pointer my-4;
    }

    .markdown :global(hr) {
        @apply w-full mx-auto my-2 border-slate-300 dark:border-zinc-800;
    }

    .markdown :global(img) {
        @apply max-h-[40vh];
    }

    .markdown :global(a) {
        @apply text-sky-500 hover:underline;
    }

    .markdown :global(ul) {
        @apply list-disc pl-4 leading-3 whitespace-normal pb-2;
    }

    .markdown :global(ol) {
        @apply list-decimal pl-4 leading-3 whitespace-normal pb-2;
    }

    .markdown :global(ul > *) {
        @apply leading-[20px];
    }

    .markdown :global(ol > *) {
        @apply leading-[20px];
    }

    .markdown :global(li) {
        @apply pt-[5px] m-0 leading-[1.5] !important ;
    }

    .markdown :global(li > *) {
        @apply m-0 leading-[1.5] !important;
    }

    .markdown :global(table) {
        width:90%;
        @apply my-4 mx-auto;
    }

    .markdown :global(td) {
        /*width: 100%;*/
    }

    .markdown :global(th) {
        text-align: left;
        /*width: 100%;*/
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
