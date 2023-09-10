<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import { createEventDispatcher } from 'svelte'

    type T = $$Generic

    export let options: T[]
    export let optionNames: string[] = []
    export let selected: T
    export let label: string | undefined = undefined
    export let alignment: Alignment = 'bottom-left'
    export let selectedFunc: Function;

    let open = false

    if (!selected) {
        selected = selectedFunc();
    }

    const dispatcher = createEventDispatcher<{ select: T }>()
</script>

{#if label}
    <div class="block font-bold text-sm w-max mb-2">{label}</div>
{/if}

<Menu {alignment}>
    <div slot="button" let:toggleOpen on:click={toggleOpen} class="w-max relative">
        <Button color="secondary">
            <slot>
                {optionNames[options.findIndex((o) => selected == o)] || selected}
            </slot>
        </Button>
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
