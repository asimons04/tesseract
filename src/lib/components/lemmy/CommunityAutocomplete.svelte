<script lang="ts">
    import type { Community, GetCommunityResponse, ListingType, SortType } from 'lemmy-js-client'
    import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'

    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy'
    import { instance } from '$lib/instance'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import SearchInput from '$lib/components/input/SearchInput.svelte'
    
    export let q: string = ''
    export let listing_type: ListingType = 'All'
    export let sort: SortType = 'Active'
    export let items: Community[] = []
    export let label:string = ''
    export let containerClass:string = ''
    
    let page: number = 0
    let limit: number = 50
    
    let infiniteScrollState: InfiniteScrollStateVars = {
        exhausted: false,
        loading: false
    }

    const dispatcher = createEventDispatcher<{ select: Community }>()

    const search = async function(e:CustomEvent) {
        infiniteScrollState.loading = true

        // Try to resolve the community directly and use that as the first result
        if (page == 0) {
            try {
                let community = await getClient().getCommunity({
                    name: q,
                })
                if (community) items = [ community.community_view.community ]
            }
            catch {}
        }

        // Search for the community 
        page++
        
        const results = await getClient().search({
            q: q ? q.split('@')[0] : ' ' ,
            type_: 'Communities',
            limit: limit,
            listing_type: listing_type,
            sort: sort,
            page: page
        })
            
        infiniteScrollState.loading = false
        if (results.communities.length < limit) infiniteScrollState.exhausted = true 
        
        if (items.length > 0) {
            results.communities.map((c) => c.community).forEach((item) => {
                // Don't add a duplicate community (e.g. if there is already an exact match from the first step)
                const idx = items.findIndex((c) => c.id == item.id)
                if (idx < 0) items.push(item)
            })
        }
        else {
            items = results.communities.map((c) => c.community)
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
        extractName={(c) => c.title}
        extractSelected={(c) => {
            if (c) {
                dispatcher('select', c)
            }
        }}

        let:extractName
        let:extractSelected
        let:option
        {...$$restProps}
    >
    
        <MenuButton on:click={() => extractSelected(option)}>
            <Avatar url={option.icon} alt={option.title} width={24} community={true}/>
            
            <div class="flex flex-col text-left">
                <span>{option.title}</span>
                <span class="text-xs opacity-80">
                    {option.name}@{new URL(option.actor_id).hostname}
                </span>
            </div>
        </MenuButton>
        
    </SearchInput>
</label>

