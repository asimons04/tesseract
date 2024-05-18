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
    export let items: Person[] = []
    export let label:string = ''
    export let containerClass:string = ''

    let showNone: boolean = false

    const dispatcher = createEventDispatcher<{ select: Person }>()
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="flex flex-col w-full {$$props.class}">
    {#if label != ''}
        <span class="font-bold text-sm text-left mb-1 w-max self-start">
            {label}
        </span>
    {/if}

    <SearchInput
        {containerClass}
        options={items || []}
        on:search={async () => {
            if (q == '') showNone = true
            else showNone = false

            const results = await getClient().search({
                q: q || ' ',
                type_: 'Users',
                limit: 50,
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

        {...$$restProps}
    >
    
        {#if option}
            <MenuButton on:click={() => extractSelected(option)}>
                <Avatar url={option.avatar} alt={option.actor_id} width={24} />
                <div class="flex flex-col text-left">
                    <span class="font-bold">{option.display_name ?? option.name}</span>
                    <span class="text-xs opacity-80">
                        {option.name}@{new URL(option.actor_id).hostname}
                    </span>
                </div>
            </MenuButton>
        {/if}
    </SearchInput>
</label>
