<script lang="ts">
    import type { SearchType } from 'lemmy-js-client';
    import { goto } from '$app/navigation'

    import Button from '$lib/components/input/Button.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte';
    import { Icon, MagnifyingGlass } from 'svelte-hero-icons';

    export let searchTerm:string = ""
    export let type: SearchType = "All"

</script>
<div class="flex mx-auto">
    <form class="hidden lg:flex lg:flex-row gap-1 items-center ml-auto mr-auto"
        on:submit={(e) => {
            e.preventDefault();
            let url = new URL(window.location.href);
            url.pathname = '/search';
            url.searchParams.set('type', type)
            url.searchParams.set('q', searchTerm);
            goto(url, {
                invalidateAll: true,
            })
        }}
    >

        <TextInput type="search" placeholder="Search" bind:value={searchTerm}/>

        <Button submit color="tertiary">
            <Icon src={MagnifyingGlass} mini width={24} />
        </Button>
    </form>
</div>