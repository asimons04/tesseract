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
        Trash,
        XCircle
    } from 'svelte-hero-icons'
    
    export let list:string[]                                  // Array of strings to manage (should be bound from parent in most cases)
    export let title:string                 = ''              // Title of the setting
    export let description:string           = ''              // Text description of the setting
    export let icon:IconSource              = PlusCircle      // Icon used for the setting entry
    export let condition:boolean            = true            // Boolean condition to show/hide the component
    export let textInputPlaceholder:string  = ''              // Placeholder for text input field
    export let filterable:boolean           = false           // Show the filter input to allow searching of the list
    export let processInputFunc: Function   = (str:string|undefined) => {return str}


    export let showPlaceholder:boolean      = true              // Show empty list placeholder
    export let placeholderText:string       = ''                // Text to show in the empty placeholder
    export let placeholderIcon:IconSource   = ArchiveBoxXMark   // Icon to use for the empty placeholder
    export let placeholderTitle:string      = 'No Items'        // Title for the empty placeholder
    export let reverseLayout: boolean       = false             // Put the list on the left and the input on the right

    let input_text:string
    let filter_input_text:string

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
        // Process the input based on a passed-in function.  Useful for cleaning up input to a desired format.
        input = processInputFunc(input)

        if (!input) return arr

        input = input.trim()

        // Don't add a duplicate or empty item
        if (input == '') return arr

        let items = input.split(',')

        if (add) {

            items.forEach((item) => {
                if (item && !arr.includes(item)) {
                    arr.push(item.trim())
                }
            })
            arr.sort()
        }
        
        else {
            items.forEach((item) => {
                let index = arr.findIndex((i) => i == item.trim())
                if (index >=0) {
                    arr.splice(index,1)
                }
            })
            arr.sort()
        }
        return arr
    }

    // Debounce function
    let debounceTimer: ReturnType<typeof setTimeout>;
    function debounce(value:string,  timeout=300) {
        clearTimeout(debounceTimer);
            debounceTimer = setTimeout( () => {
                filter_input_text = value.toLowerCase();
                clearTimeout(debounceTimer);
            }, timeout
        )
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

        <div class="flex {reverseLayout ? 'flex-row-reverse' : 'flex-row'} flex-row flex-wrap lg:flex-nowrap gap-4 w-full mt-4">
                                            
            <div class="flex flex-col w-full gap-2 lg:w-1/2">
                <form class="flex flex-row gap-2 mt-2 w-full" on:submit|preventDefault={() => {
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

            <div class="flex flex-col w-full gap-2 lg:w-1/2">
                {#if list.length > 0}
                    
                    {#if filterable}
                        <!---Filter input--->
                        <div class="flex flex-row gap-2 px-4 w-full items-center">
                            <TextInput type="text" class="w-full" placeholder="Filter entries"
                                bind:value={filter_input_text} 
                                on:keyup={(e) => { 
                                    debounce(e.detail.srcElement.value);
                                }}
                            />

                            <!---Clear the filter text box--->
                            <Button 
                                size="square-md"
                                color="ghost"
                                class="mr-4"
                                title="Clear filter"
                                on:click={() => { filter_input_text = '' }}
                            >
                                <Icon src={XCircle} mini width={16}/>
                            </Button>
                        </div>
                    {/if}

                    <div class="flex flex-col mt-2 gap-2 items-center max-h-[250px] w-full overflow-y-scroll px-4">
                        {#each list as item}
                            <div class="w-full rounded-md bg-slate-200 dark:bg-zinc-700 flex flex-row gap-2 items-center"
                                class:hidden={ filter_input_text && !item.toLowerCase().trim().includes(filter_input_text.toLowerCase().trim()) }
                            >
                                <p class="pl-2 py-2 text-sm font-bold">{item}</p>

                                <div class="mx-auto"/>
                                
                                <Button color="ghost" class="mr-4 border-none" on:click={() => { 
                                        list = updateArray(item, list, false); 
                                        dispatcher('delete', item)
                                    }} 
                                >
                                    <Icon src={Trash} mini width={22}/>
                                </Button>
                            </div>
                        {/each}
                    </div>
                {:else if showPlaceholder}
                    <span class="flex mx-auto my-auto">
                        <Placeholder icon={placeholderIcon} title="{placeholderTitle}" description="{placeholderText}" />
                    </span>
                {/if}
            </div>
            
        </div>
    </div>
{/if}