<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    import { onMount } from 'svelte';

    export let label: string | number | undefined = ''
    export let type: 'text' | 'password' | 'email' | 'number' | 'search' | null | undefined = 'text'
    export let value: string = ''
    export let required = false
    export let placeholder:string = ''
    export let focus:boolean = false;
    export let maxlength:number|undefined = undefined
    export let min:number|undefined = undefined
    export let max:number|undefined = undefined

    function typeAction(node: Node) {
        // @ts-ignore
        node.type = type
    }

    
    

    const dispatcher = createEventDispatcher()

    let className =`
        ${value.length != 0 ? 'invalid:border-red-400' : ''}
        form-text text-sm rounded-md shadow-sm px-3 h-8 w-full
        bg-slate-200 text-zinc-900
        dark:bg-zinc-800 dark:text-slate-200
        ${$$props.class}
    `
    
    let element: any;
    onMount(function() {
        if (focus) {
            setTimeout(() => {
                element.focus();
            },10)
        }
    })
</script>

<label class="flex flex-col items-center {$$props.class}">
    {#if label != ''}
        <span class="font-bold text-sm text-left mb-1 cursor-pointer w-max self-start">
            {label}
            {#if required}
                <span class="text-red-500">*</span>
            {/if}
        </span>
    {/if}
    
    <input
        use:typeAction
        bind:value
        bind:this={element}
        on:keydown={(e) => dispatcher('keydown', e)}
        on:keyup={(e) => dispatcher('keyup', e)}
        on:input={(e) => dispatcher('input', e)}
        on:change={(e) => dispatcher('change', e)}
        on:focus
        {...$$restProps}
        class={className}
        {required}
        placeholder={placeholder}
        {maxlength}
        {min}
        {max}
    />
</label>
