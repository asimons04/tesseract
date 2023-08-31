<script lang="ts">
    import { goto } from '$app/navigation'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    export let data;
    
    if (!data) {
        toast({
            content: "Something went wrong with the API call",
            type: 'warning'
        })
    }

    if (data.status && data.status == 200) {
        toast({
            content: "Successfully verified email.",
            type: 'success',
        })
        goto('/');
    }

    if (data.status && data.status == 404) {
        toast({
                content: `${data.message}`,
                type: 'error',
        });
        goto('/');
    }
    
</script>