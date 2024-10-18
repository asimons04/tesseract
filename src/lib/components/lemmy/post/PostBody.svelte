<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from './helpers'
    
    import  { scrollToTop } from './helpers.js'
    import { userSettings } from '$lib/settings.js';

    import Button from '$lib/components/input/Button.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'

    import { 
        Icon, 
        ChevronDown,
        ChevronUp
    } from 'svelte-hero-icons'

    export let post:PostView
    export let postContainer: HTMLDivElement
    export let displayType:PostDisplayType  = 'post'
    export let expandPreviewText:boolean    = false
    export let inline:boolean               = false
    
    let source: string = ''
    let hideExpandButton = false
    let fadeText = false

    function generateSource() {
        let body = post.post.body ??  ( 
            post.post.embed_description 
                ? `**Summary**: ${post.post.embed_description}`
                : ''
        )
        
        const bodyLength = body.length

        hideExpandButton = (
            $userSettings.uiState.postBodyPreviewLength == -1 || 
            bodyLength < 1 ||
            bodyLength < $userSettings.uiState.postBodyPreviewLength ||
            displayType == 'post'
        )
        
        fadeText = !expandPreviewText && bodyLength > $userSettings.uiState.postBodyPreviewLength
        
        if (displayType == 'feed' && !expandPreviewText && bodyLength > 0 && bodyLength > $userSettings.uiState.postBodyPreviewLength) {
            body = body.slice(0, $userSettings.uiState.postBodyPreviewLength)
        }

        return body
    }
    
    // Regenerate source text if post content, preview length setting, or expanding preview text
    $:  (post, $userSettings.uiState.postBodyPreviewLength, expandPreviewText), source = generateSource()
</script> 

{#if source}
    <div class="flex flex-col text-sm rounded-md {$$props.class}">    
        {#if displayType == 'post' }
                <Markdown bind:source {inline}/>
            <slot />
        {/if}

        <!--- Show expandable preview in feed--->
        {#if displayType=='feed'}
            <div class="
                {fadeText
                    ? 'bg-gradient-to-b text-transparent from-slate-800 via-slate-800 dark:from-zinc-100 dark:via-zinc-100 bg-clip-text z-0'
                    : ''
                }
            ">
                <Markdown bind:source {inline} />
            </div>
        {/if}
    </div>
{/if}

<!---Expand/Collapse Button--->
{#if !hideExpandButton }
<Button color="tertiary" class="mx-auto w-fit text-xs font-bold !py-0"
    title="{expandPreviewText ? 'Collapse' : 'Expand'}"
    on:click={() => {
        expandPreviewText = !expandPreviewText

        // Scroll top of post to top on close
        if (!expandPreviewText) scrollToTop(postContainer)
    }}
>
    <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16" slot="icon" />
    {expandPreviewText ? 'Collapse' : 'Expand'}
    <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16"  />
</Button>
{/if}