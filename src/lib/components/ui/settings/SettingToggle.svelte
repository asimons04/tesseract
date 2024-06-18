<script lang="ts">

import { Icon, InformationCircle, type IconSource } from 'svelte-hero-icons'

import { createEventDispatcher } from 'svelte'

import Switch from '$lib/components/input/Switch.svelte';

export let icon:IconSource = InformationCircle
export let title:string = ''
export let description:string = ''
export let value:boolean = false
export let condition:boolean = true
export let small:boolean = false

const dispatcher = createEventDispatcher<{ change: boolean }>()
</script>

{#if condition}
    <div class="flex flex-row w-full gap-2 py-2">
        <div class="flex flex-col">
            <p class="{small ? 'text-xs' : 'text-sm'} font-bold flex flex-row gap-2">
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
        <Switch bind:enabled={value} on:change={(e) => dispatcher('change', e.detail)}/>
    </div>
{/if}