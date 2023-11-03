<script lang="ts">
    import type {
        CommentReportView,
        PostReportView,
        PrivateMessageReportView,
    } from 'lemmy-js-client'
    import { fade } from 'svelte/transition'
    
    import CommunityCardBasic from "./CommunityCardBasic.svelte";

    export let display:boolean = true
    export let item:PostReportView | CommentReportView | PrivateMessageReportView
</script>

{#if display}
    <div class="flex flex-col w-full p-2 gap-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}}>
        {#if item?.community }
            <CommunityCardBasic community={item.community} />
        {/if}
    </div>
{/if}
