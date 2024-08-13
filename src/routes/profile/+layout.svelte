<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores'

    import Button from '$lib/components/input/Button.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SelectMenu from '$lib/components/input/SelectMenu.svelte';
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'
    
    import {
        Icon,
        ArrowUturnLeft,
        AtSymbol,
        Bookmark,
        ChatBubbleLeftRight,
        Cog6Tooth,
        Envelope,
        EnvelopeOpen,
        Inbox,
        InboxStack,
        NoSymbol,
        UserCircle,
    } from 'svelte-hero-icons'
    
    
    
    export let data;
</script>

<svelte:head>
    <title>Profile</title>
</svelte:head>

<!---Use Different navigation bars depending on which profile page is active--->

<!--- /profile/user--->
{#if $page.url.pathname.startsWith('/profile/user') || $page.url.pathname.startsWith('/u/')}
<SubNavbar back quickSettings
    toggleMargins refreshButton toggleCommunitySidebar scrollButtons compactSwitch
    listingType={true} listingTypeOptions={['all', 'posts', 'comments']} listingTypeOptionNames={['All', 'Posts', 'Comments']} bind:selectedListingType={data.type}
    sortMenu sortOptions={['New', 'TopAll', 'Old']} sortOptionNames={['New', 'Top', 'Old']} bind:selectedSortOption={data.sort}
>
    <SiteSearch placeholder="Search {data.person_view.person.name}" person_id={data.person_view.person.id} slot="center"/>
</SubNavbar>
{/if}

<!---Inbox --->
{#if $page.url.pathname.startsWith('/profile/inbox')}
    <SubNavbar  back toggleMargins refreshButton toggleCommunitySidebar>
        <div class="flex flex-row gap-1 md:gap-2 items-center" let:iconSize slot="far-left">
            <SelectMenu
                title="Read/Unread"
                options={[false, true]}
                optionNames={['All', 'Unread']}
                selected={
                        !$page.url.searchParams.get('unreadOnly')
                            ? true
                            : ($page.url.searchParams.get('unreadOnly') && $page.url.searchParams.get('unreadOnly') == 'false')
                                ? false
                                : true
                }
                icon={
                    !$page.url.searchParams.get('unreadOnly')
                        ? Envelope
                        : ($page.url.searchParams.get('unreadOnly') && $page.url.searchParams.get('unreadOnly') == 'false')
                            ? EnvelopeOpen
                            : Envelope
                }
                iconSize={18}
                on:select={(e) => {
                    $page.url.searchParams.delete('page')
                    $page.url.searchParams.set('unreadOnly', (e.detail ?? false).toString())
                    goto($page.url.toString(), {
                        invalidateAll: true,
                    })
                }}
            />

            <!---Inbox Message Type (all/replies/mentions/messages) --->
            <SelectMenu
                title="Message Type"    
                selected={$page.url.searchParams.get('type') ?? 'all' }
                options={['all', 'mentions', 'replies', 'messages']}
                optionNames={['All', 'Mentions', 'Replies', 'Messages']}
                iconSize={18}
                icon={
                    (!$page.url.searchParams.get('type') || $page.url.searchParams.get('type') == 'all')
                        ? InboxStack
                        : $page.url.searchParams.get('type') == 'mentions'
                            ? AtSymbol
                            : $page.url.searchParams.get('type') == 'replies'
                                ? ArrowUturnLeft
                                : $page.url.searchParams.get('type') == 'messages'
                                    ? ChatBubbleLeftRight
                                    : InboxStack
                }
                on:select={(e) => {
                    $page.url.searchParams.delete('page')
                    $page.url.searchParams.set('type', e.detail ?? 'all')
                    goto($page.url.toString(), {
                        invalidateAll: true,
                    })
                }}
            />
        </div>
    </SubNavbar>
{/if}

<!--- Settings and Blocks--->
{#if $page.url.pathname.startsWith('/profile/settings') || $page.url.pathname.startsWith('/profile/blocks')}
    <SubNavbar back quickSettings toggleCommunitySidebar scrollButtons />
{/if}

<!---Saved--->
{#if $page.url.pathname.startsWith('/profile/saved')}
    <SubNavbar back quickSettings compactSwitch
        toggleMargins refreshButton toggleCommunitySidebar scrollButtons
        listingType={true} listingTypeOptions={['all', 'posts', 'comments']} listingTypeOptionNames={['All', 'Posts', 'Comments']} bind:selectedListingType={data.type}
        sortMenu sortOptions={['New', 'Old']} sortOptionNames={['New', 'Old']} bind:selectedSortOption={data.sort}
    />
{/if}

<MainContentArea>
        
    <!---Profile Sub-Page Buttons--->
    <div class="sticky top-[6.9rem] flex flex-row gap-1 -ml-2 px-2 py-1 w-[calc(100%+1rem)] bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-20">
        <Button color="tertiary" alignment="left" title="Profile" class="hover:bg-slate-200" href="/profile/user">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/user') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={UserCircle} mini size="18" title="Profile" />
                <span class="text-xs">Profile</span>
            </span>            
        </Button>

        <Button color="tertiary" alignment="left" title="Inbox" class="hover:bg-slate-200" href="/profile/inbox">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/inbox') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={Inbox} mini size="18" title="Inbox" />
                <span class="text-xs">Inbox</span>
            </span>            
        </Button>

        <Button color="tertiary" alignment="left" title="Settings" class="hover:bg-slate-200" href="/profile/settings">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/settings') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={Cog6Tooth} mini size="18" title="Settings" />
                <span class="text-xs">Settings</span>
            </span>            
        </Button>

        <Button color="tertiary" alignment="left" title="Blocks" class="hover:bg-slate-200" href="/profile/blocks">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/blocks') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={NoSymbol} mini size="18" title="Blocks" />
                <span class="text-xs">Blocks</span>
            </span>            
        </Button>

        <Button color="tertiary" alignment="left" title="Saved" class="hover:bg-slate-200" href="/profile/saved">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/saved') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={Bookmark} mini size="18" title="Saved" />
                <span class="text-xs">Saved</span>
            </span>            
        </Button>
    </div>
        
    <!---Content Area for Child Pages--->
    <slot />
        

    <!---User Sidebar--->
    <UserCard person={data.person_view} moderates={data.moderates} slot="right-panel"/>

</MainContentArea>
