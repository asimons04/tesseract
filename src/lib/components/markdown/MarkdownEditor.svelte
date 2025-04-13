<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client'

    import { blobToFileList, readImageFromClipboard } from '../uploads/helpers';
    import { createEventDispatcher }    from 'svelte'
    import { imageProxyURL }            from '$lib/image-proxy'
    import { sleep }                    from '$lib/components/lemmy/post/helpers';
    import { userSettings }             from '$lib/settings'
    
    import Button                           from '$lib/components/input/Button.svelte'
    import CommunityAutocomplete            from '../lemmy/CommunityAutocomplete.svelte'
    import EmojiPicker                      from './EmojiPicker.svelte'
    import ImageUploadModal                 from '../lemmy/modal/ImageUploadModal.svelte'
    import ImageUploadPreviewDeleteButton   from '../uploads/ImageUploadPreviewDeleteButton.svelte'
    import Menu                             from '$lib/components/ui/menu/Menu.svelte';
    import MenuButton                       from '$lib/components/ui/menu/MenuButton.svelte'
    import Modal                            from '$lib/components/ui/modal/Modal.svelte'
    import MultiSelect                      from '$lib/components/input/MultiSelect.svelte'
    import PersonAutocomplete               from '../lemmy/PersonAutocomplete.svelte'
    import Slider                           from '$lib/components/input/Slider.svelte'
    import TextArea                         from '$lib/components/input/TextArea.svelte'
    import Markdown                         from '$lib/components/markdown/Markdown.svelte'

    import {
        CodeBracket,
        CodeBracketSquare,
        ExclamationTriangle,
        FaceSmile,
        Icon,
        Link,
        ListBullet,
        NumberedList,
        Photo,
        QuestionMarkCircle,
        Strikethrough,
        TableCells,
        User,
        UserGroup,
    } from 'svelte-hero-icons'
    
    export let value: string                = ''
    export let label: string | undefined    = undefined
    export let images: boolean              = true
    export let emojis: boolean              = true
    export let previewButton: boolean       = false
    export let disabled: boolean            = false
    export let rows: number                 = 4
    export let previewing:boolean           = false;
    export let id:string                    = '';
    export let placeholder: string          = ''
    
    // Bind this to an outside value if need to persist between create/destroy of this component
    export let imageUploads                 = [] as UploadImageResponse[]

    let textArea: HTMLTextAreaElement
    let uploadingImage = false
    let emojiPickerOpen:boolean = false
    let minRows = rows
    let imageAltText: string

    let formattingHelpModal:boolean = false

    let pasteImage: FileList | null
    let processingPastedImage = false

    let pickingUser:  boolean = false
    let pickingUserQuery: string = ''

    let pickingCommunity: boolean = false
    let pickingCommunityQuery: string = ''

    const dispatcher = createEventDispatcher<{ confirm: string }>()

    function replaceTextAtIndices(str: string, startIndex: number, endIndex: number, replacement: string) {
        return str.substring(0, startIndex) + replacement + str.substring(endIndex)
    }

    function moveCursorTo(pos:number) {
        textArea.selectionStart = pos
        textArea.selectionEnd = pos
    }

    function wrapSelection(start: string, end: string, setCursor:number = -1) {
        const startPos = textArea.selectionStart
        const endPos = textArea.selectionEnd

        if (value) {
            const substring = value.substring(startPos, endPos)
            let newText = `${start}${substring}${end}`
            value = replaceTextAtIndices(value, startPos, endPos, newText )
        }
        else { 
            value = start + end
        }

        textArea.focus()
        if (setCursor > 0) {
            sleep(10).then(() => moveCursorTo(setCursor))
        }
        else {
            sleep(10).then(()=> {
                textArea.selectionStart = startPos + start.length
                textArea.selectionEnd = endPos + start.length
            })
        }
    }

    /** Splits a selection on the newline character and applies a prefix and suffix to each line.
    *   @param prefix The prefix for each line.
    *   @param suffix Suffix for each line.  Default:  '\n'
    */
    function wrapMultiLineSelection(prefix:string, suffix:string='\n') {
        const startPos = textArea.selectionStart
        const endPos = textArea.selectionEnd

        let selectedText = value.substring(startPos, endPos)
        let lines = selectedText.split('\n')
        let replacementText = ''
        
        lines.forEach((line) => {
            replacementText += prefix + line.trim() + suffix
        })

        value = replaceTextAtIndices(value, startPos, endPos, replacementText)
    }

    // Creates a code block with the specified language and sets the cursor inside the block
    function createCodeBlock(language:string) {
        const cursorPos = textArea.selectionStart
        wrapSelection('\n```' + language + '\n' , '\n```', cursorPos + language.length + 5)
    }

    const shortcuts = {
        KeyB: () => wrapSelection('**', '**'),
        KeyE: () => {emojiPickerOpen = !emojiPickerOpen},
        KeyI: () => wrapSelection('*', '*'),
        KeyS: () => wrapSelection('~~', '~~'),
        KeyH: () => wrapSelection('\n# ', ''),
        KeyK: () => wrapSelection('[', '](url)'),
        Enter: () => dispatcher('confirm', value),
    }

     
    
