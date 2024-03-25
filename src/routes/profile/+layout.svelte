<script>
    import { page } from '$app/stores'
    import { userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'
    
    import {
        Icon,
        Cog6Tooth,
        UserCircle,
        Inbox,
        NoSymbol,
        Bookmark
    } from 'svelte-hero-icons'
    


    export let data;
</script>

<svelte:head>
    <title>Profile</title>
</svelte:head>

<div class="flex flex-col gap-4 h-full">
   
    <div class="flex flex-row gap-1 p-2">
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
    
    <!--<slot />-->
    <!---Use Different navigation bars depending on which profile page is active--->
    
    <!--- /profile/user--->
    {#if $page.url.pathname.startsWith('/profile/user') || $page.url.pathname.startsWith('/u/')}
    <SubNavbar 
        home back compactSwitch toggleMargins refreshButton toggleCommunitySidebar scrollButtons
        listingType={true} listingTypeOptions={['posts', 'comments']} listingTypeOptionNames={['Posts', 'Comments']} bind:selectedListingType={data.type}
        sortMenu sortOptions={['New', 'TopAll', 'Old']} sortOptionNames={['New', 'Top', 'Old']} bind:selectedSortOption={data.sort}
    />
    {/if}
    
    {#if $page.url.pathname.startsWith('/profile/inbox') || $page.url.pathname.startsWith('/profile/settings') || $page.url.pathname.startsWith('/profile/blocks')}
    <SubNavbar 
        home back compactSwitch toggleMargins refreshButton toggleCommunitySidebar scrollButtons
    />
    {/if}

    {#if $page.url.pathname.startsWith('/profile/saved')}
    <SubNavbar 
        home back compactSwitch toggleMargins refreshButton toggleCommunitySidebar scrollButtons
        listingType={true} listingTypeOptions={['posts', 'comments']} listingTypeOptionNames={['Saved Posts', 'Saved Comments']} bind:selectedListingType={data.type}
        sortMenu sortOptions={['New', 'Hot', 'Top', 'Old']} sortOptionNames={['New', 'Hot', 'Top', 'Old']} bind:selectedSortOption={data.sort}
    />
    {/if}



    <div class="flex flex-col-reverse xl:flex-row gap-4 max-w-full w-full">
        <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
            <slot />
        </div>

        {#if $userSettings.uiState.expandCommunitySidebar}
        <div>
            <UserCard person={data.user.person_view} moderates={data.user.moderates}/>
        </div>
        {/if}
    </div>
    

    
</div>
