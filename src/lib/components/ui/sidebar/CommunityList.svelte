<script lang="ts">
    import type { Community } from 'lemmy-js-client'

    import CommunityListItem from './CommunityListItem.svelte'
    import { objectCopy } from '$lib/util';
    import Placeholder from '../Placeholder.svelte';

    export let items: Community[]
    export let expanded: boolean = true
    export let hidden: boolean = false
    export let filter: string | undefined = undefined
    export let showFavoriteButton: boolean= true
    export let placeholderTitle = "No Subscriptions"
    export let placeholderDescription="You have no subscriptions"
    export let communityScrollArea: HTMLDivElement | undefined = undefined

    let filteredItems = objectCopy(items) as Community[]

    $: filter, items, updateFilter()

    function updateFilter() {
       // Reset to "all" if filter blank
        if (!filter) {
            filteredItems = objectCopy(items) as Community[]
            return
        }
    
        // Allow filtering by instance if filter starts with '@'
        if (filter?.startsWith('@')) {
            filteredItems = [] as Community[]
            let f = filter.replace('@', '').trim().toLowerCase()
            
            items.forEach((i) => {
                if (new URL(i.actor_id).hostname.toLowerCase().trim().startsWith(f)) {
                    filteredItems.push(i)
                }
            })
            filteredItems = filteredItems
            return
        }

        // Allow filtering by exact name if filter starts with '!'
        if (filter?.startsWith('!')) {
            filteredItems = [] as Community[]

            let f = filter.replace('!', '')
            let [name, instance] = f.split('@')
            name = name.toLowerCase().trim()
            if (instance) instance = instance.toLowerCase().trim()
            
            items.forEach((i) => {
                
                if (
                    i.name.toLowerCase().trim().startsWith(name.trim()) &&
                    (!instance || new URL(i.actor_id).hostname.toLowerCase().trim().startsWith(instance))
                    
                ) {
                    filteredItems.push(i)
                }
            })
            filteredItems = filteredItems
            return
        }
        
        // Generic filter if no more specific flags are set
        filteredItems = [] as Community[]
        let f = filter.trim().toLowerCase()
        let [title, instance] = f.split('@')
        
        title = title.toLowerCase().trim()
        instance = instance ? instance.toLowerCase().trim() : ''
        
        items.forEach((i) => {
            let compareValue = i.title
                ? i.title.toLowerCase().trim()
                : i.name.toLowerCase().trim()
            
            if ( compareValue.includes(title) &&
                (!instance || new URL(i.actor_id).hostname.toLowerCase().trim().startsWith(instance))
            ) {
                filteredItems.push(i)
            }
        })
        filteredItems = filteredItems
    }



</script>

{#if filteredItems.length > 0 }
    <div bind:this={communityScrollArea} class="flex flex-col { expanded ? 'pl-1' : '' } {$$props.class}" class:hidden={hidden}>
        {#each filteredItems.sort( (a, b) => a.title.localeCompare(b.title) ) as community (community.id)}
            <CommunityListItem {community} {expanded} {showFavoriteButton}/>
        {/each}
    </div>
{:else}
    <Placeholder title={placeholderTitle} description={placeholderDescription} class="mx-auto w-[75%]"/>
{/if}
