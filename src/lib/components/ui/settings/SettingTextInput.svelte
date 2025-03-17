<script lang="ts">
    import type { ButtonColor } from '$lib/ui/colors';
    import { Icon, InformationCircle, type IconSource } from 'svelte-hero-icons'

    import { createEventDispatcher } from 'svelte'

    import Button from '$lib/components/input/Button.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte';
        

    export let icon:IconSource = InformationCircle
    export let title:string = ''
    export let description:string = ''
    export let value:string = ''
    export let condition:boolean = true
    export let disabled: boolean = false
    export let maxlength: number = 255
    export let placeholder: string = ''
    export let fullwidth: boolean = false

    const dispatcher = createEventDispatcher()
</script>

{#if condition}
    <div class="flex flex-col {fullwidth ? '' : 'md:flex-row'} w-full gap-2 py-2">
        <div class="flex flex-col">
            <p class="text-sm font-bold flex flex-row gap-2">
                <Icon src={icon} mini width={16}/>
                {title}
            </p>
            <p class="text-xs font-normal">{description}</p>
        </div>
        
        <div class="mx-auto"/>
        
        <TextInput bind:value {disabled} {maxlength} {placeholder} class="w-full {fullwidth ? '' : 'md:w-[250px]'}"/>
    </div>
{/if}