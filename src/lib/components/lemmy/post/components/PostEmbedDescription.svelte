<script lang="ts">
    import type { PostDisplayType } from "../helpers"
    import { createEventDispatcher } from "svelte"
    import { userSettings } from '$lib/settings'

    import Button from "$lib/components/input/Button.svelte"
    import CompactPostThumbnail from "$lib/components/lemmy/post/components/CompactPostThumbnail.svelte"
    import Link from "$lib/components/input/Link.svelte"
    import Markdown from "$lib/components/markdown/Markdown.svelte"
    
    import { ChevronDown, ChevronUp, Icon } from "svelte-hero-icons"
    
    export let url: string = ''
    export let title: string | undefined = undefined
    export let description: string = ''
    export let card: boolean = true
    export let thumbnail_url: string | undefined = undefined
    export let showThumbnail: boolean = true
    export let nsfw = false
    export let compact: boolean = false

    const dispatcher = createEventDispatcher()
    const cardClass =  "border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm bg-slate-200/50 dark:bg-zinc-800/50"

    let expandPreviewText = false
    let expandDetails = compact
</script>



<div class="flex flex-col w-full items-start gap-1 p-2 { card ?  cardClass : ''} {expandPreviewText ? '' : 'max-h-[150px]'} {$$props.class}">    
            
    <div class="flex flex-row w-full items-start gap-2">
        {#if $$slots.thumbnail}
            <div class="{expandDetails ? 'flex' : 'hidden'} flex-none  w-[64px] h-[128px] sm:w-[96px] sm:h-[128px] md:w-[128px] md:h-[128px] rounded-lg shadow-lg bg-white/80">
                <slot name="thumbnail" />
            </div>
        {/if}
        
        {#if showThumbnail && thumbnail_url && expandDetails}
            <CompactPostThumbnail url={thumbnail_url} {nsfw} on:toggleCompact={() => dispatcher('clickThumbnail')} />
        {/if}

        
        <details bind:open={expandDetails} class="flex flex-col gap-1 {showThumbnail && thumbnail_url && expandDetails ? 'w-[calc(100%-64px)] sm:w-[calc(100%-96px)] md:w-[calc(100%-128px)]' : 'w-full'}">
            
            <summary class="flex flex-row w-full gap-2 p-1 cursor-pointer rounded-lg hover:bg-slate-300 hover:dark:bg-zinc-700">
                <!---Slot for the Archive link selector, post url, and MBFC badge--->    
                <slot />
                
                <!---Expand/Collapse Indicator--->
                <span class="ml-auto">
                    <Icon src={expandDetails ? ChevronUp : ChevronDown} width={14} mini />
                </span>
            </summary>

            
            {#if title}
                <Link class="text-sm font-bold md:px-4 mt-1" nowrap={!expandPreviewText} href={url} newtab={true} {title}>
                    {title}
                </Link>
            {/if}
            
            {#if description}
                <Markdown bind:source={description} noImages noHashtags 
                    class="md:px-4 text-slate-700 dark:text-zinc-400 text-xs
                        {expandPreviewText ? 'max-h-[20vh] overflow-y-scroll' : 'max-h-[30px] overflow-hidden'}
                    "
                />
                
                <Button color="tertiary" size="square-sm" class="sticky bottom-0 left-0  text-xs font-bold !py-0 w-full "
                    title="{expandPreviewText ? 'Collapse' : 'Expand'}"
                    on:click={() => { expandPreviewText = !expandPreviewText }}
                >
                    <Icon src={expandPreviewText ? ChevronUp : ChevronDown} width={24} mini 
                        class="{showThumbnail && thumbnail_url ? 'mr-[68px] sm:mr-[100px] md:mr-[132px]' : ''}"
                    />
                </Button>
                
            {/if}
        </details>

        
    </div>

    
</div>
