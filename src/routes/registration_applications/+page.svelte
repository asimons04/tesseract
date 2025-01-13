<script lang="ts">
    // The API's emails send a link to /registration_applications, so set up a redirect to /admin/applications here
    
    import { goto } from '$app/navigation'
    goto(`/admin/applications`)
</script>

