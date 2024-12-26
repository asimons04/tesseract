<script lang="ts">
    import { hrColors } from '$lib/ui/colors'
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'
    

    import Application from './Application.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'

    import { 
        Backward, 
        ChevronDoubleLeft, 
        ChevronDoubleRight, 
        Clipboard as ClipboardIcon,
        ClipboardDocument,
        ClipboardDocumentCheck, 
        Forward, 
        Icon 
    } from 'svelte-hero-icons'

    export let data

    let inbox: HTMLDivElement
    let showSidebar = true
</script>

<svelte:head>
    <title>Administration | Registration Applications</title>
</svelte:head>


<MainContentArea>
    <div bind:this={inbox} class="flex flex-col lg:flex-row gap-2 lg:gap-4 h-full w-full">
        
        <!---Sticky Inbox Menu--->
        <Card class="flex flex-row lg:flex-col h-fit p-1 lg:p-0 gap-2 w-fit mx-auto {showSidebar ? 'lg:w-[200px]' : 'lg:w-[50px]'} lg:sticky lg:top-[12rem]">
            
            <!---Side Menu Heading--->
            <span class="hidden lg:flex w-full flex-col gap-1">
                {#if showSidebar}
                <span class="flex flex-row items-center p-2 gap-2">
                    <Icon src={ClipboardDocumentCheck} width={18} mini />
                    <span class="text-base font-bold">Applications</span>
                </span>

                <hr class="w-full {hrColors}" />
                {/if}
            </span>

            <!---Unread Only--->
            <SidebarButton title="Unread" expanded={showSidebar} 
                class="{showSidebar ? '' : 'mx-auto'} {data.unreadOnly ? '!text-sky-700 dark:!text-sky-500' : ''}" 
                icon={ClipboardIcon}
                iconSize={18}
                on:click={() => {
                    $page.url.searchParams.set('unreadOnly', 'true')
                    searchParam($page.url, 'page', '1')
                }} 
            >
                <span class="{showSidebar ? 'flex' : 'hidden'} w-full">
                    Unread
                </span>
            </SidebarButton>

            <!---All Applications--->
            <SidebarButton title="All" expanded={showSidebar} 
                class="{showSidebar ? '' : 'mx-auto'} {data.unreadOnly ? '' : '!text-sky-700 dark:!text-sky-500'}" 
                icon={ClipboardDocumentCheck}
                iconSize={18}
                on:click={() => {
                    $page.url.searchParams.set('unreadOnly', 'false')
                    searchParam($page.url, 'page', '1')
                }}
            >
                <span class="{showSidebar ? 'flex' : 'hidden'}">
                    All
                </span>
            </SidebarButton>


            <!---Pagination--->
            {#if data.page}
                <hr class="hidden lg:flex w-full {hrColors}" />
                <span class="hidden lg:flex w-full {showSidebar ? 'flex-row' : 'flex-col'} gap-1 text-xs items-center">
                    <!---Previous Page--->
                    
                    <SidebarButton title="Previous Page" disabled={data.page==1} on:click={ () => {
                        if (data.page > 1) {
                            let prevPage = data.page - 1
                            searchParam($page.url, 'page', prevPage.toString())
                            inbox.scrollTo(0,0)
                        }
                    }}>
                        <Icon src={Backward} width={18} mini />
                    </SidebarButton>
                    
                    <span class="mx-auto">
                        {data.page}
                    </span>
                    
                    <!---Next Page--->
                    <SidebarButton title="Next Page" on:click={ () => {
                            let nextPage = data.page +1
                            searchParam($page.url, 'page', nextPage.toString())
                            inbox.scrollTo(0,0)
                    }}>
                        <Icon src={Forward} width={18} mini />
                    </SidebarButton>
                </span>
            {/if}
            
            <!---Collapse Sidebar--->
            <span class="hidden lg:flex w-full flex-col">
                <hr class="w-full {hrColors}" />
                <SidebarButton title="{showSidebar ? 'Collapse' : 'Expand'}" class="{showSidebar ? '' : 'mx-auto'}" on:click={() => showSidebar = !showSidebar} expanded={showSidebar}>
                    <Icon src={showSidebar ? ChevronDoubleLeft : ChevronDoubleRight} width={18} mini/>
                    {#if showSidebar}Collapse{/if}
                </SidebarButton>
            </span>
        </Card>
        
        <div class="flex flex-col gap-2 h-full {showSidebar ? 'w-full lg:w-[calc(100%-200px-1rem)]' : 'w-full lg:w-[calc(100%-55px-1rem)]'}">
        
        
            {#if data.applications && data.applications.length > 0}
                <div class="flex flex-col gap-1 w-full max-h-full">
                    {#each data.applications as application (application.registration_application.id)}
                        <Application bind:application />
                    {/each}
                </div>

                
                <div class="mt-auto">
                    <Pageination page={data.page} on:change={(p) => searchParam($page.url, 'page', p.detail.toString())} />
                </div>
                

            {:else}
                <div class="my-auto">
                    <Placeholder icon={ClipboardDocumentCheck} title="No Applications" description="Applications to join your instance will appear here." />
                </div>
            {/if}
        </div>
    </div>
</MainContentArea>

