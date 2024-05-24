<script lang="ts">
    
    import { imageProxyURL } from "$lib/image-proxy";
    import { userSettings } from "$lib/settings";
    import { fade } from "svelte/transition";
    import { pinch } from 'svelte-gestures'
    import { Icon, MagnifyingGlassMinus, MagnifyingGlassPlus, ViewfinderCircle, XMark } from "svelte-hero-icons";


    export let url:string
    export let resolution: number|undefined =  undefined
    export let nsfw:boolean = false
    export let altText:string = ''
    export let limitHeight:boolean = true
    export let zoomable:boolean = true
    
    let loaded = false
    let zoomed = false
    let imageElement: any
    let imageContainerElement: HTMLDivElement
    let toolbarElement: any
    
    let zoom = {
        current: 1,
        min: 0.25,
        max: 4,
        step: 0.15,
        translateX: 0,
        translateY: 0,
        startX: 0,
        startY:0,
        panning: false,
    }
    let defaultZoom = {...zoom}
    
    function resetZoom() {
        zoom = {...defaultZoom}
        applyTranslations()
    }   

    function close() {
        resetZoom()
        zoomed = false
    }

    function applyTranslations() {
        imageElement.style.transform=`scale(${zoom.current}) translate(${zoom.translateX}px, ${zoom.translateY}px)`
    }

    function zoomImage(direction: number) {
        const newZoom = zoom.current + direction * zoom.step; 
    
        // Limit the zoom level to the minimum and maximum values 
        if (newZoom < zoom.min) zoom.current = zoom.min
        else if (newZoom > zoom.max) zoom.current = zoom.max
        else zoom.current = newZoom; 

        applyTranslations()
    }

    const panStart = (e:PointerEvent) => {
        e.preventDefault();
        zoom.panning = true;
        zoom.startX = e.clientX - zoom.translateX
        zoom.startY = e.clientY - zoom.translateY
    };

    const panMove = (e:PointerEvent) => {
        if (!zoom.panning) return; // Do nothing
        zoom.translateX = (e.clientX - zoom.startX) 
        zoom.translateY = (e.clientY - zoom.startY) 
        applyTranslations()
    };

    const panEnd = () => {
        zoom.panning = false;
    };

    function pinchZoom(event:CustomEvent<{
            scale: number
            center: {
                x: number
                y: number
            }
        }>) {
        
        zoom.panning = false
        zoom.current = event.detail.scale
        applyTranslations()
    }


</script>

{#if zoomed}
    <!---Div to blur background--->  
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class="overflow-hidden fixed top-0 left-0 w-screen h-screen z-[99] 
        flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm box-border p-4 whitespace-normal cursor-zoom-out"
        role="button" tabindex="0"
        transition:fade={{ duration: 200 }}
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
            if (!imageElement.contains(e.target) && !toolbarElement.contains(e.target)) close()
		}}
    >
        <!---Toolbar with zoom in/out buttons and button to close the overlay--->
        <div bind:this={toolbarElement} class="absolute top-0 bg-slate-50/70 dark:bg-zinc-950/80 backdrop-blur-3xl w-full z-50 p-1 cursor-default">
            <div class="flex flex-row w-full">
                <span class="flex flex-row ml-auto gap-4 items-center">
                    <button title="Zoom Out" on:click={()=>zoomImage(-1)}>
                        <Icon src={MagnifyingGlassMinus} mini width={42} />
                    </button>

                    <button title="Reset Zoom" on:click={()=>resetZoom()}>
                        <Icon src={ViewfinderCircle} mini width={42}/>
                    </button>

                    <button title="Zoom In" on:click={()=>zoomImage(1)}>
                        <Icon src={MagnifyingGlassPlus} mini width={42} />
                    </button>

                    <button title="Close" class="ml-4" on:click={()=>close()}>
                        <Icon src={XMark} mini width={48} />
                    </button>
                </span>
            </div>
        </div>
        
        <!---Image Container--->
        <div bind:this={imageContainerElement} class="flex top-16 p-4 w-full h-full"
            use:pinch
            on:pinch={(e) => pinchZoom(e) }
            on:pointerdown={ (e) => panStart(e) }
            on:pointermove={ (e) => panMove(e) }
            on:pointerup={ () => panEnd() }
            on:wheel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                let direction = e.deltaY > 0 ? -1 : 1; 
                zoomImage(direction); 
            }}
        >
            
            <img bind:this={imageElement}
                src="{imageProxyURL(url, resolution, 'webp')}"
                class="flex mx-auto my-auto max-h-[100%] {zoom.panning ? 'cursor-grabbing' : 'cursor-default'}"
                alt={altText}
                

            />

        </div>

        <!--<div class="absolute bottom-0 h-16 bg-slate-50/70 dark:bg-zinc-950/80 backdrop-blur-3xl w-full z-50 p-1 cursor-default" />-->


    </div> 

{/if}



{#if url}   
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <img src="{imageProxyURL(url, resolution, 'webp')}"
            class="ml-auto mr-auto object-cover rounded-md  z-20 opacity-0 transition-opacity duration-150 
                {limitHeight ? 'max-h-[min(80vh,800px)]' : ''}    
                {zoomable ? 'cursor-zoom-in' : ''}
            "
            class:opacity-100={loaded}
            class:blur-2xl={(nsfw && $userSettings.nsfwBlur)}
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