<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import { page } from '$app/stores'
    import { goto } from '$app/navigation'
    import { getClient, getInstance } from '$lib/lemmy.js'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    export let data;
    
    
    console.log(data);
    

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