<script lang="ts">
    import { page } from '$app/stores'
    import { userSettings } from '$lib/settings'
    import { goto } from '$app/navigation';
    
    
    const sortType = $page.params.sort
    const listingType = $userSettings?.defaultSort.feed.toLowerCase() ?? 'all'
    goto(`/home/${listingType}/${sortType}`)
</script>

