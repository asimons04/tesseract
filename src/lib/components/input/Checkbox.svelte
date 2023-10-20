<script lang="ts">
    import { createEventDispatcher } from 'svelte'

    export let defaultValue: boolean = false
    export let checked: boolean | undefined = defaultValue
    const dispatcher = createEventDispatcher<{ change: boolean }>()
</script>

<label class="flex flex-row gap-2 cursor-pointer text-sm my-1 {$$props.class}">
    <input
        type="checkbox"
        bind:checked
        on:change={() => dispatcher('change', !checked)}
        class="form-checkbox 
            bg-slate-200 text-zinc-900 focus:border-zinc-900 
            dark:bg-zinc-800 dark:text-slate-200 dark:focus:bg-zinc-800 dark:focus:text-slate-200
            hover:dark:bg-zinc-900 hover:text-inherit
            focus:ring-transparent focus:border-transparent 
        "
    />
    <slot />
</label>
