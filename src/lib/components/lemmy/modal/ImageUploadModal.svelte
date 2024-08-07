<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';

    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'
    import { blobToFileList, imageBlobToWebp } from '$lib/components/uploads/helpers'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte';
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte';
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { CloudArrowUp, EyeDropper, Photo, XCircle } from 'svelte-hero-icons'

    export let open: boolean
    export let image: FileList | null = null
    export let altText: string = ''
    export let useAltText = true
    export let purpose:string = 'Image'

    let loading = false
    let uploadResponse:UploadImageResponse | undefined = undefined

    const dispatcher = createEventDispatcher<{ upload: UploadImageResponse }>()

    async function upload() {
        if (!$profile?.jwt || image == null) return

        loading = true

        try {
            const imageFile = $userSettings.convertUploadsToWebp 
                ? blobToFileList(await imageBlobToWebp(image[0]))
                : image

            uploadResponse = await getClient().uploadImage({image: imageFile[0]} )
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

<Modal bind:open icon={Photo} title="Upload {purpose}" width="max-w-lg" preventCloseOnClickOut>
    <form class="flex flex-col gap-4" >
        
        <FileInput image bind:files={image} accept="image/jpeg,image/png,image/webp"/>
        
        {#if useAltText}
            <TextInput bind:value={altText} type="text" label="Alt Text" placeholder="Briefly describe the image"/>
        {/if}

        <SettingToggleContainer>
            <SettingToggle icon={Photo} title="Pre-process Image to WebP" bind:value={$userSettings.convertUploadsToWebp}
                description="Convert the image to webP prior to uploading. Will reduce bandwidth and save work on the instance server. 
                    Also useful if your instance has a small maximum upload limit."
            />

            <SettingMultiSelect icon={EyeDropper} title="WebP Quality" bind:selected={$userSettings.convertUploadQuality}
                options={[10, 20, 30, 40, 50, 60, 70, 75, 80, 85, 95, 100]}
                condition={$userSettings.convertUploadsToWebp}
                description="What quality level to use when converting the image to webP. Lower gives a smaller file, higher gives better quality."
            />
        </SettingToggleContainer>
    </form>

    <div class="flex flex-row gap-4 mt-4 items-center justify-between" slot="buttons">
        <Button disabled={loading} icon={XCircle} iconSize={20} color="danger" size="lg" on:click={() => {
            altText = ''
            image = null
            loading = false
            open = false
        }}>
            Cancel
        </Button>
        
        <Button {loading} disabled={loading||!image} icon={CloudArrowUp} iconSize={20} on:click={async () => await upload()} color="primary" size="lg">
            Upload
        </Button>
    </div>
</Modal>
