<script lang="ts">
    import { createAvatar } from '@dicebear/core'
    import { findClosestNumber } from '$lib/util.js'
    import * as initials from '@dicebear/initials'
    import * as adventurer from '@dicebear/adventurer'
    import ZoomableImage from './ZoomableImage.svelte';
    import { inDarkTheme } from '$lib/ui/colors';

    const sizes = [128, 256, 512, 1024]

    export let url: string | undefined
    export let alt: string = ''
    export let title: string = ''
    export let circle: boolean = true
    export let rounded: boolean = false
    export let ring: boolean = false
    export let ringColor: string = 'ring-sky-700 dark:ring-sky-700'

    export let width: number
    export let fullRes:boolean = false
    export let community:boolean = false
    export let zoomable:boolean = true
    export let background:boolean = false
    export let lazyload: boolean = true
    export let fadeIn: boolean = true
</script>

<div class="flex flex-shrink-0 {ring && width < 28 ? 'm-[2px]' : ''}" style="width: {width+2}px;">
    <div class="{circle ? 'rounded-full' : ''} {rounded ? 'rounded-xl' : ''} {background ? 'bg-white/50' : ''} mx-auto w-full">
        {#if url}
            <ZoomableImage url={url} format='webp' title={title} altText={alt} {lazyload} {fadeIn}
                resolution={fullRes ? undefined : findClosestNumber(sizes, width) } 
                zoomable={zoomable && fullRes}
                class="aspect-square object-cover overflow-hidden !w-full
                    {ring ? `ring-2 ${ringColor}` : ''} 
                    {circle ? 'rounded-full' : ''}
                    {rounded ? 'rounded-xl' : ''}
                    {$$props.class}
                "
            />
        {:else}
            <div class="w-full h-full aspect-square object-cover overflow-hidden 
                    {circle ? 'rounded-full' : ''} 
                    {rounded ? 'rounded-xl' : ''} 
                    {ring ? `ring-2 ${ringColor}` : ''} 
                    {$$props.class}
                "  
                style="width: {width+2}px;"
            >
                {#if community}
                    {@html createAvatar(initials, {
                        seed: alt,
                        chars: 1,
                        }).toString()
                    }
                {:else}
                    {@html createAvatar(adventurer, {
                            seed: alt,
                            //scale: 125,
                            backgroundColor: inDarkTheme() ? ["000000"] : ["ffffff"],
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
</div>
