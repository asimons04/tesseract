<script lang="ts">
    import { createEventDispatcher } from 'svelte'

    import Button from "$lib/components/input/Button.svelte";
    import { ArrowLeft } from 'svelte-hero-icons';

    export let title:string
    
    const dispatcher = createEventDispatcher()

</script>

<div class="flex flex-row gap-4 items-center">
    <span class="w-[25px]">
        <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
            on:click={(e)=> {
                e.preventDefault()
                e.stopPropagation()
                dispatcher('click', e)
            }}
        />
    </span>

    <div class="flex flex-row w-[calc(100%-25px)] items-center justify-between">
        <span class="text-lg capitalize truncate">
            {title}
        </span>

        <span class="ml-auto">
            <slot name="actions" />
        </span>
    </div>
</div>