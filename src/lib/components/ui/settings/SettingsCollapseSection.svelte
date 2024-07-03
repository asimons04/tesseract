<script lang="ts">
    import { slide } from 'svelte/transition'
    import { Icon, ChevronUp, type IconSource} from 'svelte-hero-icons'

    import Button from '$lib/components/input/Button.svelte'
    import SettingGroup from './SettingGroup.svelte';

    export let expanded:boolean = false
    export let card = true
    export let icon:IconSource | undefined = undefined
    export let title:string = ' '
    export let condition:boolean = true
    export let collapseButton = true
</script>


{#if condition}
<div class="flex flex-col gap-1 my-2 border-b border-slate-200 dark:border-zinc-800 ">
    <Button color="tertiary" alignment="left" rounded='none' on:click={ ()=> { expanded = !expanded}} >
        <span class="mr-[0.5rem]">
            <slot name="icon" />
            
            {#if icon}
                <Icon src={icon} mini size="24" />
            {/if}
        </span>

        <span class="w-full flex flex-row text-lg font-bold">
            {title}
            
            <span class="flex mr-2 ml-auto px-2.5 py-0.5">
                <Icon src={ChevronUp} mini  width={24} class="transition-transform {expanded ? '' : 'rotate-180'}"/>
            </span>
        </span>
    </Button>
    
    {#if expanded}
        <div transition:slide>
            {#if card}
                <SettingGroup>
                    <slot />
                    
                    {#if collapseButton}
                        <Button color="secondary" class="w-full my-4" on:click={() => expanded = false } >
                            <Icon src={ChevronUp} mini width={18}/>
                            Collapse
                            <Icon src={ChevronUp} mini width={18}/>
                        </Button>
                    {/if}
                </SettingGroup>
            {:else}
                <slot />
                {#if collapseButton}
                    <Button color="secondary" class="w-full my-4" on:click={() => expanded = false } >
                        <Icon src={ChevronUp} mini width={18}/>
                        Collapse
                        <Icon src={ChevronUp} mini width={18}/>
                    </Button>
                {/if}
            {/if}

            
        </div>
    {/if}
</div>
{/if}