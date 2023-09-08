<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import type { postDisplayType } from './helpers.js'

    export let instance: string
    export let name: string
    export let url: string|boolean
    export let id: string
    export let nsfw: boolean
    export let fullResolution: boolean  // Whether to show the image in full res or append thumbnail=XXX to the image URL
    export let displayType: postDisplayType

    let loaded:boolean = false
    
    let src: string
    if (fullResolution) {
        src = `${url}?format=webp`
    }
    else {
        src = `${url}?thumbnail=768&format=webp`
    }
</script>



{#if displayType == 'feed'}
<a
    href="/post/{instance}/{id}"
    class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full m-1"
    data-sveltekit-preload-data="off"
    aria-label={name}
    title={name}
>
    <div class="m-1">
        <div class="ml-auto mr-auto {$userSettings.imageSize ?? 'max-w-3xl'}"> 
            <picture class="rounded-md overflow-hidden   max-w-full"> <!---w-full max-h-[min(50vh,500px)]--->
                <source
                    srcset="{url}?thumbnail=768&format=webp"
                    media="(max-width: 768px)"
                />

                <source
                    srcset="{url}?format=webp"
                    media="(max-width: 1024px)"
                />

                <img
                    src="{src}"
                    loading="lazy"
                    class="ml-auto mr-auto object-cover rounded-md h-auto z-30 opacity-0 transition-opacity duration-300"
                    class:opacity-100={loaded}
                    class:blur-3xl={(nsfw && $userSettings.nsfwBlur)}
                    on:load={() => (loaded = true)}
                />
            </picture>
        </div>
    </div>
</a>

{/if}

{#if displayType =='post'}
<div
    class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full m-1"
    data-sveltekit-preload-data="off"
    aria-label={name}
>
    <div class="ml-auto mr-auto mt-1 mb-1 {$userSettings.imageSize ?? 'max-w-3xl'}">
        <picture class="rounded-md overflow-hidden  max-h-[min(50vh,500px)] max-w-full"> <!--max-h-[min(50vh,500px)]--->
            <source
                srcset="{url}?thumbnail=768&format=webp"
                media="(max-width: 768px)"
            />

            <source
                srcset="{url}?format=webp"
                media="(max-width: 1024px)"
            />
            <!-- svelte-ignore a11y-missing-attribute -->
            <img
                src="{src}"
                alt="{name}"
                loading="lazy"
                class="ml-auto mr-auto object-cover rounded-md h-auto z-30 opacity-0 transition-opacity duration-300"
                class:opacity-100={loaded}
                on:load={() => (loaded = true)}
                
            />
        </picture>
    </div>
</div>

{/if}

