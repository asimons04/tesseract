<script lang="ts">
    import { LINKED_INSTANCE_URL } from "$lib/instance.js"

    import { dispatchWindowEvent } from "$lib/ui/events"
    import { profile } from '$lib/auth.js'
    import { getGroupIndex, sortGroups } from '$lib/favorites'
    import { languageText } from '$lib/language'
    import { page } from "$app/stores"
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import CommunityGroup from "./CommunityGroup.svelte";
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
    import Switch from '$lib/components/input/Switch.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import {
        ArchiveBox,
        ArrowLeftOnRectangle,
        ArrowTrendingUp,
        BuildingOffice,
        CalendarDays,
        Fire,
        GlobeAlt,
        Home,
        Icon,
        InboxArrowDown,
        Identification,
        Star,
        UserGroup,
        XCircle,
        ArrowPath,
        Folder,
        Cog6Tooth,
    } from 'svelte-hero-icons'
    import { goto } from "$app/navigation";

    
    
    let panel: 'groups' | 'subscribed' | 'favorites' = 'subscribed';
    
    // Support components for the community filters
    let communityFilterTerm:string = ''
    let communityFiltervalue:string = ''
    let showEmptyGroups:boolean = false
    let onlyShowModerating:boolean = false
    let communityScrollArea: HTMLDivElement
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
    class="hidden sm:flex flex-col px-2 overflow-auto sticky top-16 bottom-0
        gap-1 max-h-[calc(100svh-4rem)] w-full bg-slate-100 dark:bg-black z-50
        {$userSettings.uiState.expandSidebar
            ? `max-w-[25%] lg:max-w-[20%] xl:max-w-[18%] min-w-[20rem]`
            : "w-max max-w-max min-w-max"
        }
        -mb-4
    "
