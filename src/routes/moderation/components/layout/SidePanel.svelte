<script lang="ts">
    import { fly } from 'svelte/transition'
    import { PanelWidths } from '../../lib/types'

    export let display:boolean = true;
    export let width:PanelWidths = 'w-1/3'

</script>

{#if display}
    <div class="hidden lg:flex flex-col gap-2 {width}" transition:fly={{duration:300, x: '33%'}}>
        <slot/>
    </div>
{/if}