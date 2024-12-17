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
    import { userSettings } from '$lib/settings'
    
    import MarkdownCode from './renderers/MarkdownCode.svelte'
    import MarkdownCodeSpan from './renderers/MarkdownCodeSpan.svelte';
    import MarkdownImage from './renderers/MarkdownImage.svelte'
    import MarkdownLink from './renderers/MarkdownLink.svelte';
    import MarkdownSpoiler from './renderers/MarkdownSpoiler.svelte';
    
    export let source: string = ''
    export let inline: boolean = false
    export let noPreview: boolean = false
    export let noUserCommunityLink: boolean = false
    export let noLink: boolean = false
    export let noHashtags: boolean = false
    export let noImages: boolean = false

    let mdText:string
    
    marked.use({
        extensions: [
            extensions.containerExtension((params: TokenExtractionParameters) => {
                if (params.type === 'spoiler') {
                    return {
                        type: 'spoiler',
                        raw: params.raw.trim(),
                        title: params.options,
                        tokens: []
                    }
                }
                return null
            })
        ],
        gfm: !noLink
    })
    
    function preProcess(text:string) {
        let inCodeBlock = false
        let temp = text.replaceAll('&amp;', '&') + '\n'

        let lines = temp.split('\n')
        
        for (let i=0; i < lines.length; i++) {
            
            let line = lines[i]
           
            if (!inCodeBlock && line.startsWith('```'))     inCodeBlock = true
            else if (inCodeBlock && line.startsWith('```')) inCodeBlock = false

            if (!inCodeBlock) {
                line = fixLemmyEncodings(line)
                if (!noUserCommunityLink) line = findUserCommunityLinks(line)
                if (!noHashtags) line = hashtagsToMDLinks(line)
                if ($userSettings.uiState.filterAnnoyingCCLicense) line = filterAnnoyingCCLicenseOnComments(line)
            }

            lines[i] = line
        }

        temp = lines.join('\n')
        
        // Fix detection of custom containers for spoilers
        temp = temp
            .replaceAll("::: spoiler", ":::spoiler")
            .replaceAll(":::spoiler", "\n:::spoiler")
            .replaceAll(/::: /g, '\n:::\n')
        
        mdText = temp


    }

    $:  source, $userSettings.linkifyHashtags,  preProcess(source)

</script>

{#if mdText}
    <div class="markdown {$$props.class}">
        {#if inline}
            {mdText}
        {:else}
            
            <slot name="thumbnail"/>
            

            <Markdown bind:source={mdText} 
                options={{
                    //@ts-ignore (Adding a custom object to the options that get passed to the renderers)
                    custom: {
                        noPreview: noPreview,
                        noImages: noImages
                    }
                }}
                renderers={{
                    code: MarkdownCode,
                    codespan: MarkdownCodeSpan,
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

    .markdown :global(details > summary) {
        @apply cursor-pointer my-4 !mt-0 !mb-2 ;
    }

    .markdown :global(hr) {
        @apply w-full mx-auto my-2 border-slate-300 dark:border-zinc-800;
    }

    .markdown :global(img) {
        @apply max-h-[40vh];
    }

    .markdown :global(a) {
        @apply text-sky-700 dark:text-sky-500 hover:underline;
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

    .markdown :global(pre) {
        @apply flex bg-slate-50 dark:bg-zinc-950;
    }

    .markdown :global(code) {
        @apply w-full;
    }



</style>


