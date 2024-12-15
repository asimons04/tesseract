<script lang="ts">
    import { userSettings } from "$lib/settings";
    import { createEventDispatcher, onDestroy } from "svelte"

    export let postContainer:HTMLDivElement
    export let inViewport:boolean = false
    export let delay: number = 2000
    export let threshold: number = 0

    const dispatch = createEventDispatcher()

    onDestroy( () => {
        if (postContainer) observer.unobserve(postContainer)
        observing = false
    })
    
    let timeout:number
    let observing = false
    
    // Determine if the post is in the viewport and use that to determine whether to render it as an embed in the feed.
    // Should reduce memory consumption by a lot on video-heavy feeds.
    inViewport = false
    const observer = new window.IntersectionObserver( ([entry]) => {
            if (entry.isIntersecting) {
                inViewport = true
                dispatch('inViewport', true)

                clearTimeout(timeout)
                return
            }
            // Give a short buffer time to allow resizing window without the element being flagged out of viewport and destroyed.
            timeout = window.setTimeout(() => {
                inViewport = false
                dispatch('inViewport', false)
            }, delay)
        }, 
        { root: null, threshold: threshold,}
    )
    
    $:  if (postContainer && !observing) {
            observer.observe(postContainer)
            observing = true
        }
    

</script>