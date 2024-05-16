<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';

    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
  
    import Button from '$lib/components/input/Button.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { CloudArrowUp, Photo, XCircle } from 'svelte-hero-icons'
    

    export let open: boolean
    export let image: FileList | null = null
    export let altText: string = ''
    export let useAltText = true
    
    let loading = false
    let uploadResponse:UploadImageResponse | undefined = undefined

    const dispatcher = createEventDispatcher<{ upload: UploadImageResponse }>()

    async function upload() {
        if (!$profile?.jwt || image == null) return

        loading = true

        try {
            uploadResponse = await getClient().uploadImage({image: image[0]} )
            if (uploadResponse?.msg != 'ok') throw new Error(`Image upload returned an error: ${uploadResponse?.msg}`)
            dispatcher('upload', uploadResponse)
            loading = false
        
            // Reset the preview image and alt text
            image = null
            altText = ''
        
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
                title: "Error"
            })
        }
        loading = false
    }
</script>

<Modal bind:open icon={Photo} title="Upload Image" width="max-w-lg">
    <form class="flex flex-col gap-4" on:submit|preventDefault={upload}>
        <FileInput image bind:files={image} accept="image/jpeg,image/png,image/webp"/>
        {#if useAltText}
            <TextInput bind:value={altText} type="text" label="Alt Text" placeholder="Briefly describe the image"/>
        {/if}
        
        <div class="flex flex-row gap-4 items-center">
            <Button disabled={loading} icon={XCircle} color="danger" size="lg" class="w-full" on:click={() => {
                altText = ''
                image = null
                loading = false
                open = false
            }}>
                Cancel
            </Button>
            
            <Button {loading} disabled={loading} icon={CloudArrowUp} submit color="primary" size="lg" class="w-full">
                Upload
            </Button>
        </div>
    </form>
</Modal>
