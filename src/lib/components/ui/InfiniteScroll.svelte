<script lang="ts">
    import { onDestroy, createEventDispatcher } from 'svelte'

    export let threshold: number = 150
    export let loading: boolean = false
    
    const dispatcher = createEventDispatcher();

    $: window.addEventListener("scroll", onScroll)

    function onScroll(e:any) {
        const offset = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY)
        if (offset <= threshold && !loading) {
            dispatcher('loadMore')
        }
    }

    onDestroy( () => {
        window.removeEventListener("scroll", onScroll)
    })
</script>
