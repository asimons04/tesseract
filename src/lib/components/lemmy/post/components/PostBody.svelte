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

    let bodyContainer: HTMLDivElement
    
</script> 


<div bind:this={bodyContainer} class="flex flex-col text-sm gap-1 p-1 rounded-md 
        {displayType == 'feed' && !expandPreviewText ? 'max-h-[128px]' : ''}
        {displayType == 'feed' && !expandPreviewText && $userSettings.uiState.scrollPostBodyInFeed ? 'overflow-y-auto' : ''}
        {displayType == 'feed' && !expandPreviewText && !$userSettings.uiState.scrollPostBodyInFeed ? 'overflow-y-hidden' : ''}
        {displayType == 'feed' && expandPreviewText && $userSettings.uiState.scrollPostBodyInFeed ? 'max-h-[50vh] overflow-y-auto' : ''} 
        {$$props.class}
    ">    
    {#if displayType == 'post' }
        <Markdown bind:source={post.post.body}>
            <span slot="thumbnail">
                <slot name="thumbnail" />
            </span>
        </Markdown>
        <slot />
    {/if}

    <!--- Show expandable preview in feed--->
    {#if displayType=='feed'}
        <Markdown bind:source={post.post.body} >
            <span slot="thumbnail">
                <slot name="thumbnail"/>
            </span>
                
        </Markdown>
    {/if}
</div>



<!---Expand/Collapse Button--->
{#if displayType == 'feed' && ( bodyContainer?.scrollHeight > bodyContainer?.clientHeight || expandPreviewText)}
    <Button color="tertiary" size="sm" class="mx-auto text-xs font-bold !py-0 w-full {expandPreviewText ? '' : 'mb-[5px]'}"
        iconClass="{offsetExpandButton ? 'ml-[128px]' : ''}"
        title="{expandPreviewText ? 'Collapse' : 'Expand'}"
        icon={expandPreviewText ? undefined : ChevronDown}
        iconSize={20}
        on:click={() => {
            expandPreviewText = !expandPreviewText

            // Scroll top of post to top on close
            //if (!expandPreviewText) dispatchWindowEvent('scrollPostIntoView', { post_id: post.post.id})
            if (!expandPreviewText) dispatchWindowEvent('scrollPostIntoView', { post_id: post.post.id})
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
