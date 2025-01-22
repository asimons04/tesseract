<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';

    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'
    import { blobToFileList, imageBlobToWebp } from '$lib/components/uploads/helpers'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { ENABLE_MEDIA_PROXY, userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte';
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte';
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { Cloud, CloudArrowUp, EyeDropper, Photo, XCircle } from 'svelte-hero-icons'

    export let open: boolean
    export let image: FileList | null = null
    export let altText: string = ''
    export let useAltText = true
    export let purpose:string = 'Media'

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
            isVideo = false
        
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
                title: "Error"
            })
        }
        loading = false
    }

    function cancel() {
        altText = ''
        image = null
        loading = false
        open = false
        isVideo = false
    }

    $: image, disableWebpConvert(image)
    let isVideo = false

    function disableWebpConvert(f:FileList | null) {
        if (!f) return
        if (f[0].type?.split('/')[0] == 'video') {
            $userSettings.convertUploadsToWebp = false
            isVideo = true
        }
    }
</script>

<Modal bind:open icon={Photo} title="Upload {purpose}" width="max-w-lg" preventCloseOnClickOut on:close={() => cancel()}>
    <form class="flex flex-col gap-4" >
        
        <FileInput image bind:files={image} accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"/>
        
        {#if useAltText}
            <TextInput bind:value={altText} type="text" label="Alt Text" placeholder="Briefly describe the image"/>
        {/if}

        {#if !isVideo}
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

            {#if ENABLE_MEDIA_PROXY && $userSettings.proxyMedia.enabled}
                <SettingToggle bind:value={$userSettings.proxyMedia.useForImageUploads} icon={Cloud} title="Use Image Proxy" 
                    description="Use the Tesseract image proxy URL for the image URL."
                />
            {/if}
        </SettingToggleContainer>
        {/if}
    </form>

    <div class="flex flex-row gap-4 mt-4 items-center justify-between" slot="buttons">
        <Button disabled={loading} icon={XCircle} iconSize={20} color="danger" size="lg" on:click={() => cancel() }>
            Cancel
        </Button>
        
        <Button {loading} disabled={loading||!image} icon={CloudArrowUp} iconSize={20} on:click={async () => await upload()} color="primary" size="lg">
            Upload
        </Button>
    </div>
</Modal>
