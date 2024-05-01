<script lang="ts">
    import type { SidePanelTypes } from '../../lib/types'
    import Button from '$lib/components/input/Button.svelte'
    import { Icon, IconSource, Bars4 } from 'svelte-hero-icons'

    export let sidePanel:SidePanelTypes
    export let value:SidePanelTypes
    export let icon:IconSource = Bars4
    export let name:string = ''
    export let action:Function = () => { return }
</script>

<Button color="tertiary" size="sm" title="{name}" class="{sidePanel == value ? 'font-bold' : ''}"
    on:click={() => {
        sidePanel == value
            ? sidePanel = 'closed'
            : sidePanel = value
        
        action();

    }}

>
    <Icon src={icon} mini width={16}/>
    {name}
</Button>