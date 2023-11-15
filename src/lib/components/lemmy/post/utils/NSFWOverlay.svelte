<script lang="ts">
    import { userSettings} from '$lib/settings'
    import { PostDisplayType } from '../helpers';
    
    export let nsfw:boolean
    export let displayType:PostDisplayType = 'feed'

    console.log("Overlay mounted", nsfw, displayType);
    //let acknowledge:boolean = false
</script>


<!---Click to Remove Blur--->    
{#if nsfw && $userSettings.nsfwBlur && displayType =='feed'}
    <div class="absolute z-20 left-0 top-0 w-full h-full bg-white/75 dark:bg-black/75">  
        <div class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-lg font-bold border border-slate-500 whitespace-nowrap shadow-lg p-4 cursor-pointer"
            on:click={(e)=> {
                if (nsfw) {
                    e.preventDefault();
                    e.stopPropagation();
                    //acknowledge = true;
                    nsfw = nsfw = false;
                }
            }}
        >
            [Reveal NSFW Content]
        </div>
    </div>
{/if}