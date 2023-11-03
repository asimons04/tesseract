<script lang="ts">

    export let display:boolean = true;

</script>


{#if display}
<div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
    <slot />
</div>
{/if}