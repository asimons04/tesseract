<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';

    import { createEventDispatcher } from 'svelte'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte';
    import Button from "$lib/components/input/Button.svelte"
    import { Trash } from 'svelte-hero-icons';

    export let uploadResponse: UploadImageResponse | undefined
    export let iconSize:number = 16
    export let showPreview:boolean = false
    export let previewSize:number = 48
    
    let dispatcher = createEventDispatcher<{ delete: boolean }>()
    
    export async function deleteImage() {
        if (!uploadResponse?.delete_url || !$profile?.jwt) return
        const deleteResult = await fetch(uploadResponse.delete_url, 
            { 
                headers: {
                    Authorization: `Bearer ${$profile.jwt}`
                }
            }
        )
        if (deleteResult.ok) {
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
    <!---Delete the uploaded Image--->
    {#if uploadResponse?.delete_url}
        <Button color="tertiary-border" size="square-form" title="Delete Upload" icon={Trash} iconSize={iconSize} on:click={deleteImage} />
    {:else}
        <Button color="danger" size="square-form" title="Delete Upload" icon={Trash} iconSize={iconSize} disabled />
    {/if}
</div>