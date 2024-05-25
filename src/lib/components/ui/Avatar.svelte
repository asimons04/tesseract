<script lang="ts">
    import { createAvatar } from '@dicebear/core'
    import { findClosestNumber } from '$lib/util.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import * as initials from '@dicebear/initials'
    import * as adventurer from '@dicebear/adventurer'
    import ZoomableImage from './ZoomableImage.svelte';

    const sizes = [48, 64, 128, 256, 512, 1024]

    export let url: string | undefined
    export let alt: string = ''
    export let title: string = ''
    export let circle: boolean = true
    export let ring: boolean = false

    export let width: number
    export let res: number | undefined = undefined
    export let fullRes:boolean = false
    export let community:boolean = false
    export let zoomable:boolean = true
</script>

<div style="width: {width}px; height: {width}px;">
    {#if url}
        <ZoomableImage url={url} title={title} altText={alt} 
            resolution={fullRes ? undefined : findClosestNumber(sizes,res||width)} 
            zoomable={zoomable && fullRes}
            class="aspect-square object-cover overflow-hidden !w-full
                {ring ? 'ring-2 ring-sky-700' : ''} 
                {circle ? 'rounded-full' : ''}
                {$$props.class}
            "
        />
    {:else}
        <div
            class="w-full h-full aspect-square object-cover overflow-hidden ring-2 ring-sky-700 {$$props.class}"
            class:rounded-full={circle}
        >
            {#if community}
                {@html createAvatar(initials, {
                    seed: alt,
                    }).toString()
                }
            {:else}
                {@html createAvatar(adventurer, {
                        seed: alt,
                        //scale: 125,
                        backgroundColor: ["ffffff"],
                        flip: true,
                        eyebrows: [
                            "variant01","variant02","variant03", "variant04","variant05",
                            "variant06", "variant07","variant08","variant09","variant10",
                            "variant11", "variant12","variant13","variant14","variant15"
                        ],
                        eyes: [
                            "variant01","variant02","variant03", "variant04","variant05",
                            "variant06", "variant07","variant08","variant09","variant10",
                            "variant11", "variant12","variant13","variant14","variant15",
                            "variant16", "variant17","variant18","variant19","variant20",
                            "variant21", "variant22","variant23","variant24","variant25",
                            "variant26"
                        ],
                        features: ["birthmark", "freckles"],
                        featuresProbability: 45,
                        glasses: ["variant01","variant02","variant03", "variant04","variant05"],
                        glassesProbability: 35,
                        randomizeIds: true
                    }).toString()
                }
            {/if}
        </div>
    {/if}
</div>

<!---
    {@html createAvatar(initials, {
        seed: alt,
        }).toString()
    }

--->