<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import type { IconSource } from 'svelte-hero-icons'

    export let expanded: boolean = true
    export let title: string = ''
    export let disabled: boolean = false
    export let icon: IconSource | undefined = undefined
    export let iconSize: number | undefined = undefined
</script>

<Button {...$$restProps} {icon} {iconSize} {disabled} color="tertiary" alignment="left" title={title} on:click class="!text-xs font-bold hover:bg-slate-200 {expanded ? '' : '!p-1.5'} {$$props.class}">
    <slot />
</Button>
