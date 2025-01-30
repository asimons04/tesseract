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

    export let height:string = 'h-auto max-h-[95vh]'
    export let width:string = 'min-w-[50%]'
    export let maximized:boolean = false
    export let allowMaximize:boolean = false
    export let preventCloseOnClickOut:boolean = false
    export let card:boolean = true
    export let capitalizeTitle: boolean = false

    let modalElement:any
    let originalWidth = width
    let originalHeight = height

    let modalBackground:HTMLDivElement

    function maximize() {
        if (maximized) {
            width = originalWidth
            height = originalHeight
            width = width
            height = height
            maximized = false
        }
        else {
            width = "w-[95vw]"
            height = 'h-auto max-h-[95vh]'
            //height = 'h-[95vh]'
            maximized = true
        }
    }

    function isSelecting() {
        return window.getSelection && window.getSelection()?.type === 'Range'
    }

    const dispatcher = createEventDispatcher()

    function onSwipe(e:SvelteGestureSwipeEvent) {
        if  (
                e.detail.direction && ['left', 'right'].includes(e.detail.direction) &&
                //@ts-ignore
                e.detail.target.type! != 'textarea' && 
                !isSelecting()
            ) {
            dispatcher('close')
            open = false
        }
    }
</script>

{#if open}
    <!---Div to blur background. --->  
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class="overflow-hidden fixed top-0 left-0 w-screen h-screen z-[99] 
            flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm box-border p-1 md:p-4 whitespace-normal cursor-default
        "
        role="button" tabindex="0"
        bind:this={modalBackground}
        transition:fade={{ duration: 200 }}
        on:keydown={(
            //@ts-ignore
            e) => {
            if (e.key == 'Escape' || e.key == 'GoBack' || e.key == 'BrowserBack') {
                e.preventDefault()
                e.stopPropagation();
                dispatcher('close')
                open = false
            }
        }}
        on:click={(
            //@ts-ignore
            e) => {
            if (!modalElement.contains(e.target) && !preventCloseOnClickOut) {
                dispatcher('close')
                open = false
            }
		}}
        on:wheel={(
            //@ts-ignore
            e) => {
            if (!modalElement.contains(e.target)) {
                e.preventDefault()
                e.stopPropagation()
            }
        }}
    >
  
        <div class="flex w-full h-full" transition:scale={{ start: 0.5, easing: expoOut }} >
            
            <div class="flex my-auto dark:!bg-zinc-950 rounded-xl w-full min-w-[min(100%,450px)] {width} {height} box-border mx-auto ">

                <div bind:this={modalElement} tabindex="-1" role="dialog"
                    class="flex flex-col gap-4 p-3 rounded-xl overflow-none 
                        {height} w-full    
                        bg-white dark:bg-zinc-950 
                        border border-slate-200 dark:border-zinc-800 
                        {action ? 'border-b-0 rounded-b-none' : ''}
                    "
                >
                    <!---Modal Dialog Title Bar--->
                    <div class="flex flex-row gap-2 items-center max-w-full">
                        {#if icon} 
                            <span class="w-[32px]">
                                <Icon src={icon} mini width={28}/>
                            </span>
                        {/if}
                        <h1 class="font-bold text-lg gap-2 w-fit truncate {capitalizeTitle ? 'capitalize' : ''}">
                            {title}
                        </h1>
                        
                        <span class="flex flex-row gap-2 items-center ml-auto">
                            <slot name="title-bar-buttons"/>
                            
                            {#if allowMaximize}
                                <span class="hidden lg:flex">
                                    <Button title="{maximized ? 'Un-maximize' : 'Maximize'}" size="md" rounded="lg" color="tertiary" 
                                        on:click={() => (maximize())}
                                    >
                                        <Icon src={maximized ? ArrowsPointingIn : ArrowsPointingOut} mini size="16" />
                                    </Button>
                                </span>
                            {/if}
                            
                            <Button title="Close" size="md" rounded="lg" color="tertiary" on:click={(e) => {
                                e.preventDefault()
                                e.stopPropagation();
                                open = false
                                dispatcher('close')
                            }}
                            >
                                <Icon src={XMark} mini size="16" />
                            </Button>
                        </span>
                    </div>
                    
                    <div class="flex flex-col overflow-hidden w-full h-full"
                        use:swipe={{
                            touchAction: 'pan-y',
                            minSwipeDistance: 120
                        }}  on:swipe={onSwipe}
                    >
                        <!---Slot to hold the modal's content--->
                        <Card elevation={card ? 1 : -1} class="flex flex-col overflow-y-auto {card ? 'p-2' : ''} {height}">
                            <slot />
                        </Card>


                        {#if $$slots.buttons}
                            <div class="mt-4" />
                            
                            <div class="flex flex-col w-full mt-auto">
                                <slot name="buttons" />
                            </div>
                        {/if}

                    </div>

                </div>
                
                {#if action}
                <div class="mt-4 border-x border-b bg-slate-100 dark:bg-zinc-950 dark:border-zinc-800 p-3 py-2 flex justify-end rounded-b-xl">
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
