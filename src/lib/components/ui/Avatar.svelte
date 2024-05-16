<script lang="ts">
    import { findClosestNumber } from '$lib/util.js'
    import { createAvatar } from '@dicebear/core'
    import { imageProxyURL } from '$lib/image-proxy'
    import * as initials from '@dicebear/initials'

    const sizes = [48, 64, 128, 256, 512, 1024]

    export let url: string | undefined
    export let alt: string = ''
    export let title: string = ''
    export let circle: boolean = true
    export let ring: boolean = false

    export let width: number
    export let res: number | undefined = undefined
    
</script>

{#if url}
    <img
        src="{imageProxyURL(url, findClosestNumber(sizes,res||width), 'webp')}"
        {alt}
        {width}
        {title}
        loading="lazy"
        class="aspect-square object-cover overflow-hidden {ring ? 'ring-2 ring-sky-700' : ''} {$$props.class} "
        class:rounded-full={circle}
    />
{:else}
    <div
        style="width: {width}px; height: {width}px;"
        class="aspect-square object-cover overflow-hidden {ring ? 'ring-2 ring-sky-700' : ''} {$$props.class}"
        class:rounded-full={circle}
    >
        {@html createAvatar(initials, {
            seed: alt,
            }).toString()
        }
    </div>
{/if}
