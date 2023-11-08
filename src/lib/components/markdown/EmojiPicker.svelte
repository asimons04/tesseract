<script lang="ts">
    
    import { afterUpdate, onMount } from 'svelte'
    
    import EmojiMartData from '@emoji-mart/data/sets/14/google.json'
    import {Picker as EmojiPicker}  from 'emoji-mart'
    
    export let value:string = ''                // Actual value extracted from textarea
    export let textArea:HTMLTextAreaElement     // Text area (used to get cursor position)
    export let rows:number                      // Number of rows of the parent markdown editor
    export let open:boolean                     // Toggles the picker open/closed

    function replaceTextAtIndices(str: string, startIndex: number, endIndex: number, replacement: string) {
        return str.substring(0, startIndex) + replacement + str.substring(endIndex)

    }
    const getPicker = function () { 
        return new EmojiPicker({
            data: EmojiMartData,
            onEmojiSelect: (s) => {
                value = textArea.value = replaceTextAtIndices(textArea.value, textArea.selectionStart, textArea.selectionEnd, s.native)
                open = !open
            },
            set: 'google',
            theme: dark() ? 'dark': 'auto',
            previewPosition: 'none',
            navPosition: 'none',
            dynamicWidth: true
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
<div class="w-full z-20 h-[0px]">
    <!--- Emoji Picker Container--->
    <div bind:this={pickerContainer} class="overflow-hidden w-full" class:hidden={!open} style="height: {(rows+5)*24}px"/>
</div>


