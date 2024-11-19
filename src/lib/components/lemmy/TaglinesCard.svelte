<script lang="ts">
    import type { Tagline } from 'lemmy-js-client'
    
    import { slide } from 'svelte/transition'

    import Markdown from "$lib/components/markdown/Markdown.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    import type { SystemTimerEvent } from '$lib/ui/events';
    

    export let taglines: Tagline[] | undefined = undefined

    let tagline = ''
    let lastTick: number = 0

    if (taglines && taglines.length > 0) {
        tagline = taglines[Math.floor(Math.random() * taglines.length)].content
    }

    function updateTaglineOnInterval(e:SystemTimerEvent) {
        if ( (e.detail.timestamp - lastTick) > 15) {
            lastTick = e.detail.timestamp
            if (taglines && taglines.length > 0) tagline = taglines[Math.floor(Math.random() * taglines.length)].content
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

