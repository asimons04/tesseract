<script lang="ts">
    import type { Filters} from './+page.js'
    
    import { getClient } from '$lib/lemmy'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util.js'
    
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
</script>

<svelte:head>
    <title>Modlog</title>
</svelte:head>


<SubNavbar home back refreshButton scrollButtons >
    
    <!---Custom Sub-Navbar Buttons for Modlog--->
    <span class="flex flex-row gap-1 md:gap-2 items-center" slot="far-left" let:iconSize>
        <!--- Modlog Filter Menu --->
        <SubnvarbarMenu alignment="bottom-left" icon={Funnel} shiftLeft={2} >
            <button class="flex flex-col w-full p-2 gap-2 cursor-default" on:click|preventDefault|stopPropagation>
               
                <Card class="w-full p-2">
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
                        selected={data.type}
                        on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
                        icon={HandRaised}
                        title="Modlog Action"
                    />
                </Card>


                <!--- Lookup a Community to Filter--->
                <Card class="flex flex-col gap-4 p-2 w-full">
                    <button class="flex flex-row gap-4 w-full" on:click|stopPropagation>
                        <Icon mini src={UserGroup} width={iconSize-2} />
                        
                        {#if filter.community.set}
                            <div class="flex flex-row w-full justify-between">
                                
                                {#if filter.community.community}
                                    <CommunityLink avatar={true} avatarSize={iconSize} community={filter.community.community} />
                                {:else}
                                    <span>
                                        { new URLSearchParams($page.url.search).get('community') }
                                    </span>
                                {/if}
                                
                                
                                <button class="cursor-pointer" on:click={() => {
                                    searchParam($page.url, 'community', '', 'community');
                                }}>
                                    <Icon src={XCircle} mini width={iconSize-2}/>
                                </button>
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
                    </button>
                
                
                    <!---Lookup a moderator to filter--->
                    {#if $profile?.user}
                    
                        <button class="flex flex-row gap-4 w-full" on:click|stopPropagation>
                            <Icon mini src={ShieldCheck} width={iconSize-2} />    
                            
                            {#if filter.moderator.set}
                                <div class="flex flex-row w-full justify-between">
                                    {#if filter.moderator.person}
                                        <UserLink avatar={true} avatarSize={iconSize} user={filter.moderator.person} useDisplayNames={false} shortenDisplayName={true}/>
                                    {:else}
                                        <span>
                                            { new URLSearchParams($page.url.search).get('mod_id') }
                                        </span>
                                    {/if}
                                    
                                    <button class="cursor-pointer" on:click={() => searchParam($page.url, 'mod_id', '', 'mod_id')}>
                                        <Icon src={XCircle} mini width={iconSize-2}/>
                                    </button>
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
                        </button>
                    
                    {/if}

                    <!---Filter for a Moderatee--->
                
                    <button class="flex flex-row gap-4 w-full" on:click|stopPropagation>
                        <Icon mini src={User} width={iconSize-2} />

                        {#if filter.moderatee.set}
                            <div class="flex flex-row w-full justify-between">
                                {#if filter.moderatee.person}
                                    <UserLink avatar={true} avatarSize={iconSize} user={filter.moderatee.person} badges={false} useDisplayNames={false} shortenDisplayName={true}/>
                                {:else}
                                    <span>
                                        { new URLSearchParams($page.url.search).get('other_person_id') }
                                    </span>
                                {/if}
                            
                                <button class="cursor-pointer" on:click={() => searchParam($page.url, 'other_person_id', '', 'other_person_id')}>
                                    <Icon src={XCircle} mini width={iconSize-2}/>
                                </button>
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
                    </button>
                </Card>
                
                
                <Button color="danger" class="w-full" on:click={() => {
                    filter.community.set = false
                    delete filter.community.community
                    
                    filter.moderator.set = false
                    delete filter.moderator.person
                    
                    filter.moderatee.set = false
                    delete filter.moderatee.person
                    
                    goto('/modlog') 
                }}>
                    <Icon src={ArrowPathRoundedSquare} slot="icon" mini width={16}/>
                    Reset Modlog Filters
                </Button>
            </button>

        </SubnvarbarMenu>
    </span>

</SubNavbar>


<MainContentArea>
    <div class="flex flex-row w-full h-full gap-4 flex-wrap justify-between">

    {#if data.modlog && data.modlog.length > 0}
        <div class="flex flex-col gap-2 divide-y w-full">
            
            <div class="hidden lg:flex flex-row gap-4 items-start w-full sticky top-[6.8rem] text-sm font-bold bg-white/25 dark:bg-black/25 backdrop-blur-3xl z-5">
                <div class="w-[5%] flex justify-center">Time</div>
                <div class="w-[15%] flex justify-center">Community</div>
                {#if $profile?.user}
                    <div class="w-[20%] flex justify-center">Moderator</div>
                {/if}
                <div class="w-[20%] flex justify-center">Moderatee</div>
                <div class="{$profile?.user ? 'w-[40%]' : 'w-[60%]'} flex justify-center">Details</div>
            </div>
            
            {#each data.modlog as modlog}
                {#if modlog.actionName != "Unknown"}  
                    <ModlogItemTable item={modlog} bind:filter />
                {/if}
            {/each}
        </div>

        <Pageination page={data.page} disableNext={data.modlog.length < 1} on:change={(e) => searchParam($page.url, 'page', e.detail.toString())} />

    {:else}
        <div class="mx-auto my-auto">
            <Placeholder title="No Results" description="There are no modlog results for the provided query." icon={ExclamationTriangle} />
        </div>
    {/if}
    
    
    
    
    

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
