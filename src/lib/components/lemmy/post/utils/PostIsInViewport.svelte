<script lang="ts">
    export let postContainer:HTMLDivElement
    export let inViewport:boolean
    export let delay: number = 2000
    export let threshold: number = 0
    
    let timeout:number
    
    // Determine if the post is in the viewport and use that to determine whether to render it as an embed in the feed.
    // Should reduce memory consumption by a lot on video-heavy feeds.
    inViewport = false
    const observer = new window.IntersectionObserver( ([entry]) => {
            if (entry.isIntersecting) {
                inViewport = true
                clearTimeout(timeout)
                return
            }
            // Give a short buffer time to allow resizing window without the element being flagged out of viewport and destroyed.
            timeout = window.setTimeout(() => {
                inViewport = false
            }, delay)
        }, 
        { root: null, threshold: threshold,}
    )
    $: if (postContainer) observer.observe(postContainer);

</script>