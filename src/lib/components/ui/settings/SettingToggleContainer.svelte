<script lang="ts">
    import { dividerColors } from '$lib/ui/colors' 
</script>

<div class="flex flex-col divide-y {dividerColors} gap-4 w-full">
    <slot/>
</div>