<script lang="ts">
    import { createEventDispatcher } from "svelte"

    export let min: number          = 0
    export let max: number
    export let step: number         = 1
    export let value: number
    export let vertical: boolean    = false
    export let slider: HTMLInputElement | undefined = undefined

    const dispatcher = createEventDispatcher<{change: number}>()
</script>


{#if vertical}
    <input bind:this={slider} type="range" bind:value {min} {max} {step} dir="rtl" 
        class="h-full w-2 bg-gray-400 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer  {$$props.class}" 
        style="writing-mode: vertical-lr;"
        on:change={() => dispatcher('change', value)}
    /> 
{:else}
    <input this={slider} type="range" bind:value {min} {max} {step} 
        class="w-full h-2 bg-gray-400 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer  {$$props.class}"
        on:change={() => dispatcher('change', value)}
    />
{/if}