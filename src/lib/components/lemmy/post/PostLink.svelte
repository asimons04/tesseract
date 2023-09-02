<script lang="ts">
  import Link from '$lib/components/input/Link.svelte'
  import { userSettings } from '$lib/settings.js'
  import { Icon, Link as LinkIcon } from 'svelte-hero-icons'

  export let url: string
  export let thumbnail_url: string
  export let nsfw: boolean = false
  let loaded = false;
</script>


<Link href={url} newtab={$userSettings.openInNewTab.postLinks} highlight nowrap />


<Link
    href={url}
    newtab={$userSettings.openInNewTab.postLinks}
>
    <div class="overflow-hidden z-10 relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full">
        <div class="ml-auto mr-auto mt-1 mb-1 max-w-4xl">
            <img
                src="{thumbnail_url}"
                loading="lazy"
                class="max-w-full ml-auto mr-auto object-cover rounded-md  z-30 opacity-0 transition-opacity duration-300"
                
                class:opacity-100={loaded}
                on:load={() => (loaded = true)}
                class:blur-3xl={nsfw}
            />
        </div>
    </div>

    
</Link>

