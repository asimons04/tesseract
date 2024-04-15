<script lang="ts">
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import { createEventDispatcher } from 'svelte'

    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    
    import { 
        Icon,
        Check,
        ChevronDown
    } from 'svelte-hero-icons'
    

    type T = $$Generic

    export let options: T[] = []
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
                <Icon src={icon} mini width={iconSize}/>
            {/if}

            {#if label}
                {label}
            {/if}
            
            <slot>
                <!--Hide selected text in mobile view or until width is at least 'large'--->
                <span class="hidden lg:flex">
                    {optionNames[options.findIndex((o) => selected == o)] || selected}
                </span>
            </slot>
            
            <span class="ml-auto"/>
            <Icon src={ChevronDown} mini width={14}/>
        </span>
        
    </button>
    
    {#if title}
        <li class="flex flex-row w-full text-left items-center justify-between text-xs font-bold px-4 py-1 my-1 opacity-80">
            {title}
            <Icon src={icon} mini width={iconSize}/>
        </li>
        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
    {/if}
    
    {#each options as option, index}
        <MenuButton
            on:click={() => {
                selected = option
                dispatcher('select', option)
            }}
        >   
            <span class="flex flex-row w-full text-left justify-between">
                {optionNames[index] || option}
                
                <!---Show an indicator icon next to the selected option--->
                {#if (optionNames[options.findIndex((o) => selected == o)] || selected) == (optionNames[index] || option)}
                <span>    
                    <Icon src={Check} mini width={12}/>
                </span>
                {/if}

            </span>
        </MenuButton>
    {/each}

    <slot />
</Menu>
