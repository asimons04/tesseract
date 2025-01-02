<script lang="ts">
    // The API's emails send a link to /reports, so set up a redirect to /moderation here
    
    import { goto } from '$app/navigation'
    goto(`/moderation`)
</script>

