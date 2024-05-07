<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { uploadImage } from '$lib/lemmy.js'
  
    import Button from '$lib/components/input/Button.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'

    import { Photo } from 'svelte-hero-icons'

    export let open: boolean
    export let image: FileList | null = null

    let loading = false

    const dispatcher = createEventDispatcher<{ upload: string }>()

    async function upload() {
        if (!$profile?.jwt || image == null) return

        loading = true

        try {
            const uploaded = await uploadImage(image[0])
            if (!uploaded) throw new Error('Image upload returned undefined')
            
            dispatcher('upload', uploaded)
            loading = false
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

<Modal bind:open icon={Photo} title="Upload Image" >
    <form class="flex flex-col gap-4" on:submit|preventDefault={upload}>
        <FileInput image bind:files={image} accept="image/jpeg,image/png,image/webp"/>
        <Button {loading} disabled={loading} submit color="primary" size="lg">
            Upload
        </Button>
    </form>
</Modal>
