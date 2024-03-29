<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
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
</script>

<div class="flex flex-col gap-1 my-2 border-b border-slate-200 dark:border-zinc-800 ">
    <Button color="tertiary" alignment="left" rounded='none'
        on:click={ ()=> { expanded = !expanded}}
    >
        <span class="mr-[0.5rem]">
            <slot name="icon" />
            
            {#if icon}
                <Icon src={icon} mini size="24" />
            {/if}
        </span>

        <span class="w-full flex flex-row justify-between text-xs font-bold">
            {title}
            
            <span class="text-xs font-medium mr-2 ml-auto px-2.5 py-0.5">
                <Icon src={ChevronUp} mini height={18} width={18} class="transition-transform {expanded ? '' : 'rotate-180'}"/>
            </span>
        </span>
    </Button>
    
    {#if expanded}
        <div class="flex flex-col gap-2 pl-8 py-2" transition:slide>
            <slot />
        </div>
    {/if}
</div>