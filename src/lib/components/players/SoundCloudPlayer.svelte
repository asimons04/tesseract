<script lang="ts">
    import IFrame from '$lib/components/lemmy/post/utils/IFrame.svelte'

    export let url: string 
    export let embed_video_url: string | undefined  = undefined
    export let title: string                        = ''

    let embedURL:   URL

    // Check for a defined embed URL and use that if available
    if (embed_video_url) {
        embedURL = new URL(embed_video_url);
    }
    // If embed URL isn't provided, make our own!
    else if (!url.includes("/discover/")) {
        embedURL = new URL(`https://w.soundcloud.com/player/?visual=true&url=${url.replace('m.soundcloud.com', 'soundcloud.com')}`)
    }

</script>

{#if embedURL}
    <IFrame {embedURL} {title} />
{/if}