<script lang="ts">
    import type { InboxFeedType } from './+page'

    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { hrColors } from '$lib/ui/colors'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings'

    import Card from '$lib/components/ui/Card.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import InboxItem from './InboxItem.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import ProfileMenuBar from '$routes/profile/ProfileMenuBar.svelte'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte';
    
    import {
        AtSymbol,
        Backward,
        BarsArrowDown,
        BarsArrowUp,
        ChatBubbleLeft,
        ChatBubbleLeftRight,
        Check,
        ChevronDoubleLeft,
        ChevronDoubleRight,
        Envelope,
        Forward,
        Icon,
        Inbox,
        Window as WindowIcon,
    } from 'svelte-hero-icons'
    
    
    export let data

    let markingAsRead = false
    let showSidebar = true
    let inbox: HTMLDivElement

    

    async function markAllAsRead() {
        if (!$profile?.user) {
            goto('/login')
            return
        }

        markingAsRead = true

        const response = await getClient().markAllAsRead()

        $profile.user.unreads = 0

        goto($page.url, {invalidateAll: true,}).then(() => {
            markingAsRead = false
        })

        return response.replies
    }

    
</script>

<svelte:head>
    <title>Profile | Inbox</title>
</svelte:head>

<SubNavbar home back quickSettings refreshButton scrollButtons toggleCommunitySidebar  />

<MainContentArea>
        
    <ProfileMenuBar />

    
    <div bind:this={inbox} class="flex flex-col lg:flex-row gap-2 lg:gap-4 h-full w-full">
        
        <!---Sticky Inbox Menu--->
        <Card class="flex flex-row lg:flex-col h-fit p-1 lg:p-0 gap-2 {showSidebar ? 'w-fit mx-auto lg:w-[200px]' : 'w-fit mx-auto lg:w-[50px]'} lg:sticky lg:top-[12rem]">
            
            <!---Inbox Heading--->
            <span class="hidden lg:flex w-full flex-col gap-1">
                {#if showSidebar}
                <span class="flex flex-row items-center p-2 gap-2">
                    <Icon src={Inbox} width={18} mini />
                    <span class="text-base font-bold">Inbox</span>
                </span>

                <hr class="w-full {hrColors}" />
                {/if}
            </span>

            <!---Unread Only--->
            <SidebarButton title="Unread" expanded={showSidebar} class="{showSidebar ? '' : 'mx-auto'} {data.type == 'unread' ? '!text-sky-700 dark:!text-sky-500' : ''}" 
                on:click={() => {
                    $page.url.searchParams.set('type', 'all')
                    $page.url.searchParams.set('unreadOnly', 'true')
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

            <!---Notification Type Selectors--->
            <SidebarButton title="All" expanded={showSidebar} class="{showSidebar ? '' : 'mx-auto'} {data.type == 'all' ? '!text-sky-700 dark:!text-sky-500' : ''}" 
                on:click={() => {
                    $page.url.searchParams.set('type', 'all')
                    $page.url.searchParams.set('unreadOnly', 'false')
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={Inbox} width={18} mini/>
                
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    All
                </span>
            </SidebarButton>
    
            <!---Comment Replies--->
            <SidebarButton title="Replies" expanded={showSidebar} class="{showSidebar ? '' : 'mx-auto'} {data.type == 'replies' ? '!text-sky-700 dark:!text-sky-500' : ''}"
                on:click={() => {
                    $page.url.searchParams.set('type', 'replies')
                    $page.url.searchParams.set('unreadOnly', 'false')
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={ChatBubbleLeft} width={18} mini/>
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    Replies
                </span>
                
            </SidebarButton>
    
    
            <!---Mentions--->
            <SidebarButton title="Mentions" expanded={showSidebar} class="{showSidebar ? '' : 'mx-auto'} {data.type == 'mentions' ? '!text-sky-700 dark:!text-sky-500' : ''}"
                on:click={() => { 
                    $page.url.searchParams.set('type', 'mentions')
                    $page.url.searchParams.set('unreadOnly', 'false')
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={AtSymbol} width={18} mini/>
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    Mentions
                </span>
            </SidebarButton>
    
            <!---Direct Messages--->
            <SidebarButton title="Direct Messages" expanded={showSidebar} class="{showSidebar ? '' : 'mx-auto'} {data.type == 'messages' ? '!text-sky-700 dark:!text-sky-500' : ''}"
                on:click={() => {
                    $page.url.searchParams.set('type', 'messages')
                    $page.url.searchParams.set('unreadOnly', 'false')
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={ChatBubbleLeftRight} width={18} mini/>
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    Direct Messages
                </span>
            </SidebarButton>

            <!---Mark All As Read--->
            <SidebarButton title="Mark All as Read" class="{showSidebar ? '' : 'mx-auto'} " on:click={markAllAsRead} loading={markingAsRead} disabled={markingAsRead}>
                    <Icon src={Check} width={18} mini class={markingAsRead ? 'hidden' : ''}/>
                    <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                        Mark All as Read
                    </span>
            </SidebarButton>

            <!---Collapse/Expand All--->
            <SidebarButton class="{showSidebar ? '' : 'mx-auto'}"
                title="{$userSettings.notifications.expandInboxItemsByDefault ? 'Collapse' : 'Expand'} All"
                on:click={() => { $userSettings.notifications.expandInboxItemsByDefault = !$userSettings.notifications.expandInboxItemsByDefault}}
            >
                <Icon src={$userSettings.notifications.expandInboxItemsByDefault ? BarsArrowUp : BarsArrowDown} width={18} mini/>
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    {$userSettings.notifications.expandInboxItemsByDefault ? 'Collapse' : 'Expand'} All
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
                <SidebarButton title="{showSidebar ? 'Collapse' : 'Expand'}" class="{showSidebar ? '' : 'mx-auto'} " on:click={() => showSidebar = !showSidebar} expanded={showSidebar}>
                    <Icon src={showSidebar ? ChevronDoubleLeft : ChevronDoubleRight} width={18} mini/>
                    {#if showSidebar}Collapse{/if}
                </SidebarButton>
            </span>
        </Card>

        <div class="flex flex-col gap-2 h-full w-full {showSidebar ? 'w-full lg:w-[calc(100%-200px-1rem)]' : 'w-full lg:w-[calc(100%-55px-1rem)]'}">
            {#if !data.data || (data.data?.length ?? 0) == 0}
                <div class="my-auto">
                    <Placeholder icon={Inbox} title="No new notifications" description="Messages, replies, and mentions will appear here." />
                </div>
            {:else}
                {#each data.data as item}
                    <InboxItem bind:item  bind:type={data.type} on:markAsRead={(e) => {
                        if (e.detail) data.unreadCount--
                        else data.unreadCount++
                    }}/>
                {/each}
        
                {#if data.data.length > 0 || (data.data.length < 1 && data.page > 1)}
                    <Pageination page={data.page} on:change={(p) => {
                        searchParam($page.url, 'page', p.detail.toString())
                        inbox.scrollTo(0,0)
                    }} />
                {/if}
                
            {/if}
        </div>

    </div>

    <div class="h-full" slot="right-panel">
        {#if $profile?.user}
            <UserCard  moderates={$profile.user.moderates} person={
                    {
                        person: $profile.user.local_user_view.person,
                        is_admin: $profile.user.local_user_view.local_user.admin,
                        counts: $profile.user.local_user_view.counts
                    }
                }
            />
        {/if}
    </div>
    
    
</MainContentArea>
