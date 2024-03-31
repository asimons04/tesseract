<script lang="ts">
    import { onDestroy, onMount, createEventDispatcher } from 'svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';

    import { 
        Icon, 
        ArchiveBoxXMark,
        ChevronDown
    } from 'svelte-hero-icons'
    
    export let threshold: number = 500              // Number of pixels from the bottom before dispatching the load more event
    export let loading: boolean  = false            // Disable events when a loading event is already processing
    export let exhausted:boolean = false            // Flag to disable automatic loading if API returns no more data
    export let automatic:boolean = true             // Automatically load new content. False will require clicking load more button manually
    export let manual:boolean    = false            // Whether to automatically load next page or require button click

    const dispatcher = createEventDispatcher();

    //$: window.addEventListener("scroll", onScroll)
    onMount( () => {
        window.addEventListener("scroll", onScroll)
    })

    function onScroll(e:any) {
        const offset = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY)
        if (automatic && !manual && offset <= threshold && !loading) {
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
