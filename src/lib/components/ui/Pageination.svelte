<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import { createEventDispatcher } from 'svelte'
    import {
        ChevronDoubleLeft,
        ChevronDoubleRight,
        Icon
    } from 'svelte-hero-icons'

    export let page: number
    export let disableNext:boolean = false

    const dispatcher = createEventDispatcher<{ change: number }>()
</script>

<div class="flex flex-row w-full h-8 mt-auto gap-4 {$$props.class}">
    
    <Button  class="flex-1 font-normal w-full" title="Previous Page" color="tertiary-border"
        on:click={() => {
            dispatcher('change', --page)
        }}
        disabled={page <= 1}
    >
        <Icon src={ChevronDoubleLeft} mini size="18"/>
        Back
    </Button>

    <div class="flex w-1/3 items-center">
        <span class="mx-auto font-bold text-xl text-center">
            {page}
        </span>
    </div>
    
    <Button  class="flex-1 font-normal w-full" title="Next Page"  color="tertiary-border" disabled={disableNext}
        on:click={() => {
            dispatcher('change', ++page)
        }}
    >
        Next
        <Icon src={ChevronDoubleRight} mini size="18"/>
  </Button>
</div>
