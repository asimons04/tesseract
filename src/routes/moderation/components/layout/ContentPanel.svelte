<script lang="ts">
    import { PanelWidths, SidePanelTypes } from '../../lib/types'

    import { fly } from 'svelte/transition'
    
    export let display:boolean = true;
    export let sidePanel:SidePanelTypes = 'closed'
    //export let width:PanelWidths  = '1/3'

    //$: panelWidth = `w-${width}`
</script>

{#if display}
    <div class="flex flex-row gap-4 w-full overflow-hidden" transition:fly={{ duration: 300, y: -60, opacity: 0 }}>
        <div class="flex flex-col gap-2 w-full {sidePanel != 'closed' ? 'lg:w-2/3' : ''} p-2 overflow-y-scroll" >
            <slot/>
        </div>
        <slot name="sidePanel"/>
    </div>
{/if}