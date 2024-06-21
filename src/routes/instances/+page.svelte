<script lang="ts">
    import type { InstanceWithFederationStateCustom } from './+page'

    import { page } from '$app/stores'
    import { site } from '$lib/lemmy'
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import InstanceListItem from './InstanceListItem.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte';
    import SettingToggle from "$lib/components/ui/settings/SettingToggle.svelte"
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import SubnavbarMenu from '$lib/components/ui/subnavbar/SubnavbarMenu.svelte'
    import Switch from '$lib/components/input/Switch.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import {
        Icon,
        Funnel,
        HandThumbDown,
        Link,
        MagnifyingGlass,
        XCircle,
        Bars3,
        Server,
        
    } from 'svelte-hero-icons'
    
    
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
    
    //Do initial render
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

<SubNavbar home back toggleMargins refreshButton toggleCommunitySidebar scrollButtons on:navRefresh={() => search()} >
    <SubnavbarMenu alignment="bottom-left" shiftLeft={2} icon={Funnel} containerClass="max-h-[79svh]" slot="far-left">
        
        <div class="flex flex-col w-full p-2 gap-2 cursor-default" >
            <Card class="p-2">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div on:click|stopPropagation>
                    
                    <!---Software Type--->
                    <SettingMultiSelect
                        title="Software Type"
                        options={data.software_types}
                        selected={selectedSoftwareType}
                        icon={Server}
                        padding={false} small={true}
                        on:select={(e) => { 
                            selectedSoftwareType = e.detail
                            search()
                        }}
                    />

                    <!---Federation State--->
                    <SettingMultiSelect
                        title="Federation State"    
                        options={data.federation_states}
                        selected={selectedFederationState}
                        icon={Link}
                        padding={false} small={true}
                        on:select={(e) => { 
                            selectedFederationState = e.detail
                            search()
                        }}
                    />

                    <SettingToggle
                        title="Show Dead?"
                        icon={HandThumbDown}
                        bind:value={showDeadInstances}
                        on:change={(e) => {
                            showDeadInstances = e.detail
                            search()
                        }}
                    />
            

                    <form class="flex flex-col gap-2 mt-4 w-full" on:submit|preventDefault={()=> {
                        batchPage = 1
                        search()
                    }}>

                        <TextInput type="text" placeholder="Filter Instances" label="Keyword" bind:value={filterTerm} on:change={() => filterTerm=filterTerm.toLowerCase() } />
                        
                        <div class="flex flex-row gap-4 items-center p-2 mt-4">
                            <!---Reset--->
                            <Button color="danger" size="lg" class="w-full" icon={XCircle} width={16} title="Reset Search Filter"  
                                on:click={() => {
                                    clearFilter()
                                    search()
                                }}
                            >
                                Reset
                            </Button>
                            
                            <Button submit color="primary" size="lg" class="w-full"  icon={MagnifyingGlass} width={16} title="Reset Search Filter">
                                Search
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>

        </div>

    </SubnavbarMenu>
    

    <!---Filters--->
    <form class="hidden xl:flex flex-row gap-2 mx-auto items-center w-fit" let:iconSize slot="center" on:submit|preventDefault={()=> {
        batchPage = 1
        search()
    }}>

        <!---Search--->
        <TextInput type="text" placeholder="Filter Instances" class="h-8" bind:value={filterTerm} on:change={() => filterTerm=filterTerm.toLowerCase() }/>
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
        <TextInput type="text" placeholder="Filter Instances" class="h-8" bind:value={filterTerm} on:change={() => filterTerm=filterTerm.toLowerCase() }/>
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
                {#each batch as instance, id (instance.id)}
                    <InstanceListItem bind:instance />
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