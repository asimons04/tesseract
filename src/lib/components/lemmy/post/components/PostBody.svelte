<script lang="ts">
    import type { PostView }        from 'lemmy-js-client'
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers'
    
    import { dispatchWindowEvent }  from '$lib/ui/events'
    import { userSettings }         from '$lib/settings'

    import Button   from '$lib/components/input/Button.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'

    import { 
        ChevronDown,
        ChevronUp,

        Icon

    } from 'svelte-hero-icons'
    
  

    export let post:PostView
    export let displayType:PostDisplayType  = 'post'
    export let expandPreviewText:boolean    = false
    export let inline:boolean               = false
    export let offsetExpandButton: boolean  = false
    
    let source: string = ''
    let hideExpandButton = false
    let fadeText = false
    
    function generateSource() {
        let body = post.post.body ?? ''
        
        const bodyLength = body.length
        let truncateBody = $userSettings.uiState.postBodyPreviewLength < 10000

        hideExpandButton = (
            $userSettings.uiState.postBodyPreviewLength == -1 || 
            bodyLength < 1 ||
            bodyLength < $userSettings.uiState.postBodyPreviewLength ||
            !truncateBody ||
            displayType == 'post'
        )
        
        fadeText = !expandPreviewText && truncateBody && bodyLength > $userSettings.uiState.postBodyPreviewLength
        
        if (displayType == 'feed' && !expandPreviewText && bodyLength > 0 && bodyLength > $userSettings.uiState.postBodyPreviewLength && truncateBody) {
            body = body.slice(0, $userSettings.uiState.postBodyPreviewLength)
        }

        return body
    }
    
    // Regenerate source text if post content, preview length setting, or expanding preview text
    $:  (post, $userSettings.uiState.postBodyPreviewLength, expandPreviewText), source = generateSource()
</script> 


{#if source && $userSettings.uiState.postBodyPreviewLength >=0 }
    <div class="flex flex-col text-sm gap-1 p-1 rounded-md {displayType == 'feed' && expandPreviewText && $userSettings.uiState.scrollPostBodyInFeed ? 'max-h-[50vh] overflow-y-auto' : ''} {$$props.class}">    
        {#if displayType == 'post' }
            <Markdown bind:source {inline}>
                <span slot="thumbnail">
                    <slot name="thumbnail" />
                </span>
            </Markdown>
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
                <Markdown bind:source {inline} noImages={!expandPreviewText}>
                    <span slot="thumbnail">
                        <slot name="thumbnail"/>
                    </span>
                        
                </Markdown>
            </div>
        {/if}
    </div>
{/if}


<!---Expand/Collapse Button--->
{#if !hideExpandButton }
    <Button color="tertiary" size="sm" class="mx-auto text-xs font-bold !py-0 w-full {expandPreviewText || $userSettings.uiState.postBodyPreviewLength < 49 ? '' : 'mt-[-25px] mb-[5px]'}"
        iconClass="{offsetExpandButton ? 'ml-[128px]' : ''}"
        title="{expandPreviewText ? 'Collapse' : 'Expand'}"
        icon={expandPreviewText ? undefined : ChevronDown}
        iconSize={20}
        on:click={() => {
            expandPreviewText = !expandPreviewText

            // Scroll top of post to top on close
            //if (!expandPreviewText) dispatchWindowEvent('scrollPostIntoView', { post_id: post.post.id})
            dispatchWindowEvent('scrollPostIntoView', { post_id: post.post.id})
        }}
    >
        {#if expandPreviewText}
        <span class="flex flex-row gap -1 text-xs mx-auto opacity-80">
            <Icon src={ChevronUp} width={20} mini />
            Collapse
            <Icon src={ChevronUp} width={20} mini />
        </span>
        {/if}
    </Button>
        

{/if}
