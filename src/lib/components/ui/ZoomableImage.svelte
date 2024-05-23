<script lang="ts">
    
    import { imageProxyURL } from "$lib/image-proxy";
    import { userSettings } from "$lib/settings";
    import { fade } from "svelte/transition";
    
    import panzoom from 'panzoom'
    import { Icon, XCircle } from "svelte-hero-icons";

    export let url:string
    export let resolution: number|undefined =  undefined
    export let nsfw:boolean = false
    export let altText:string = ''
    export let limitHeight:boolean = true
    
    
    let loaded = false
    let zoomed = false
    let imageElement: HTMLImageElement
    let imageContainerElement: HTMLDivElement
    let zoomer: any

    function close() {
        if (zoomer) zoomer.dispose()
        zoomed = false
    }

    // Activate panzoom on the image element    
    $:  if (zoomed && imageElement) {
            zoomer = panzoom(imageElement, 
                {
                    transformOrigin: {x: 0.5, y: 0.5}
                }
            )
        }
</script>

{#if zoomed}
    <!---Div to blur background--->  
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class="overflow-hidden fixed top-0 left-0 w-screen h-screen z-[99] 
        flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm box-border p-4 whitespace-normal cursor-default"
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
		}}
    >

        <div class="absolute top-0 right-0 z-50 p-4">
            <button on:click={()=>close()}>
                <Icon src={XCircle} mini width={48} />
            </button>
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
{/if}



{#if url}   
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <img src="{imageProxyURL(url, resolution, 'webp')}"
            class="ml-auto mr-auto object-cover rounded-md {limitHeight ? 'max-h-[min(80vh,800px)]' : ''} z-20 opacity-0 transition-opacity duration-150 cursor-zoom-in"
            class:opacity-100={loaded}
            class:blur-2xl={(nsfw && $userSettings.nsfwBlur)}
            alt={altText}
            on:load={() => (loaded = true)}
            on:click={(e) => {
                e.preventDefault()
                e.stopPropagation()
                zoomed = true
            }}
        />
{/if}