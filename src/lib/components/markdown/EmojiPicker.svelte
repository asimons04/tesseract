<script lang="ts">

    
    import { afterUpdate, onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { site } from '$lib/lemmy'


    
    import EmojiMartData from '@emoji-mart/data/sets/14/google.json'
    import {Picker as EmojiPicker}  from 'emoji-mart'
    
    export let value:string = ''                // Actual value extracted from textarea
    export let textArea:HTMLTextAreaElement     // Text area (used to get cursor position)
    export let rows:number                      // Number of rows of the parent markdown editor
    export let open:boolean                     // Toggles the picker open/closed

    // Read in the current site info and grab its custom emojis (if any)
    let siteInfo = get(site);
    let siteEmojis:any = []
    try {
        if (siteInfo?.custom_emojis) {
            let customEmojis = {
                id: 'custom',
                name: 'Custom',
                emojis: [] as any[]
            }

            for (let i:number=0; i < siteInfo.custom_emojis.length; i++) {
                let ce = siteInfo.custom_emojis[i];
                
                let customEmoji:any = {
                    id: ce.custom_emoji.shortcode,
                    name: ce.custom_emoji.alt_text,
                    keywords: ce.keywords.map((kw) => kw.keyword),
                    skins: [ {src: ce.custom_emoji.image_url} ]
                }
                customEmojis.emojis.push(customEmoji)
            }
            siteEmojis.push(customEmojis)
        }
    }
    catch (err) {
        console.log("Failed to import site custom emojis", err);
    }

    function replaceTextAtIndices(str: string, startIndex: number, endIndex: number, replacement: string) {
        return str.substring(0, startIndex) + replacement + str.substring(endIndex)

    }

    const getPicker = function () { 
        return new EmojiPicker({
            data: EmojiMartData,
            onEmojiSelect: (s) => {
                let emojiValue:string
                s.native
                    ? emojiValue = s.native
                    : s.src
                        ? emojiValue = `![${s.name}](${s.src} "${s.shortcodes.replaceAll(':', '')}")`
                        : emojiValue=""

                value = textArea.value = replaceTextAtIndices(textArea.value, textArea.selectionStart, textArea.selectionEnd, emojiValue)
                open = !open
            },
            set: 'google',
            theme: dark() ? 'dark': 'auto',
            previewPosition: 'none',
            navPosition: 'none',
            dynamicWidth: true,
            custom: siteEmojis
        });
    }
    
    let pickerContainer:HTMLDivElement
    let picker = getPicker();
    
    // Recreate the picker when its container gets removed/recreated in the DOM when switching between edit/preview
    afterUpdate(() => {
        if (pickerContainer && !pickerContainer.contains(picker)) {
            picker = getPicker()
            pickerContainer.appendChild(picker)
        }
    })
    
    // Initialize the emoji picker
    onMount(() => {
        pickerContainer.appendChild(picker);
    })
</script>

<!--- Zero-height container to make the overlap work--->
<div class="w-full z-20 h-0">
    <!--- Emoji Picker Container--->
    <div bind:this={pickerContainer} class="overflow-hidden w-full" class:hidden={!open} style="height: {(rows+5)*24}px"/>
</div>


