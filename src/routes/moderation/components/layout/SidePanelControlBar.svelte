<script lang="ts">

    export let display:boolean = true;
</script>

{#if display}
    <!-- Side panel Menu Control Bar--->
    <div class="hidden lg:flex flex-col gap-1">
        <div class="flex flex-row w-full gap-2 py-1 bg-slate-200 dark:bg-zinc-800 rounded-md">
            <span class="ml-4 flex text-xs font-bold items-center">
                Lookup Tools:
            </span>

            <slot/>

        </div>
    </div>
{/if}