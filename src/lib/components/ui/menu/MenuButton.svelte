<script lang="ts">
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import { Color } from '$lib/ui/colors'
    import { createEventDispatcher } from 'svelte'

    type ButtonColor = keyof typeof buttonColors

    const buttonColors = {
        secondary:
            'hover:bg-neutral-200/50 hover:dark:bg-zinc-600/20 text-slate-800 fill-slate-800 dark:text-zinc-200 dark:fill-zinc-200',

        dangerSecondary: 'hover:bg-red-500 text-red-500 hover:text-white',

        success:
            'hover:bg-green-600 text-green-600 dark:text-green-500 hover:text-white hover:dark:text-white',

        warning:
            'hover:bg-yellow-500 dark:text-yellow-300 text-yellow-700 hover:dark:text-black hover:text-black',

        info:
            'hover:bg-sky-500 dark:text-sky-500 text-sky-700 hover:dark:text-white hover:text-white',
    }

    export let color: ButtonColor = 'secondary'
    export let link = false
    export let href:string = ''
    export let loading:boolean = false
    export let disabled:boolean = false
    export let title:string = '';
    export let newtab:boolean = false;
    
    //export let toggleOpen:Function|undefined
    
    const click = createEventDispatcher()
</script>

<div class="{$$props.containerClass}">
    {#if link}
        <a
            {href}
            target="{newtab ? '_blank' : undefined}"
            title="{title}"
            on:click={
                (
                    //@ts-ignore
                    e
                ) => click('click', e)}
            class="flex flex-row gap-2 items-center px-4 py-1 w-full text-sm transition-colors 
                {buttonColors[color]} 
                {disabled ? 'opacity-50 pointer-events-none' : ''}
                {$$props.class}
            "

        >
            <slot name="icon" />
            <slot/>
        </a>
    {:else}
        <button
            on:click={
                (
                    //@ts-ignore
                    e
                ) => click('click', e)}
            title="{title}"
            type="button"
            class="flex flex-row gap-2 items-center px-4 py-1 w-full text-sm text-start
                transition-colors {buttonColors[color]} 
                disabled:opacity-50 disabled:pointer-events-none
                {$$props.class}
            "
            {disabled}
        >
            {#if loading}
                <Spinner width={16} />
            {:else}
                <slot name="icon" />
            {/if}

            <slot/>
            <!--<slot {toggleOpen}/>-->
        </button>
    {/if}
</div>
