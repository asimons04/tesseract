<script lang="ts">
    import Link from "$lib/components/input/Link.svelte";
    import Markdown from "$lib/components/markdown/Markdown.svelte"
    
    import { createEventDispatcher } from "svelte"
    import { imageProxyURL } from "$lib/image-proxy"
    import { userSettings } from "$lib/settings"
    import Button from "$lib/components/input/Button.svelte";
    import { ArrowsPointingOut, ChevronDown, ChevronUp, Icon } from "svelte-hero-icons";
    
    
    export let url: string = ''
    export let title: string | undefined = undefined
    export let description: string = ''
    export let card: boolean = true
    export let minLength:number = 0
    export let thumbnail_url: string | undefined = undefined
    export let showThumbnail: boolean = true
    
    const dispatcher = createEventDispatcher()
    const cardClass = "border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm bg-slate-200/50 dark:bg-zinc-800/50"
    //const cardClass = "border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm bg-white/20 dark:bg-black/20"

    let expandPreviewText = false
    let source: string | undefined = undefined
    let previewLength = 420
    $:  description, expandPreviewText, source = (description && description.length > 240 && expandPreviewText)
        ? description
        : (description && description.length > previewLength)
                ? description?.slice(0, previewLength) + '...'
                : description?.slice(0, previewLength)

</script>



<div class="flex flex-col w-full items-start gap-1 p-2 { card ?  cardClass : ''} {$$props.class}">    
    <!---Slot for the Archive link selector, post url, and MBFC badge--->
    <slot/>
            
    <div class="flex flex-row w-full items-start gap-1">
        
        <div class="flex flex-col gap-1 {showThumbnail && thumbnail_url ? 'w-[calc(100%-128px)]' : 'w-full'}">

            {#if description && description.length > minLength}
                {#if title}
                    <Link class="text-sm font-bold md:px-4" href={url} newtab={$userSettings.openInNewTab.links} {title}>
                        {title}
                    </Link>
                {/if}

                <Markdown bind:source class="md:px-4 text-slate-700 dark:text-zinc-400 text-xs"/>
            {/if}
        </div>

        {#if showThumbnail && thumbnail_url}
            <button class="flex flex-none w-[128px] h-[128px] rounded-lg shadow-lg" 
                style="background-image: url('{imageProxyURL(thumbnail_url, 256, 'webp')}'); 
                    background-size: cover; 
                    background-position: center center;
                    background-repeat: no-repeat;
                "
                on:click={() => {
                    dispatcher('clickThumbnail')
                }}
                
            >
                <span class="flex flex-col h-fit mt-auto mb-1 p-1 rounded-lg relative left-[5px] bg-slate-100/50 dark:bg-zinc-900/60">
                    <Icon src={ArrowsPointingOut} width={16} mini />
                </span>
            </button>
        {/if}
    </div>

    {#if description && description.length > previewLength }
        <Button color="tertiary" size="square-sm" class="mx-auto text-xs font-bold !py-0 w-full {expandPreviewText || $userSettings.uiState.postBodyPreviewLength < 49 ? '' : 'mt-[-25px] mb-[5px]'}"
            title="{expandPreviewText ? 'Collapse' : 'Expand'}"
            on:click={() => { expandPreviewText = !expandPreviewText }}
            icon={expandPreviewText ? ChevronUp : ChevronDown}
            iconSize={24}
        />
    {/if}
</div>
