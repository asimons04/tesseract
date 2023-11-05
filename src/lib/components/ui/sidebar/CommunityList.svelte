<script lang="ts">
    import type { Community } from 'lemmy-js-client'

    import CommunityListItem from './CommunityListItem.svelte'

    export let items: Community[]
    export let expanded: boolean
    export let hidden: boolean
    export let filter: string

</script>


<div class="flex flex-col { expanded ? 'pl-1' : '' }" class:hidden={hidden}>
    {#each items.sort( (a, b) => a.title.localeCompare(b.title) ) as community (community.id)}
        <CommunityListItem 
            community={community} 
            hidden={(filter && !community.title.toLowerCase().trim().includes(filter.toLowerCase().trim())) || false }
            {expanded}
        />
    {/each}
</div>
