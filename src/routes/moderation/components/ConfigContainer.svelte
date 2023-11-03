<script lang="ts">

    export let display:boolean = true;
    export let title:string = ''
</script>


{#if display}
<div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
    
    {#if title}
        <span class="mt-4 text-base font-bold dark:text-zinc-400 text-slate-600">
            Available Actions
        </span>
    {/if}
    <div class="flex flex-col gap-2 pr-2 w-full">
        <slot />
    </div>
</div>
{/if}