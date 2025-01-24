<script lang="ts">
    import { buildTidalEmbedURL, type PostDisplayType } from '$lib/components/lemmy/post/helpers'

    import IFrame from '$lib/components/lemmy/post/utils/IFrame.svelte'
    
    export let url:string 
    export let title: string = ''

    let embedURL: URL | undefined
    
    $:  url, embedURL = buildTidalEmbedURL(url)

</script>

{#if embedURL}
    <IFrame {embedURL} {title} />
{/if}