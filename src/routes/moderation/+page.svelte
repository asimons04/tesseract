<script lang="ts">
    import type { StandardReport } from './components/helpers'
    import { createStandardReport } from './components/helpers'

    import { fly } from 'svelte/transition'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Report from './components/Report2.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import SubnavbarMenu from '$lib/components/ui/subnavbar/SubnavbarMenu.svelte';

    import { 
    Envelope,
        EnvelopeOpen,
        Icon,
        Inbox, 
        Newspaper 
    } from 'svelte-hero-icons'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte';
    

    export let data

    $: type = $page.url.searchParams.get('type')?.toLowerCase() 

</script>

<svelte:head>
    <title>Reports</title>
</svelte:head>

<SubNavbar home back refreshButton>
    
    <div class="flex flex-row gap-2" let:iconSize slot="left">
        <!---All or Unread Reort Selector--->
        <SelectMenu
            alignment="bottom-left"
            options={['all', 'unread']}
            optionNames={['All', 'Unread']}
            selected={data.type}
            title="Read/Unread"
            icon={data.type=='all' ? EnvelopeOpen : Envelope}
            iconSize={18}
            on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
        />

        <Button href="/modlog" title="Full Modlog" size="sm" color="tertiary">
            <Icon src={Newspaper} width={iconSize}/>
        </Button>
    </div>

</SubNavbar>

<MainContentArea>
    <h1 class="font-bold text-2xl">Reports</h1>

    {#if data.reports}
        {#if (!type || type=='unread') }

            {#if data.reports.length > 0}
                <div class="flex flex-col gap-1 w-full max-h-full">
                    {#each data.reports as item}
                        {#if !item.resolved}
                            <div class="mt-[-0.25rem]" transition:fly={{delay: 300, duration:500, x: '50%'}}>    
                                <Report bind:report={item}/>
                            </div>
                        {/if}
                    {/each}
                </div>
                
            {:else}
                <Placeholder icon={Inbox} title="No new reports" description="When submissions are reported, you can act on them here."/>
            {/if}
        {/if}



        {#if type=='all'}
            {#if data.reports.length > 0}
                <div class="flex flex-col gap-1 w-full max-h-full">
                    {#each data.reports as item}
                            <div class="mt-[-0.25rem]" transition:fly={{delay: 300, duration:500, x: '50%'}}>    
                                <Report bind:report={item} />
                            </div>
                    {/each}
                </div>
            {:else}
                <Placeholder icon={Inbox} title="No reports" description="When submissions are reported, you can act on them here."/>
            {/if}
        {/if}
        
        <div class="mt-auto px-2">
            <Pageination
                page={data.page}
                on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
            />
        </div>
    {/if}
</MainContentArea>