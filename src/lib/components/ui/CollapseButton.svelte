<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import { slide } from 'svelte/transition'
    import {
        Icon,
        ChevronUp,
        ChevronDown,
        Folder,
        type IconSource
    } from 'svelte-hero-icons'
    
    export let expanded:boolean = false
    export let icon:IconSource = Folder
    export let title:string = ' '
</script>

<div class="flex flex-col gap-1 my-1">
    <Button color="tertiary" alignment="left"
        on:click={ ()=> { expanded = !expanded}}
    >
        <span class="mr-[0.5rem]">
            <Icon src={icon} mini size="24" />
        </span>

        <span class="w-full flex flex-row justify-between">
            {title}
            
            <span class="text-xs font-medium mr-2 ml-auto px-2.5 py-0.5">
                <Icon src={expanded ? ChevronUp : ChevronDown} mini height={18} width={18} />
            </span>
        </span>
    </Button>
    
    {#if expanded}
        <div class="flex flex-col gap-2 pl-8" transition:slide>
            <slot />
        </div>
    {/if}
</div>