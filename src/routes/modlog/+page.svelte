<script lang="ts">
    import type { Filters} from './+page.js'
    
    import { dividerColors } from '$lib/ui/colors.js'
    import { getClient } from '$lib/lemmy'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util.js'
    import { site } from '$lib/lemmy'
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte';
    import CommunityAutocomplete from '$lib/components/lemmy/CommunityAutocomplete.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import ModlogItemTable from './item/ModlogItemTable.svelte'
    import PersonAutocomplete from '$lib/components/lemmy/PersonAutocomplete.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import SubnvarbarMenu from '$lib/components/ui/subnavbar/SubnavbarMenu.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte';

    import { 
        Icon, 
        ArrowPathRoundedSquare, 
        ExclamationTriangle, 
        Funnel, 
        HandRaised, 
        ShieldCheck,        
        UserGroup,
        User,
        XCircle 
    } from 'svelte-hero-icons'
    import { amModOfAny } from '$lib/components/lemmy/moderation/moderation.js';
    import type { ModlogActionType } from 'lemmy-js-client';
    import SettingButton from '$lib/components/ui/settings/SettingButton.svelte';
    

    export let data
    
    // Setup Filter object    
    let filter: Filters = {
        title:      '',
        moderator:  {set: false, person: undefined, loading: false},
        moderatee:  {set: false, person: undefined, loading: false},
        community:  {set: false, community: undefined, loading: false},
        action:     {set: false}
    }
    
    async function setCommunityFilter() {
        // Community Filter
        if (!$page.url.searchParams.get('community')) filter.community.set = false
        if (!filter.community.set) delete filter.community.community

        if (filter.community.set && !filter.community.community) {
                
            if (data.modlog && data.modlog.length > 0 && data.modlog[0].community ) {
                filter.community.community = data.modlog[0].community
            }
            else if (!filter.community.loading) {
                filter.community.loading = true
                const results = await getClient().getCommunity({
                    id: Number($page.url.searchParams.get('community'))
                })
                
                filter.community.loading = false
                if (results?.community_view?.community) {
                    filter.community.community = {...results.community_view.community}
                }
            }
        }
    }

    async function setModerateeFilter() {
        if (!$page.url.searchParams.get('other_person_id')) filter.moderatee.set = false
        if (!filter.moderatee.set) delete filter.moderatee.person

        if (filter.moderatee.set && !filter.moderatee.person) {
            if (data.modlog && data.modlog.length > 0 && data.modlog[0].moderatee) {
                filter.moderatee.person = data.modlog[0].moderatee;
            }
            else if (!filter.moderatee.loading){
                filter.moderatee.loading = true
                const results = await getClient().getPersonDetails({
                    person_id: Number($page.url.searchParams.get('other_person_id'))
                })

                filter.moderatee.loading = false

                if (results?.person_view?.person) {
                    filter.moderatee.person = results.person_view.person
                }
            }
            
        }
    }

    async function setModeratorFilter() {
        if (!$page.url.searchParams.get('mod_id')) filter.moderator.set = false
        if (!filter.moderator.set) delete filter.moderator.person

        if (filter.moderator.set && !filter.moderator.person) {
            if (data.modlog && data.modlog.length > 0 && data.modlog[0].moderator) {
                filter.moderator.person = data.modlog[0].moderator;
            }
            else if (!filter.moderator.loading){
                filter.moderator.loading = true
                const results = await getClient().getPersonDetails({
                    person_id: Number($page.url.searchParams.get('mod_id'))
                })
                filter.moderator.loading = false
                
                if (results?.person_view?.person) {
                    filter.moderator.person = results.person_view.person
                }

            }
        }
    }

    // Watch the URL params for changes to filters
    $:  $page.url.search, filter.community.set = new URLSearchParams($page.url.search).has('community');
    $:  $page.url.search, filter.moderatee.set = new URLSearchParams($page.url.search).has('other_person_id');
    $:  $page.url.search, filter.moderator.set = new URLSearchParams($page.url.search).has('mod_id');

    // Set the filter details if/when they're set
    $:  filter.community.set, setCommunityFilter()
    $:  filter.moderatee.set, setModerateeFilter()
    $:  filter.moderator.set, setModeratorFilter()

    $: showModeratorColumn = ($profile?.user || $site?.site_view.local_site.hide_modlog_mod_names == false) ? true : false
</script>

<svelte:head>
    <title>Modlog</title>
</svelte:head>


<SubNavbar home back refreshButton scrollButtons />



