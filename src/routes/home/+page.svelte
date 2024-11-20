<script lang="ts">
    import { goto } from '$app/navigation'
    import { userSettings } from '$lib/settings'
    goto(`/home/${$userSettings?.defaultSort.sort.toLowerCase() ?? 'new'}`)
</script>