<script lang="ts">
    import { goto } from '$app/navigation'
    import { userSettings } from '$lib/settings'
    const sort = $userSettings?.defaultSort.sort.toLowerCase() ?? 'new'
    const type = $userSettings?.defaultSort.feed.toLowerCase() ?? 'all'

    goto(`/home/${type}/${sort}`)
</script>

