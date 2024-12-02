<script lang="ts">
    import type { IconSource } from 'svelte-hero-icons'
    import { ChevronDown, Icon } from 'svelte-hero-icons'

    import Button from '$lib/components/input/Button.svelte'
    import { createEventDispatcher } from 'svelte'
    
    type T = $$Generic
    
    export let options: T[]
    export let disabled: boolean[] = []
    export let optionNames: string[] = []
    export let selected: T 
    export let headless: boolean = false
    export let items: number = 4
    export let fullWidth: boolean = false 
    export let selectedFunc: Function|undefined = undefined;
    export let icon: IconSource | undefined = undefined
    export let iconSize:number = 14
    export let label:string = ''


    if (!selected && selectedFunc) {
        selected = selectedFunc();
    }
    const dispatcher = createEventDispatcher<{ select: T }>()

    $: { dispatcher('select', selected)}

  //flex flex-row items-center w-max max-w-full overflow-auto
  let containerClass = `
    flex flex-row items-center min-w-[120px] ${fullWidth ? 'w-full' : ''} max-w-full overflow-auto
    ${
      headless
        ? 'py-1'
        : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-1'
    }
    gap-1
    ${$$props.class}
  `

  const buttonClass = (selected: boolean) => `
    px-1.5 py-1.5 text-sm
    ${!selected ? 'hover:bg-slate-100 hover:dark:bg-zinc-800' : ''}
     transition-colors rounded-md
    ${
      selected
        ? headless
          ? ''
          : 'bg-slate-900 text-slate-50 dark:bg-zinc-100 dark:text-black hover:bg-slate-800 hover:dark:bg-zinc-300 h-8'
        : ''
    }
    disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap
    relative
  `
</script>
<div class="flex flex-col gap-1 {fullWidth ? 'w-full' : ''}">
    
    <span class="flex flex-row gap-1">
        <span>
            {#if icon}
                <Icon src={icon} width={iconSize} mini />
            {/if}
            <slot name="icon"/>
        </span>
        
        <span class="text-sm font-bold">
            {#if label}
                {label}
            {/if}
            <slot name="label"/>
        </span>
    </span>

    <div class={containerClass}>
        {#each options.slice(0, items) as option, index}
            <button
                class={buttonClass(selected == option)}
                on:click|preventDefault={() => (selected = option)}
                disabled={disabled[index] ?? false}
                type="button"
            >
                {optionNames[index] || option}
                
                {#if headless && option == selected}
                    <div class="absolute -bottom-1 left-0 w-full border-b-2 rounded-t-sm border-black dark:border-white"/>
                {/if}
            </button>
        {/each}

        {#if options.length > items}
        <select
            bind:value={selected}
            class="bg-slate-200 text-zinc-900 dark:bg-zinc-800 dark:text-slate-200
            text-sm mr-2 p-1 rounded-md cursor-pointer w-full form-select
            {options
                .slice(items)
                .includes(selected)
                    ? ''
                    : 'w-4'
            }"
        >
            <Button color="tertiary">
                <Icon src={ChevronDown} size="16" mini />
            </Button>
            {#each options.slice(items) as option, index}
                <option class="dark:bg-zinc-900 dark:text-slate-100 bg-slate-100  text-zinc-900" value={option}>{optionNames[index + items] || option}</option>
            {/each}
        </select>
        {/if}
    </div>
</div>

<slot {selected} />
