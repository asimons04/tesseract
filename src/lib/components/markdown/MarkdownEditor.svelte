<script lang="ts">
    import type { Community, Person } from 'lemmy-js-client'

    import { createEventDispatcher } from 'svelte'
    
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { uploadImage } from '$lib/lemmy.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import EmojiPicker from './EmojiPicker.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'

    import {
        CodeBracket,
        ExclamationTriangle,
        FaceSmile,
        Icon,
        Link,
        ListBullet,
        Photo,
    } from 'svelte-hero-icons'

    export let images: boolean = true
    export let value: string = ''
    export let label: string | undefined = undefined
    export let previewButton: boolean = false
    export let disabled: boolean = false
    export let rows: number = 4
    export let previewing:boolean = false;
    export let id:string = '';
    export let resizeable:boolean = true;
    

    /*
    export let beforePreview: (input: string) => string = (input) => input
    export let previewContainerClass:string = '';
    export let previewContainerStyle:string = '';
    
    */
    const dispatcher = createEventDispatcher<{ confirm: string }>()

    let textArea: HTMLTextAreaElement
    let uploadingImage = false
    let loading = false
    let image: FileList | null = null
    let emojiPickerOpen:boolean = false

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

    

    async function upload() {
        if (!$profile?.jwt || image == null) return

        loading = true

        try {
            const uploaded = await uploadImage(image[0])
            if (!uploaded) throw new Error('Image upload returned undefined')
            wrapSelection(`![](${uploaded})`, '')
            uploadingImage = false
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        loading = false
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
    <Modal bind:open={uploadingImage} title="Upload Image" icon={Photo}>
        
        <form class="flex flex-col gap-4" on:submit|preventDefault={upload}>
            <FileInput image bind:files={image} />
            <Button {loading} disabled={loading} submit color="primary" size="lg">
                Upload
            </Button>
        </form>
    </Modal>
{/if}

<div class="flex flex-col w-full h-full">
    {#if label}
        <div class="block my-1 font-bold text-sm">{label}</div>
    {/if}

    <div class="flex flex-col border border-slate-300 dark:border-zinc-800 rounded-md overflow-hidden focus-within:border-black focus-within:dark:border-white transition-colors w-full h-full">
        {#if previewing}
            <div class="bg-slate-100 dark:bg-zinc-900 px-3 py-2.5 border border-slate-300 dark:border-zinc-700 rounded-md overflow-auto text-sm {resizeable ? 'resize-y' : 'resize-none'}" style="height: {(rows+3)*24}px">
                <Markdown source={value} />
            </div>

        {:else}
            <div class="flex flex-col px-1">
                <!--Toolbar-->
                <div class="[&>*]:flex-shrink-0 flex flex-row overflow-x-scroll overflow-y-hidden h-fit p-1.5 gap-1.5 mb-2 {$$props.disabled ? 'opacity-60 pointer-events-none' : ''}">
                    <!--Emoji Picker Button-->
                    <Button
                        on:click={() => emojiPickerOpen = !emojiPickerOpen}
                        title="Emojis"
                        size="square-md"
                    >
                        <span class="font-bold">
                            <Icon src={FaceSmile} mini size="16"/>
                        </span>
                    </Button>

                    {#if images}
                        <Button
                            on:click={() => (uploadingImage = !uploadingImage)}
                            title="Image"
                            size="square-md"
                        >
                            <Icon src={Photo} size="16" mini />
                        </Button>
                    {/if}
                
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
                        wrapSelection('::: spoiler <spoiler title>\n', '\n:::')}
                        title="Spoiler"
                        size="square-md"
                    >
                        <Icon src={ExclamationTriangle} mini size="16" />
                    </Button>
                
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
                </div>

                <!---Emoji Picker Panel--->
                <EmojiPicker bind:value bind:textArea {rows} bind:open={emojiPickerOpen} navButtons={true}/>

                <!--Actual text area-->
                <TextArea
                    class="border-0 rounded-none h-full focus-within:border-none {resizeable ? 'resize-y' : 'resize-none'}"
                    bind:value
                    bind:item={textArea}
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
                    {rows}
                    {id}
                    {...$$restProps}
                />
            </div>
        {/if}
        
        {#if $$slots.actions || previewButton}
            <!---Bottom Toolbar (edit/preview button, submit button--->
            <div class="flex-shrink-0 flex flex-row overflow-auto overflow-y-hidden p-1.5 gap-1.5 items-center justify-between
                {$$props.disabled
                    ? 'opacity-60 pointer-events-none'
                    : ''
                }
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
