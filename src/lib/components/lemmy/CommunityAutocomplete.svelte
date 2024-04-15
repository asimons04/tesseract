<script lang="ts">
    import type { Community, ListingType, SortType } from 'lemmy-js-client'

    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import SearchInput from '$lib/components/input/SearchInput.svelte'

    import { Icon, XCircle } from 'svelte-hero-icons'

    
    export let q: string = ''
    export let listing_type: ListingType = 'All'
    export let sort: SortType = 'New'
    export let items: Community[] = []
    export let label:string = ''
    export let containerClass:string = ''

    const dispatcher = createEventDispatcher<{ select: Community }>()
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
        on:search={async () => {
            const results = await getClient().search({
                q: q || ' ',
                auth: $profile?.jwt || undefined,
                type_: 'Communities',
                limit: 50,
                listing_type: listing_type,
                sort: sort,
            })
            items = results.communities.map((c) => c.community)
        }}
        debounceTime={600}
        extractName={(c) => c.title}
        bind:query={q}
        extractSelected={(c) => {
            if (c) {
                dispatcher('select', c)
            }
        }}

        let:extractName
        let:extractSelected
        let:option
        let:query
        {...$$restProps}
    >
    
        <MenuButton on:click={() => extractSelected(option)}>
            <Avatar url={option.icon} alt={option.title} width={24} />
            
            <div class="flex flex-col text-left">
                <span>{option.title}</span>
                <span class="text-xs opacity-80">
                    {new URL(option.actor_id).hostname}
                </span>
            </div>
        </MenuButton>
        
    </SearchInput>
</label>

