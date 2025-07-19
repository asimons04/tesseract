<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import { hrColors } from '$lib/ui/colors'
    import { slide } from 'svelte/transition'
    import {
        Icon,
        ChevronUp,
        ChevronDown,
        type IconSource
    } from 'svelte-hero-icons'
    
    
    export let expanded:boolean = false
    export let icon:IconSource | undefined = undefined
    export let title:string = ' '
    export let heading:boolean = false
    export let innerClass:string = ''
    export let iconSize:number = 24
    export let bottomBorder: boolean = true
    export let middleLine: boolean = false
    export let bold: boolean = true
    export let truncate: boolean = false
</script>

<div class="flex flex-col gap-1 my-2 {bottomBorder ? 'border-b border-slate-200 dark:border-zinc-800' : ''} {$$props.class}">
    <Button color="tertiary" alignment="left" rounded='none' on:click={ ()=> { expanded = !expanded}}>
        
        <span class="{$$slots.icon || icon ? 'mr-[0.5rem]' : ''}">
            <slot name="icon" />
            
            {#if icon}
                <Icon src={icon} mini width={iconSize} />
            {/if}
        </span>

        <span class="flex flex-row justify-between whitespace-nowrap {heading ? 'text-xl' : 'text-xs'} {bold ? 'font-bold' : ''} {truncate ? 'truncate' : ''}">
            <slot name="title" />
            {title}
        </span>

        {#if middleLine}
            <hr class="flex w-full {hrColors} my-auto" />
        {/if}
        
        <span class="text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 my-auto">
            <Icon src={ChevronUp} mini height={18} width={18} class="transition-transform {expanded ? '' : 'rotate-180'}"/>
        </span>
    </Button>
    
    {#if expanded}
        <div class="flex flex-col gap-2 pl-4 pr-2 py-2 {innerClass}" transition:slide>
            <slot />
        </div>
    {/if}
</div>