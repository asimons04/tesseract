<script lang="ts">
  import { profile } from '$lib/auth.js'
  import Button from '$lib/components/input/Button.svelte'
  import FileInput from '$lib/components/input/FileInput.svelte'
  import Modal from '$lib/components/ui/modal/Modal.svelte'
  import { toast } from '$lib/components/ui/toasts/toasts.js'
  import { uploadImage } from '$lib/lemmy.js'
  import { createEventDispatcher } from 'svelte'

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
      })
    }

    loading = false
  }
</script>

<Modal bind:open>
  <span slot="title">Upload image</span>
  <form class="flex flex-col gap-4" on:submit|preventDefault={upload}>
    <FileInput
      accept="image/jpeg,image/png,image/webp"
      image
      bind:files={image}
    />
    <Button {loading} disabled={loading} submit color="primary" size="lg">
      Upload
    </Button>
  </form>
</Modal>
