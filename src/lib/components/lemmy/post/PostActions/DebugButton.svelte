<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import { userSettings } from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte'
    import { Icon, BugAnt } from 'svelte-hero-icons'
    
    
    export let post:PostView
    let debug:boolean = false;

</script>

{#if $userSettings.debugInfo}
    {#await import('$lib/components/util/debug/DebugObject.svelte') then { default: DebugObject }}
        <DebugObject object={post} bind:open={debug} />
    {/await}

    <!--class="hover:text-inherit border-none"-->
    <Button on:click={() => (debug = true)} size="square-md"  title="Debug Info" color="tertiary-border">
        <Icon src={BugAnt} mini size="16" slot="icon" />
    </Button>
{/if}

