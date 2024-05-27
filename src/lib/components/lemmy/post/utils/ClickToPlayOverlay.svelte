<script lang="ts">
    import type { PostDisplayType } from '../helpers';
    import { createEventDispatcher } from 'svelte'
    
    import { Icon, Play } from 'svelte-hero-icons'

    export let show:boolean
    export let displayType:PostDisplayType = 'feed'

    let dispatcher = createEventDispatcher()
</script>


<!---Click to Remove Blur--->    
{#if show && displayType =='feed'}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="absolute z-[5] left-0 top-0 w-full h-full bg-black/50" 
        on:click={(e)=> {
            if (show) {
                e.preventDefault();
                e.stopPropagation();
                show = show = false;
                dispatcher('click', e)
            }
        }}
    >  
        <div class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-lg font-bold 
            rounded-full border border-slate-500 whitespace-nowrap shadow-lg p-4 cursor-pointer
            bg-white dark:bg-black
            "
        >
            <Icon src={Play} mini width={64} />
        </div>
    </div>
{:else}
    <slot/>
{/if}