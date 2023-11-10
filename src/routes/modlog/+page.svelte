<script lang="ts">
    import type { Filters} from './page.js'
    
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import ModlogItemTable from './item/ModlogItemTable.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import ObjectAutocomplete from '$lib/components/lemmy/ObjectAutocomplete.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import { Icon, ArrowPathRoundedSquare, ExclamationTriangle, XCircle } from 'svelte-hero-icons'

    export let data


    
    // Setup Filter object    
    let filter: Filters = {
        title:      '',
        moderator:  {set: false},
        moderatee:  {set: false},
        community:  {set: false},
        action:     {set: false}
    }
    
    // Make Filter object reactive
    $: {
        filter.title = '';
        filter.community.set = new URLSearchParams(window.location.search).has('community');
        filter.moderatee.set = new URLSearchParams(window.location.search).has('other_person_id');
        filter.moderator.set = new URLSearchParams(window.location.search).has('mod_id');
        
        // Community Filter
        if (filter.community.set && data.modlog && data.modlog.length > 0 && data.modlog[0].community) {
             filter.community.community = data.modlog[0].community;
        } else {
            delete filter.community.community
        }
        //Moderatee Filter
        if (filter.moderatee.set && data.modlog && data.modlog.length > 0 && data.modlog[0].moderatee) {
            filter.moderatee.person = data.modlog[0].moderatee;
        } else {
            delete filter.moderatee.person
        }

        //Moderator Filter
        if (filter.moderator.set && data.modlog && data.modlog.length > 0 && data.modlog[0].moderator) {
            filter.moderator.person = data.modlog[0].moderator;
        }
        else {
            delete filter.moderator.person
        }
    }

</script>

<svelte:head>
    <title>Modlog</title>
</svelte:head>