>
    <!--- Feed Sort Convenience Buttons--->
    <span class="flex  {$userSettings.uiState.expandSidebar ? 'flex-row justify-between' : 'flex-col gap-1'}">
        
        <!---Popular --->
        <SidebarButton href="/home/{$userSettings.defaultSort.feed.toLowerCase() ?? 'all'}/active" expanded={$userSettings.uiState.expandSidebar} title="{languageText('POPULAR','Popular')}" data-sveltekit-preload-data="off">
            <Icon src={ArrowTrendingUp} mini size="18" title="{languageText('POPULAR','Popular')}" />
            <span class:hidden={!$userSettings.uiState.expandSidebar}>{languageText('POPULAR','Popular')}</span>
        </SidebarButton>

        <!---Hot --->
        <SidebarButton href="/home/{$userSettings.defaultSort.feed.toLowerCase() ?? 'all'}/hot" expanded={$userSettings.uiState.expandSidebar} title="{languageText('HOT','Hot')}" data-sveltekit-preload-data="off">
            <Icon src={Fire} mini size="18" title="{languageText('HOT','Hot')}" />
            <span class:hidden={!$userSettings.uiState.expandSidebar}>{languageText('HOT','Hot')}</span>
        </SidebarButton>

        <!---Top Day --->
        <SidebarButton href="/home/{$userSettings.defaultSort.feed.toLowerCase() ?? 'all'}/topday" expanded={$userSettings.uiState.expandSidebar} title="{languageText('TOP_DAY','Top Day')}" data-sveltekit-preload-data="off">
            <Icon src={CalendarDays} mini size="18" title="{languageText('TOP_DAY','Top Day')}" />
            <span class:hidden={!$userSettings.uiState.expandSidebar}>{languageText('TOP_DAY','Top Day')}</span>
        </SidebarButton>
    </span>

    <hr class="border-slate-300 dark:border-zinc-800 mt-2"/>

    <div class="flex {$userSettings.uiState.expandSidebar ? 'flex-row justify-between' : 'flex-col gap-1'}">
        
        <!---Frontpage--->
        <SidebarButton href="/home/{$userSettings.defaultSort.feed.toLowerCase() ?? 'all'}/{$userSettings?.defaultSort.sort.toLowerCase() ?? 'new'}" expanded={$userSettings.uiState.expandSidebar} title="{languageText('HOME', 'Home')}" data-sveltekit-preload-data="off" class="w-full">
            <Icon src={Home} mini size="18" title="{languageText('HOME', 'Home')}" />
            <span class:hidden={!$userSettings.uiState.expandSidebar}>{languageText('HOME', 'Home')}</span>
        </SidebarButton>

        <!---Latest (New + Refresh)--->
        <SidebarButton expanded={$userSettings.uiState.expandSidebar} title="{languageText('REFRESH', 'Refresh')}" data-sveltekit-preload-data="off"
            on:click={() => {
                if ($page.url.pathname.startsWith('/home')) {
                    dispatchWindowEvent('refreshFeed')
                }
                else {
                    goto(`/home/${$userSettings.defaultSort.feed.toLowerCase() ?? 'all'}/${$userSettings?.defaultSort.sort.toLowerCase() ?? 'new'}?invalidate=true`)
                }
            }}
        >
            <Icon src={ArrowPath} mini size="18" title="Refresh Latest" />
        </SidebarButton>
    </div>

    <!--- Explore Communities / Favorites --->
    
    <!---Communities--->
    <SidebarButton href="/communities" expanded={$userSettings.uiState.expandSidebar} title="{languageText('EXPLORE_COMMUNITIES', 'Explore Communities')}" data-sveltekit-preload-data="off">
        <Icon src={GlobeAlt} mini size="18" title="{languageText('EXPLORE_COMMUNITIES', 'Explore Communities')}" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>{languageText('EXPLORE_COMMUNITIES', 'Explore Communities')}</span>
    </SidebarButton>

    <!---Settings--->
    <SidebarButton href="/settings" expanded={$userSettings.uiState.expandSidebar} title="{languageText('SETTINGS', 'Settings')}" data-sveltekit-preload-data="off">
        <Icon src={Cog6Tooth} mini size="18" title="{languageText('SETTINGS', 'Settings')}" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>{languageText('SETTINGS', 'Settings')}</span>
    </SidebarButton>
    


    


    {#if $profile?.user}
        <!--- Favorites, Subscribed, and Moderating Communities--->
        <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
        
        <!---Switcher Buttons--->
        <div class="flex {$userSettings.uiState.expandSidebar ? 'flex-row' : 'flex-col'} gap-1">
            <div class="ml-auto"/>

            <SidebarButton title="{languageText('SUBSCRIBED', 'Subscribed')}" expanded={$userSettings.uiState.expandSidebar} on:click={()=> panel='subscribed'}>
                <span class="flex flex-col items-center {panel=='subscribed' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                    <Icon src={InboxArrowDown} mini size="18" />
                    <span class="hidden {$userSettings.uiState.expandSidebar ? 'sm:block' : ''} text-xs">{languageText('SUBSCRIBED', 'Subscribed')}</span>
                </span>
            </SidebarButton>


            {#if $userSettings.uiState.expandSidebar}
                <SidebarButton title="{languageText('GROUPS', 'Groups')}" expanded={$userSettings.uiState.expandSidebar} on:click={()=> panel='groups'}>
                    <span class="flex flex-col items-center {panel=='groups' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={Folder} mini size="18" />
                        <span class="hidden {$userSettings.uiState.expandSidebar ? 'sm:block' : ''} text-xs">{languageText('GROUPS', 'Groups')}</span>
                    </span>
                </SidebarButton>
            {/if}

            
            <SidebarButton title="{languageText('FAVORITES', 'Favorites')}" expanded={$userSettings.uiState.expandSidebar} on:click={()=> panel='favorites'}>
                <span class="flex flex-col items-center {panel=='favorites' ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                    <Icon src={Star} mini size="18" />
                    <span class="hidden {$userSettings.uiState.expandSidebar ? 'sm:block' : ''} text-xs ">{languageText('FAVORITES', 'Favorites')}</span>
                </span>
            </SidebarButton>

            <div class="mr-auto"/>
        </div>

        
        
        <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
        
        <div class="flex flex-col gap-1 h-full overflow-y-auto">
            
            <!--- Subscribed/Moderating Community list --->
            {#if panel=='subscribed'}

                <!--- Search field to filter the subscribed communities--->
                {#if $userSettings.uiState.expandSidebar}
                    <form class="p-2 flex flex-row items-center gap-2" on:submit|preventDefault>
                        <TextInput 
                            type="text" autocomplete="new-password"    
                            placeholder="{languageText('FILTER_COMMUNITIES', 'Filter Communities')}"
                            class="h-8 w-full"
                            bind:value={communityFiltervalue}
                            on:keyup={(e) => { 
                                debounce(e.detail.srcElement.value);
                                panel = 'subscribed'
                            }}
                        />

                        <Button size="square-md" color="tertiary" 
                            title="{languageText('RESET', 'Reset')}" 
                            class="ml-auto" 
                            icon={XCircle} 
                            iconSize={22}
                            on:click={async () => {
                                debounce('')
                                communityFiltervalue = ''
                                communityScrollArea.scrollTo(0,0)
                            }}
                        />
                    </form>
                {/if}

                <div bind:this={communityScrollArea} class="flex flex-col gap-1 h-full overflow-y-auto">
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
                            <Placeholder size="22" icon={ArchiveBox} 
                                title="{languageText('NO_SUBSCRIPTIONS_TITLE', 'No Subscriptions')}" 
                                description="{languageText('NO_SUBSCRIPTIONS_DESC', "You're not subscribed to any communities. When you are, they will be listed here.")}" 
                            />
                        {/if}
                    {/if}
                </div>

                <div class="mt-auto"/>
                
                
                <hr class="border-slate-300/60"/>

                {#if $profile.user.moderates?.length > 0 && $userSettings.uiState.expandSidebar}
                    <div class="flex flex-col gap-2 mb-1">
                        <div class="pl-2 text-sm flex flex-row items-center">
                            <span class="flex flex-col text-xs">
                                <span class="font-bold">{languageText('COMMUNITY_LIST_ONLY_MODERATING_TITLE', "Only Moderating")}</span>
                                <span class="font-normal">{languageText('COMMUNITY_LIST_ONLY_MODERATING_DESC', "Show only communities I moderate")}</span>
                            </span>
                            <span class="ml-auto"/>
                            <Switch bind:enabled={onlyShowModerating} on:change={() => communityScrollArea.scrollTo(0,0) }/>
                        </div>
                    </div>
                {/if}
            {/if}

            <!--- Groups--->
            {#if panel=='groups' && $userSettings.uiState.expandSidebar}
                <div class="flex flex-col gap-1 h-full overflow-y-auto">
                    
                    {#if $profile?.groups && $profile?.groups?.length > 0}
                        {#each $profile.groups.sort(sortGroups) as group}
                            <CommunityGroup group={group} bind:showEmptyGroups/>
                        {/each}
                    {:else}
                        <Placeholder size="22" icon={UserGroup} 
                            title="{languageText('NO_GROUPS_TITLE', "No Groups")}"
                            description="{languageText('NO_GROUPS_DESC', "Your grouped communities will appear here.")}"
                        />
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
        <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
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
