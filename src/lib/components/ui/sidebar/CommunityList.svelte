<script lang="ts">
    import type { Community } from 'lemmy-js-client'

    import CommunityListItem from './CommunityListItem.svelte'

    export let items: Community[]
    export let expanded: boolean = true
    export let hidden: boolean = false
    export let filter: string | undefined = undefined
    export let group:string = ''
    export let menu:boolean = true

</script>


<div class="flex flex-col { expanded ? 'pl-1' : '' }" class:hidden={hidden}>
    {#each items.sort( (a, b) => a.title.localeCompare(b.title) ) as community (community.id)}
        <CommunityListItem 
            community={community} 
            group={group}
            hidden={(filter && !community.title.toLowerCase().trim().includes(filter.toLowerCase().trim())) || false }
            {expanded} {menu}
        />
    {/each}
</div>
