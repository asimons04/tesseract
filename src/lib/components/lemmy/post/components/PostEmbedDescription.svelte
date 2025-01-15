<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import { imageProxyURL } from "$lib/image-proxy"

    import Button from "$lib/components/input/Button.svelte"
    import CompactPostThumbnail from "$lib/components/lemmy/post/components/CompactPostThumbnail.svelte";
    import Link from "$lib/components/input/Link.svelte"
    import Markdown from "$lib/components/markdown/Markdown.svelte"
    
    import { ArrowsPointingOut, ChevronDown, ChevronUp, Icon } from "svelte-hero-icons";

    
    
    
    export let url: string = ''
    export let title: string | undefined = undefined
    export let description: string = ''
    export let card: boolean = true
    export let thumbnail_url: string | undefined = undefined
    export let showThumbnail: boolean = true
    
    const dispatcher = createEventDispatcher()
    const cardClass = "border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm bg-slate-200/50 dark:bg-zinc-800/50"

    let expandPreviewText = false
</script>



<div class="flex flex-col w-full items-start gap-1 p-2 { card ?  cardClass : ''} {expandPreviewText ? '' : 'max-h-[150px]'} {$$props.class}">    
    

            
    <div class="flex flex-row w-full items-start gap-2">
        {#if $$slots.thumbnail}
            <div class="flex flex-none  w-[64px] h-[128px] sm:w-[96px] sm:h-[128px] md:w-[128px] md:h-[128px] rounded-lg shadow-lg bg-white/80">
                <slot name="thumbnail" />
            </div>
        {/if}
        
        {#if showThumbnail && thumbnail_url}
            <button class="flex flex-none  w-[64px] h-[128px] sm:w-[96px] sm:h-[128px] md:w-[128px] md:h-[128px] rounded-lg shadow-lg bg-white/80" 
                style="background-image: url('{imageProxyURL(thumbnail_url, 256, 'webp')}'); 
                    background-size: cover; 
                    background-position: center center;
                    background-repeat: no-repeat;
                "
                on:click={() => {
                    dispatcher('clickThumbnail')
                }}
                
            >
                <span class="flex flex-col h-fit mt-auto ml-auto mr-1 mb-1 p-1 rounded-lg relative bg-slate-100/50 dark:bg-zinc-900/60">
                    <Icon src={ArrowsPointingOut} width={16} mini />
                </span>
            </button>
        {/if}

        <div class="flex flex-col gap-1 
            {showThumbnail && thumbnail_url ? 'w-[calc(100%-64px)] sm:w-[calc(100%-96px)] md:w-[calc(100%-128px)]' : 'w-full'}
            "
        >
            <!---Slot for the Archive link selector, post url, and MBFC badge--->
            <span class="flex flex-row w-full gap-2 px-1">
                <slot />
            </span>

            
            {#if title}
                <Link class="text-sm font-bold md:px-4" nowrap={!expandPreviewText} href={url} newtab={true} {title}>
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
        </div>

        
    </div>

    
</div>
