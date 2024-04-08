<script lang="ts">
    import type { Community, ListingType, Person } from 'lemmy-js-client'

    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import SearchInput from '$lib/components/input/SearchInput.svelte'

    import { Icon, XCircle } from 'svelte-hero-icons'

    
    export let q: string = ''
    export let type: 'community' | 'person' = 'community'
    export let listing_type: ListingType = 'Subscribed'
    export let items: Community[] | Person[] = []
    export let showWhenEmpty: boolean = false
    export let label:string = ''
    export let containerClass:string = ''

    if (type == 'community') items = [] as Community[]
    if (type == 'person') items = [] as Person[]

    let showNone: boolean = false

    const dispatcher = createEventDispatcher<{ select: Community|Person }>()
</script>

{#if type == 'community'}
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
                    sort: 'TopAll',
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
            {showWhenEmpty}
            {...$$restProps}
        >
        
            {#if query == '' && showWhenEmpty}
                <MenuButton on:click={() => dispatcher('select', undefined)}>
                    <Icon src={XCircle} size="16" mini />
                    <div class="flex flex-col text-left">
                        <span>None</span>
                    </div>
                </MenuButton>
            {:else if option && query != ''}
                <MenuButton on:click={() => extractSelected(option)}>
                    <Avatar url={option.icon} alt={option.title} width={24} />
                    <div class="flex flex-col text-left">
                        <span>{option.title}</span>
                        <span class="text-xs opacity-80">
                            {new URL(option.actor_id).hostname}
                        </span>
                    </div>
                </MenuButton>
            {/if}
        </SearchInput>
    </label>
{/if}



{#if type == 'person'}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex flex-col w-full {$$props.class}">
        {#if label != ''}
            <span class="font-bold text-sm text-left mb-1 w-max self-start">
                {label}
            </span>
        {/if}
        <SearchInput
            options={items || []}
            on:search={async () => {
                if (q == '') showNone = true
                else showNone = false

                const results = await getClient().search({
                    q: q || ' ',
                    auth: $profile?.jwt || undefined,
                    type_: 'Users',
                    limit: 20,
                })
                items = results.users.map((u) => u.person)
            }}
            debounceTime={600}
            extractName={(u) => u.name}
            bind:query={q}
            extractSelected={(u) => {
                if (u) dispatcher('select', u)
            }}

            let:extractName
            let:extractSelected
            let:option
            let:query
            {showWhenEmpty}
            {...$$restProps}
        >
        
            {#if query == '' && showWhenEmpty}
                <MenuButton on:click={() => dispatcher('select', undefined)}>
                    <Icon src={XCircle} size="16" mini />
                    <div class="flex flex-col text-left">
                        <span>None</span>
                    </div>
                </MenuButton>
            {:else if option}
                <MenuButton on:click={() => extractSelected(option)}>
                    <Avatar url={option.avatar} alt={option.name} width={24} />
                    <div class="flex flex-col text-left">
                        <span>{option.name}</span>
                        <span class="text-xs opacity-80">
                            {new URL(option.actor_id).hostname}
                        </span>
                    </div>
                </MenuButton>
            {/if}
        </SearchInput>
    </label>
{/if}