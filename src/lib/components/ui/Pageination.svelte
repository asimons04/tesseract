<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import { createEventDispatcher } from 'svelte'
    import {
        ChevronDoubleLeft,
        ChevronDoubleRight,
        ChevronDoubleUp,
        Icon
    } from 'svelte-hero-icons'

    export let page: number
    export let scrollToTop:boolean = true

    const dispatcher = createEventDispatcher<{ change: number }>()
</script>

<div class="flex flex-row w-full h-8 mt-auto gap-4">
    
    <Button  class="flex-1 font-normal w-full" title="Previous Page"
        on:click={() => {
            dispatcher('change', --page)
        }}
        disabled={page <= 1}
    >
        <Icon src={ChevronDoubleLeft} mini size="18"/>
        Back
    </Button>

    {#if scrollToTop}
        <Button class="flex-1 font-normal w-full" title="Scroll to Top"
            on:click={() => {
                window.scrollTo(0,0);
            }}
        >
            <Icon src={ChevronDoubleUp} mini size="16" slot="icon" />
            <span class="hidden md:inline">Scroll to Top</span>
        </Button>
    {/if}


    <Button  class="flex-1 font-normal w-full" title="Next Page"
        on:click={() => {
            dispatcher('change', ++page)
        }}
    >
        Next
        <Icon src={ChevronDoubleRight} mini size="18"/>
  </Button>
</div>
