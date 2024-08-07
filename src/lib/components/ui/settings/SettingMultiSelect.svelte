<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    
    import MultiSelect from '$lib/components/input/MultiSelect.svelte';

    import { Icon, InformationCircle, type IconSource } from 'svelte-hero-icons'

    export let icon:IconSource = InformationCircle
    export let title:string = ''
    export let description:string = ''
    export let selected: any
    export let condition:boolean = true
    export let options:any[]
    export let optionNames:any[] = []
    export let padding:boolean = true
    export let small:boolean = false
    export let justify:boolean = false

    const dispatcher = createEventDispatcher<{ select: string }>()
    $: { dispatcher('select', selected)}
</script>

{#if condition}
    <div class="flex flex-row w-full gap-2 items-center {padding ? 'py-2' : ''}">
        <div class="flex flex-col {justify ? 'w-1/2' : ''}">
            
            <span class="{small ? 'text-xs' : 'text-sm'} font-bold flex flex-row items-center gap-2">
                <Icon src={icon} mini size="16"/>
                {title}
            </span>
            
            {#if description}
                <span class="text-xs font-normal">
                    {description}
                </span>
            {/if}

            {#if $$slots.default}
                <div class="flex flex-row flex-wrap lg:flex-nowrap gap-2 w-full mt-4">
                    <slot />
                </div>
            {/if}
        </div>
        
        <div class="mx-auto"/>
        <MultiSelect
            {options}
            optionNames = {optionNames.length > 0 ? optionNames : options}
            bind:selected
            headless={true}
            items={0}
            class="{justify ? 'w-1/2' : ''}"
        />
    </div>
{/if}