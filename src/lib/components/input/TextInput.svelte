<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    import { Eye, EyeSlash } from 'svelte-hero-icons';
    
    import Button from './Button.svelte';

    export let label: string | number | undefined = ''
    export let type: 'text' | 'password' | 'email' | 'number' | 'search' | null | undefined = 'text'
    export let value: string | number = ''
    export let required = false
    export let placeholder:string = ''
    export let maxlength:number|undefined = undefined
    export let min:number|undefined = undefined
    export let max:number|undefined = undefined
    export let readonly:boolean = false
    export let autocomplete:string = 'off'
    export let name:string = 'textInput'

    function typeAction(node: Node) {
        // @ts-ignore
        node.type = type
        // @ts-ignore
        node.name = name
    }

    const dispatcher = createEventDispatcher()
    // ${!value ? 'invalid:border-red-400' : ''}
    let className =`
        form-text text-sm rounded-md shadow-sm px-3 h-8 w-full
        bg-slate-200 text-zinc-900
        dark:bg-zinc-800 dark:text-slate-200
        disabled:opacity-75
        ${$$props.class}
    `
    
    let element: HTMLInputElement;
</script>

<label class="flex flex-col items-center {$$props.class}">
    {#if label}
        <span class="font-bold text-sm text-left mb-1 w-max self-start">
            {label}
            {#if required}
                <span class="text-red-500">*</span>
            {/if}
        </span>
    {/if}
    
    <span class="flex flex-row gap-2 w-full items-center">
        <input
            use:typeAction
            bind:value
            bind:this={element}
            on:keydown={(e) => dispatcher('keydown', e)}
            on:keyup={(e) => dispatcher('keyup', e)}
            on:input={(e) => dispatcher('input', e)}
            on:change={(e) => dispatcher('change', e)}
            on:paste={(e) => dispatcher('paste', e)}
            on:focus
            {...$$restProps}
            class={className}
            {required}
            placeholder={placeholder}
            {maxlength}
            {min}
            {max}
            {readonly}
            disabled={readonly}
            {autocomplete}
        />

        <!---Show/Hide Password Button--->
        {#if type=='password' && element}
            <Button size="square-form" color="tertiary-border"  icon={element.type == 'password' ? Eye : EyeSlash} 
                title="{element.type == 'password' ? 'Show Password' : 'Hide Password'}"
                on:click={() => {
                    if (element.type == 'password') element.type = 'text'
                    else element.type = 'password'
                }}
            />
        {/if}
    </span>
</label>
