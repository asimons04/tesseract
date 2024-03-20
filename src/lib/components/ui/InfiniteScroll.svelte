<script lang="ts">
    import { onDestroy, createEventDispatcher } from 'svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';
    
    import { 
        Icon, 
        ArchiveBoxXMark,
        ChevronDown
    } from 'svelte-hero-icons'
    
    export let threshold: number = 150
    export let loading: boolean = false
    export let noMorePosts:boolean = false
    export let nextBatchLoading:boolean = false
    
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


{#if nextBatchLoading}
    <div class="mx-auto">
        <Spinner width={24} />
    </div>
{/if}

<Button color="secondary" class="w-full"
    title="Load More Posts" id="loadmore"
    on:click={async () => {
        noMorePosts = false
        dispatcher('loadMore')
    }}
>
    <Icon src={noMorePosts ? ArchiveBoxXMark : ChevronDown} mini size="16" />
    {noMorePosts ? 'No More Posts to Load' : 'Load More Posts'}
    <Icon src={noMorePosts ? ArchiveBoxXMark : ChevronDown} mini size="16" />
</Button>
