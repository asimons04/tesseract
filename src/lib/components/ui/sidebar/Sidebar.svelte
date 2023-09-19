<script lang="ts">
    import { LINKED_INSTANCE_URL } from "$lib/instance.js"
    import {
        AdjustmentsHorizontal,
        ArrowLeftOnRectangle,
        ArrowTrendingUp,
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
        UserGroup
    } from 'svelte-hero-icons'
    import Button from '../../input/Button.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import { profile, profileData } from '$lib/auth.js'
    import { userSettings } from '$lib/settings.js'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import { flip } from 'svelte/animate'
    import { expoOut } from 'svelte/easing'
    let communityFilterTerm:string = '';

</script>

<nav
    class="hidden sm:flex flex-col pl-4 pr-4 pt-[1.2rem] overflow-auto sticky top-16 bottom-0
        gap-1 max-h-[calc(100svh-4rem)] w-full bg-slate-100 dark:bg-black
        {$userSettings.uiState.expandSidebar
            ? `max-w-[25%] xl:max-w-[18%] lg:max-w-[20%] resize-x min-w-[12rem]`
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


    {#if $profile?.user}
        <!--- Subscribed Community List --->
        <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
        
        <!--- Search field to filter the subscribed communities--->
        <div class="p-3 flex" class:hidden={!$userSettings.uiState.expandSidebar}>
            <TextInput 
                type="search"
                placeholder="Jump to a Community"
                bind:value={communityFilterTerm}
                on:keyup={() => { 
                    // Set the search term to lowercase for comparison 
                    communityFilterTerm = communityFilterTerm.toLowerCase();
                    
                    // Expand the subscribed list since that's where the result will appear
                    if (!$userSettings.uiState.expandSubscribedList) {
                        $userSettings.uiState.expandSubscribedList = true;
                    }

                    // Hide the 'moderating list'
                    $userSettings.uiState.expandModeratingList = false;
                }}
                class="h-8 w-full"
            />
        </div>
        

        <SidebarButton 
            class="w-full"
            title="{$userSettings.uiState.expandSubscribedList ? 'Collapse' : 'Expand'} Subscriptions"  
            expanded={$userSettings.uiState.expandSidebar}
            on:click={() => {
                $userSettings.uiState.expandSubscribedList = !$userSettings.uiState.expandSubscribedList
                $userSettings.uiState.expandModeratingList = false;
            }}
        >

            <Icon src={InboxArrowDown} mini size="18" />
            
            <span class="w-full flex flex-row justify-between" class:hidden={!$userSettings.uiState.expandSidebar}>
                Subscribed
                <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                    {$profile?.user.follows.length}
                </span>
            </span>
        </SidebarButton>

        
        
        <!--- Subscribed community list --->
        <CommunityList
            expanded={$userSettings.uiState.expandSidebar}
            items={$profile.user.follows.map((i) => i.community)}
            hidden={!$userSettings.uiState.expandSubscribedList }
            filter={communityFilterTerm}
        />

        
        <!--- Communities User is Moderating --->
        {#if $profile?.user.moderates.length > 0}
            <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
            <SidebarButton 
                class="w-full"  
                title="{$userSettings.uiState.expandModeratingList ? 'Collapse' : 'Expand'} Moderating"  
                expanded={$userSettings.uiState.expandSidebar}
                on:click={() => {
                    $userSettings.uiState.expandModeratingList = !$userSettings.uiState.expandModeratingList;
                    // Hide the "subscribed" list
                    $userSettings.uiState.expandSubscribedList = false;
                }}
            >
                <Icon src={HandRaised} mini size="18" />
                <span class="w-full flex flex-row justify-between" class:hidden={!$userSettings.uiState.expandSidebar}>
                    Moderating
                    <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                        {$profile?.user.moderates.length}
                    </span>
                </span>
            </SidebarButton>
            
            <CommunityList
                expanded={$userSettings.uiState.expandSidebar}
                items={$profile.user.moderates.map((i) => i.community)}
                hidden={!$userSettings.uiState.expandModeratingList}
            />
        {/if}
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
