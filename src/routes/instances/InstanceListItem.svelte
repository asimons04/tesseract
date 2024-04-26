<script lang="ts">
    import type { Instance } from 'lemmy-js-client'
    
    export let instance: Instance
    
    
</script>   

<div class="bg-slate-100 dark:bg-zinc-800 text-black dark:text-slate-100 border border-slate-900 dark:border-zinc-100 p-2 text-sm rounded-md leading-[22px]">    
    <div class="flex flex-col w-full gap-1">
        
        <span class="text-base font-bold">{instance.domain}</span>
        <span class="text-xs font-normal">{instance.software} {instance.version}</span>

    </div>
</div>