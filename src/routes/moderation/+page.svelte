<script lang="ts">
    import type { CommunityModeratorView } from 'lemmy-js-client'
    
    import { dispatchWindowEvent } from '$lib/ui/events'
    import { goto } from '$app/navigation'
    import { hrColors } from '$lib/ui/colors'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings'

    import Card from '$lib/components/ui/Card.svelte'
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Report from './Report.svelte'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    import { 
        Backward,
        BarsArrowDown,
        BarsArrowUp,
        ChevronDoubleLeft,
        ChevronDoubleRight,
        Clipboard,
        Envelope,
        EnvelopeOpen,
        Forward,
        Icon,
        Inbox, 
    } from 'svelte-hero-icons'
    
    
    
    
    
    export let data

    
    let showSidebar = true
    let inbox: HTMLDivElement
    let moderates = [] as CommunityModeratorView[]

    $:  $profile?.user?.moderates, generateModCommunityList()

    function generateModCommunityList() {
        if ($profile?.user?.moderates && $profile?.user?.moderates.length > 0) {
            moderates = $profile.user.moderates.sort((a, b) => {
                if (b.community.name > a.community.name) return -1
                if (b.community.name < a.community.name) return 1
                return 0
            })

        }
    }
</script>

<svelte:head>
    <title>Reports</title>
</svelte:head>

<SubNavbar home back refreshButton scrollButtons />


<MainContentArea>

    <div bind:this={inbox} class="flex flex-col lg:flex-row gap-2 lg:gap-4 h-full w-full">
        
        <!---Sticky Inbox Menu--->
        <Card class="flex flex-row lg:flex-col h-fit p-1 lg:p-0 gap-2 w-fit mx-auto {showSidebar ? 'lg:w-[200px]' : 'lg:w-[50px]'} lg:sticky lg:top-[8rem]">
            
            <!---Inbox Heading--->
            <span class="hidden lg:flex w-full flex-col gap-1">
                {#if showSidebar}
                <span class="flex flex-row items-center p-2 gap-2">
                    <Icon src={Clipboard} width={18} mini />
                    <span class="text-base font-bold">Reports</span>
                </span>

                <hr class="w-full {hrColors}" />
                {/if}
            </span>

            <!---Unread Only--->
            <SidebarButton title="Unread" expanded={showSidebar} class="{showSidebar ? '' : 'mx-auto'} {data.filter == 'unread' ? '!text-sky-700 dark:!text-sky-500' : ''}" 
                on:click={() => {
                    $page.url.searchParams.set('filter', 'unread')
                    $page.url.searchParams.delete('community_id')
                    searchParam($page.url, 'page', '1')
                }} 
            >
                <Icon src={Envelope} width={18} mini/>
                
                <span class="hidden {showSidebar ? 'lg:flex' : ''} w-full">
                    Unread
                    <span class="ml-auto">
                        <FormattedNumber number={data.unreadCount ?? 0} />
                    </span>
                </span>
            </SidebarButton>

            <!---All Reports--->
            <SidebarButton title="All" expanded={showSidebar} class="{showSidebar ? '' : 'mx-auto'} {data.filter == 'all' ? '!text-sky-700 dark:!text-sky-500' : ''}" 
                on:click={() => {
                    $page.url.searchParams.set('filter', 'all')
                    $page.url.searchParams.delete('community_id')
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={EnvelopeOpen} width={18} mini/>
                
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    All
                </span>
            </SidebarButton>

            <!---Collapse/Expand All--->
            <SidebarButton class="{showSidebar ? '' : 'mx-auto'}"
                title="{$userSettings.moderation.expandReportsByDefault ? 'Collapse' : 'Expand'} All"
                on:click={() => { 
                    $userSettings.moderation.expandReportsByDefault = !$userSettings.moderation.expandReportsByDefault
                    dispatchWindowEvent('expandAll', {expanded: $userSettings.moderation.expandReportsByDefault})
                }}
            >
                <Icon src={$userSettings.moderation.expandReportsByDefault ? BarsArrowUp : BarsArrowDown} width={18} mini/>
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    {$userSettings.moderation.expandReportsByDefault ? 'Collapse' : 'Expand'} All
                </span>

            </SidebarButton>

            <!---Community Selector--->
            {#if showSidebar && moderates.length > 0}
                <hr class="hidden lg:flex w-full {hrColors}" />    

                <CollapseButton iconSize={18} bottomBorder={false} expanded={$page.url.searchParams.has('community_id')}
                    title="By Community" class="hidden lg:flex" innerClass="items-start max-h-[40vh] overflow-y-scroll overflow-x-hidden"
                >
                    {#each moderates as modCommunity}

                        <button class="w-full text-left hover:underline {data.community_id == modCommunity.community.id ? 'font-bold text-sky-700 dark:text-sky-500' : ''}" 
                            on:click={() => {
                                if ($page.url.searchParams.get('community_id') == modCommunity.community.id.toString()) {
                                    $page.url.searchParams.delete('community_id')
                                    goto($page.url, {invalidateAll: true})
                                }
                                else {
                                    searchParam($page.url, 'community_id', modCommunity.community.id.toString())
                                }
                            }}
                        >
                            <span class="text-xs capitalize truncate">
                                {modCommunity.community.title ?? modCommunity.community.name}
                            </span>
                        </button>

                    {/each}
                    
                </CollapseButton>
            {/if}


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
            {#if data.reports && data.reports?.length > 0}
                
                    
                <div class="flex flex-col gap-1 w-full max-h-full">
                    {#each data.reports as item}
                        {#if (data.filter =='unread' && !item.resolved) || data.filter != 'unread'}
                            <Report bind:report={item} on:resolveReport={(e) => {
                                if (e.detail.resolved) data.unreadCount--
                                else data.unreadCount++  
                            }}/>
                        {/if}
                    {/each}
                </div>
                        
            {:else}
                <Placeholder icon={Inbox} title="No new reports" description="When submissions are reported, you can act on them here."/>
            {/if}
                
                
            {#if data.reports && (data.reports.length > 0 || (data.reports.length < 1 && data.page > 1))}
                <div class="mt-auto px-2">
                    <Pageination page={data.page}
                        on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
                    />
                </div>
            {/if}

        </div>
    </div>
</MainContentArea>