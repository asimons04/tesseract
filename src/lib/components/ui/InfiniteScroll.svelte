<script lang="ts">
    import { onDestroy, onMount, createEventDispatcher } from 'svelte'
    import { page } from '$app/stores';

    import Button from '$lib/components/input/Button.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';

    import { 
        Icon, 
        ArchiveBoxXMark,
        ChevronDoubleLeft,
        ChevronDoubleRight,
        ChevronDown,
    } from 'svelte-hero-icons'

    
    export let threshold: number = 500              // Number of pixels from the bottom before dispatching the load more event
    export let loading: boolean  = false            // Disable events when a loading event is already processing
    export let exhausted:boolean = false            // Flag to disable automatic loading if API returns no more data
    export let enabled: boolean  = true
    export let disableBack:boolean = false

    const dispatcher = createEventDispatcher();

    onMount( () => {
        if (enabled) window.addEventListener("scroll", onScroll)
    })

    function onScroll(e:any) {
        const offset = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY)
        if (offset <= threshold && !loading) {
            dispatcher('loadMore')
        }
    }

    onDestroy( () => {
        window.removeEventListener("scroll", onScroll)
    })
</script>


{#if loading}
    <div class="mx-auto">
        <Spinner width={24} />
    </div>
{/if}

{#if enabled}
    <Button color="secondary" class="w-fit mx-auto" title="Load More"
        on:click={() => {
            exhausted = false
            dispatcher('loadMore')
        }}
    >
        <div class="flex flex-row gap-2 items-center">
            <Icon src={exhausted ? ArchiveBoxXMark : ChevronDown} mini size="16" />
            {exhausted ? 'No More Results to Load' : 'Load More'}
            <Icon src={exhausted ? ArchiveBoxXMark : ChevronDown} mini size="16" />
        </div>
    </Button>

<!---Show manual Pagination Buttons if Infinite Scroll Disabled--->
{:else}
    <div class="flex flex-row gap-4 items-center w-full">
        <Button color="tertiary-border" class="w-full" bind:disabled={disableBack} on:click={() => { dispatcher('prev')} } >
            <Icon src={ChevronDoubleLeft} mini size="16" />
            Previous
        </Button>

        <span class="flex w-full" />
        
        <Button color="tertiary-border" class="w-full" on:click={ () => { dispatcher('next') }} >
            Next
            <Icon src={ChevronDoubleRight} mini size="16" />
        </Button>
    </div>

{/if}
