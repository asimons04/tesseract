<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';

    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
  
    import Button from '$lib/components/input/Button.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'

    import { Photo } from 'svelte-hero-icons'
    

    export let open: boolean
    export let image: FileList | null = null

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
            image = null
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

        <Button {loading} disabled={loading} submit color="primary" size="lg">
            Upload
        </Button>
    </form>
</Modal>
