<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte"
    export let card: boolean = true
</script>

<Card elevation={card ? 1 : -1} 
    class="flex flex-col gap-2 {card ? 'p-2' : ''} w-full max-h-full overflow-y-scroll {$$props.class}"
>
    <slot />
</Card>