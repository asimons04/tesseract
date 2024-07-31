<script lang="ts">
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import { backOut, bounceOut, circOut, expoOut, sineOut } from 'svelte/easing'
    import { scale } from 'svelte/transition'
  
    export let open = false
  
    let clazz = ''
    export { clazz as class }
    export let itemsClass = ''
    export let absolute = false
    export let alignment: Alignment = 'bottom-left'

    let element: any
  
    export const toggleOpen = () => ( open = !open)
  
    function getOriginClass(origin: Alignment) {
        switch (origin) {
            case 'top-right':
                return 'bottom-[100%] right-0 origin-bottom-right'
            case 'bottom-left':
                return 'top-[100%] origin-top-left'
            case 'top-left':
                return 'bottom-[100%] left-0 origin-bottom-left'
            case 'bottom-right':
                return 'top-[100%] right-0 origin-top-right'
            
            case 'top-center':
                return 'bottom-[100%] -left-[50%] origin-bottom'

            case 'bottom-center':
                return 'top-[100%] -left-[200%] origin-top'

            case 'side-left':
                return 'bottom-[-500%] right-[120%]'
            case 'side-right':
                return 'bottom-[-500%] right-[-120%]'
            
            case "left":
                return "bottom-[-160%] right-[75%]"
            default:
                return 'bottom-[100%] origin-top-left'
      }
    }

  </script>
  
  <!--- Closes the profile menu if clicking outside of it --->
  <svelte:body on:click={
    (
        //@ts-ignore 
        e
    ) => {
        if (!element.contains(e.target)) {
            open = false
        }
    }}
  />
  
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="overflow-visible 
    {absolute ? 'absolute' : 'relative'}
    cursor-auto {clazz} {itemsClass}
    "
    bind:this={element}
    tabindex="-1"
>
    <slot name="button" {open} {toggleOpen} />
    
    {#if open}
        <menu transition:scale|local={{
                duration: 200,
                start: 0.95,
                easing: expoOut,
            }}
            class="list-none absolute h-auto z-[90] overflow-auto 
                {getOriginClass(alignment)}
                rounded-lg py-1 w-max my-2 flex flex-col 
                shadow-md  border
                bg-white/95  border-slate-200 
                dark:bg-zinc-950/95 dark:border-zinc-800
                backdrop-blur-3xl
                min-w-[255px] max-w-[90vw] max-h-[79svh]
                {$$props.containerClass}
            "
        >

            {#if open}
                <div on:click={toggleOpen} class="flex flex-col gap-0 w-full" role="button" tabindex=0>
                    <slot {toggleOpen} />
                </div>
            {/if}
        </menu>
    {/if}
</div>