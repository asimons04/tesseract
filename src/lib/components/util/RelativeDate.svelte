<script lang="ts">
    import { onMount, onDestroy } from 'svelte'
    import { userSettings } from '$lib/settings'
    
    export let date: string
    export let relativeTo: Date = new Date()
    export let options: Intl.RelativeTimeFormatOptions = {
        numeric: 'always',
        style: 'narrow',
    }

    const stringToDate = (date: string): Date => new Date(date)
    const toLocaleDateString = (date: Date): string => {
        try {
            return date.toLocaleString()
        } catch (err) {
            return 'Invalid Date'
        }
    }
    
    $: dateTime = toLocaleDateString(stringToDate(date))

    // Set an interval to update the comnparison time every minute
    let updateInterval:number
    const startInterval = function() {
        if ($userSettings.uiState.autoUpdateDates) {
            updateInterval = window.setInterval(() => {
            relativeTo = new Date()    
            }, 60 * 1000)
        }
    }

    const stopInterval = function() {
        if (!updateInterval) return
        window.clearInterval(updateInterval)
    }

    onMount(() => startInterval() )
    onDestroy(() => stopInterval() )


    onDestroy(() => {
        clearInterval(updateInterval)
    })


    function formatRelativeDate(date: Date) {
        try {
            const now = relativeTo?.getTime() 
            const diffInMillis = now - date.getTime()
  
            const thresholds = [
                { unit: 'second', threshold: 1000 },
                { unit: 'minute', threshold: 60 * 1000 },
                { unit: 'hour', threshold: 60 * 60 * 1000 },
                { unit: 'day', threshold: 24 * 60 * 60 * 1000 },
                { unit: 'week', threshold: 7 * 24 * 60 * 60 * 1000 },
                { unit: 'month', threshold: 30 * 24 * 60 * 60 * 1000 },
                { unit: 'year', threshold: 365 * 24 * 60 * 60 * 1000 },
            ]
  
            for (let i = thresholds.length - 1; i >= 0; i--) {
                if (diffInMillis >= thresholds[i].threshold) {
                    const value = Math.round(diffInMillis / thresholds[i].threshold)

                    let language = 'en'

                    if (typeof navigator != 'undefined') {
                        language = navigator.language
                    }
  
                    const rtf = new Intl.RelativeTimeFormat(language, options)
  
                    return rtf.format(-value, thresholds[i].unit as any)
                }
            }
            return 'Now'
        } catch (err) {
            return 'Invalid Date'
        }
    }
</script>
  
<time class="whitespace-nowrap" datetime={dateTime} title={dateTime}>
    {#key relativeTo}
        {formatRelativeDate(stringToDate(date))}
    {/key}
</time>