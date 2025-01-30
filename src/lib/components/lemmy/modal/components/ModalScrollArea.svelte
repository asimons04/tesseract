<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte"
    export let card: boolean = true
    export let div: HTMLDivElement | undefined = undefined
</script>

<Card bind:div elevation={card ? 1 : -1} 
    class="flex flex-col gap-2 {card ? 'p-2' : ''} w-full max-h-full overflow-y-auto {$$props.class}"
>
    <slot />
</Card>