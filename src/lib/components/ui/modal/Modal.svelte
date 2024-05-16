<script lang="ts">
    import { type IconSource, Icon, XMark, ArrowsPointingIn, ArrowsPointingOut } from 'svelte-hero-icons'

    import { createEventDispatcher } from 'svelte'
    import { expoOut } from 'svelte/easing'
    import { fade, scale } from 'svelte/transition'

    import Button from '$lib/components/input/Button.svelte'

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
    
    let modalElement:any
    let originalWidth = width
    
    function maximize() {
        if (maximized) {
            width = originalWidth
            width = width
            fullHeight = false
            maximized = false
        }
        else {
            width = "min-w-[100%]"
            fullHeight = true
            maximized = true
        }
    }

    const dispatcher = createEventDispatcher()
</script>

{#if open}
    <!---Div to blur background. Diabled click event that closes modal --->  
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class="overflow-hidden fixed top-0 left-0 w-screen h-screen z-[99] 
        flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm box-border p-4 whitespace-normal cursor-default"
        role="button" tabindex=0
        transition:fade={{ duration: 200 }}
        on:keydown={(e) => {
            if (e.key == 'Escape' || e.key == 'GoBack' || e.key == 'BrowserBack') {
                e.preventDefault()
                e.stopPropagation();
                open = false
            }
        }}
        on:click={(e) => {
			if (!modalElement.contains(e.target) && !preventCloseOnClickOut) open = false
		}}
    >
  
        <div bind:this={modalElement} transition:scale={{ start: 0.5, easing: expoOut }}
            class="overflow-y-auto rounded-xl max-w-full box-border w-full {fullHeight ? 'h-[95svh]' : height} {$$props.class}"
        >
            <div class="w-full dark:!bg-zinc-950 rounded-xl {width} box-border mx-auto {fullHeight ? 'h-full' : height}">
                <div
                    class="flex flex-col gap-4 p-3 rounded-xl overflow-none  w-full 
                    dark:bg-zinc-950 dark:border-zinc-800
                    bg-white border border-slate-200  {fullHeight ? 'h-[95vh]' : 'h-auto'}"
                    class:rounded-b-none={action}
                    class:border-b-0={action}
                >
                    <div class="flex flex-row max-w-full">
                        <h1 class="flex flex-row items-center font-bold text-xl gap-2 w-fit">
                            {#if icon} 
                                <Icon src={icon} mini width={28}/>
                            {/if}
                            {title}
                        </h1>
                        
                        <span class="flex flex-row gap-2 items-center ml-auto">
                            {#if allowMaximize}
                            <Button size="md" rounded="lg" color="tertiary" on:click={() => (maximize())}>
                                <Icon src={maximized ? ArrowsPointingIn : ArrowsPointingOut} mini size="16" />
                            </Button>
                            {/if}
                            
                            <Button size="md" rounded="lg" color="tertiary" on:click={() => (open = false)}>
                                <Icon src={XMark} mini size="16" />
                            </Button>
                        </span>
                    </div>
                    
                    <div class="flex flex-col overflow-y-auto w-full h-full">
                        <slot />
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
