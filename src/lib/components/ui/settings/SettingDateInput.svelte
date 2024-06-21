<script lang="ts">

    import { Icon, InformationCircle, type IconSource } from 'svelte-hero-icons'
    import DateInput from '$lib/components/input/DateInput.svelte';
        
    export let icon:IconSource = InformationCircle
    export let title:string = ''
    export let description:string = ''
    export let value:string
    export let condition:boolean = true

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
            
            {#if $$slots.default && value}
                <div class="flex flex-row flex-wrap lg:flex-nowrap gap-2 w-full mt-4">
                    <slot />
                </div>
            {/if}
        </div>
        
        <div class="mx-auto"/>
        <DateInput bind:value />
    </div>
{/if}