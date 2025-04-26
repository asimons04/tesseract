<script lang="ts">
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { parseSortType } from '$lib/components/lemmy/feed/helpers'
    import { userSettings } from '$lib/settings'
    
    const sort = parseSortType($userSettings?.defaultSort.sort.toLowerCase() ?? 'new')
    goto(`/c/${$page.params.community_name}/${sort}`)
</script>