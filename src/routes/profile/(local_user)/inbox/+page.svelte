<script lang="ts">
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { hrColors } from '$lib/ui/colors'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    
    import Card from '$lib/components/ui/Card.svelte'
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
        ChatBubbleLeft,
        ChatBubbleLeftRight,
        Check,
        ChevronDoubleLeft,
        ChevronDoubleRight,
        Envelope,
        Icon,
        Inbox,
        Window as WindowIcon,
    } from 'svelte-hero-icons'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte';
    
    export let data

    let markingAsRead = false
    let type: 'mention' | 'comment_reply' | 'post_reply' | 'private_message' | 'unread' | 'all' = 'unread'
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

<SubNavbar home back quickSettings refreshButton scrollButtons toggleCommunitySidebar
    scrollPreventDefault
    on:navScrollBottom={() => inbox.scrollTo(0, inbox.scrollHeight)}
    on:navScrollTop={() => inbox.scrollTo(0,0)}
/>

<MainContentArea>
        
    <ProfileMenuBar />

    
    <div bind:this={inbox} class="flex flex-col lg:flex-row gap-2 lg:gap-4 w-full overflow-y-scroll h-[calc(-11.6rem+100vh)]">
        
        <!---Sticky Inbox Menu--->
        <Card class="flex flex-row lg:flex-col h-fit p-1 lg:p-0 gap-2 {showSidebar ? 'w-fit mx-auto lg:w-[200px]' : 'w-fit mx-auto lg:w-[35px]'} lg:sticky lg:top-[1rem]">
            
            <!---Inbox Heading--->
            <span class="hidden lg:flex w-full flex-col gap-1">
                {#if showSidebar}
                <span class="flex flex-row items-center p-2 gap-2">
                    <Icon src={Inbox} width={18} mini />
                    <span class="text-base font-bold">Inbox</span>
                </span>

                <hr class="w-[90%] {hrColors}" />
                {/if}
            </span>

            <!---Unread Only--->
            <SidebarButton title="Unread" expanded={showSidebar} class="{type == 'unread' ? '!text-sky-700 dark:!text-sky-500' : ''}" 
                on:click={() => {
                    type = 'unread'
                    searchParam($page.url, 'page', '1')
                }} 
            >
                <Icon src={Envelope} width={18} mini/>
                
                <span class="hidden {showSidebar ? 'lg:flex' : ''} w-full">
                    Unread
                    <span class="ml-auto">
                        <FormattedNumber number={$profile?.user?.unreads ?? 0} />
                    </span>
                </span>
            </SidebarButton>

            <!---Notification Type Selectors--->
            <SidebarButton title="All" expanded={showSidebar} class="{type == 'all' ? '!text-sky-700 dark:!text-sky-500' : ''}" 
                on:click={() => {
                    type = 'all'
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={Inbox} width={18} mini/>
                
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    All
                </span>
            </SidebarButton>
    
            <!---Comment Replies--->
            <SidebarButton title="Comment Replies" expanded={showSidebar} class="{type == 'comment_reply' ? '!text-sky-700 dark:!text-sky-500' : ''}"
                on:click={() => {
                    type = 'comment_reply'
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={ChatBubbleLeft} width={18} mini/>
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    Comment Replies
                </span>
                
            </SidebarButton>
    
            <!---Post Replies--->
            <SidebarButton title="Post Replies" expanded={showSidebar} class="{type == 'post_reply' ? '!text-sky-700 dark:!text-sky-500' : ''}"
                on:click={() => {
                    type = 'post_reply'
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={WindowIcon} width={18} mini/>
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    Post Replies
                </span>
            </SidebarButton>
    
            <!---Mentions--->
            <SidebarButton title="Mentions" expanded={showSidebar} class="{type == 'mention' ? '!text-sky-700 dark:!text-sky-500' : ''}"
                on:click={() => { 
                    type = 'mention'
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={AtSymbol} width={18} mini/>
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    Mentions
                </span>
            </SidebarButton>
    
            <!---Direct Messages--->
            <SidebarButton title="Direct Messages" expanded={showSidebar} class="{type == 'private_message' ? '!text-sky-700 dark:!text-sky-500' : ''}"
                on:click={() => {
                    type = 'private_message'
                    searchParam($page.url, 'page', '1')
                }}
            >
                <Icon src={ChatBubbleLeftRight} width={18} mini/>
                <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                    Direct Messages
                </span>
            </SidebarButton>

            <!---Mark All As Read--->
            <SidebarButton title="Mark All as Read" on:click={markAllAsRead} loading={markingAsRead} disabled={markingAsRead}>
                    <Icon src={Check} width={18} mini class={markingAsRead ? 'hidden' : ''}/>
                    <span class="hidden {showSidebar ? 'lg:flex' : ''}">
                        Mark All as Read
                    </span>
            </SidebarButton>
            
            <!---Collapse Sidebar--->
            <span class="hidden lg:flex w-full flex-col">
                <hr class="w-[90%] {hrColors}" />
                <SidebarButton title="{showSidebar ? 'Collapse' : 'Expand'}" on:click={() => showSidebar = !showSidebar} expanded={showSidebar}>
                    <Icon src={showSidebar ? ChevronDoubleLeft : ChevronDoubleRight} width={18} mini/>
                    {#if showSidebar}Collapse{/if}
                </SidebarButton>
            </span>
        </Card>

        <div class="flex flex-col gap-2 h-full w-full {showSidebar ? 'w-full lg:w-[calc(100%-200px)]' : 'w-full lg:w-[calc(100%-35px)]'}">
            {#if !data.data || (data.data?.length ?? 0) == 0}
                <div class="my-auto">
                    <Placeholder icon={Inbox} title="No new notifications" description="Messages, replies, and mentions will appear here." />
                </div>
            {:else}
                {#each data.data as item}
                    <InboxItem bind:item  bind:type/>
                {/each}
        
                <Pageination page={data.page} on:change={(p) => searchParam($page.url, 'page', p.detail.toString())} />
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
