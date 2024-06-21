<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';

    import { createEventDispatcher } from 'svelte'
    import { deleteImageUpload } from './helpers';
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte';
    import Button from "$lib/components/input/Button.svelte"
    import { Trash } from 'svelte-hero-icons';

    export let uploadResponse: UploadImageResponse | undefined
    export let previewSize:number = 48
    
    let dispatcher = createEventDispatcher<{ 
        delete: boolean 
        insert: UploadImageResponse
    }>()
    
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

{#if uploadResponse}
<div class="relative flex flex-row gap-0 items-center">
    <button on:click={() => {
        if (uploadResponse?.url) {
            navigator.clipboard.writeText(uploadResponse.url)
            dispatcher('insert', uploadResponse)
        }
    }}>
        <Avatar url={uploadResponse.url} width={previewSize} circle={false}/>
    </button>
    
    <span class="absolute bottom-0 right-0 bg-white dark:bg-black">
        <Button color="danger" size="square-sm" title="Delete Upload"
            icon={Trash} iconSize={12} 
            disabled={!uploadResponse?.delete_url} on:click={deleteImage} 
        />
    </span>
</div>
{/if}