<script lang="ts">
    import type { SystemTimerEvent } from '$lib/ui/events';
    
    export let date: string | number
    export let relativeTo: Date = new Date()
    export let short: boolean = false
    export let updateInterval: number = 30
    export let showAbsoluteTime: boolean = false
    export let options: Intl.RelativeTimeFormatOptions = {
        numeric: 'always',
        style: 'narrow',
    }

    const stringToDate = (date: number|string): Date => new Date(date)
    
    const toLocaleDateString = (date: Date): string => {
        try {
            return date.toLocaleString()
        } catch (err) {
            return 'Invalid Date'
        }
    }
    
    
    
    let lastTick: number = 0
    function handleSystemTimerEvent(e:SystemTimerEvent) {
        if ( (e.detail.timestamp - lastTick) > updateInterval) {
            lastTick = e.detail.timestamp
            relativeTo = new Date()
        }
    }

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
  
                    if (short) return rtf.format(-value, thresholds[i].unit as any).replace('ago', '').trim()
                    else return rtf.format(-value, thresholds[i].unit as any)
                }
            }
            return 'Now'
        } catch (err) {
            return 'Invalid Date'
        }
    }

    let displayVal = formatRelativeDate(stringToDate(date))
    $:  dateTime = toLocaleDateString(stringToDate(date))

    $:  relativeTo, displayVal = formatRelativeDate(stringToDate(date))
</script>

<svelte:window on:systemTimer={handleSystemTimerEvent} />

{#if showAbsoluteTime}
    <time class="{$$props.class}" datetime={dateTime} title={dateTime}>
        {dateTime}
    </time>
    
{:else}
    <time class="whitespace-nowrap {$$props.class}" datetime={dateTime} title={dateTime}>
        {displayVal}
    </time>
{/if}