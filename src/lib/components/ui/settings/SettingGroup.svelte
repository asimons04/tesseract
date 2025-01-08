<script lang="ts">
    import { dividerColors } from '$lib/ui/colors'
    import Card from '$lib/components/ui/Card.svelte'
</script>

<Card class="flex flex-col divide-y {dividerColors} gap-3 p-4 text-sm my-2">
    <slot />
</Card>
