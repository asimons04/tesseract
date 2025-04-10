<script lang="ts">
    import type { ChangeViewEvent } from '$lib/ui/events'
    
    import { createEventDispatcher, onMount } from "svelte"
    import { getOptimalThumbnailURL } from "../helpers"
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
    export let thumbnail_urls: (string|undefined)[] | undefined = undefined
    export let showThumbnail: boolean = true
    export let nsfw = false
    export let compact: boolean = false
    export let expandDetails = ['more-compact', 'ultra-compact'].includes($userSettings.uiState.view) ? false : compact
    
    const dispatcher = createEventDispatcher()
    const cardClass =  "border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm bg-slate-200/50 dark:bg-zinc-800/50"

    

    let expandPreviewText = false
    

    $:  thumbnail_available = (showThumbnail && (thumbnail_url || getOptimalThumbnailURL({urls:thumbnail_urls})) && expandDetails)
    $:  title, description, hideCFBullshit()
    
    function hideCFBullshit() {
        const cfRegex = /^just a moment|px\-captcha|Are you a robot\?|attention.*cloudflare|^MSN|^reuters.com|^403 Forbidden$/gi
        if (title?.match(cfRegex) || description?.match(cfRegex)) {
            title = ''
            description = ''
        }
        if (!thumbnail_available && !title && !description) expandDetails = false
    }


    const handlers = {
        ChangeViewEvent: function (e:ChangeViewEvent) {
            if (['more-compact', 'ultra-compact'].includes(e.detail.view)) {
                expandDetails = false
            }
            else {
                expandDetails = true
            }
        }
    }

    
</script>

<svelte:window on:changeView={handlers.ChangeViewEvent} />


<div class="flex flex-col w-full items-start gap-1 { card ?  cardClass : ''} {expandPreviewText ? '' : 'max-h-[130px]'} {$$props.class}">    
            
    <div class="flex flex-row w-full items-start gap-1">
        
       
        {#if thumbnail_available}
            <CompactPostThumbnail url={thumbnail_url} urls={thumbnail_urls} {nsfw} on:toggleCompact={() => dispatcher('clickThumbnail')} />
        {/if}

        
        <details bind:open={expandDetails} class="flex flex-col gap-1 {thumbnail_available ? 'w-[calc(100%-72px)] sm:w-[calc(100%-104px)] md:w-[calc(100%-136px)]' : 'w-full'}">
            
            <summary class="flex flex-row w-full p-1 rounded-lg {title || description || (showThumbnail && thumbnail_url) ? 'cursor-pointer  hover:bg-slate-300 hover:dark:bg-zinc-700' : ''} ">
                
                <span class="flex flex-row w-[calc(100%-30px)] gap-1 md:gap-2">
                    <!---Slot for the Archive link selector, post url, and MBFC badge--->    
                    <slot />
                </span>
                
                <!---Expand/Collapse Indicator--->
                {#if title || description || thumbnail_url}
                    <span class="ml-auto">
                        <Icon src={expandDetails ? ChevronUp : ChevronDown} width={14} mini />
                    </span>
                {/if}
            </summary>

            <div class="flex flex-col w-full gap-2 px-2 md:px-4 my-1">
                {#if title}
                    <Link class="text-sm font-bold" nowrap={!expandPreviewText} href={url} newtab={true} {title}>
                        {title}
                    </Link>
                {/if}
                
                {#if description}
                    <Markdown bind:source={description} noImages noHashtags 
                        class="text-slate-700 dark:text-zinc-400 text-xs
                            {expandPreviewText ? 'max-h-[20vh] overflow-y-scroll' : 'max-h-[20px] overflow-hidden'}
                        "
                    />
                    
                    <Button color="tertiary" size="square-sm" class="sticky bottom-0 left-0 mb-1 text-xs font-bold !py-0 w-full "
                        title="{expandPreviewText ? 'Collapse' : 'Expand'}"
                        on:click={() => { expandPreviewText = !expandPreviewText }}
                    >
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} width={20} mini 
                            class="{showThumbnail && thumbnail_url ? 'mr-[68px] sm:mr-[100px] md:mr-[132px]' : ''}"
                        />
                    </Button>
                    
                {/if}
            </div>
        </details>

        
    </div>

    
</div>
