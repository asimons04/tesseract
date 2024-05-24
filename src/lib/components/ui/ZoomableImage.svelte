<script lang="ts">
    
    import { imageProxyURL } from "$lib/image-proxy";
    import { userSettings } from "$lib/settings";
    import { fade } from "svelte/transition";
    
    import panzoom from 'panzoom'
    
    import { 
        Icon, 
        MagnifyingGlassMinus, 
        MagnifyingGlassPlus, 
        XMark
    } from "svelte-hero-icons";
    import { onMount } from "svelte";

    export let url:string
    export let resolution: number|undefined =  undefined
    export let nsfw:boolean = false
    export let altText:string = ''
    export let limitHeight:boolean = true
    export let displayType: 'post' | 'feed' = 'feed'
    export let zoomable:boolean = true
    export let imgClass:string = ''
    
    let loaded = false
    let zoomed = false
    let imageElement: any 
    let toolbarElement: any
    let imageContainerElement: HTMLDivElement
    let zoomer: any
    let scale = 1


    function midpoint() {
        let rect = imageContainerElement.getBoundingClientRect()
        return {
            x: rect.width / 2,
            y: rect.height / 2
        }
    }
    function close() {
        scale = 1
        let {x, y} = midpoint()
        zoomer.zoomAbs(x,y,scale)
        
        zoomed = false
        zoomed = zoomed
    }

    onMount(() => {
        zoomer = panzoom(imageElement, 
            {
                minZoom: 0.5,
                maxZoom: 7,
                autocenter: true,
                bounds: true,
                boundsPadding: 0.1,
                transformOrigin: {x: 0.5, y: 0.5},
            }
        )
    })

    function zoom(zoomIn:boolean = true) {
        let { scale } = zoomer.getTransform()

        scale = zoomIn
            ? scale + 0.5
            : scale - 0.5
        let {x, y} = midpoint()
        zoomer.zoomAbs(x,y, scale)

    }
    
</script>


<!---Div to blur background--->  
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="{zoomed ? '' : 'hidden'} overflow-hidden fixed top-0 left-0 w-screen h-screen z-[99] 
    flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm box-border p-4 whitespace-normal cursor-default"
    role="button" tabindex="0"
    transition:fade={{ duration: 200 }}
    on:wheel={(e) => {
        e.preventDefault()
        e.stopPropagation()
    }}
    on:keydown={(e) => {
        if (e.key == 'Escape') {
            e.preventDefault()
            e.stopPropagation();
            close()
        }
    }}
    on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Close the image if clicking outside the image (but not if clicking in the toolbar)
        if (!imageElement.contains(e.target) && !toolbarElement.contains(e.target)) close()
    }}
>
    <!---Toolbar with zoom in/out buttons and button to close the overlay--->
    <div bind:this={toolbarElement} class="absolute top-0 bg-slate-50/70 dark:bg-zinc-950/80 backdrop-blur-3xl w-full z-50 p-1">
        <div class="flex flex-row w-full">
            <span class="flex flex-row ml-auto gap-4 items-center">
                <button on:click={()=>zoom(false)}>
                    <Icon src={MagnifyingGlassMinus} mini width={42} />
                </button>

                <button on:click={()=>zoom(true)}>
                    <Icon src={MagnifyingGlassPlus} mini width={42} />
                </button>

                <button class="ml-4" on:click={()=>close()}>
                    <Icon src={XMark} mini width={48} />
                </button>
            </span>
        </div>
    </div>
    
    <!---Image Container--->
    <div bind:this={imageContainerElement}>
        <img bind:this={imageElement}
            src="{imageProxyURL(url, resolution, 'webp')}"
            class="mx-auto my-auto"
            alt={altText}
        />
    </div>
</div> 



<!---Regular Display--->
{#if url}   
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img src="{imageProxyURL(url, resolution, 'webp')}"
        class="ml-auto mr-auto object-cover rounded-md 
            {limitHeight ? 'max-h-[min(80vh,800px)]' : ''} 
            {zoomable ? 'cursor-zoom-in' : ''}    
            z-20 opacity-0 transition-opacity duration-150
            {imgClass}
        "
        class:opacity-100={loaded}
        class:blur-2xl={(nsfw && displayType==='feed' && $userSettings.nsfwBlur)}
        alt={altText}
        on:load={() => (loaded = true)}
        on:click={(e) => {
            if (zoomable) {
                e.preventDefault()
                e.stopPropagation()
                zoomed = true
            }
        }}
    />
{/if}