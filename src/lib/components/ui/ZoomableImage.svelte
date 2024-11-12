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
    import { createEventDispatcher } from "svelte";
    import { imageProxyURL } from "$lib/image-proxy";
    import { userSettings } from "$lib/settings";
    import { zoomImageModal } from "../lemmy/moderation/moderation";

    export let url:string
    export let resolution: number|undefined =  undefined
    export let nsfw:boolean = false
    export let altText:string = ''
    export let title:string = ''
    export let zoomable:boolean = true
    export let lazyload:boolean = false
    export let fadeIn:boolean = true

    let dispatcher = createEventDispatcher()
    let loaded = false
    
    let loading = lazyload ? 'lazy' : 'eager'
    // Class not used due to chicken/egg, but leaving in until I move it to a util library for outside use
    export class Zoomable {
        element: any
        zoom: ZoomParams
        defaultParams: ZoomParams
        zoomed: boolean
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
            this.zoomed = false
        }

        async applyTranslations() {
            await this.sleep(50)
            this.element.style.transform=`scale(${this.zoom.current}) translate(${this.zoom.translateX}px, ${this.zoom.translateY}px)`
        }

        bumpZoom(dir:number) {
            (dir > 0)
                ? this.setZoom(this.zoom.current + this.zoom.step)
                : this.setZoom(this.zoom.current - this.zoom.step)
            this.applyTranslations()
        }

        close() {
            this.resetZoom()
            this.zoomed = false
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

</script>



{#if url}   
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <img src="{imageProxyURL(url, resolution, 'webp')}"
        class="{$$props.class} 
            {fadeIn ? 'opacity-0 transition-opacity duration-150' : ''}  {loaded ? 'opacity-100' : ''}
            {zoomable ? 'cursor-zoom-in' : ''}
        "
        referrerpolicy="no-referrer"
        class:blur-2xl={(nsfw && $userSettings.nsfwBlur)}
        alt={altText}
        title={title}
        {loading}
        on:load={() => (loaded = true)}
        on:click={(
            //@ts-ignore
            e
        ) => {
            if (zoomable) {
                e.preventDefault()
                e.stopPropagation()
                zoomImageModal(url, altText)
            }
            else {
                dispatcher('click', e)
            }
        }}
    />
{/if}