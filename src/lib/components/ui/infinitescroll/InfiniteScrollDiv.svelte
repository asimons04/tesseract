<script lang="ts">
    import type { InfiniteScrollStateVars } from './helpers'

    import { onDestroy, createEventDispatcher } from 'svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';

    import { 
        Icon, 
        ArchiveBoxXMark,
        ChevronDown
    } from 'svelte-hero-icons'
    
    export let threshold: number = 500              // Number of pixels from the bottom before dispatching the load more event
    export let element: HTMLDivElement | HTMLMenuElement
    export let exhaustedMessage: string = 'No More Results to Load'
    export let state:InfiniteScrollStateVars = {
        loading: false,
        exhausted: false,
    }
    const dispatcher = createEventDispatcher();

   $: if (element) {
        element.addEventListener("scroll", onScroll)
    }

    function onScroll(e:any) {
        const offset = element.scrollHeight - (element.clientHeight + element.scrollTop)
        if (offset <= threshold && !state.loading && !state.exhausted) {
            state.loading = true
            dispatcher('loadMore')
        }
    }

    onDestroy( () => {
        if (element) element.removeEventListener("scroll", onScroll)
    })
</script>



<div class="flex flex-col items-center mx-auto">
    {#if state.loading}        
        <Spinner width={24} />
    
    {:else}
        <Button color="secondary" class="w-fit mx-auto" title="Load More" bind:disabled={state.exhausted}
            on:click={() => {
                state.exhausted = false
                dispatcher('loadMore')
            }}
        >
            <div class="flex flex-row gap-2 items-center">
                <Icon src={state.exhausted ? ArchiveBoxXMark : ChevronDown} mini size="16" />
                {state.exhausted ? exhaustedMessage : 'Load More'}
                <Icon src={state.exhausted ? ArchiveBoxXMark : ChevronDown} mini size="16" />
            </div>
        </Button>
    {/if}
</div>