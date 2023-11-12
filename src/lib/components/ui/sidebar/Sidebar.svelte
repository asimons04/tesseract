<script lang="ts">
    import { LINKED_INSTANCE_URL } from "$lib/instance.js"

    import { expoOut } from 'svelte/easing'
    import { flip } from 'svelte/animate'
    import { profile, profileData } from '$lib/auth.js'
    import { sortGroups } from '$lib/favorites'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '../../input/Button.svelte'
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import {
        AdjustmentsHorizontal,
        ArchiveBox,
        ArrowLeftOnRectangle,
        ArrowTrendingUp,
        Bars3,
        BuildingOffice,
        ChevronDoubleLeft,
        ChevronDoubleDown,
        Cog6Tooth,
        GlobeAlt,
        HandRaised,
        Home,
        Icon,
        InboxArrowDown,
        InformationCircle,
        Identification,
        MagnifyingGlass,
        Minus,
        Plus,
        QueueList,
        Star,
        UserGroup,
        XCircle
    } from 'svelte-hero-icons'
    import CommunityGroup from "./CommunityGroup.svelte";
    
    let panel: 'groups' | 'subscribed' | 'moderating' = 'subscribed';
    
    // Support components for the community filter
    let communityFilterTerm:string = '';
    let communityFiltervalue:string = '';
    
    let debounceTimer: ReturnType<typeof setTimeout>;
    function debounce(value:string,  timeout=300) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(
            () => {
                communityFilterTerm = value.toLowerCase();
                clearTimeout(debounceTimer);
            }, timeout
        )
        
    }

    
</script>

<nav
    class="hidden sm:flex flex-col pl-4 pr-4 pt-[1.2rem] overflow-auto sticky top-16 bottom-0
        gap-1 max-h-[calc(100svh-4rem)] w-full bg-slate-100 dark:bg-black z-50
        {$userSettings.uiState.expandSidebar
            ? `max-w-[25%] lg:max-w-[20%] xl:max-w-[18%] resize-x min-w-[20rem]`
            : "w-max max-w-max min-w-max"
        }
    "
