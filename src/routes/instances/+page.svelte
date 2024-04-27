<script lang="ts">
    import type { Instance } from 'lemmy-js-client'

    import Button from '$lib/components/input/Button.svelte';
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import InstanceListItem from './InstanceListItem.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte';

    import {
        HandThumbUp,
        Icon,
        NoSymbol,
        Link,
        XCircle

    } from 'svelte-hero-icons'
    
    export let data;

    function sortInstances(a:Instance, b:Instance) {
        return a.domain < b.domain ? -1 : a.domain > b.domain ? 1 : 0
    }

    data.instances.blocked.sort(sortInstances)
    data.instances.linked.sort(sortInstances)
    data.instances.allowed.sort(sortInstances)


    let tab: 'allowed' | 'blocked' | 'linked' = 'linked'
    
    
    let filterTerm:string = ''
    let filterTermInput:string = ''
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
</script>

<svelte:head>
    <title>Federated Instances</title>
</svelte:head>

<SubNavbar home back toggleMargins refreshButton toggleCommunitySidebar />

<div class="sticky top-[6.8rem] flex flex-row gap-1 -ml-2 px-2 py-1 w-[calc(100%+1rem)] bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-10">
    <div class="flex flex-row gap-1 mx-auto">
        <Button color="tertiary" alignment="left" title="Linked" class="hover:bg-slate-200" on:click={() => tab='linked' }>
            <span class="flex flex-col items-center {tab == 'linked' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={Link} mini size="18" title="Linked" />
                <span class="text-xs text-center">Linked ({data.instances.linked.length})</span>
            </span>            
        </Button>

        {#if data.instances.allowed.length > 0}
            <Button color="tertiary" alignment="left" title="Allowed" class="hover:bg-slate-200" on:click={() => tab='allowed' }>
                <span class="flex flex-col items-center {tab == 'allowed' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                    <Icon src={HandThumbUp} mini size="18" title="Allowed" />
                    <span class="text-xs text-center">Allowed ({data.instances.allowed.length})</span>
                </span>            
            </Button>
        {:else}
            <Button color="tertiary" alignment="left" title="Blocked" class="hover:bg-slate-200" on:click={() => tab='blocked' }>
                <span class="flex flex-col items-center {tab == 'blocked' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                    <Icon src={NoSymbol} mini size="18" title="Blocked" />
                    <span class="text-xs text-center">Blocked ({data.instances.blocked.length})</span>
                </span>            
            </Button>
        {/if}

        <span class="flex flex-row gap-1 mx-auto items-center">
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
        </span>
    </div>
</div>



<MainContentArea>
    <FeedContainer>

        
        
        <div class="flex flex-col gap-4 w-full">
            {#if tab == 'linked'}
                {#each data.instances.linked as instance}
                    {#if filterTerm == '' || instance.domain.includes(filterTerm)}  
                        <InstanceListItem instance={instance} />
                    {/if}
                {/each}

            {/if}

            {#if tab == 'blocked'}
                {#each data.instances.blocked as instance}
                    {#if filterTerm == '' || instance.domain.includes(filterTerm)}  
                        <InstanceListItem instance={instance} />
                    {/if}
                {/each}

            {/if}

            {#if tab == 'allowed'}
                {#each data.instances.allowed as instance}
                    {#if filterTerm == '' || instance.domain.includes(filterTerm)}  
                        <InstanceListItem instance={instance} />
                    {/if}
                {/each}

            {/if}
        </div>

        

    </FeedContainer>
</MainContentArea>