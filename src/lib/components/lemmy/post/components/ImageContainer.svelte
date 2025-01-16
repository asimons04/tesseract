<script lang="ts">
    import { imageProxyURL } from "$lib/image-proxy";
    import { isImage, isVideo } from "../helpers";
    export let image_url: string
</script>

<div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-md max-w-full p-1">
    <div class="ml-auto mr-auto max-w-full"> 
        <picture class="rounded-md overflow-hidden w-full  max-w-full"> 
            {#if isImage(image_url)}
                <img src="{imageProxyURL(image_url, 256)}" alt="" class="z-[1] absolute w-full object-cover h-full opacity-50 brightness-150 dark:brightness-90 dark:opacity-50 blur-2xl top-[-1px] right-[-1px] bottom-[-1px] left-[-1px]">
            {:else if isVideo(image_url)}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video playsinline muted=true preload="metadata" class="z-[1] absolute w-full object-cover h-full opacity-50 brightness-150 dark:brightness-90 dark:opacity-50 blur-2xl top-[-1px] right-[-1px] bottom-[-1px] left-[-1px]">
                    <source src="{imageProxyURL(image_url, 256)}" />
                </video>
            {/if}
                <slot/>
        </picture>
    </div>
</div>