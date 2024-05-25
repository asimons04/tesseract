<script lang="ts">
    interface ZoomParams {
        current: number
        min: number
        max: number
        step: number
        translateX: number
        translateY: number
        startX: number
        startY: number
        panning: boolean
        doubleClick: boolean
    }

    interface PinchEvent extends CustomEvent {
        detail: {
            scale: number
            center: {
                x: number
                y: number
            }
        }
    }

    interface SwipeEvent extends CustomEvent {
        detail: {
            direction: 'top' | 'right' | 'bottom' | 'left',
            target: EventTarget
        }
    }

    import { imageProxyURL } from "$lib/image-proxy";
    import { userSettings } from "$lib/settings";
    import { fade } from "svelte/transition";
    import { pinch, swipe } from 'svelte-gestures'
    
    import { 
        Icon, 
        MagnifyingGlassMinus, 
        MagnifyingGlassPlus, 
        ViewfinderCircle, 
        XMark 
    } from "svelte-hero-icons";
    
    import Card from "./Card.svelte";

    export let url:string
    export let resolution: number|undefined =  undefined
    export let nsfw:boolean = false
    export let altText:string = ''
    export let limitHeight:boolean = true
    export let title:string = ''
    export let zoomable:boolean = true
    
    let loaded = false
    let zoomed = false
    let imageElement: any
    let imageContainerElement: HTMLDivElement
    let toolbarElement: any
    
    let zoom = {
        current: 1,         // Default / 'zero' scale value
        min: 0.25,          // Minimum scale value
        max: 4,             // Maximum scale value
        step: 0.15,         // Amount of scale to apply per scroll/click
        translateX: 0,      // The cacluated X coordinate used in the translate()
        translateY: 0,      // The cacluated Y coordinate used in the translate() 
        startX: 0,          // X coordinate for panning to begin
        startY:0,           // Y coordinate for panning to begin
        panning: false,     // Flag used internally to determine if currently panning
        doubleClick: false, // Flag used to determine if double-click quick zoom is enabled
    }
    let defaultZoom = {...zoom}
    
    // Class not used due to chicken/egg, but leaving in until I move it to a util library for outside use
    export class Zoomable {
        element: any
        zoom: ZoomParams
        defaultParams: ZoomParams

        constructor(element: any, options:any = {}) {
            if (element) this.element = element
            this.zoom = {
                current: options.initialZoom ?? 1,         
                min: options.minZoom ?? 0.25,          
                max: options.maxZoom ?? 4,
                step: options.zoomStep ?? 0.15,
                translateX: 0,      
                translateY: 0,      
                startX: 0,          
                startY:0,           
                panning: false,     
                doubleClick: false, 
            }
            this.defaultParams = {...this.zoom}
        }

        async applyTranslations() {
            await sleep(50)
            this.element.style.transform=`scale(${zoom.current}) translate(${zoom.translateX}px, ${zoom.translateY}px)`
        }

        bumpZoom(dir:number) {
            (dir > 0)
                ? this.setZoom(this.zoom.current + this.zoom.step)
                : this.setZoom(this.zoom.current - this.zoom.step)
            this.applyTranslations()
        }

        close() {
            this.resetZoom()
            zoomed = false
        }

        doubleClickZoom() {
            this.zoom.current = this.zoom.doubleClick
                ? 1
                : 2
            this.zoom.doubleClick = !this.zoom.doubleClick
            this.applyTranslations()
        }

        onSwipe(e:SwipeEvent) {
            if (['top', 'bottom'].includes(e.detail.direction)) {
                this.close()
            }
        }
        
        panEnd() {
            this.zoom.panning = false;
        }
        
        async panMove(e:PointerEvent) {
            if (!this.zoom.panning) return; // Do nothing
            this.zoom.translateX = (e.clientX - this.zoom.startX) 
            this.zoom.translateY = (e.clientY - this.zoom.startY) 
            await this.sleep(10 * this.zoom.current)
            this.applyTranslations()
        }

        panStart(e:PointerEvent) {
            e.preventDefault();
            this.zoom.panning = true;
            this.zoom.startX = e.clientX - this.zoom.translateX
            this.zoom.startY = e.clientY - this.zoom.translateY
        }

        pinchZoom(e:PinchEvent) {
            this.zoom.panning = false
            this.setZoom(e.detail.scale)
            this.applyTranslations()
        }

        resetZoom() {
            this.zoom = {...this.defaultParams}
            this.applyTranslations()
        }

        scrollZoom(e:WheelEvent) {
            e.preventDefault();
            e.stopPropagation();
            let direction = e.deltaY > 0 ? -1 : 1; 
            this.zoomImage(direction); 
        }

        setElement(element:any) {
            this.element = element
        }
        setZoom(val:number) {
            if (val > this.zoom.max) this.zoom.current = this.zoom.max
            else if (val < this.zoom.min) this.zoom.current = this.zoom.min
            else this.zoom.current = val
            return this
        }

        sleep(ms:number) {
            return new Promise((r) => setTimeout(r, ms))
        }

        

        zoomImage(direction: number) {
            this.setZoom(this.zoom.current + (direction * this.zoom.step))
            this.applyTranslations()
        }


    }


    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


    // Applies the scale and translation values to the image element
    function applyTranslations() {
        imageElement.style.transform=`scale(${zoom.current}) translate(${zoom.translateX}px, ${zoom.translateY}px)`
    }

    // Bumps the zoom by the step amount. dir > 0 is zoom in, dir < 0 is zoom out.
    function bumpZoom(dir:number) {
        (dir > 0)
            ? setZoom(zoom.current + zoom.step)
            : setZoom(zoom.current - zoom.step)
        applyTranslations()

    }

    // Resets the zoom parameters to default and closes the modal
    function close() {
        resetZoom()
        zoomed = false
    }
    
    // Quick zooms to double scale and back to normal on double-tap
    function doubleClickZoom() {
        
        zoom.current = zoom.doubleClick
            ? 1
            : 2
        zoom.doubleClick = !zoom.doubleClick
        applyTranslations()
    }

    // Fires on swipe events
    function onSwipe(e:SwipeEvent) {
        if (['top', 'bottom'].includes(e.detail.direction)) {
            close()
        }
    }

    // Zooms the image in if direction is > 0, zooms out if < 0
    function zoomImage(direction: number) {
        setZoom(zoom.current + direction * zoom.step)
        applyTranslations()
    }
    // Fires when mouse is released and clears the panning flag
    function panEnd() {
        zoom.panning = false;
    }

    // Fires on mouse move. If not also mousedown, returns. Otherwise, cacluates the translation values (current mouse x/y - the starting coordinates from panStart
    async function panMove(e:PointerEvent) {
        if (!zoom.panning) return; // Do nothing
        zoom.translateX = (e.clientX - zoom.startX)
        zoom.translateY = (e.clientY - zoom.startY)
        //await sleep(10 * zoom.current)
        applyTranslations()
    }

    // Fires when clicking and calculates the starting coordinates of the translate (current mouse coords - current translation coords) and sets the panning flag
    function panStart(e:PointerEvent) {
        e.preventDefault();
        zoom.panning = true;
        zoom.startX = e.clientX - zoom.translateX
        zoom.startY = e.clientY - zoom.translateY
    }

    // Fires on pinch event and sets the scale to the value reported from the event. Does not pan while pinch-zooming
    async function pinchZoom(e:PinchEvent) {
        zoom.panning = false
        if (e.detail.scale > zoom.current) bumpZoom(1)
        if (e.detail.scale < zoom.current) bumpZoom(-1)
    }

    // Resets the zoom parameters to default
    function resetZoom() {
        zoom = {...defaultZoom}
        applyTranslations()
    }  

    function scrollZoom(e:WheelEvent) {
        e.preventDefault();
        e.stopPropagation();
        let direction = e.deltaY > 0 ? -1 : 1; 
        zoomImage(direction); 
    }

    function setZoom(val:number) {
        if (val >= zoom.max) zoom.current = zoom.max
        else if (val <= zoom.min) zoom.current = zoom.min
        else zoom.current = val
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
                zoomed = false

            }
        }}
        on:click={(e) => {
			e.preventDefault();
            e.stopPropagation();
            if (!imageElement.contains(e.target) && !toolbarElement.contains(e.target)) { 
                close()
                zoomed = false
            }
		}}
    >
        <!---Toolbar with zoom in/out buttons and button to close the overlay--->
        <div bind:this={toolbarElement} class="absolute top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl w-full z-50 p-1 cursor-default">
            <div class="flex flex-row w-full">
                <span class="flex flex-row gap-4 px-4 w-full items-center">
                    
                    <!---Markdown editor resize slider--->
                    <Card class="flex flex-row gap-2 items-center rounded-lg p-2 lg:ml-auto">
                        <span class="flex flex-row gap-1 w-fit mr-auto items-center">
                            
                            <button title="Reset Zoom" on:click={()=>bumpZoom(-1)}>
                                <Icon src={MagnifyingGlassMinus} mini width={24} />
                            </button>
                            
                            <input type="range" bind:value={zoom.current} min={zoom.min} max={zoom.max+zoom.step} step={zoom.step} 
                                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                on:input={() => applyTranslations() }
                                on:drag|preventDefault
                            >
                            
                            <button title="Reset Zoom" on:click={()=>bumpZoom(1)}>
                                <Icon src={MagnifyingGlassPlus} mini width={24} />
                            </button>
                        </span>

                        <button title="Reset Zoom" on:click={()=>resetZoom()}>
                            <Icon src={ViewfinderCircle} mini width={32}/>
                        </button>
                    </Card>
                    
                    
                    


                    <button title="Close" class="ml-auto" on:click={()=> { close(); zoomed=false }}>
                        <Icon src={XMark} mini width={48} />
                    </button>
                </span>
            </div>
        </div>
        
        <!---Image Container--->
        <div class="flex top-16 p-4 w-full h-full cursor-zoom-out" role="button" tabindex="0"
            bind:this={imageContainerElement}
            on:wheel        ={ (e) => scrollZoom(e) }
            on:pointerdown  ={ (e) => panStart(e) }
            on:pointermove  ={ (e) => panMove(e) }
            on:pointerup    ={ () => panEnd() }
            on:dblclick     ={ () => doubleClickZoom() }
            use:pinch   on:pinch={(e) => pinchZoom(e) }
            use:swipe   on:swipe={(e) => onSwipe(e) }
        >
            
            <img bind:this={imageElement}
                src="{imageProxyURL(url, resolution, 'webp')}"
                class="flex mx-auto my-auto pt-8 !max-h-[100%] {zoom.panning ? 'cursor-grabbing' : 'cursor-default'}"
                alt={altText}
            />
        </div>
    </div> 

{/if}



{#if url}   
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <img src="{imageProxyURL(url, resolution, 'webp')}"
            class="{$$props.class} opacity-0 transition-opacity duration-150 
                {limitHeight ? 'max-h-[min(80vh,800px)]' : ''}    
                {zoomable ? 'cursor-zoom-in' : ''}
            "
            class:opacity-100={loaded}
            class:blur-2xl={(nsfw && $userSettings.nsfwBlur)}
            alt={altText}
            title={title}
            on:load={() => (loaded = true)}
            on:click={async (e) => {
                if (zoomable) {
                    e.preventDefault()
                    e.stopPropagation()
                    zoomed = true
                }
            }}
        />
{/if}