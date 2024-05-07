<script lang="ts">
    import type { StandardReport } from "./helpers";
    import { fade } from 'svelte/transition'
    
    import CommunityCardBasic from "./CommunityCardBasic.svelte";

    export let display:boolean = true
    export let item: StandardReport
</script>

{#if display && item.community}
    <div class="flex flex-col w-full p-2 gap-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}}>
        <CommunityCardBasic community={item.community} />
    </div>
{/if}
