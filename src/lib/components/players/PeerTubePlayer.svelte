<script lang="ts">
    import IFrame from "$lib/components/lemmy/post/utils/IFrame.svelte"
    
    export let url: string
    export let title: string = ''
    export let autoplay: boolean = false

    let embedURL: URL
    try {
        let tempURL = new URL(url)
        if (autoplay) tempURL.searchParams.set('autoplay', '1')
        embedURL = tempURL
    }
    catch {}
</script>


{#if embedURL}
    <IFrame {embedURL} {title} />
{/if}