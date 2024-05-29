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

    interface PressEvent extends CustomEvent {
        detail: {
            x: number
            y: number
            pointerType?: 'touch' | 'mouse' | 'pen'
            target: EventTarget
        }
    }
    

    interface SwipeEvent extends CustomEvent {
        detail: {
            direction: 'top' | 'right' | 'bottom' | 'left',
            target: EventTarget
        }
    }

    import { imageProxyURL } from "$lib/image-proxy";
    import { fade } from "svelte/transition";
    import { pinch, swipe } from 'svelte-gestures'
    
    import { 
    ArrowUturnLeft,
        ArrowUturnRight,
        Icon, 
        MagnifyingGlassMinus, 
        MagnifyingGlassPlus, 
        ViewfinderCircle, 
        XMark 
    } from "svelte-hero-icons";
    
    import Button from "$lib/components/input/Button.svelte";
    import Card from "$lib/components/ui/Card.svelte";

    export let url:string
    export let altText:string = ''
    export let open = false

    let imageElement: any
    let imageContainerElement: HTMLDivElement
    let toolbarElement: any
    
    let zoom = {
        current: 1,         // Default / 'zero' scale value
        min: 0.75,          // Minimum scale value
        max: 5,             // Maximum scale value
        step: 0.5,          // Amount of scale to apply per scroll/click
        translateX: 0,      // The cacluated X coordinate used in the translate()
        translateY: 0,      // The cacluated Y coordinate used in the translate() 
        startX: 0,          // X coordinate for panning to begin
        startY:0,           // Y coordinate for panning to begin
        panning: false,     // Flag used internally to determine if currently panning
        doubleClick: false, // Flag used to determine if double-click quick zoom is enabled
        rotateDeg: 0,       // Number of degrees to rotate
        rotateStep: 90      // Number of degrees to rotate per step

    }
    let defaultZoom = {...zoom}
    


    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Applies the scale and translation values to the image element
    function applyTranslations() {
        imageElement.style.transformOrigin = "center"
        imageElement.style.transform=`scale(${zoom.current}) translate(${zoom.translateX}px, ${zoom.translateY}px) rotate(${zoom.rotateDeg}deg)`
    }

    function bumpRotate(dir:number) {
        (dir > 0)
            ? rotate(zoom.rotateDeg + zoom.rotateStep)
            : rotate(zoom.rotateDeg - zoom.rotateStep)
    }

    // Bumps the zoom by the step amount. dir > 0 is zoom in, dir < 0 is zoom out.
    function bumpZoom(dir:number, keepCenter=false) {
        (dir > 0)
            ? setZoom(zoom.current + zoom.step)
            : setZoom(zoom.current - zoom.step)
        if (keepCenter) {
            zoom.translateX = 0
            zoom.translateY = 0
        }
        applyTranslations()

    }

    // Resets the zoom parameters to default and closes the modal
    function close() {
        resetZoom()
        open = false
    }
    
    // Quick zooms to double scale and back to normal on double-tap
    function doubleClickZoom() {
        zoom.translateX = 0
        zoom.translateY = 0 
        zoom.current = zoom.doubleClick
            ? 1
            : 2
        zoom.doubleClick = !zoom.doubleClick
        applyTranslations()
    }


    // Fires on swipe events
    function onSwipe(e:SwipeEvent) {
        if (e.detail.direction == 'top')    bumpZoom(1, true) 
        if (e.detail.direction == 'bottom') bumpZoom(-1, true) 
        if (e.detail.direction == 'left')   close()
        if (e.detail.direction == 'right')  close()
    }

    
    // Fires when mouse is released and clears the panning flag
    function panEnd() {
        zoom.panning = false;
    }

    // Fires on mouse move. If not also mousedown, returns. Otherwise, cacluates the translation values (current mouse x/y - the starting coordinates from panStart
    async function panMove(e:PointerEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (!zoom.panning) return; // Do nothing
        zoom.translateX = (e.clientX - zoom.startX)
        zoom.translateY = (e.clientY - zoom.startY)
        applyTranslations()
    }

    // Fires when clicking and calculates the starting coordinates of the translate (current mouse coords - current translation coords) and sets the panning flag
    function panStart(e:PointerEvent) {
        e.preventDefault()
        e.stopPropagation()
        zoom.panning = true;
        zoom.startX = e.clientX - zoom.translateX
        zoom.startY = e.clientY - zoom.translateY
    }

    // Fires on pinch event and sets the scale to the value reported from the event. Does not pan while pinch-zooming
    async function pinchZoom(e:PinchEvent) {
        e.preventDefault()
        e.stopPropagation()
        zoom.panning = false
        zoom.current = (e.detail.scale * 0.75)

        // Force to stay centered when zooming
        zoom.translateX = 0
        zoom.translateY = 0        
        if (zoom.current > zoom.max) zoom.current = zoom.max
        if (zoom.current < zoom.min) zoom.current = zoom.min
        
        applyTranslations()
        
    }

    // Resets the zoom parameters to default
    function resetZoom() {
        zoom = {...defaultZoom}
        applyTranslations()
    }

    function rotate(deg:number) {
        zoom.rotateDeg = deg
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

    // Zooms the image in if direction is > 0, zooms out if < 0
    function zoomImage(direction: number) {
        setZoom(zoom.current + direction * zoom.step)
        applyTranslations()
    }


</script>

{#if open}
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
            if (!imageElement.contains(e.target) && !toolbarElement.contains(e.target)) { 
                close()
            }
		}}
    >
        <!---Toolbar with zoom in/out buttons and button to close the overlay--->
        <div bind:this={toolbarElement} class="absolute top-0 bg-slate-50/30 dark:bg-zinc-950/80 backdrop-blur-3xl w-full z-50 p-1 cursor-default">
            <div class="flex flex-row w-full">
                <span class="flex flex-row gap-4 px-4 w-full items-center">
                    
                    <!---Markdown editor resize slider--->
                    <Card class="flex flex-row gap-2 items-center rounded-lg lg:mx-auto">
                        <span class="flex flex-row gap-1 w-fit mr-auto items-center">
                            
                            <Button title="Rotate Counter-Clockwise" color="tertiary"  icon={ArrowUturnLeft} iconSize={24} on:click={()=>bumpRotate(-1)} />

                            <Button title="Reset Zoom" color="tertiary" icon={MagnifyingGlassMinus} iconSize={24} on:click={()=>bumpZoom(-1)} />
                            
                            <input type="range" bind:value={zoom.current} min={zoom.min} max={zoom.max} step={zoom.step} 
                                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                on:input={() => applyTranslations() }
                                on:drag|preventDefault
                            >
                            
                            <Button title="Reset Zoom" color="tertiary" icon={MagnifyingGlassPlus} iconSize={24} on:click={()=>bumpZoom(1)} />
                        </span>

                        <Button title="Reset Zoom" color="tertiary" icon={ViewfinderCircle} iconSize={24} on:click={()=>resetZoom()} />

                        <Button title="Rotate Clockwise" color="tertiary" icon={ArrowUturnRight} iconSize={24} on:click={()=>bumpRotate(1)} />
                    </Card>
                    
                    <Card>
                        <Button title="Close" color="tertiary" size="sm" icon={XMark} iconSize={24} on:click={()=> close()} />
                    </Card>
                </span>
            </div>
        </div>
        
        <!---Image Container--->
        <div class="flex top-16 p-4 w-full h-full cursor-zoom-out" role="button" tabindex="0"
            bind:this={imageContainerElement}
            on:wheel        = { (e) => scrollZoom(e) }
            on:pointerdown  = { (e) => panStart(e) }
            on:pointermove  = { (e) => panMove(e) }
            on:pointerup    = { () => panEnd() }
            on:dblclick     = { () => doubleClickZoom() }
            use:pinch   on:pinch={(e) => pinchZoom(e) }
            use:swipe   on:swipe={(e) => onSwipe(e) }
        >
            
            <img bind:this={imageElement}
                src="{imageProxyURL(url)}"
                class="flex mx-auto my-auto pt-8 !max-h-[100%] {zoom.panning ? 'cursor-grabbing' : 'cursor-default'}"
                alt={altText}
            />
        </div>
    </div> 

{/if}


