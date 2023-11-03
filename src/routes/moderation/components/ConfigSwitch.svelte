<script lang="ts">
    import {
        type IconSource,
        Icon,
        Bars4
    } from 'svelte-hero-icons'

    import Switch from '$lib/components/input/Switch.svelte'

    export let enabled:boolean                  // State variable
    
    export let icon:IconSource      = Bars4     // Icon to use
    export let name: string         = ''        // Config option display name
    export let description:string   = ''        // Long description of the setting.
    export let nested:boolean       = false;    // Whether to suppress the top border and indent for a nested config item
    export let display:boolean      = true;     // Whether to show (default) or hide the object. Can be used to avoid if blocks in parent
</script>


{#if display}
<div class="flex flex-row w-full gap-2 {nested ? 'ml-4 pr-4 !border-t-0' : 'py-2'} {$$props.class}">
    <div class="flex flex-col">
        <p class="text-sm font-bold flex flex-row gap-2">
            <Icon src={icon} mini width={16}/>
            {name}
        </p>
        <p class="text-xs font-normal">{description}</p>
        
        <slot name="inner" />
    </div>
    
    <div class="mx-auto"/>
    
    <Switch bind:enabled={enabled} />
</div>
<slot />

{/if}