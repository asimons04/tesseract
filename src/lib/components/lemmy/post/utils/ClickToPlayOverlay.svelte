<script lang="ts">
    import type { PostDisplayType } from '../helpers';
    import { createEventDispatcher } from 'svelte'
    import { userSettings } from '$lib/settings'
    
    import { Icon, Play } from 'svelte-hero-icons'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';

    export let show:boolean
    export let loading: boolean = false

    let dispatcher = createEventDispatcher()
</script>


<!---Click to Remove Blur--->    
{#if show }
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="absolute z-[5] left-0 top-0 w-full h-full bg-slate-200/35 dark:bg-zinc-800/35" 
        on:click={(
            //@ts-ignore
            e
        )=> {
            if (show) {
                e.preventDefault();
                e.stopPropagation();
                //show = show = false;
                dispatcher('click', e)
            }
        }}
    >  
        <div class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-lg font-bold 
            rounded-full border-2 border-slate-200 whitespace-nowrap shadow-lg p-4 cursor-pointer
            bg-white/50 dark:bg-black/50 hover:text-sky-500
            "
        >
            {#if loading}
                <Spinner width={64}/>
            {:else}
                <Icon src={Play} mini width={64} />
            {/if}
        </div>
    </div>
{:else}
    <slot/>
{/if}