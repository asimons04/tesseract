<script lang="ts">
    type T = $$Generic
    
    import TextInput from '$lib/components/input/TextInput.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import { createEventDispatcher } from 'svelte'

    export let query: string
    export let debounceTime: number = 300

    export let options: T[]
    export let extractSelected: (item: T | null) => any
    export let extractName: (item: T) => string
    export let showWhenEmpty: boolean = false
    export let containerClass:string = ''
    
    let canSearch: boolean = false
        
    export { canSearch as searchOnMount }

    const debounce = (fn: Function, ms = 300) => {
        let timeoutId: ReturnType<typeof setTimeout>
        return function (this: any, ...args: any[]) {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => fn.apply(this, args), ms)
        }
    }

    const dispatcher = createEventDispatcher<{ search: string }>()

    const debounceFunc = debounce(() => {
        canSearch = true
        dispatcher('search', query)
    }, debounceTime)
    
</script>

<div class="relative">
    <TextInput
        type="search"
        bind:value={query}
        on:keyup={() => {
            extractSelected(null)
            debounceFunc()
        }}
        {...$$restProps}
    />

    <Menu open={((options.length > 0 && query != '') || showWhenEmpty) }
        alignment="bottom-left"
        containerClass="!max-h-[50vh] {containerClass}"
    >
        {#if query == '' && showWhenEmpty}
            <slot {extractName} {extractSelected} {query} />
        
        {:else if query!=''}
            {#each options as option}
                <slot {extractName} {extractSelected} {query} {option}>
                    <MenuButton on:click={() => {
                        extractSelected(option)
                        query=''
                    }}>
                        {extractName(option)}
                    </MenuButton>
                </slot>
            {/each}
        {/if}
    </Menu>
</div>