</script>

<!---Image Upload Modal--->
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


<!---Markdown Editor--->
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
                            <Button title="Emojis" size="square-md" icon={FaceSmile} iconSize={16}
                                on:click={() => {
                                    pickingCommunity = false
                                    pickingUser = false
                                    emojiPickerOpen = !emojiPickerOpen
                                }}
                                
                            />
                        {/if}

                        <!---Image Upload Button--->
                        {#if images}
                            <Button title="Image" size="square-md" icon={Photo} iconSize={16}
                                loading={processingPastedImage}
                                disabled={processingPastedImage}    
                                on:click={() => (uploadingImage = !uploadingImage)}
                            />
                        {/if}

                        <!---User Picker Button--->
                        <Button title="Insert User Link" size="square-md" icon={User} iconSize={16}
                            on:click={() => {
                                pickingCommunity = false
                                emojiPickerOpen = false
                                pickingUser = !pickingUser
                            }}

                        />

                        <!---Community Picker Button--->
                        <Button title="Insert Community Link" size="square-md" icon={UserGroup} iconSize={16}
                            on:click={() => {
                                pickingUser = false
                                emojiPickerOpen = false
                                pickingCommunity = !pickingCommunity
                            }}
                        />
                            
                        
                        <!---Bold--->
                        <Button title="Bold" size="square-md"
                            on:click={() => wrapSelection('**', '**')}
                        >
                            <span class="font-bold">B</span>
                        </Button>

                        <!---Italic--->
                        <Button title="Italic" size="square-md"
                            on:click={() => wrapSelection('*', '*')}
                        >
                            <span class="italic font-bold">I</span>
                        </Button>
                    
                        <!---Link--->
                        <Button title="Link" size="square-md" icon={Link} iconSize={16}
                            on:click={() => wrapSelection('[', '](url)')}
                        />
                    
                        <!---Heading--->
                        <Menu containerClass="!min-w-[75px] !max-w-[80px] overflow-auto" alignment="bottom-left">
                            <Button title="Header" size="square-md" slot="button" let:toggleOpen on:click={toggleOpen}>
                                <span class="italic font-bold font-serif">H</span>
                            </Button>
                            
                            <MenuButton on:click={() => wrapSelection('\n# ', '')}>
                                <span class="italic font-bold font-serif">H1</span>
                            </MenuButton>

                            <MenuButton on:click={() => wrapSelection('\n## ', '')}>
                                <span class="italic font-bold font-serif">H2</span>
                            </MenuButton>

                            <MenuButton on:click={() => wrapSelection('\n### ', '')}>
                                <span class="italic font-bold font-serif">H3</span>
                            </MenuButton>

                            <MenuButton on:click={() => wrapSelection('\n#### ', '')}>
                                <span class="italic font-bold font-serif">H4</span>
                            </MenuButton>

                        </Menu>

                        <!---Strikethrough--->
                        <Button title="Strikethrough" size="square-md" icon={Strikethrough} iconSize={16}
                            on:click={() => wrapSelection('~~', '~~')}
                        />

                        <!--- Quote --->
                        <Button title="Quote" size="square-md"
                            on:click={() => {
                                wrapMultiLineSelection('> ')
                            }}
                        >
                            <span class="font-bold font-serif">"</span>
                        </Button>

                        <!---Bullet List--->
                        <Button title="List" size="square-md" icon={ListBullet} iconSize={16}
                            on:click={() => {
                                wrapMultiLineSelection('- ')
                            }}
                            
                        />

                        <!---Numbered List--->
                        <Button title="Numbered List" size="square-md" icon={NumberedList} iconSize={16}
                            on:click={() => {
                                wrapMultiLineSelection('1) ')
                            }}
                            
                        />

                        <!---Code Span--->
                        <Button title="Code Span" size="square-md" icon={CodeBracketSquare} iconSize={16}
                            on:click={() => wrapSelection('`', '`')} 
                        />

                        <!---Code Block--->
                        <Menu containerClass="!min-w-fit overflow-auto" containerStyle="max-height: {(rows)*25}px !important" alignment="bottom-center">
                            <Button title="Code Block" size="square-md" slot="button" icon={CodeBracket} iconSize={16} let:toggleOpen on:click={toggleOpen}/>

                            <MenuButton on:click={() => createCodeBlock('')}>
                                <span class="text-sm">Plaintext</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('bash')}>
                                <span class="text-sm">Bash</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('c')}>
                                <span class="text-sm">C</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('c++')}>
                                <span class="text-sm">C++</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('go')}>
                                <span class="text-sm">Go</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('java')}>
                                <span class="text-sm">Java</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('javascript')}>
                                <span class="text-sm">Javascript</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('python')}>
                                <span class="text-sm">Python</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('rust')}>
                                <span class="text-sm">Rust</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('sh')}>
                                <span class="text-sm">Shell</span>
                            </MenuButton>

                            <MenuButton on:click={() => createCodeBlock('typescript')}>
                                <span class="text-sm">TypeScript</span>
                            </MenuButton>

                        </Menu>
                        
                        <!---Table--->
                        <Button title="Table" size="square-md" icon={TableCells} iconSize={16}
                            on:click={() => {
                                const cursorPos = textArea.selectionStart
                                wrapSelection('\n| Heading | Heading |\n| --- | --- |\n| Column | Column |','', cursorPos + 39)
                            }}
                        />

                        <!---Spoiler--->
                        <Button title="Spoiler" size="square-md" icon={ExclamationTriangle} iconSize={16}
                            on:click={() => {
                                const cursorPos = textArea.selectionStart
                                wrapSelection('\n::: spoiler Title\n', '\n:::', cursorPos+19)
                            }}
                        />
                        
                    </span>

                    <!---Markdown editor resize slider--->
                    <span class="flex flex-row gap-1 w-full lg:w-fit lg:ml-auto items-center">
                        <Slider bind:value={rows} min={minRows} max={minRows*3} />
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
                            <div class="flex flex-row gap-1 items-center w-full">
                                <div class="w-[20px]">
                                    <Icon src={User} mini width={18} />
                                </div>

                                <div class="w-[calc(100%-24px)]">
                                    <PersonAutocomplete focused containerClass="max-w-full" containerStyle="max-height: {(rows)*25}px !important" 
                                        on:select={(e) => {
                                            wrapSelection(`@${e.detail.name}@${new URL(e.detail.actor_id).hostname} `, '')
                                            pickingUser = false

                                        }}
                                    />
                                </div>
                            </div>
                        {/if}
                        
                        <!---Community--->
                        {#if pickingCommunity}
                            <div class="flex flex-row gap-1 items-center w-full">
                                <div class="w-[20px]">
                                    <Icon src={UserGroup} mini width={18} />
                                </div>

                                <div class="w-[calc(100%-24px)]">    
                                    <CommunityAutocomplete focused containerClass="max-w-full" containerStyle="max-height: {(rows)*25}px !important"
                                        on:select={(e) => {
                                            wrapSelection(`!${e.detail.name}@${new URL(e.detail.actor_id).hostname} `, '')
                                            pickingCommunity = false
                                        }}
                                    />
                                </div>
                            </div>
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
                    {disabled}
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
                        if (disabled || $userSettings.uiState.disableMarkdownEditorKeyboardShortcuts) return
                        
                        // Handle shortcut keys
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