<div class="flex flex-col gap-4 p-2">
    <div class="flex flex-row w-full flex-wrap justify-between">
        <div class="flex flex-col">
            <h1 class="font-bold text-2xl">Modlog</h1>
            
            {#if filter.community.set || filter.moderator.set || filter.moderatee.set}
                <h2 class="font-bold text-lg">Filters</h2>    
                
                <div class="text-xs ml-4 flex flex-col gap-2">
                    {#if filter.community.set}
                        <div class="flex flex-row gap-2">
                            <span>
                                <strong>Community ID</strong>: {
                                    filter.community.community
                                        ? filter.community.community.name + '@' + new URL(filter.community.community.actor_id).host
                                        : new URLSearchParams(window.location.search).get('community')
                                    }
                            </span>
                            
                            <span class="cursor-pointer" on:click={() => {
                                searchParam($page.url, 'community', '', 'community');
                            }}>
                                <Icon src={XCircle} mini size="16"/>
                            </span>
                        </div>
                    {/if}

                    {#if filter.moderator.set}
                        <div class="flex flex-row gap-2">
                            <span>
                                <strong>Moderator ID</strong>: {
                                    filter.moderator.person 
                                        ? filter.moderator.person.name + '@' + new URL(filter.moderator.person.actor_id).host
                                        : new URLSearchParams(window.location.search).get('mod_id')
                                    }
                            </span>

                            <span class="cursor-pointer" on:click={() => {
                                searchParam($page.url, 'mod_id', '', 'mod_id');
                            }}>
                                <Icon src={XCircle} mini size="16"/>
                            </span>
                        </div>
                    {/if}

                    {#if filter.moderatee.set}
                        <div class="flex flex-row gap-2">
                            <span>    
                                <strong>Moderatee ID</strong>: {
                                    filter.moderatee.person 
                                        ? filter.moderatee.person.name + '@' + new URL(filter.moderatee.person.actor_id).host
                                        : new URLSearchParams(window.location.search).get('other_person_id')
                                    }
                                
                            </span>
                        
                            <span class="cursor-pointer" on:click={() => {
                                searchParam($page.url, 'other_person_id', '', 'other_person_id');
                            }}>
                                <Icon src={XCircle} mini size="16"/>
                            </span>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
        
        <MultiSelect
            options={[
                'All',
                'ModRemovePost',
                'ModRemoveComment',
                'ModBan',
                'ModBanFromCommunity',
                'ModLockPost',
                'ModFeaturePost',
                'ModRemoveCommunity',
                'ModAddCommunity',
                'ModTransferCommunity',
                'ModAdd',
                'ModHideCommunity',
                'AdminPurgePerson',
                'AdminPurgeCommunity',
                'AdminPurgePost',
                'AdminPurgeComment',
            ]}

            optionNames={[
                'All',
                'Remove Post',
                'Remove Comment',
                'Ban',
                'Ban From Community',
                'Lock Post',
                'Feature Post',
                'Remove Community',
                'Add Community',
                'Transfer Community',
                'Add',
                'Hide Community',
                'Purge Person',
                'Purge Community',
                'Purge Post',
                'Purge Comment',
            ]}
            selected={data.type}
            items={2}
            on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
        />
    </div>
        
    <div class="flex flex-row w-full flex-wrap items-center justify-between">

        <div class="max-w-sm" >
            <div class="block my-1 font-bold text-sm">Community</div>
            <ObjectAutocomplete
                placeholder="Filter by community"
                jwt={$profile?.jwt}
                listing_type="All"
                showWhenEmpty={true}
                on:select={(e) =>
                    searchParam($page.url, 'community', e.detail?.id.toString(), 'page')}
            />

            
        </div>
        
        <div class="max-w-sm">
            <div class="block my-1 font-bold text-sm">Moderator</div>
            <ObjectAutocomplete
                placeholder="Filter by Moderator"
                jwt={$profile?.jwt}
                showWhenEmpty={false}
                type="person"
                on:select={(e) =>
                    searchParam($page.url, 'mod_id', e.detail?.id.toString(), 'page')}
            />
        </div>

        <div class="max-w-sm">
            <div class="block my-1 font-bold text-sm">Moderatee</div>
            <ObjectAutocomplete
                placeholder="Filter by Moderatee"
                jwt={$profile?.jwt}
                showWhenEmpty={false}
                type="person"
                on:select={(e) =>
                    searchParam($page.url, 'other_person_id', e.detail?.id.toString(), 'page')}
            />
        </div>
    </div>
    
    <div class="flex flex-row w-full flex-wrap items-center justify-between">
        <div class="ml-auto"/>

        <Button color="primary" on:click={() => goto('/modlog') }>
            <Icon src={ArrowPathRoundedSquare} class="h-8" mini size="16"/>
            Reset Modlog Filters
        </Button>
        
    </div>

    {#if data.modlog && data.modlog.length > 0}
        <div class="flex flex-col gap-2 divide-y w-full">
            
            <div class="hidden lg:flex flex-row gap-4 items-start w-full sticky top-16 text-sm font-bold bg-white/25 dark:bg-black/25 backdrop-blur-3xl z-20">
                <div class="w-[5%]">Time</div>
                <div class="w-[15%]">Community</div>
                <div class="w-[20%]">Moderator</div>
                <div class="w-[20%]">Moderatee</div>
                <div class="w-[40%]">Details</div>
            </div>
            
            {#each data.modlog as modlog}
                <ModlogItemTable item={modlog} filter={filter} />
            {/each}
        </div>
        

        <Pageination
            page={data.page}
            on:change={(e) => searchParam($page.url, 'page', e.detail.toString())}
        />
    {:else}
        <div class="my-auto">
            <Placeholder
                title="No Results"    
                description="There are no modlog results for the provided query."
                icon={ExclamationTriangle}
            />
        </div>
    
    {/if}



    
</div>

<style lang="postcss">
    :global(.table thead tr th) {
        @apply border border-slate-200 dark:border-zinc-800 px-4 py-2 bg-slate-100;
    }

    :global(.table tr td) {
        @apply border border-slate-200 px-4 py-2 overflow-auto;
    }

    :global(.dark .table tr td) {
        @apply border-zinc-800;
    }

    :global(.dark thead tr th) {
        @apply border-zinc-800 bg-zinc-900;
    }
</style>
