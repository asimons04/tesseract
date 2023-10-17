<script lang="ts">

    import { userSettings } from '$lib/settings.js'
    import Button from '$lib/components/input/Button.svelte'

    import { 
        ArrowSmallLeft,
        ChevronDoubleUp,
        ChevronDoubleDown,
        Icon 
    } from 'svelte-hero-icons'

    export let position: 'top' | 'bottom' = 'top'
</script>

{#if position=="top"}
    <!--- Menu bar above post content --->
    <div class="flex flex-row gap-2 w-full mb-2 justify-between" class:hidden={!$userSettings.uiState.showPWAButtons}>
        <!--- Button to Return to Feed --->
        <Button class="font-normal w-full" title="Go back to feed"
            on:click={() => {
                history.back();
            }}
            hidden={history.length<2}
        >
            <Icon src={ArrowSmallLeft} mini size="16" slot="icon" />
            <span class="hidden md:inline">Return to Feed</span>
        </Button>
        
        <!--- Button to Scroll to the Bottom --->
        <Button class="font-normal w-full" title="Scroll to Top"
            on:click={() => {
                window.scrollTo(0,document.body.scrollHeight);
            }}
        >
            <Icon src={ChevronDoubleDown} mini size="16" slot="icon" />
            <span class="hidden md:inline">Scroll to Bottom</span>
        </Button>
        
    </div>
{/if}

{#if position=="bottom"}
<!--- Menu bar below post/comments content --->
    <div class="flex flex-row gap-2 w-full mb-2 justify-between" class:hidden={!$userSettings.uiState.showPWAButtons}>
        <!--- Button to Return to Feed --->
        <Button class="font-normal w-full" title="Go back to feed"
            on:click={() => {
                history.back();
            }}
            hidden={history.length<2}
        >
            <Icon src={ArrowSmallLeft} mini size="16" slot="icon" />
            <span class="hidden md:inline">Return to Feed</span>
        </Button>

        <!--- Button to Scroll to the Top --->
        <Button class="font-normal w-full" title="Scroll to Top"
            on:click={() => {
                window.scrollTo(0,0);
            }}
        >
            <Icon src={ChevronDoubleUp} mini size="16" slot="icon" />
            <span class="hidden md:inline">Scroll to Top</span>
        </Button>

    </div>

{/if}