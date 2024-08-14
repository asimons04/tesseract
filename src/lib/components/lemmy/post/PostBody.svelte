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
    
    let source: string
    
    function generateSource() {
        let text = post.post.body ??  ( 
            post.post.embed_description 
                ? `**Summary**: ${post.post.embed_description}`
                : ''
        )

        text = !expandPreviewText && text.length > $userSettings.uiState.postBodyPreviewLength
            ? text.slice(0, $userSettings.uiState.postBodyPreviewLength)
            : text
        
        return text

    }
    // Use the embed description from the metadata, if available, if no post body is provided.
    $:  (post, $userSettings.uiState.postBodyPreviewLength), source = generateSource()

</script>

{#if post.post.body}

    <div class="flex flex-col text-sm rounded-md {$$props.class}">    
        {#if displayType == 'post' }
                <Markdown source={post.post.body} {inline}/>
            <slot />
        {/if}

        <!--- Show expandable preview in feed--->
        {#if displayType=='feed'}
            <div class="
                {!expandPreviewText && !post.post.nsfw && post.post.body.length > $userSettings.uiState.postBodyPreviewLength
                    ? 'bg-gradient-to-b text-transparent from-slate-800 via-slate-800 dark:from-zinc-100 dark:via-zinc-100 bg-clip-text z-0'
                    : ''
                }
            ">
                <Markdown 
                    class="{post.post.nsfw && $userSettings.nsfwBlur ? 'blur-sm' : ''}"
                    {inline}
                    bind:source
                    
                />
            </div>

            <!---Expand/Collapse Button--->
            {#if (post.post.body.length > $userSettings.uiState.postBodyPreviewLength) || post.post.nsfw}
                <Button color="tertiary" class="mx-auto w-fit text-xs font-bold !py-0"
                    title="{expandPreviewText ? 'Collapse' : 'Expand'} {post.post.nsfw && $userSettings.nsfwBlur? 'NSFW Text' : ''}"
                    on:click={() => {
                        expandPreviewText = !expandPreviewText
                        post.post.nsfw = false

                        // Scroll top of post to top on close
                        if (!expandPreviewText) scrollToTop(postContainer)
                    }}
                >
                    <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16" slot="icon" />
                    {expandPreviewText ? 'Collapse' : 'Expand'} {post.post.nsfw && $userSettings.nsfwBlur? 'NSFW Text' : ''}
                    <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16"  />
                </Button>
            {/if}
        {/if}
    </div>
{/if}