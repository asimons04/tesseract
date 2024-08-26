<script lang="ts">
    import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'
    import type { Person } from 'lemmy-js-client'
    
    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import SearchInput from '$lib/components/input/SearchInput.svelte'

    
    export let q: string = ''
    export let items: Person[] = []
    export let label:string = ''
    export let containerClass:string = ''

    let page: number = 0
    let limit: number = 50
    
    let infiniteScrollState: InfiniteScrollStateVars = {
        exhausted: false,
        loading: false
    }
    
    const dispatcher = createEventDispatcher<{ select: Person }>()

    const search = async function(e:CustomEvent) {
        infiniteScrollState.loading = true
        
        // Try to resolve the community directly and use that as the first result
        if (page == 0) {
            try {
                let person = await getClient().getPersonDetails({
                    username: q,
                })
                if (person) items = [ person.person_view.person ]
            }
            catch {}
        }

        // Search for the community 
        page++
        
        const results = await getClient().search({
            q: q ? q.split('@')[0] : ' ' ,
            type_: 'Users',
            limit: limit,
            page: page
        })
            
        infiniteScrollState.loading = false
        
        if (results.users.length < limit) infiniteScrollState.exhausted = true 
        
        if (items.length > 0) {
            results.users.map((u) => u.person).forEach((item) => {
                // Don't add a duplicate person (e.g. if there is already an exact match from the first step)
                const idx = items.findIndex((p) => p.id == item.id)
                if (idx < 0) items.push(item)
            })
        }
        else {
            items = results.users.map((p) => p.person)
        }
        items = items

    }

    const resetSearch = function () {
        items = []
        page = 0
        infiniteScrollState.loading = false
        infiniteScrollState.exhausted = false
    }
    
    // Reset the search state if the query changes
    $: q, resetSearch()

</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="flex flex-col w-full {$$props.class}">
    {#if label != ''}
        <span class="font-bold text-sm text-left mb-1 w-max self-start">
            {label}
        </span>
    {/if}

    <SearchInput
        containerClass="{containerClass}"
        bind:options={items}
        bind:infiniteScrollState
        bind:query={q}
        on:search={search}
        on:loadMore={search}
        debounceTime={600}
        extractName={(u) => u.name}
        extractSelected={(u) => {
            if (u) dispatcher('select', u)
        }}

        let:extractName
        let:extractSelected
        let:option

        {...$$restProps}
    >
    
        {#if option}
            <MenuButton on:click={() => extractSelected(option)}>
                <Avatar url={option.avatar} alt={option.actor_id} width={24} />
                <div class="flex flex-col text-left">
                    <span class="font-bold">{option.display_name ?? option.name}</span>
                    <span class="flex flex-row flex-wrap gap-0 text-xs opacity-80">
                        <span>{option.name}</span>
                        <span>@{new URL(option.actor_id).hostname}</span>
                    </span>
                </div>
            </MenuButton>
        {/if}
    </SearchInput>
</label>
