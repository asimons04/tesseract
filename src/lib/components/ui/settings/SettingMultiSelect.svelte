<script lang="ts">

    import { Icon, InformationCircle, type IconSource } from 'svelte-hero-icons'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte';

    export let icon:IconSource = InformationCircle
    export let title:string = ''
    export let description:string = ''
    export let selected: any
    export let condition:boolean = true
    export let options:any[]
    export let optionNames:any[] = []

</script>

{#if condition}
    <div class="flex flex-row w-full gap-2 py-2">
        <div class="flex flex-col">
            <p class="text-sm font-bold flex flex-row gap-2">
                <Icon src={icon} mini width={16}/>
                {title}
            </p>
            <p class="text-xs font-normal">
                {description}
            </p>
        </div>
        
        <div class="mx-auto"/>
        <MultiSelect
            {options}
            optionNames = {optionNames.length > 0 ? optionNames : options}
            bind:selected
            headless={true}
            items={0}
        />
    </div>
{/if}