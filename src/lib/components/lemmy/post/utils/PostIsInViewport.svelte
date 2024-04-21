<script lang="ts">
    export let postContainer:HTMLDivElement
    export let inViewport:boolean
    
    // Determine if the post is in the viewport and use that to determine whether to render it as an embed in the feed.
    // Should reduce memory consumption by a lot on video-heavy feeds.
    inViewport = false
    const observer = new window.IntersectionObserver( ([entry]) => {
        if (entry.isIntersecting) {
            inViewport = true
            return
        }
        inViewport = false
        }, 
        { root: null, threshold: 0,}
    )
    $: if (postContainer) observer.observe(postContainer);

</script>