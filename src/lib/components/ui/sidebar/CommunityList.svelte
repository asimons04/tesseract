<script lang="ts">
    import type { Community } from 'lemmy-js-client'

    import CommunityListItem from './CommunityListItem.svelte'
    import { objectCopy } from '$lib/util';

    export let items: Community[]
    export let expanded: boolean = true
    export let hidden: boolean = false
    export let filter: string | undefined = undefined
    
    let filteredItems = objectCopy(items) as Community[]

    $: filter, updateFilter()

    function updateFilter() {
       // Reset to "all" if filter blank
        if (!filter) {
            filteredItems = objectCopy(items) as Community[]
            return
        }
    
        // Allow filtering by instance if filter starts with '@'
        if (filter?.startsWith('@')) {
            filteredItems = [] as Community[]
            let f = filter.replace('@', '')
            
            items.forEach((i) => {
                if (new URL(i.actor_id).hostname.trim().startsWith(f.trim())) {
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
        items.forEach((i) => {
            let f = filter.trim()
            if (i.title.toLowerCase().trim().includes(f.toLowerCase().trim())) {
                filteredItems.push(i)
            }
        })
        filteredItems = filteredItems
    }



</script>


<div class="flex flex-col { expanded ? 'pl-1' : '' }" class:hidden={hidden}>
    {#each filteredItems.sort( (a, b) => a.title.localeCompare(b.title) ) as community (community.id)}
        <CommunityListItem {community} {expanded} />
    {/each}
</div>
