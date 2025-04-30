<script lang="ts">
    import type { PostView }        from 'lemmy-js-client'
    import { type PostDisplayType } from '$lib/components/lemmy/post/helpers'
    
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
    export let compact                      = false

    let bodyContainer: HTMLDivElement
    $: bodyContainerDoesScroll = bodyContainer?.scrollHeight > bodyContainer?.clientHeight || (post.post.body?.substring(0,150).includes('!['))
</script> 

<div bind:this={bodyContainer} 
    class="flex flex-col text-sm gap-1 p-1 rounded-md 
        {displayType == 'feed' && !expandPreviewText ? 'max-h-[120px] overflow-y-hidden' : ''}
        {displayType == 'feed' && !expandPreviewText && bodyContainerDoesScroll 
            ? 'bg-gradient-to-b text-transparent from-slate-800 via-slate-800 dark:from-zinc-100 dark:via-zinc-100 bg-clip-text z-0' 
            : ''
        }
        {displayType == 'feed' && expandPreviewText && $userSettings.uiState.scrollPostBodyInFeed ? 'max-h-[50vh] overflow-y-auto' : ''} 
        {$$props.class}
    "
>    
    <Markdown bind:source={post.post.body} {inline}>
        <span slot="thumbnail">
            <slot name="thumbnail" />
        </span>
    </Markdown>
    <slot />
</div>

<!---Expand/Collapse Button (only show if text is expanded or if the body container needs to scroll)--->
{#if displayType == 'feed' && (expandPreviewText || bodyContainer?.scrollHeight > bodyContainer?.clientHeight)}
    <Button color="tertiary" size="sm" 
        class="mx-auto text-xs font-bold !py-0 !px-1 w-full
            {expandPreviewText ? '' : 'mb-[5px]'} 
        "
        iconClass="{offsetExpandButton ? 'ml-[128px]' : ''}"
        title="{expandPreviewText ? 'Collapse' : 'Expand'}"
        icon={expandPreviewText ? undefined : ChevronDown}
        iconSize={20}
        on:click={() => {
            expandPreviewText = !expandPreviewText
            if (compact || !expandPreviewText) dispatchWindowEvent('scrollPostIntoView', { post_id: post.post.id})
            bodyContainer?.scrollTo(0,0)
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
