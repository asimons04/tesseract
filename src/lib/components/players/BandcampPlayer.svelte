<script lang="ts">

    import Image from "$lib/components/lemmy/post/components/Image.svelte"
    import type { PostDisplayType } from "../lemmy/post/helpers";

    export let embed_url: string
    export let thumbnail_url: string        = '/img/bandcamp.webp'
    export let alt_text: string             = ''
    export let displayType:PostDisplayType  = 'feed'

    let embedURL = new URL(embed_url)
    embedURL.pathname += '/bgcol=1F1F24/linkcol=F4F4F5/'

    
</script>

<div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
        
    <!--- Album Art from Thumbnail --->
    <Image url={thumbnail_url} altText={alt_text} {displayType} class="max-h-[min(40vh,500px)]">

    
        <!---Iframe with player--->
        <div class="overflow-hidden z-10 max-w-full max-h-[128px] -mt-[75px]">
            <div class="ml-auto mr-auto w-full}">
                <div class="flexiframe-container  max-w-screen max-h-[128px] mx-auto">
                    <iframe 
                        class="flexiframe rounded-b-md"
                        src="{embedURL}" 
                        allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                        loading="lazy"
                        allowfullscreen
                        title="Bandcamp: {alt_text}"
                    >
                    </iframe>
                </div>
            </div>
        </div>
    </Image>

</div>

<style>
    .flexiframe-container {
        position: relative;
        overflow: hidden;
        padding-top: 56.25%;
        max-width: 627px;
    }

    .flexiframe {
        position: absolute;
        top: 0;
        left: 0;
        height: 120px;
        width: 100%;
        border:0;
    }
</style>