<script lang="ts">
    import { dispatchWindowEvent, type SystemTimerEvent } from "$lib/ui/events"
    import { onDestroy, onMount } from "svelte"
    import { StorageCache } from '$lib/storage-controller'
    import { userSettings } from "$lib/settings";
    import { get } from "svelte/store";

    let systemTimer: number
    let lastTick = 0

    onMount( () => {
        systemTimer = window.setInterval(() => {
            const now = Math.round(new Date().getTime() /1000)
            dispatchWindowEvent('systemTimer', {timestamp: now} )
        }, 1000)
    })


    onDestroy(() => {
        clearInterval(systemTimer)
    })

    // Add tasks here that should be performed globally.
    const handlers = {
        SystemTimerEvent(e:SystemTimerEvent) {
            
            // Every minute, run housekeeping on the controller's storage
            if ( (e.detail.timestamp - lastTick) >= 60) {
                lastTick = e.detail.timestamp
                if (get(userSettings).debugInfo) console.log("SystemTimer.svelte: Running storage housekeeping...")
                new StorageCache({type: 'local'}).housekeep()
                new StorageCache({type: 'session'}).housekeep()
            }
        }
    }
</script>

<svelte:window on:systemTimer={handlers.SystemTimerEvent} />
