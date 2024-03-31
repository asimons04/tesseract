<script lang="ts">
    import { LINKED_INSTANCE_URL } from "$lib/instance.js"

    import { expoOut } from 'svelte/easing'
    import { flip } from 'svelte/animate'
    import { profile, profileData } from '$lib/auth.js'
    import { getGroupIndex, sortGroups } from '$lib/favorites'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
    import Switch from '$lib/components/input/Switch.svelte'
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
    
    let panel: 'groups' | 'subscribed' | 'favorites' = 'subscribed';
    
    // Support components for the community filters
    let communityFilterTerm:string = ''
    let communityFiltervalue:string = ''
    let showEmptyGroups:boolean = false
    let onlyShowModerating:boolean = false

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
            ? `max-w-[25%] lg:max-w-[20%] xl:max-w-[18%] min-w-[20rem]`
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
    <SidebarButton href="/" expanded={$userSettings.uiState.expandSidebar} title="Home" data-sveltekit-preload-data="hover">
        <Icon src={Home} mini size="18" title="Home" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Home</span>
    </SidebarButton>

    <!---Popular --->
    <SidebarButton href="/?sort=Active" expanded={$userSettings.uiState.expandSidebar} title="Popular" data-sveltekit-preload-data="hover">
        <Icon src={ArrowTrendingUp} mini size="18" title="Popular" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Popular</span>
    </SidebarButton>
    
    <!---Communities--->
    <SidebarButton href="/communities" expanded={$userSettings.uiState.expandSidebar} title="Communities" data-sveltekit-preload-data="hover">
        <Icon src={GlobeAlt} mini size="18" title="Communities" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Communities</span>
    </SidebarButton>

    <!---Feed Groups--->
    <SidebarButton href="/feeds/favorites" expanded={$userSettings.uiState.expandSidebar} title="Favorites" data-sveltekit-preload-data="hover">
        <Icon src={Star} mini size="18" title="Feeds" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Favorites</span>
    </SidebarButton>


    {#if $profile?.user}
        <!--- Favorites, Subscribed, and Moderating Communities--->
        <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
        
        <!---Switcher Buttons--->
        <div class="flex {$userSettings.uiState.expandSidebar ? 'flex-row' : 'flex-col'} gap-1">
            <div class="ml-auto"/>

            <SidebarButton title="Subscribed" expanded={$userSettings.uiState.expandSidebar} on:click={()=> panel='subscribed'}>
                <span class="flex flex-col items-center {panel=='subscribed' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                    <Icon src={InboxArrowDown} mini size="18" title="Subscribed" />
                    <span class="hidden {$userSettings.uiState.expandSidebar ? 'sm:block' : ''} text-xs">Subscribed</span>
                </span>
            </SidebarButton>


            {#if $userSettings.uiState.expandSidebar}
                <SidebarButton title="Groups" expanded={$userSettings.uiState.expandSidebar} on:click={()=> panel='groups'}>
                    <span class="flex flex-col items-center {panel=='groups' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={UserGroup} mini size="18" title="Groups" />
                        <span class="hidden {$userSettings.uiState.expandSidebar ? 'sm:block' : ''} text-xs">Groups</span>
                    </span>
                </SidebarButton>
            {/if}

            
            <SidebarButton title="Favorites" expanded={$userSettings.uiState.expandSidebar} on:click={()=> panel='favorites'}>
                <span class="flex flex-col items-center {panel=='favorites' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                    <Icon src={Star} mini size="18" title="Favorites" />
                    <span class="hidden {$userSettings.uiState.expandSidebar ? 'sm:block' : ''} text-xs ">Favorites</span>
                </span>
            </SidebarButton>

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
                <button class="my-auto cursor-pointer" title="Reset Search Filter" on:click={async () => {
                        debounce('');
                        communityFiltervalue = '';
                    }}
                >
                    <Icon src={XCircle} mini size="22"/>
                </button>
            </div>
        {/if}
        
        <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
        
        <div class="flex flex-col gap-1 h-full overflow-y-auto">
            
            <!--- Subscribed/Moderating Community list --->
            {#if panel=='subscribed'}
                <div class="flex flex-col gap-1 h-full overflow-y-auto">
                    {#if $profile.user.follows.length > 0}
                        
                        <CommunityList
                            expanded={$userSettings.uiState.expandSidebar}
                            items={
                                onlyShowModerating 
                                ? $profile.user.moderates.map((i) => i.community)
                                : $profile.user.follows.map((i) => i.community)
                            }
                            filter={communityFilterTerm}
                        />
                    {:else}
                        {#if $userSettings.uiState.expandSidebar}
                            <Placeholder size="22" icon={ArchiveBox} title="No Subscriptions" description="You're not subscribed to any communities. When you are, they will be listed here." />
                        {/if}
                    {/if}
                </div>

                <div class="mt-auto"/>
                
                
                <hr class="border-slate-300/60"/>

                {#if $profile.user.moderates?.length > 0 && $userSettings.uiState.expandSidebar}
                    <div class="flex flex-col gap-2 mb-1">
                        <div class="pl-2 text-sm flex flex-row items-center">
                            <span class="flex flex-col text-xs">
                                <span class="font-bold">Moderating</span>
                                <span class="font-normal">Show only communities I moderate</span>
                            </span>
                            <span class="ml-auto"/>
                            <Switch bind:enabled={onlyShowModerating}/>
                        </div>
                    </div>
                {/if}
            {/if}

            <!--- Groups--->
            {#if panel=='groups' && $userSettings.uiState.expandSidebar}
                <div class="flex flex-col gap-1 h-full overflow-y-auto">
                    
                    {#if $profile?.groups && $profile?.groups?.length > 1}
                        {#each $profile.groups.sort(sortGroups) as group}
                            <CommunityGroup group={group} bind:showEmptyGroups/>
                        {/each}
                    {:else}
                        <Placeholder size="22" icon={UserGroup} title="No Groups" description="Your favoritie and grouped communities will appear here." />
                    {/if}
                </div>

                <div class="mt-auto"/>
                
                
                <hr class="border-slate-300/60"/>
                
                <div class="flex flex-col gap-2 mb-1">
                    <div class="pl-2 text-sm flex flex-row items-center">
                        <span class="flex flex-col text-xs">
                            <span class="font-bold">Show Empty Groups</span>
                            <span class="font-normal">Empty groups are hidden by default.</span>
                        </span>
                        <span class="ml-auto"/>
                        <Switch bind:enabled={showEmptyGroups}/>
                    </div>
                </div>
            {/if}

            <!---Favorites--->
            {#if panel == 'favorites'}
                <div class="flex flex-col gap-1 h-full overflow-y-auto">
                    {#if $profile?.groups && $profile?.groups[getGroupIndex('Favorites')]?.communities?.length > 0}
                        <CommunityList 
                            expanded={$userSettings.uiState.expandSidebar} 
                            items={$profile?.groups[getGroupIndex('Favorites')]?.communities}
                        />
                    {:else if $userSettings.uiState.expandSidebar}
                        <Placeholder size="22" icon={Star} title="No Favorites" description="You haven't favorited any communities yet. When you do, they will appear here" />
                    {/if}
                </div>
            {/if}

        </div>

    <!--- Sidebar options for non-authenticated users--->
    {:else}
        <SidebarButton href="/login" expanded={$userSettings.uiState.expandSidebar} title="Home" data-sveltekit-preload-data="hover">
            <Icon src={ArrowLeftOnRectangle} mini size="18" title="Login" />
            <span class:hidden={!$userSettings.uiState.expandSidebar}>Login</span>
        </SidebarButton>

        <SidebarButton href="/signup" expanded={$userSettings.uiState.expandSidebar} title="Home" data-sveltekit-preload-data="hover">
            <Icon src={Identification} mini size="18" title="Sign Up" />
            <span class:hidden={!$userSettings.uiState.expandSidebar}>Sign Up</span>
        </SidebarButton>
        
        {#if !LINKED_INSTANCE_URL}
            <SidebarButton href="/accounts" expanded={$userSettings.uiState.expandSidebar} title="Home" data-sveltekit-preload-data="hover">
                <Icon src={BuildingOffice} mini size="18" title="Change Guest Instance" />
                <span class:hidden={!$userSettings.uiState.expandSidebar}>Change Guest Instance</span>
            </SidebarButton>
        {/if}
    {/if}
    
</nav>
