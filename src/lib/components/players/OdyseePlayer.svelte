<script lang="ts">
    import IFrame from '$lib/components/lemmy/post/utils/IFrame.svelte'
    
    export let url:string 
    export let autoplay: boolean            = false
    export let title: string                = ''

    let embedURL: URL | undefined

    
    try {
        let originalURL = new URL(url)
        let videoID = originalURL.pathname.replace('/','')
    
        embedURL = new URL("https://odysee.com")
        embedURL.pathname = `/$/embed/${videoID}`
        embedURL.searchParams.set('autopause', '0')

        let startTime = originalURL.searchParams.get('t');
        if (startTime) embedURL.searchParams.set('t', startTime)
        if (autoplay) embedURL.searchParams.set('autoplay', '1')
    }
    catch {}
</script>

{#if embedURL}
    <IFrame {embedURL} {title} />
{/if}