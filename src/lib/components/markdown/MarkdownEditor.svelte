<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client'

    import { blobToFileList, readImageFromClipboard, readTextFromClipboard } from '../uploads/helpers';
    import { createEventDispatcher } from 'svelte'
    import { imageProxyURL } from '$lib/image-proxy'
    import { userSettings } from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte'
    import CommunityAutocomplete from '../lemmy/CommunityAutocomplete.svelte'
    import EmojiPicker from './EmojiPicker.svelte'
    import ImageUploadModal from '../lemmy/modal/ImageUploadModal.svelte'
    import ImageUploadPreviewDeleteButton from '../uploads/ImageUploadPreviewDeleteButton.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import PersonAutocomplete from '../lemmy/PersonAutocomplete.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'

    import {
        CodeBracket,
        ExclamationTriangle,
        FaceSmile,
        Icon,
        Link,
        ListBullet,
        Photo,
        User,
        UserGroup,
    } from 'svelte-hero-icons'
    
    
    
    
    

    
    export let value: string = ''
    export let label: string | undefined = undefined
    export let images: boolean = true
    export let emojis: boolean = true
    export let previewButton: boolean = false
    export let disabled: boolean = false
    export let rows: number = 4
    export let previewing:boolean = false;
    export let id:string = '';
    export let placeholder: string = ''
    
    // Bind this to an outside value if need to persist between create/destroy of this component
    export let imageUploads = [] as UploadImageResponse[]

    let textArea: HTMLTextAreaElement
    let uploadingImage = false
    let emojiPickerOpen:boolean = false
    let minRows = rows
    let imageAltText: string

    let pasteImage: FileList | null
    let processingPastedImage = false

    let pickingUser:  boolean = false
    let pickingCommunity: boolean = false

    const dispatcher = createEventDispatcher<{ confirm: string }>()

    function replaceTextAtIndices(str: string, startIndex: number, endIndex: number, replacement: string) {
        return str.substring(0, startIndex) + replacement + str.substring(endIndex)
    }

    function wrapSelection(start: string, end: string) {
        const startPos = textArea.selectionStart
        const endPos = textArea.selectionEnd

        const substring = textArea.value.substring(startPos, endPos)
        let newText = `${start}${substring}${end}`

        textArea.value = replaceTextAtIndices(
            textArea.value,
            startPos,
            endPos,
            newText
        )

        textArea.focus()
        textArea.selectionStart = startPos + start.length
        textArea.selectionEnd = endPos + start.length

        value = textArea.value
    }

    const shortcuts = {
        KeyB: () => wrapSelection('**', '**'),
        KeyE: () => {emojiPickerOpen = !emojiPickerOpen},
        KeyI: () => wrapSelection('*', '*'),
        KeyS: () => wrapSelection('~~', '~~'),
        KeyH: () => wrapSelection('\n# ', ''),
        KeyK: () => wrapSelection('[](', ')'),
        Enter: () => dispatcher('confirm', value),
    }

    
    
</script>

