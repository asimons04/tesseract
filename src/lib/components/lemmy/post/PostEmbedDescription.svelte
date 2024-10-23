<script lang="ts">
    import Markdown from "$lib/components/markdown/Markdown.svelte"

    export let title: string | undefined = undefined
    export let description: string | undefined = undefined
    export let card: boolean = true
    export let minLength:number = 15
    
</script>

{#if description && description.length > minLength}
    <div class="flex flex-col p-2 gap-1 w-full 
            { card ? 'border border-slate-300 dark:border-zinc-700 rounded-lg shadow-sm bg-slate-200/50 dark:bg-zinc-800/50' : ''}
        "
    >
        {#if title}
            <span class="text-xs font-bold md:px-4">
                {title}
            </span>
        {/if}

        <Markdown bind:source={description} class="md:px-4 text-xs"/>
    </div>
{/if}