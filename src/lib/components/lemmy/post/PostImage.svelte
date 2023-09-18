<script lang="ts">
    import type { PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    import { getInstance } from '$lib/lemmy.js'
    import { userSettings } from '$lib/settings.js'

    export let post:PostView | undefined
    export let displayType: PostDisplayType
    
    
    
    let instance: string                    = getInstance()
    let name:string | undefined             = post.post.name ?? undefined
    let id:number | undefined               = post.post.id ?? undefined
    let url:string|undefined                = post.post.url ?? undefined
    let thumbnail_url:string | undefined    = post.post.thumbnail_url ?? undefined
    let nsfw:boolean                        = post.post.nsfw ?? false
    let nsfwBlur:boolean                    = $userSettings.nsfwBlur ?? true
    let loaded:boolean                      = false
    
    
    // Hack to get GIFs to play in the feed.  Lemmy converts them to weird webm at best.
    if (displayType == 'feed' && url.endsWith('.gif')) {
        thumbnail_url = url;
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
        <div class="ml-auto mr-auto {$userSettings.imageSize.feed ?? 'max-w-3xl'}"> 
            <picture class="rounded-md overflow-hidden w-full max-h-[min(50vh,500px)]  max-w-full"> <!---w-full max-h-[min(50vh,500px)]--->
                <source
                    srcset="{url}?thumbnail=768&format=webp"
                    media="(max-width: 768px)"
                />

                <source
                    srcset="{url}?format=webp"
                    media="(max-width: 1024px)"
                />

                <img
                    src="{thumbnail_url ?? url}?thumbnail=768&format=webp"
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
    <div class="ml-auto mr-auto mt-1 mb-1 {$userSettings.imageSize.post ?? 'max-w-3xl'}">
        <picture class="rounded-md overflow-hidden  max-h-[min(50vh,500px)] max-w-full"> <!--max-h-[min(50vh,500px)]--->
            <img
                src="{url}?format=webp"
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

