<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let label: string = ''
  export let description: string = ''
  export let placeholder: string = ''
  export let value: string = ''
  export let maxlength: number = -1
  export let rows: number = 3
  export let required: boolean = false
  export let item: any = undefined
  export let spellcheck:string = 'true';
  export let id:string = '';

  let clazz = ''
  export { clazz as class }

  const dispatcher = createEventDispatcher()
</script>

<label class="flex flex-col items-center {clazz}">
  {#if label != ''}
    <span
      class="font-bold text-sm text-left mb-1 cursor-pointer w-max self-start"
    >
      {label}
      {#if required}
        <span class="font-bold text-red-500">*</span>
      {/if}
    </span>
  {/if}

  {#if description != ''}
    <span
      class="text-sm text-left mb-1 cursor-pointer w-max self-start"
    >
      {description}
    </span>
  {/if}
  <textarea
    bind:value
    bind:this={item}
    on:input={(e) => dispatcher('input', e)}
    on:keydown
    {id}
    {placeholder}
    {maxlength}
    {rows}
    spellcheck="{spellcheck}"
    class="form-textarea text-sm w-full px-3 py-2.5 rounded-md shadow-sm 
        bg-slate-200 text-zinc-900
        dark:bg-zinc-800 dark:text-slate-200
        {clazz}
    "
    {...$$restProps}
  />
</label>

<!--
    "w-full px-3 text-sm py-2.5 bg-white dark:bg-black
    border border-slate-300 dark:border-zinc-700 dark:focus:border-white
    focus:outline-none focus:border-black transition-colors rounded-md
-->
