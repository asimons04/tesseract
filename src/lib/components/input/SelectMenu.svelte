<script lang="ts">
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import { createEventDispatcher } from 'svelte'

    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    
    import { 
        Icon,
        ChevronDown
    } from 'svelte-hero-icons'
    

    type T = $$Generic

    export let options: T[]
    export let optionNames: string[] = []
    export let selected: T
    export let label: string | undefined = undefined
    export let alignment: Alignment = 'bottom-left'
    export let selectedFunc: Function | undefined = undefined
    export let title:string = '';
    export let icon:any = undefined;
    export let iconSize:number = 16
    
    let open = false

    if (!selected && selectedFunc) {
        selected = selectedFunc();
    }

    const dispatcher = createEventDispatcher<{ select: T }>()
</script>


<Menu {alignment} containerClass="!z-[30]" >
    <button slot="button" let:toggleOpen on:click={toggleOpen} class="w-max relative" title="{title}">
        
        <span class="flex flex-row items-center gap-1 md:gap-2 font-bold text-sm cursor-pointer p-2
            border border-slate-200 dark:border-zinc-700 rounded-lg bg-transparent 
            hover:bg-slate-100 hover:dark:bg-zinc-700 dark:text-zinc-200  disabled:border-none 
            {$$props.class}
        ">
            {#if icon}
                <span class="hidden sm:flex">
                    <Icon src={icon} mini width={iconSize}/>
                </span>
            {/if}

            {#if label}
                {label}
            {/if}
            
            <slot>
                {optionNames[options.findIndex((o) => selected == o)] || selected}
            </slot>
            
            <span class="ml-auto"/>
            <Icon src={ChevronDown} mini width={14}/>
        </span>
        
    </button>

    {#each options as option, index}
        <MenuButton
            on:click={() => {
                selected = option
                dispatcher('select', option)
            }}
        >
            {optionNames[index] || option}
        </MenuButton>
    {/each}
</Menu>
