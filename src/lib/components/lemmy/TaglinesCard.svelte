<script lang="ts">
    import type { SystemTimerEvent } from '$lib/ui/events';
    import type { Tagline } from 'lemmy-js-client'
    
    import { slide } from 'svelte/transition'

    import Markdown from "$lib/components/markdown/Markdown.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    
    

    export let taglines: Tagline[] | undefined = undefined
    export let interval:number = 15

    let tagline = getRandomTagline()
    let lastTick: number = 0
    
    function getRandomTagline() {
        if (taglines && taglines.length > 0) {
            return taglines[Math.floor(Math.random() * taglines.length)].content
        }
        return ''
    }


    function updateTaglineOnInterval(e:SystemTimerEvent) {
        if ( (e.detail.timestamp - lastTick) > interval) {
            lastTick = e.detail.timestamp
            if (taglines && taglines.length > 0) tagline = getRandomTagline()
        }
    }
</script>

<svelte:window on:systemTimer={updateTaglineOnInterval} />


<div class="flex flex-col w-full my-2" transition:slide>
    {#if tagline}
        <Card class="p-2 text-center">
            <Markdown source={tagline} />
        </Card>
    {/if}
</div>

