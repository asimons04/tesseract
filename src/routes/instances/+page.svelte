<script lang="ts">
    import type { Instance } from 'lemmy-js-client'

    import { page } from '$app/stores';
    import { site } from '$lib/lemmy'

    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import InstanceListItem from './InstanceListItem.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SelectMenu from '$lib/components/input/SelectMenu.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import Switch from '$lib/components/input/Switch.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte';

    import {
        Icon,
        Link,
        XCircle,
        Bars3
    } from 'svelte-hero-icons'

    
    
    
    export let data;

    function sortInstances(a:Instance, b:Instance) {
        return a.domain < b.domain ? -1 : a.domain > b.domain ? 1 : 0
    }

    data.instances.blocked.sort(sortInstances)
    data.instances.linked.sort(sortInstances)
    data.instances.allowed.sort(sortInstances)
    
    let filterTerm:string       = $page.url.searchParams.get('instance') ?? ''
    let filterTermInput:string  = $page.url.searchParams.get('instance') ?? ''
    let hideDeadInstances       = $page.url.searchParams.get('hideDead')?.toLowerCase() == 'true' ?? false
    let selectedSoftwareType    = $page.url.searchParams.get('software') ?? 'All'
    let selectedFederationState = $page.url.searchParams.get('state') ?? 'Linked'

    let debounceTimer: ReturnType<typeof setTimeout>;
    
    function debounce(value:string,  timeout=300) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(
            () => {
                filterTerm = value.toLowerCase();
                clearTimeout(debounceTimer);
            }, timeout
        )
    }

    // Get a list of the software types to filter by

    let softwareTypes = ['All'] as string[]
    data.instances.blocked.forEach((instance:Instance) => {
        if (instance.software && !softwareTypes.includes(instance.software)) softwareTypes.push(instance.software)
    })

    data.instances.linked.forEach((instance:Instance) => {
        if (instance.software && !softwareTypes.includes(instance.software)) softwareTypes.push(instance.software)
    })

    data.instances.allowed.forEach((instance:Instance) => {
        if (instance.software && !softwareTypes.includes(instance.software)) softwareTypes.push(instance.software)
    })

    softwareTypes.sort()

    // Populate arrays for federation state dropdown
    let federationStates = ['Linked'] 
    

    if (data.instances.allowed.length > 0) federationStates.push('Allowed')
    else federationStates.push('Blocked')

</script>

<svelte:head>
    <title>Federated Instances</title>
</svelte:head>

<SubNavbar home back toggleMargins refreshButton toggleCommunitySidebar scrollButtons >
    <div class="flex flex-row gap-1 md:gap-2 items-center" let:iconSize slot="left">
        <!---Local/Subscribed/All Switcher--->
        <SelectMenu
            options={softwareTypes}
            selected={selectedSoftwareType}
            on:select={(e) => { 
                selectedSoftwareType = e.detail
            }}
            title="Software Type"
            icon={Bars3}
        />

        <SelectMenu
            options={federationStates}
            selected={selectedFederationState}
            on:select={(e) => { 
                selectedFederationState = e.detail
            }}
            title="Federation State"
            icon={Link}

        />
    </div>

    <!---Filters--->
    <div class="hidden xl:flex flex-row gap-2 items-center" slot="center">
  
        <TextInput type="text" placeholder="Filter Instances" class="h-8"
            bind:value={filterTermInput}
            on:keyup={(e) => { 
                debounce(e.detail.srcElement.value);
            }}
        />
        <button class="my-auto cursor-pointer" title="Reset Search Filter" on:click={async () => {
                debounce('');
                filterTermInput = ''
            }}
        >
            <Icon src={XCircle} mini size="22"/>
        </button>

        <span class="font-bold text-xs whitespace-nowrap ml-4">Hide dead</span>
        <Switch bind:enabled={hideDeadInstances}/>

    </div>

</SubNavbar>





<MainContentArea>
    
    <!---Filter for mobile view--->
    <span class="flex xl:hidden flex-row gap-1 mx-auto items-center">
        <TextInput type="text" placeholder="Filter Instances" class="h-8 w-full"
            bind:value={filterTermInput}
            on:keyup={(e) => { 
                debounce(e.detail.srcElement.value);
            }}
        />
        <button class="my-auto cursor-pointer" title="Reset Search Filter" on:click={async () => {
                debounce('');
                filterTermInput = ''
            }}
        >
            <Icon src={XCircle} mini size="22"/>
        </button>

        <span class="font-bold text-xs whitespace-nowrap">Hide dead instances</span>
        <Switch bind:enabled={hideDeadInstances}/>
    </span>

    
    <FeedContainer>
        <div class="flex flex-col gap-4 w-full">
            {#if selectedFederationState == 'Linked'}
                {#each data.instances.linked as instance}
                    <InstanceListItem instance={instance} bind:filterTerm bind:hideDead={hideDeadInstances} bind:softwareType={selectedSoftwareType}/>
                {/each}

            {/if}

            {#if selectedFederationState == 'Blocked'}
                {#each data.instances.blocked as instance}
                    <InstanceListItem instance={instance} bind:filterTerm bind:hideDead={hideDeadInstances} bind:softwareType={selectedSoftwareType}/>
                {/each}

            {/if}

            {#if selectedFederationState == 'Allowed'}
                {#each data.instances.allowed as instance}
                    <InstanceListItem instance={instance} bind:filterTerm bind:hideDead={hideDeadInstances} bind:softwareType={selectedSoftwareType}/>
                {/each}
            {/if}
        </div>
    </FeedContainer>

    <div class="h-full" slot="right-panel">
        {#if $site}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version}/>
        {/if}
    </div>
</MainContentArea>