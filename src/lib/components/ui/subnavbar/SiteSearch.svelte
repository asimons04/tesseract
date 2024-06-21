<script lang="ts">
    import type { SearchType } from 'lemmy-js-client';
    import { goto } from '$app/navigation'

    import Button from '$lib/components/input/Button.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte';
    import { Icon, MagnifyingGlass } from 'svelte-hero-icons';

    export let searchTerm:string = ""
    export let type: SearchType = "All"
    export let community_id:number = 0
    export let person_id:number = 0
    export let placeholder:string|undefined = undefined

</script>


<div class="flex mx-auto">
    <form name="search" class="hidden lg:flex lg:flex-row gap-1 items-center ml-auto mr-auto"
        on:submit={(e) => {
            e.preventDefault();
            let url = new URL(window.location.href);
            url.pathname = '/search';
            url.searchParams.set('type', type)
            url.searchParams.set('q', searchTerm);
            
            if (community_id > 0) url.searchParams.set('community_id', community_id.toString())
            if (person_id > 0) url.searchParams.set('person_id', person_id.toString())

            goto(url, {
                invalidateAll: true,
            })
        }}
    >

        <TextInput type="search" name="search_input" placeholder="{placeholder ?? 'Search'}" bind:value={searchTerm}/>

        <Button submit color="tertiary">
            <Icon src={MagnifyingGlass} mini width={24} />
        </Button>
    </form>
    
    <!---Below large breakpoint, just show a button that will take you to the search page, prepopulated with the community/user details--->
    <span class="flex lg:hidden items-center gap-1 ml-auto">
        <Button color="tertiary"
            on:click={() => {
                let url = new URL(window.location.href);
                url.pathname = '/search';
                url.searchParams.set('type', type)
                
                if (community_id > 0) url.searchParams.set('community_id', community_id.toString())
                if (person_id > 0) url.searchParams.set('person_id', person_id.toString())

                goto(url, {
                    invalidateAll: true,
                })
            }}
        >
            <Icon src={MagnifyingGlass} mini width={24} />
        </Button>
    </span>
    
</div>