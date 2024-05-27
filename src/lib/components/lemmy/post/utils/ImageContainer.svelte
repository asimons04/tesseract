<script lang="ts">
    import { userSettings } from "$lib/settings";
    export let limitHeight = false
</script>

<div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
    <div class="ml-auto mr-auto {$userSettings.imageSize.feed ?? 'max-w-3xl'}"> 
        <picture class="rounded-md overflow-hidden w-full {limitHeight ? 'max-h-[min(50vh,500px)]' : ''}  max-w-full"> 
            <slot/>
        </picture>
    </div>
</div>