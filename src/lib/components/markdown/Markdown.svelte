<script lang="ts">
    // Marked.js Docs: https://marked.js.org/using_pro
    // Tokenizer Code:  https://github.com/markedjs/marked/blob/master/src/Tokenizer.ts#L559
    // Defeault renderer code:  https://github.com/magidoc-org/magidoc/tree/main/packages/plugins/svelte-marked/src/lib/markdown/components

    
    import Markdown, {
        extensions,
        type TokenExtractionParameters
         
    } from '@magidoc/plugin-svelte-marked'
    
    import {
        filterAnnoyingCCLicenseOnComments,
        findLemmyverseLinks,
        findUniversalCommentLinks,
        findUniversalPostLinks,
        findUserCommunityLinks,
        hashtagsToMDLinks
    } from './markdown'

    import { marked } from 'marked';
    import { userSettings } from '$lib/settings'
    
    import MarkdownCode         from './renderers/MarkdownCode.svelte'
    import MarkdownCodeSpan     from './renderers/MarkdownCodeSpan.svelte'
    import MarkdownHTML         from './renderers/MarkdownHTML.svelte'
    import MarkdownImage        from './renderers/MarkdownImage.svelte'
    import MarkdownLink         from './renderers/MarkdownLink.svelte'
    import MarkdownList         from './renderers/MarkdownList.svelte'
    import MarkdownListItem     from './renderers/MarkdownListItem.svelte'
    import MarkdownSpoiler      from './renderers/MarkdownSpoiler.svelte'
    import MarkdownTable        from './renderers/MarkdownTable.svelte'
    
    
    
    export let source: string = ''
    export let inline: boolean = false
    export let noPreview: boolean = false
    export let noUserCommunityLink: boolean = false
    export let noLink: boolean = false
    export let noHashtags: boolean = false
    export let noImages: boolean = false

    let mdText:string | undefined

    const noLinktokenizer = {
        autolink(src: string): undefined  {
            return undefined
        },

        url(src:string): undefined {
            return undefined
        },

        list(src:string): undefined {
            return undefined
        }
    }

    marked.use({
        tokenizer: noLink
            ? noLinktokenizer
            : undefined,
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
    })

    
    // Pre-process the markdown text to detect user/community links, hashtags, etc
    function preProcess(text:string|undefined) {
        if (!text) {
            mdText = undefined
            return
        }
        
        // Initialize guardrail flags
        let inCodeBlock = false
        let inCodeSpan = false
        let inImage = true
        
        // Fix stupid ampersand encodings
        let temp = text.replaceAll('&amp;', '&') + '\n'
        if ($userSettings.uiState.filterAnnoyingCCLicense) temp = filterAnnoyingCCLicenseOnComments(temp)

        // Break the text into lines and parse each line individually
        let lines = temp.split('\n')
        for (let i=0; i < lines.length; i++) {
            
            let line = lines[i]
           
            // Check if inside a code block
            if (!inCodeBlock && line.startsWith('```'))     inCodeBlock = true
            else if (inCodeBlock && line.startsWith('```')) inCodeBlock = false

            // If not inside a code block, pre-process the line
            if (!inCodeBlock) {
                
                // Reset the word-level guardrails
                inCodeSpan = false
                inImage = false

                // Don't trim lines that are intentionally indented for nested list items
                // But trim any other since marked.js will treat two spaces before text as a code span which we do not want.
                if (!line.match(/^\s+[-|\*|0-9\)].*/i)) line = line.trim()


                // Trim list items so they don't turn into code spans
                line = line.replace(/^-\s*/, '- ')
                line = line.replace(/^[0-9]+\)\s*/, '1) ')

                // Clean up some ugly LemmyUI-ness
                line = line.replace(/^cross-posted from:/, 'Cross-posted from:')

                // Split the line into words and process each word individually
                let words = line.split(' ')
                for (let j=0; j < words.length; j++) {
                    
                    let word = words[j]
                    
                    // Check if word is part of a code span
                    if (!inCodeSpan && word.startsWith('`'))    inCodeSpan = true
                    else if (inCodeSpan && word.endsWith('`'))  inCodeSpan = false
                    
                    // Check if word is beginning/end of an image or link
                    if (!inImage && word.startsWith('!\['))         inImage = true
                    else if (inImage && word.match(/.*\]\(.*\)/i))  inImage = false

                    // Check if word is just an image without alt text (which comes through as one word
                    if (word.match(/^!\[\](.*)$/i))     inImage = true

                    // If word starts with escape slash, don't process it as markdown (just spruce up the encodings and remove the slash for display)
                    if (word.startsWith('\\')) {
                        //word = fixLemmyEncodings(word)
                        word = word.substring(1, word.length)
                        words[j] = word
                    }

                    // If word isn't escaped, not inside a code span, image, process each word
                    else if (!inCodeSpan && !inImage) {
                        if (!noUserCommunityLink) word = findUserCommunityLinks(word)
                        if (!noHashtags) word = hashtagsToMDLinks(word)
                        
                        word = findLemmyverseLinks(word)
                        word = findUniversalPostLinks(word)
                        word = findUniversalCommentLinks(word)

                        words[j] = word
                    }
                    
                    // Account for single "word" code-spans
                    if (inCodeSpan && word.endsWith('`'))  inCodeSpan = false
                }
                line = words.join(' ')
               
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
                    html: MarkdownHTML,
                    image: MarkdownImage,
                    link: MarkdownLink,
                    list: MarkdownList,
                    list_item: MarkdownListItem,
                    spoiler: MarkdownSpoiler,
                    table: MarkdownTable,
                
                }}

            />
        {/if}
    </div>
    

{/if}

<style lang="postcss">
    .markdown :global(h1) {
        @apply text-3xl font-bold mt-4;
    }
    .markdown :global(h2) {
        @apply text-2xl font-bold mt-4;
    }
    .markdown :global(h3) {
        @apply text-xl font-bold mt-4;
    }

    .markdown :global(h4) {
        @apply text-lg font-bold mt-4;
    }

    .markdown :global(details > summary) {
        @apply cursor-pointer my-4 !mt-0 !mb-2 ;
    }

    .markdown :global(hr) {
        @apply max-w-[100%]  my-2 border-slate-300 dark:border-zinc-600;
    }

    .markdown :global(img) {
        @apply max-h-[40vh];
    }

    .markdown :global(a) {
        @apply text-sky-700 dark:text-sky-500 hover:underline;
    }

    .markdown :global(ul) {
        @apply list-disc pl-[1.6rem] leading-3 whitespace-normal pb-2;
    }

    .markdown :global(ol) {
        @apply list-decimal pl-[1.6rem] leading-3 whitespace-normal pb-2;
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


