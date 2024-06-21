<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';

    import { createEventDispatcher } from 'svelte'
    import { deleteImageUpload } from './helpers';
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Button from "$lib/components/input/Button.svelte"
    import { Trash } from 'svelte-hero-icons';

    export let uploadResponse: UploadImageResponse | undefined
    export let iconSize:number = 16
    
    let dispatcher = createEventDispatcher<{ delete: boolean }>()
    
    export async function deleteImage() {
        if (!uploadResponse) return
        
        const deleteResult = await deleteImageUpload(uploadResponse)
        if (deleteResult) {
            toast({
                type: 'success',
                title: 'Image Deleted',
                content: 'The uploaded image was successfully deleted'
            })
            dispatcher('delete', true)
            uploadResponse = undefined
        }
        else {
            toast({
                type: 'error',
                title: 'Error',
                content: 'Failed to call delete URL for that image.'
            })
            dispatcher('delete', false)
        }
    }
</script>

<div class="flex flex-row gap-2 items-center">
    <Button color="tertiary-border" size="square-form" title="Delete Upload" icon={Trash} iconSize={iconSize} disabled={!uploadResponse?.delete_url} on:click={deleteImage} />
</div>