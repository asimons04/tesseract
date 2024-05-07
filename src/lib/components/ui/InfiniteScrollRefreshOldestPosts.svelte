<script lang="ts">
    import { goto } from '$app/navigation';
    import Button from "../input/Button.svelte";
    import { Icon, ChevronDoubleUp } from 'svelte-hero-icons';

    export let show:boolean = false
</script>


{#if show}
<div class="flex my-4">
    <Button color="tertiary-border" class="w-fit mx-auto" title="Load Older Posts" on:click>
        <div class="flex flex-row gap-2 items-center">
            <Icon src={ChevronDoubleUp} mini size="16" />
            Load Older Posts 
            <Icon src={ChevronDoubleUp} mini size="16" />
        </div>
    </Button>
</div>
{/if}