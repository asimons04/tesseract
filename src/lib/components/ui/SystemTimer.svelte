<script lang="ts">
    import { dispatchWindowEvent } from "$lib/ui/events"
    import { onDestroy, onMount } from "svelte"

    let systemTimer: number

    onMount( () => {
        systemTimer = window.setInterval(() => {
            const now = Math.round(new Date().getTime() /1000)
            dispatchWindowEvent('systemTimer', {timestamp: now} )
        }, 1000)
    })


    onDestroy(() => {
        clearInterval(systemTimer)
    })
</script>