{#if uploadingImage && images}
    <ImageUploadModal bind:open={uploadingImage} bind:image={pasteImage} bind:altText={imageAltText} on:upload={(e) => {
            if (e.detail?.url) {
                $userSettings.proxyMedia.useForImageUploads
                    ? wrapSelection(`![${imageAltText}](${imageProxyURL(e.detail.url)})`, '')
                    : wrapSelection(`![${imageAltText}](${e.detail.url})`, '')
                imageUploads.push(e.detail)
                imageUploads = imageUploads
            }
            uploadingImage = false
        }}
    />
{/if}

<div class="flex flex-col w-full">
    {#if label}
        <div class="block my-1 font-bold text-sm">{label}</div>
    {/if}

    <div class="flex flex-col border border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 rounded-md overflow-hidden focus-within:border-black focus-within:dark:border-white transition-colors w-full h-full">
        {#if previewing}
            
            <div class="bg-slate-100 dark:bg-zinc-900 px-3 py-2.5 border border-slate-300 dark:border-zinc-700 rounded-md overflow-auto text-sm resize-none" style="height: {(rows+3)*24}px">
                <Markdown source={value} />
            </div>

        {:else}
            <div class="flex flex-col px-1">
                <!--Toolbar-->
                <div class="flex flex-col lg:flex-row h-fit p-1.5 gap-4 mb-2 {$$props.disabled ? 'opacity-60 pointer-events-none' : ''}">
                    
                    <!---Formatting Buttons--->
                    <span class="flex flex-row flex-wrap gap-1.5 items-center">
                        <!--Emoji Picker Button-->
                        {#if emojis}
                            <Button
                                on:click={() => emojiPickerOpen = !emojiPickerOpen}
                                title="Emojis"
                                size="square-md"
                            >
                                <span class="font-bold">
                                    <Icon src={FaceSmile} mini size="16"/>
                                </span>
                            </Button>
                        {/if}

                        <!---Image Upload Button--->
                        {#if images}
                            <Button
                                on:click={() => (uploadingImage = !uploadingImage)}
                                title="Image"
                                size="square-md"
                                loading={processingPastedImage}
                                disabled={processingPastedImage}
                            >
                                {#if !processingPastedImage}
                                    <Icon src={Photo} size="16" mini />
                                {/if}
                            </Button>
                        {/if}

                        <!---User Picker Button--->
                        <Button
                            on:click={() => {
                                pickingCommunity = false
                                pickingUser = !pickingUser
                            }}
                            title="Find User"
                            size="square-md"
                            icon={User}
                            iconSize={16}
                        />

                        <!---Community Picker Button--->
                        <Button
                            on:click={() => {
                                pickingUser = false
                                pickingCommunity = !pickingCommunity
                            }}
                            title="Find Community"
                            size="square-md"
                            icon={UserGroup}
                            iconSize={16}
                        />
                            
                        
                    
                        <Button
                            on:click={() => wrapSelection('**', '**')}
                            title="Bold"
                            size="square-md"
                        >
                            <span class="font-bold">B</span>
                        </Button>

                        <Button
                            on:click={() => wrapSelection('*', '*')}
                            title="Italic"
                            size="square-md"
                        >
                            <span class="italic font-bold">I</span>
                        </Button>
                    
                        <Button
                            on:click={() => wrapSelection('[label](url)', '')}
                            title="Link"
                            size="square-md"
                        >
                            <Icon src={Link} mini size="16" />
                        </Button>
                    
                        <Button
                            on:click={() => wrapSelection('\n# ', '')}
                            title="Header"
                            size="square-md"
                        >
                            <span class="italic font-bold font-serif">H</span>
                        </Button>

                        <Button
                            on:click={() => wrapSelection('~~', '~~')}
                            title="Strikethrough"
                            size="square-md"
                        >
                            <span class="line-through font-bold">S</span>
                        </Button>

                        <Button
                            on:click={() => wrapSelection('\n> ', '')}
                            title="Quote"
                            size="square-md"
                        >
                            <span class="font-bold font-serif">"</span>
                        </Button>

                        <Button
                            on:click={() => wrapSelection('\n- ', '')}
                            title="List"
                            size="square-md"
                        >
                            <Icon src={ListBullet} mini size="16" />
                        </Button>

                        <Button
                            on:click={() => wrapSelection('`', '`')}
                            title="Code"
                            size="square-md"
                        >
                            <Icon src={CodeBracket} mini size="16" />
                        </Button>

                        <Button
                            on:click={() =>
                            wrapSelection('::: spoiler Spoiler Title\n', '\n:::')}
                            title="Spoiler"
                            size="square-md"
                        >
                            <Icon src={ExclamationTriangle} mini size="16" />
                        </Button>
                    </span>

                    <!---Markdown editor resize slider--->
                    <span class="flex flex-row gap-1 w-full lg:w-fit lg:ml-auto items-center">
                        <input type="range" bind:value={rows} min={minRows} max={minRows*3} class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                    </span>
                
                    <!---
                    <Button
                        on:click={() => wrapSelection('~', '~')}
                        title="Subscript"
                        size="square-md"
                    >
                        <span class="font-bold">
                            X<sub>1</sub>
                        </span>
                    </Button>
                
                    <Button
                        on:click={() => wrapSelection('^', '^')}
                        title="Superscript"
                        size="square-md"
                    >
                        <span class="font-bold">
                            X<sup>1</sup>
                        </span>
                    </Button>
                    --->
                </div>

                <!---Emoji Picker Panel--->
                <EmojiPicker bind:value bind:textArea {rows} bind:open={emojiPickerOpen} navButtons={true}/>

                <!---User and Community Pickers--->
                {#if pickingUser || pickingCommunity}
                    <div class="flex flex-col gap-1 w-full my-1">
                        
                        <!---User--->
                        {#if pickingUser}
                            <PersonAutocomplete containerStyle="max-height: {(rows)*25}px !important" 
                                on:select={(e) => {
                                    wrapSelection(` @${e.detail.name}@${new URL(e.detail.actor_id).hostname} `, '')
                                    pickingUser = false

                                }}
                            />
                        {/if}
                        
                        <!---Community--->
                        {#if pickingCommunity}
                            <CommunityAutocomplete containerStyle="max-height: {(rows)*25}px !important"
                                on:select={(e) => {
                                    wrapSelection(` !${e.detail.name}@${new URL(e.detail.actor_id).hostname} `, '')
                                    pickingCommunity = false
                                }}
                            />
                        {/if}
                    </div>
                {/if}
                

                <!--Actual text area-->
                <TextArea
                    class="border-0 rounded-none h-full focus-within:border-none resize-none"
                    {placeholder}
                    bind:value
                    bind:item={textArea}
                    allowImagePasting={images}
                    {rows}
                    {id}
                    {...$$restProps}

                    on:paste={async (e) => { 
                        processingPastedImage = true
                        const imageBlob = await readImageFromClipboard(e.detail) 
                        
                        if (imageBlob) {
                            pasteImage = blobToFileList(imageBlob)
                            uploadingImage = true
                        }
                        /*
                        else {
                            wrapSelection(await readTextFromClipboard(e.detail), '')
                        }
                        */
                        
                        processingPastedImage = false
                    }}

                    on:keydown={(e) => {
                        if (disabled) return
                        if (e.ctrlKey || e.metaKey) {
                            // @ts-ignore
                            let shortcut = shortcuts[e.code]
                            if (shortcut) {
                                e.preventDefault()
                                shortcut?.()
                            }
                        }
                    }}
                />
            </div>
        {/if}

        <!---Bottom bar with upload image delete buttons--->
        <div class="flex flex-col w-full px-1">
            {#if imageUploads.length > 0}
                <div class="block my-1 font-bold text-sm">Image Uploads</div>
            {/if}
            
            <div class="flex flex-row gap-4 p-1.5 px-4 items-center">
                {#each imageUploads as upload, index}
                    {#if upload}
                        <ImageUploadPreviewDeleteButton uploadResponse={upload} previewSize={64}
                            on:insert={(e) => {
                                try {
                                    if (e.detail?.url) {
                                        $userSettings.proxyMedia.useForImageUploads
                                            ? wrapSelection(`![](${imageProxyURL(e.detail.url)})`, '')
                                            : wrapSelection(`![](${e.detail.url})`, '')
                                    }
                                }
                                catch {}
                            }}
                            
                            on:delete={(e) => {
                                // Delete the image and remove its markdown code from the editor
                                if (e.detail && upload?.url) {
                                    // Generate a regex to match the markdown syntax for that image URL and remove it from the textarea value.
                                    let imageURL = $userSettings.proxyMedia.useForImageUploads
                                            ? imageProxyURL(upload.url)?.replace('?', '\\?')
                                            : upload.url?.replace('?', '\\?')
                                    if (imageURL) {
                                        const URLRegex = new RegExp(`!\\[.*\\]\\(${imageURL}\\)`)
                                        value = value.replace(URLRegex, '')
                                    }
                                    // Remove this upload object from the array
                                    imageUploads.splice(index,1)
                                    imageUploads = imageUploads
                                }
                            }}
                        />
                    {/if}
                {/each} 
            </div>
        </div>
        
        {#if $$slots.actions || previewButton}
            <!---Bottom Toolbar (edit/preview button, submit button--->
            <div class="flex-shrink-0 flex flex-row overflow-auto overflow-y-hidden p-1.5 gap-1.5 items-center justify-between
                {$$props.disabled ? 'opacity-60 pointer-events-none' : '' }
            "
            >
                {#if previewButton}
                    <div class="mb-3">
                        <MultiSelect
                            bind:selected={previewing}
                            options={[false, true]}
                            optionNames={['Edit', 'Preview']}
                        />
                    </div>
                    
                {/if} 

                <slot name="actions"/>
            </div>
        {/if}
    </div>
    
</div>
