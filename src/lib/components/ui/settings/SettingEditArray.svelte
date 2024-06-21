<script lang="ts">
    
    import { createEventDispatcher } from "svelte";

    import Button from "$lib/components/input/Button.svelte"
    import Placeholder from "../Placeholder.svelte"
    import TextInput from "$lib/components/input/TextInput.svelte";

    import {
        type IconSource,
        ArchiveBoxXMark,
        Icon,
        PlusCircle,
        XCircle
    } from 'svelte-hero-icons'
    
    export let list:string[]                        // Array of strings to manage (should be bound from parent in most cases)
    export let title:string = ''                    // Title of the setting
    export let description:string = ''              // Text description of the setting
    export let icon:IconSource = PlusCircle         // Icon used for the setting entry
    export let condition:boolean = true             // Boolean condition to show/hide the component
    export let textInputPlaceholder:string = ''     // Placeholder for text input field
    export let showPlaceholder:boolean = true       // Show empty list placeholder
    
    
    let input_text:string
    
    let dispatcher = createEventDispatcher<{
        add: string,
        delete: string,
    }>()

    /** Updates a provided array by adding or removing an input value
    * @param input  A string value to add to or remove from the array
    * @param arr    A string array to manipulate
    * @param add    `true` (default) to add the input string to the array, `false` to remove it
    */
    const updateArray = function(input:string, arr:string[], add=true) {
        if (!input) return arr
        
        input = input.trim()

        // Don't add a duplicate or empty item
        if (input == '') return arr

        if (add) {
            if (arr.includes(input)) return arr
            arr.push(input)
            arr.sort()
        }
        else {
            let index = arr.findIndex((item) => item == input)
            if (index >=0) {
                arr.splice(index,1)
            }
            arr.sort()
        }
        // Reactivity hack
        return arr
    }

</script>

{#if condition}
    <div class="flex flex-col w-full gap-2 py-2">
        <p class="text-sm font-bold flex flex-row gap-2">
            <Icon src={icon} mini width={16}/>
            {title}
        </p>
        
        <p class="text-xs font-normal">
            {description}
        </p>

        <slot />

        <div class="flex flex-row flex-wrap lg:flex-nowrap gap-2 w-full mt-4">
                                            
            <div class="flex flex-col w-full gap-2 lg:w-1/2">
                <form class="flex flex-row gap-2 mt-2 w-full" on:submit|preventDefault={(e) => {
                        list = updateArray(input_text, list, true)
                        input_text = ''
                        dispatcher('add', input_text)
                    }}
                >
                    
                    <TextInput bind:value={input_text}  type="text" class="w-full" placeholder={textInputPlaceholder}/>
                    
                    <Button color="primary" class="h-8" submit>
                        <Icon src={PlusCircle} mini width={18}/>
                        Add
                    </Button>
                </form>
            </div>

            <div class="flex flex-col mt-2 gap-2 items-center max-h-[250px] w-full lg:w-1/2 overflow-y-scroll px-4">
                {#if list.length > 0}
                    {#each list as item}
                        
                        <div class="w-full rounded-md bg-slate-200 dark:bg-zinc-700 flex flex-row gap-2 items-center">
                            <p class="pl-4 py-2 text-sm font-bold">{item}</p>

                            <div class="mx-auto"/>
                            
                            <Button color="ghost" class="mr-4 border-none" on:click={() => { 
                                    list = updateArray(item, list, false); 
                                    dispatcher('delete', item)
                                }} 
                            >
                                <Icon src={XCircle} mini width={22}/>
                            </Button>
                        </div>
                        
                    {/each}
                {:else if showPlaceholder}
                    <span class="flex mx-auto my-auto">
                        <Placeholder icon={ArchiveBoxXMark} title="No Items" description="" />
                    </span>
                {/if}
            </div>
        </div>
    </div>
{/if}