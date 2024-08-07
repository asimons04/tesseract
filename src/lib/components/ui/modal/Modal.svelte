<script lang="ts">
    import { type SvelteGestureSwipeEvent } from '$lib/util'
    import { type IconSource, Icon, XMark, ArrowsPointingIn, ArrowsPointingOut } from 'svelte-hero-icons'

    import { createEventDispatcher } from 'svelte'
    import { expoOut } from 'svelte/easing'
    import { fade, scale } from 'svelte/transition'
    import { swipe } from 'svelte-gestures'

    import Button from '$lib/components/input/Button.svelte'
    import Card from '../Card.svelte'
    
    export let action: string | undefined = undefined
    export let open = false
    export let title:string = '';
    export let icon:IconSource = undefined;

    export let fullHeight:boolean = false
    export let height:string = 'h-auto'
    export let width:string = 'min-w-[50%]'
    export let maximized:boolean = false
    export let allowMaximize:boolean = false
    export let preventCloseOnClickOut:boolean = false
    export let card:boolean = true

    let modalElement:any
    let originalWidth = width
    let modalBackground:HTMLDivElement

    function maximize() {
        if (maximized) {
            width = originalWidth
            width = width
            fullHeight = false
            maximized = false
        }
        else {
            width = "lg:max-w-[75%]"
            fullHeight = true
            maximized = true
        }
    }

    const dispatcher = createEventDispatcher()

    function onSwipe(e:SvelteGestureSwipeEvent) {
        if (e.detail.direction && ['left', 'right'].includes(e.detail.direction)) open = false
    }
</script>

{#if open}
    <!---Div to blur background. --->  
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class="overflow-hidden fixed top-0 left-0 w-screen h-screen z-[99] 
            flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm box-border p-4 whitespace-normal cursor-default
        "
        role="button" tabindex="0"
        bind:this={modalBackground}
        transition:fade={{ duration: 200 }}
        on:keydown={(
            //@ts-ignore
            e
        ) => {
            if (e.key == 'Escape' || e.key == 'GoBack' || e.key == 'BrowserBack') {
                e.preventDefault()
                e.stopPropagation();
                open = false
            }
        }}
        on:click={(
            //@ts-ignore
            e
        ) => {
			if (!modalElement.contains(e.target) && !preventCloseOnClickOut) open = false
		}}
        on:wheel={(
            //@ts-ignore
            e
        ) => {
            if (!modalElement.contains(e.target)) {
                e.preventDefault()
                e.stopPropagation()
            }
        }}
    >
  
        <div transition:scale={{ start: 0.5, easing: expoOut }}
            class="overflow-y-auto rounded-xl max-w-full box-border w-full {fullHeight ? 'h-[95svh]' : height} {$$props.class}"
            
        >
            <div class="w-full dark:!bg-zinc-950 rounded-xl {width} box-border mx-auto {fullHeight ? 'h-full' : height}">
                <div bind:this={modalElement} tabindex="-1" role="dialog"
                    class="flex flex-col gap-4 p-3 rounded-xl overflow-none  w-full 
                        bg-white dark:bg-zinc-950 
                        border border-slate-200 dark:border-zinc-800 
                        {fullHeight ? 'h-[95vh]' : 'h-auto'}
                        {action ? 'border-b-0 rounded-b-none' : ''}
                    "
                >
                    <div class="flex flex-row max-w-full">
                        <h1 class="flex flex-row items-center font-bold text-xl gap-2 w-fit capitalize">
                            {#if icon} 
                                <Icon src={icon} mini width={28}/>
                            {/if}
                            {title}
                        </h1>
                        
                        <span class="flex flex-row gap-2 items-center ml-auto">
                            {#if allowMaximize}
                            <span class="hidden lg:flex">
                                <Button title="{maximized ? 'Un-maximize' : 'Maximize'}" size="md" rounded="lg" color="tertiary" 
                                    on:click={() => (maximize())}
                                >
                                    <Icon src={maximized ? ArrowsPointingIn : ArrowsPointingOut} mini size="16" />
                                </Button>
                            </span>
                            {/if}
                            
                            <Button title="Close" size="md" rounded="lg" color="tertiary" on:click={() => {
                                open = false
                                dispatcher('close')
                            }}
                            >
                                <Icon src={XMark} mini size="16" />
                            </Button>
                        </span>
                    </div>
                    
                    <div class="flex flex-col overflow-y-auto w-full h-full"
                        use:swipe={{touchAction: 'pan-y'}}  on:swipe={onSwipe}
                    >
                        {#if card}
                            <Card class="flex flex-col p-4">
                                <slot />
                            </Card>
                        {:else}
                            <slot />
                        {/if}
                    </div>

                </div>
                
                {#if action}
                <div class="border-x border-b bg-slate-100 dark:bg-zinc-950 dark:border-zinc-800 p-3 py-2 flex justify-end rounded-b-xl">
                    <slot name="action">
                        <Button on:click={(e) => dispatcher('action', e)} color="primary" size="lg">
                            {action}
                        </Button>
                    </slot>
                </div>
                {/if}
            </div>
        </div>
    </div>
{/if}