>

    <Button
        alignment="left"
        on:click={() =>
            ($userSettings.uiState.expandSidebar = !$userSettings.uiState.expandSidebar)
        }
        class="w-max !p-2 hover:bg-slate-200"
        aria-label="{$userSettings.uiState.expandSidebar ? 'Collapse': 'Expand'} Sidebar"
        title="{$userSettings.uiState.expandSidebar ? 'Collapse': 'Expand'} Sidebar"
    >
        <Icon
            src={ChevronDoubleLeft}
            mini
            size="16"
            class="transition-transform {$userSettings.uiState.expandSidebar ? '' : 'rotate-180'}"
        />
    </Button>
    

    <!---Frontpage--->
    <SidebarButton href="/" expanded={$userSettings.uiState.expandSidebar} title="Home">
        <Icon src={Home} mini size="18" title="Home" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Home</span>
    </SidebarButton>

    <!---Popular --->
    <SidebarButton href="/?sort=Active" expanded={$userSettings.uiState.expandSidebar} title="Popular">
        <Icon src={ArrowTrendingUp} mini size="18" title="Popular" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Popular</span>
    </SidebarButton>
    
    <!---Communities--->
    <SidebarButton href="/communities" expanded={$userSettings.uiState.expandSidebar} title="Communities">
        <Icon src={GlobeAlt} mini size="18" title="Communities" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Communities</span>
    </SidebarButton>

    <!---Feed Groups--->
    <SidebarButton href="/feeds/favorites" expanded={$userSettings.uiState.expandSidebar} title="Feeds">
        <Icon src={QueueList} mini size="18" title="Feeds" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Feeds</span>
    </SidebarButton>


    {#if $profile?.user}
        <!--- Favorites, Subscribed, and Moderating Communities--->
        <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
        
        <!---Switcher Buttons--->
        <div class="flex {$userSettings.uiState.expandSidebar ? 'flex-row' : 'flex-col'} gap-1">
            <div class="ml-auto"/>

            <Button title="Subscribed" size="md" class="!border-none" color="ghost" on:click={()=> panel='subscribed'}>
                <span class="flex flex-col items-center {panel=='subscribed' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                    <Icon src={InboxArrowDown} mini size="18" title="Subscribed" />
                    <span class="hidden {$userSettings.uiState.expandSidebar ? 'sm:block' : ''} text-xs">Subscribed</span>
                </span>
            </Button>

            {#if $userSettings.uiState.expandSidebar}
                <Button title="Groups" size="md" class="!border-none" color="ghost" on:click={()=> panel='groups'}>
                    <span class="flex flex-col items-center {panel=='groups' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={Star} mini size="18" title="Groups" />
                        <span class="hidden {$userSettings.uiState.expandSidebar ? 'sm:block' : ''} text-xs">Groups</span>
                    </span>
                </Button>
            {/if}

            {#if $profile?.user.moderates.length > 0}
                <Button title="Moderating" size="md" class="!border-none" color="ghost" on:click={()=> panel='moderating'}>
                    <span class="flex flex-col items-center {panel=='moderating' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={HandRaised} mini size="18" title="Moderating" />
                        <span class="hidden {$userSettings.uiState.expandSidebar ? 'sm:block' : ''} text-xs ">Moderating</span>
                    </span>
                </Button>
            {/if}

            <div class="mr-auto"/>
        </div>

        <!--- Search field to filter the subscribed communities--->
        {#if $userSettings.uiState.expandSidebar}
            <div class="p-2 flex flex-row gap-1">
                <TextInput 
                    bind:value={communityFiltervalue}
                    type="text"
                    placeholder="Jump to a Community"
                    on:keyup={(e) => { 
                        debounce(e.detail.srcElement.value);
                        panel = 'subscribed'
                    }}
                    class="h-8 w-full"
                />
                <span class="my-auto cursor-pointer" title="Reset Search Filter" on:click={async () => {
                        debounce('');
                        communityFiltervalue = '';
                    }}
                >
                    <Icon src={XCircle} mini size="22"/>
                </span>
            </div>
        {/if}
        
        <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
        
        <div class="flex flex-col gap-1 h-full overflow-y-auto">
            
            
            <!--- Favorites--->
            {#if panel=='groups'}

                {#if $profile?.groups}
                    {#each $profile.groups.sort(sortGroups) as group}
                        <CommunityGroup expanded={$userSettings.uiState.expandSidebar} group={group} />
                    {/each}
                
                {:else}
                    {#if $userSettings.uiState.expandSidebar}
                        <Placeholder size="22" icon={ArchiveBox} title="No Groups" description="Your favoritie and grouped communities will appear here." />
                    {/if}
                {/if}
            {/if}
            
            
            
            <!--- Subscribed community list --->
            {#if panel=='subscribed'}
                {#if $profile.user.follows.length > 0}
                    
                    <CommunityList
                        expanded={$userSettings.uiState.expandSidebar}
                        items={$profile.user.follows.map((i) => i.community)}
                        filter={communityFilterTerm}
                    />
                {:else}
                    {#if $userSettings.uiState.expandSidebar}
                        <Placeholder size="22" icon={ArchiveBox} title="No Subscriptions" description="You're not subscribed to any communities. When you are, they will be listed here." />
                    {/if}
                {/if}
            {/if}
        
            <!--- Communities User is Moderating --->
             {#if panel=='moderating' && $profile?.user.moderates.length > 0}
                <CommunityList
                    expanded={$userSettings.uiState.expandSidebar}
                    items={$profile.user.moderates.map((i) => i.community)}
                />
            {/if}
        </div>
    {:else}
        <Button
            class="hover:bg-slate-200 {$userSettings.uiState.expandSidebar ? '' : '!p-1.5'}"
            href="/login"
            color="tertiary"
            alignment="left"
        >
            <Icon mini src={ArrowLeftOnRectangle} size="18" />
            <span class:hidden={!$userSettings.uiState.expandSidebar}>Log in</span>
        </Button>

        <Button
            class="hover:bg-slate-200 {$userSettings.uiState.expandSidebar ? '' : '!p-1.5'}"
            href="/signup"
            color="tertiary"
            alignment="left"
        >
            <Icon mini src={Identification} size="18" title="Sign Up"/>
            <span class:hidden={!$userSettings.uiState.expandSidebar}>Sign Up</span>
        </Button>
        
        {#if !LINKED_INSTANCE_URL}
            <Button
                class="hover:bg-slate-200 {$userSettings.uiState.expandSidebar ? '' : '!p-1.5'}"
                href="/accounts"
                color="tertiary"
                alignment="left"
            >
                <Icon mini src={BuildingOffice} size="18" />
                <span class:hidden={!$userSettings.uiState.expandSidebar}>Change Guest Instance</span>
            </Button>
        {/if}
    {/if}
    
</nav>
