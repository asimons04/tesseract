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
    
    let open = false

    if (!selected && selectedFunc) {
        selected = selectedFunc();
    }

    const dispatcher = createEventDispatcher<{ select: T }>()
</script>


<Menu {alignment} containerClass="!z-[30]" >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div slot="button" let:toggleOpen on:click={toggleOpen} class="w-max relative" title="{title}">
        
        <span class="flex flex-row items-center gap-0 md:gap-1 font-bold text-sm cursor-pointer {$$props.class}">
            {#if icon}
                <span class="hidden sm:flex">
                    <Icon src={icon} mini width={16}/>
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
        
    </div>

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
