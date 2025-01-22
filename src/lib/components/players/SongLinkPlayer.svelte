<script lang="ts">
    import { buildSonglinkEmbedLink, type PostDisplayType } from '$lib/components/lemmy/post/helpers'

    import IFrame from '$lib/components/lemmy/post/utils/IFrame.svelte'
    
    export let url:string 
    export let autoplay: boolean = false
    export let title: string = ''
    export let displayType: PostDisplayType = 'post'

    let embedURL: URL | undefined

    embedURL = buildSonglinkEmbedLink(url, displayType, autoplay)
</script>

{#if embedURL}
    <IFrame {embedURL} {title} />
{/if}