<script lang="ts">
    
    import type { PostDisplayType } from '../helpers';
    import type { PostView } from 'lemmy-js-client';

    import { userSettings} from '$lib/settings'

    
    export let post:PostView
    export let displayType:PostDisplayType = 'feed'
</script>


<!---Click to Remove Blur--->    
{#if post && $userSettings.nsfwBlur && displayType =='feed'}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="absolute z-20 left-0 top-0 w-full h-full bg-white/75 dark:bg-black/75" 
        on:click={(e)=> {
            if (nsfw) {
                e.preventDefault();
                e.stopPropagation();
                nsfw = nsfw = false;
            }
        }}
    >  
        <div class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-lg font-bold border border-slate-500 whitespace-nowrap shadow-lg p-4 cursor-pointer">
            [Reveal NSFW Content]
        </div>
    </div>
{:else}
    <slot/>
{/if}