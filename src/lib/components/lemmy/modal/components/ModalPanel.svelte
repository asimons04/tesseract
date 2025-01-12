<script lang="ts">
    import { expoIn } from "svelte/easing";
    import { slide } from "svelte/transition";

</script>

<div class="flex flex-col gap-4 mt-0 w-full h-full overflow-hidden" transition:slide={{easing:expoIn}}>
    <slot/>
</div>