<MainContentArea>
    <div class="flex flex-col w-full h-full gap-4">
        
        <!---Filters--->
        <Card class="w-full h-fit p-2">
            
            <div class="flex flex-col w-full p-2 gap-2 cursor-default">
                <SettingButton
                    title="Modlog"
                    description="Use the filters to find specific entries by community, moderator, person as well as filter by the action type performed."
                    icon={Funnel}
                    buttonText="Reset"
                    on:click={() => {
                        ['type', 'page', 'mod_id', 'other_person_id', 'community'].forEach((k) => $page.url.searchParams.delete(k))
                        goto('/modlog', {invalidateAll: true})
                    }}
                />
                
                <SettingMultiSelect
                    padding={false} small={true} justify={false}
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
                    bind:selected={data.type}
                    on:select={(e) => {
                        if ((!$page.url.searchParams.get('type') && data.type != 'All') || $page.url.searchParams.get('type') && data.type != $page.url.searchParams.get('type')) searchParam($page.url, 'type', e.detail, 'page')
                    }}
                    icon={HandRaised}
                    title="Modlog Action"
                    description="Filter for specific modlog actions. Note that actions like ban or remove also include their reverse actions."
                />

                <!--- Community, Moderator, Moderatee Filters--->
                <div class="flex flex-col xl:flex-row gap-4 p-2 w-full">
                    
                    <!---Community--->
                    <div class="flex flex-col w-full xl:w-1/3 gap-1">
                        <span class="hidden xl:flex font-bold text-sm opacity-80">Community</span>
                        
                        <div class="flex flex-row gap-4 w-full">
                            {#if filter.community.set}
                                <div class="flex flex-row w-full justify-between">
                                    
                                    {#if filter.community.community}
                                        <CommunityLink avatar={true} avatarSize={16} community={filter.community.community}  class="!w-[90%] truncate"/>
                                    {:else}
                                        <span>
                                            { new URLSearchParams($page.url.search).get('community') }
                                        </span>
                                    {/if}
                                    <Button color="tertiary-border" size="sm" icon={XCircle} iconSize={16} on:click={() => searchParam($page.url, 'community', '', 'community')} />
                                </div>
                            {:else}
                                <span class="flex flex-row gap-2 w-full">
                                    
                                    <CommunityAutocomplete containerClass="!w-full" placeholder="Community" listing_type="All"
                                        showHiddenRemoved={true}
                                        on:select={(e) => {
                                            filter.community.community = e.detail
                                            searchParam($page.url, 'community', e.detail?.id.toString(), 'page')
                                        }}
                                    />
                                </span>
                            {/if}
                        </div>
                    </div>
                
                
                    <!---Lookup a moderator to filter--->
                    <div class="flex flex-col w-full xl:w-1/3 gap-1">
                        {#if $profile?.user || $site?.site_view.local_site.hide_modlog_mod_names == false}
                            <span class="hidden xl:flex font-bold text-sm opacity-80">Moderator</span>
                            <div class="flex flex-row gap-4 w-full">
                                {#if filter.moderator.set}
                                    <div class="flex flex-row w-full justify-between">
                                        {#if filter.moderator.person}
                                            <UserLink avatar={true} avatarSize={16} user={filter.moderator.person} useDisplayNames={false}  class="!w-[90%] truncate"/>
                                        {:else}
                                            <span>
                                                { new URLSearchParams($page.url.search).get('mod_id') }
                                            </span>
                                        {/if}
                                        <Button color="tertiary-border" size="sm" icon={XCircle} iconSize={16} on:click={() => searchParam($page.url, 'mod_id', '', 'mod_id')} />
                                    </div>
                                {:else}
                                    <span class="flex flex-row gap-2 w-full">
                                        
                                        <PersonAutocomplete
                                            containerClass="!w-full"    
                                            placeholder="Moderator"
                                            on:select={(e) => {
                                                filter.moderator.person = e.detail
                                                searchParam($page.url, 'mod_id', e.detail?.id.toString(), 'page')
                                            }}
                                        />
                                    </span>
                                {/if}
                            </div>
                        {/if}
                    </div>

                    <!---Filter for a Moderatee--->
                    <div class="flex flex-col w-full xl:w-1/3 gap-1">
                        <span class="hidden xl:flex font-bold text-sm opacity-80">Moderatee</span>
                        
                        <div class="flex flex-row gap-4 w-full">
                            {#if filter.moderatee.set}
                                <div class="flex flex-row w-full justify-between">
                                    {#if filter.moderatee.person}
                                        <UserLink avatar={true} avatarSize={16} user={filter.moderatee.person} badges={false} useDisplayNames={false} class="!w-[90%] truncate"/>
                                    {:else}
                                        <span>
                                            { new URLSearchParams($page.url.search).get('other_person_id') }
                                        </span>
                                    {/if}
                                    <Button color="tertiary-border" size="sm" icon={XCircle} iconSize={16} on:click={() => searchParam($page.url, 'other_person_id', '', 'other_person_id')} />
                                </div>
                            {:else}
                                <span class="flex flex-row gap-2 w-full">
                                    <PersonAutocomplete
                                        containerClass="!w-full"
                                        placeholder="Moderatee"
                                        on:select={(e) => {
                                            filter.moderatee.person = e.detail
                                            searchParam($page.url, 'other_person_id', e.detail?.id.toString(), 'page')
                                        }}
                                    />
                                </span>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </Card>


        {#if data.modlog && data.modlog.length > 0}
            <div class="flex flex-col gap-2 divide-y {dividerColors} w-full">
                
                <Card class="hidden lg:flex flex-row p-1 gap-4 items-start w-full sticky top-[7rem] text-sm font-bold z-10">
                    <div class="w-[5%] flex justify-start">Time</div>
                    <div class="w-[20%] flex justify-start">Community</div>
                    {#if showModeratorColumn}
                        <div class="w-[20%] flex justify-start">Moderator</div>
                    {/if}
                    <div class="w-[20%] flex justify-start">Moderatee</div>
                    <div class="{showModeratorColumn ? 'w-[35%]' : 'w-[55%]'} flex justify-start">Details</div>
                </Card>
                
                {#each data.modlog as modlog}
                    {#if modlog.actionName != "Unknown"}  
                        <ModlogItemTable item={modlog} {showModeratorColumn} bind:filter />
                    {/if}
                {/each}
            </div>
        {:else}
            <div class="mx-auto my-auto">
                <Placeholder title="No Results" description="There are no modlog results for the provided query." icon={ExclamationTriangle} />
            </div>
        {/if}
        <Pageination page={data.page} disableNext={data.modlog.length < 1} on:change={(e) => searchParam($page.url, 'page', e.detail.toString())} />
    </div>
    
    
    

</MainContentArea>


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
