<script lang="ts">
    import { createEventDispatcher } from 'svelte'
  
    export let label: string | number | undefined = ''
    export let value: string
    export let required = false
  
  
    const dispatcher = createEventDispatcher()
  
    let className = `
      w-full px-3 text-sm py-2.5 bg-white dark:bg-zinc-950
      border border-slate-300 dark:border-zinc-700 dark:focus:border-white
      focus:outline-none focus:border-black transition-colors rounded-md disabled:bg-slate-200 disabled:border-slate-300 dark:disabled:border-zinc-600 dark:disabled:bg-zinc-700 disabled:opacity-70
      ${$$props.class}
    `
  </script>
  
  <label class="flex flex-col items-center {$$props.class}">
    {#if label != ''}
      <span class="font-bold text-sm text-left mb-1 cursor-pointer w-max self-start">
        {label}
        {#if required}
          <span class="text-red-500">*</span>
        {/if}
      </span>
    {/if}
    
    <input
        type="date"
        bind:value
        {...$$restProps}
        class={className}
        {required}
    />
  </label>
  