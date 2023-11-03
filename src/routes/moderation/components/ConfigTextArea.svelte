<script lang="ts">
    import {
        type IconSource,
        Icon,
        Bars4
    } from 'svelte-hero-icons'

    import TextArea from '$lib/components/input/TextArea.svelte'

    export let display:boolean  = true;
    export let nested:boolean   = false;
    export let icon:IconSource  = Bars4;
    export let name:string      = '';
    export let description:string = '';
    export let value:string     = '';
    export let rows:number      = 4;
    export let placeholder:string = '';

</script>


{#if display}
<div class="flex flex-row w-full gap-2 {nested ? 'ml-4 pr-4 !border-t-0' : 'py-2'} {$$props.class}">
    <div class="flex flex-col w-full">
        <p class="text-sm font-bold flex flex-row gap-2">
            <Icon src={icon} mini width={16}/>
            {name}
        </p>
        <p class="text-xs font-normal">{description}</p>
        
        <div class="mt-2"/>
        
        <div class="flex flex-col md:flex-row w-full gap-1 items-start">
            <slot name="left"/>
            <TextArea class="w-full" bind:value={value} type="text" rows={rows} placeholder="{placeholder}"/>
        </div>
        <slot/>
    </div>
</div>
{/if}