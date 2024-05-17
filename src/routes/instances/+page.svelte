<script lang="ts">
    import type { Instance } from 'lemmy-js-client'
    import type { InstanceWithFederationStateCustom } from './+page'

    import { page } from '$app/stores';
    import { site } from '$lib/lemmy'

    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import InstanceListItem from './InstanceListItem.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import Switch from '$lib/components/input/Switch.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte';

    import {
        Icon,
        Link,
        MagnifyingGlass,
        XCircle,
        Bars3
    } from 'svelte-hero-icons'
    import Button from '$lib/components/input/Button.svelte';
    
    export let data;
   
    let filterTerm:string       = $page.url.searchParams.get('instance') ?? ''
    let showDeadInstances       = $page.url.searchParams.has('showDead') || false
    let selectedSoftwareType    = $page.url.searchParams.get('software') ?? 'All'
    let selectedFederationState = $page.url.searchParams.get('state') ?? 'All'
    
    
   
    // Paginate instances so page doesn't use close to 1 GB RAM
    let filteredList            = [] as InstanceWithFederationStateCustom[]
    let batch = [] as InstanceWithFederationStateCustom[]
    let pageLimit = 100
    let batchPage = 1
    search(batchPage)
    
    function search(page:number = 1) {
        batch = [] as InstanceWithFederationStateCustom[]
        let startIndex = (page-1) * pageLimit
        let endIndex = startIndex + pageLimit
        
        if (page == 1) {
            filteredList = [] as InstanceWithFederationStateCustom[]
        
            // Filter the instances first
            for (let i:number=0; i < data.instances.length; i++) {
                let instance = data.instances[i]

                // Filters
                if (
                        (instance.domain) && 
                        (!filterTerm || instance.domain.includes(filterTerm))  &&
                        (selectedSoftwareType == 'All' || (instance.software && instance.software.toLowerCase() == selectedSoftwareType.toLowerCase())) &&
                        (selectedFederationState == 'All' || selectedFederationState.toLowerCase() == instance.state.toLowerCase()) &&
                        ( showDeadInstances || (!showDeadInstances && !instance.dead))
                    ) {
                    filteredList.push(instance)
                }
            }
        }
        
        // Paginate the filtered list
        for (let i = startIndex; i < endIndex; i++) {
            if(filteredList[i]) batch.push(filteredList[i])
            else break;
        }
        
        batch = batch
    }

    function clearFilter() {
        filterTerm = ''
        selectedSoftwareType = 'All'
        showDeadInstances = false
        selectedFederationState = 'All'
        batchPage = 1
    }

</script>

<svelte:head>
    <title>Federated Instances</title>
</svelte:head>

<SubNavbar home back toggleMargins refreshButton toggleCommunitySidebar scrollButtons >
    <div class="flex flex-row gap-1 md:gap-2 items-center" let:iconSize slot="left">
        <!---Local/Subscribed/All Switcher--->
        <SelectMenu
            options={data.software_types}
            selected={selectedSoftwareType}
            on:select={(e) => { 
                selectedSoftwareType = e.detail
                search()
            }}
            title="Software Type"
            icon={Bars3}
        />

        <SelectMenu
            options={data.federation_states}
            selected={selectedFederationState}
            on:select={(e) => { 
                selectedFederationState = e.detail
                search()
            }}
            title="Federation State"
            icon={Link}

        />
    </div>

    <!---Filters--->
    <form class="hidden xl:flex flex-row gap-2 items-center" let:iconSize slot="center" on:submit|preventDefault={()=> {
        batchPage = 1
        search()
    }}>

        <span class="font-bold text-xs whitespace-nowrap ml-4">Show dead</span>
        
        <Switch bind:enabled={showDeadInstances}  on:change={(e) => {
            showDeadInstances = e.detail
            search()
        }}/>

        <!---Search--->
        <TextInput type="text" placeholder="Filter Instances" class="h-8" bind:value={filterTerm} />
        <Button submit color="tertiary" icon={MagnifyingGlass} {iconSize} size="sm" title="Reset Search Filter"/>
       

        <!---Reset--->
        <Button color="tertiary" size="sm" icon={XCircle} {iconSize} title="Reset Search Filter" on:click={async () => {
                clearFilter()
                search()
            }}
        />
    </form>

</SubNavbar>





<MainContentArea>
    
    <!---Filter for mobile view--->
    <form class="flex xl:hidden flex-row gap-1 mx-auto items-center" on:submit|preventDefault={()=> {
        batchPage = 1
        search()
    }}>

        <span class="font-bold text-xs whitespace-nowrap ml-4">Show dead</span>
        
        <Switch bind:enabled={showDeadInstances}  on:change={(e) => {
            showDeadInstances = e.detail
            search()
        }}/>

        <!---Search--->
        <TextInput type="text" placeholder="Filter Instances" class="h-8" bind:value={filterTerm} />
        <Button submit color="tertiary" icon={MagnifyingGlass} iconSize={24} size="sm" title="Reset Search Filter"/>
        

        <!---Reset--->
        <Button color="tertiary" size="sm" icon={XCircle} iconSize={24} title="Reset Search Filter" on:click={async () => {
                clearFilter()
                search()
            }}
        />
    </form>
    
    <FeedContainer>
        <div class="flex flex-col gap-4 w-full h-full">
            {#if batch.length > 0}
                {#each batch as instance}
                    <InstanceListItem instance={instance} />
                {/each}
            {:else}
                <Placeholder icon={MagnifyingGlass} title="No results"  description="No instances matched the filter." />
            {/if}
        </div>
    </FeedContainer>

    <Pageination bind:page={batchPage} disableNext={batch.length < pageLimit} on:change={(e) => {
        batchPage = e.detail
        search(batchPage)
        window.scrollTo(0,0)
    }}/>

    <div class="h-full" slot="right-panel">
        {#if $site}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version}/>
        {/if}
    </div>
</MainContentArea>