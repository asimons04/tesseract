<script lang="ts">
    type T = $$Generic
    import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'

    import InfiniteScrollDiv from '../ui/infinitescroll/InfiniteScrollDiv.svelte';
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import Spinner from '../ui/loader/Spinner.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { createEventDispatcher } from 'svelte'

    export let query: string
    export let debounceTime: number = 300

    export let options: T[]
    export let extractSelected: (item: T | null) => any
    export let extractName: (item: T) => string
    export let containerClass:string = ''
    export let containerStyle:string = ''
    export let focused: boolean = false
    export let maxResultsHeight="!max-h-[50vh]"
    
    export let infiniteScrollState:InfiniteScrollStateVars = {
        exhausted: false,
        loading: false
    }

    let canSearch: boolean = false
    
    const dispatcher = createEventDispatcher<{ search: string, loadMore: any, reset: any }>()

    export { canSearch as searchOnMount }

    const debounce = (fn: Function, ms = 300) => {
        let timeoutId: ReturnType<typeof setTimeout>
        return function (this: any, ...args: any[]) {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => fn.apply(this, args), ms)
        }
    }
   

    const doSearch = debounce(() => {
        canSearch = true
        dispatcher('search', query)
    }, debounceTime)
    
    $: open = query != ''
</script>

<div class="relative">
    <TextInput {focused} type="search" bind:value={query} on:keyup={() => {
            extractSelected(null)
            doSearch()
        }}
        {...$$restProps}
    />
    
    
    {#if open}
        <Menu bind:open
            alignment="bottom-left"
            containerClass="{maxResultsHeight} {containerClass}"
            containerStyle={containerStyle}
            let:menu
        >
            
            {#if options.length > 0}
            
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

                <div class="flex flex-col items-center pt-2 w-full">
                    <InfiniteScrollDiv bind:state={infiniteScrollState} element={menu} threshold={500} exhaustedMessage="{options.length} Results Found"
                        on:loadMore={ () => dispatcher('loadMore') }
                    />
                </div>
            {:else if infiniteScrollState.loading}
                <div class="flex flex-col items-center mx-auto">    
                    <Spinner width={24} />
                </div>
            
            {:else}
                <MenuButton on:click={() => {
                    query = ''
                    open = false
                }}>
                    No Results
                </MenuButton>
                
            {/if}
            
        </Menu>
    {/if}
</div>
