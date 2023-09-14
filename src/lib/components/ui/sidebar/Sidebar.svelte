<script lang="ts">
    import {
        AdjustmentsHorizontal,
        ArrowLeftOnRectangle,
        ArrowTrendingUp,
        ChevronDoubleLeft,
        ChevronDoubleDown,
        Cog6Tooth,
        GlobeAlt,
        HandRaised,
        Home,
        Icon,
        InboxStack,
        InformationCircle,
        Identification,
        Minus,
        Newspaper,
        Plus,
        UserGroup
    } from 'svelte-hero-icons'
    import Button from '../../input/Button.svelte'
    import { profile, profileData } from '$lib/auth.js'
    import { userSettings } from '$lib/settings.js'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import ProfileButton from '$lib/components/ui/sidebar/ProfileButton.svelte'
    import { flip } from 'svelte/animate'
    import { expoOut } from 'svelte/easing'

</script>

<nav
    class="hidden sm:flex flex-col pl-4 pr-4 py-4 overflow-auto sticky top-16 bottom-0
        gap-1 max-h-[calc(100svh-4rem)] w-full bg-slate-100 dark:bg-black
        {$userSettings.uiState.expandSidebar
            ? 'max-w-[18%] resize-x min-w-[12rem]'
            : 'w-max max-w-max min-w-max'
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
    
    <!---Settings--->
    <SidebarButton href="/settings" expanded={$userSettings.uiState.expandSidebar} title="Settings">
        <Icon src={Cog6Tooth} mini size="18" title="Settings" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Settings</span>
    </SidebarButton>

    <!---Communities--->
    <SidebarButton href="/communities" expanded={$userSettings.uiState.expandSidebar} title="Communities">
        <Icon src={GlobeAlt} mini size="18" title="Communities" />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Communities</span>
    </SidebarButton>

    <SidebarButton href="/modlog" expanded={$userSettings.uiState.expandSidebar} title="Modlog">
        <Icon src={Newspaper} size="16" mini />
        <span class:hidden={!$userSettings.uiState.expandSidebar}>Modlog</span>
        
    </SidebarButton>

    <!--- Account Selector --->
    {#if $profileData.profiles.length >= 1}
        
        <div class="flex flex-col">
            <hr class="border-slate-300 dark:border-zinc-800 my-1" />
            
            <SidebarButton 
                class="w-full"
                title="{$userSettings.uiState.expandAccountsList ? 'Collapse' : 'Expand'} User Account List"
                expanded={$userSettings.uiState.expandSidebar}
                on:click={() =>
                    ($userSettings.uiState.expandAccountsList = !$userSettings.uiState.expandAccountsList)
                }
            >
                <Icon src={UserGroup} mini size="18" />
                <span class:hidden={!$userSettings.uiState.expandSidebar}>Accounts</span>
            </SidebarButton>

            <span class="flex flex-col" class:hidden={!$userSettings.uiState.expandAccountsList}>
                {#each $profileData.profiles as prof, index (prof.id)}
                    <div animate:flip={{ duration: 300, easing: expoOut }} class="w-full">
                        <ProfileButton {index} {prof} expanded={$userSettings.uiState.expandSidebar}/>
                    </div>
                {/each}
                
                <SidebarButton href="/accounts" expanded={$userSettings.uiState.expandSidebar} title="Manage Accounts">
                    <Icon src={AdjustmentsHorizontal} mini size="18" />
                    <span class:hidden={!$userSettings.uiState.expandSidebar}>Manage Accounts</span>
                </SidebarButton>
                
            </span>

            
        </div>
        
    {/if}
    

    {#if $profile?.user}
        <!--- Communities User is Moderating --->
        {#if $profile?.user.moderates.length > 0}
            
            <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
            <SidebarButton 
                class="w-full"  
                title="{$userSettings.uiState.expandModeratingList ? 'Collapse' : 'Expand'} Communities I Moderate List"  
                expanded={$userSettings.uiState.expandSidebar}
                on:click={() =>
                    ($userSettings.uiState.expandModeratingList = !$userSettings.uiState.expandModeratingList)
                }
            >
                <Icon src={HandRaised} mini size="18" />
                <span class:hidden={!$userSettings.uiState.expandSidebar}>
                    Moderating
                    <span class="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
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
        
        <!--- Subscribed Community List --->
        <hr class="border-slate-300 dark:border-zinc-800 my-1"/>
        
        <SidebarButton 
            class="w-full"
            title="{$userSettings.uiState.expandSubscribedList ? 'Collapse' : 'Expand'} My Community Subscriptions List"  
            expanded={$userSettings.uiState.expandSidebar}
            on:click={() =>
                ($userSettings.uiState.expandSubscribedList = !$userSettings.uiState.expandSubscribedList)
            }
        >
            <Icon src={InboxStack} mini size="18" />
            <span class:hidden={!$userSettings.uiState.expandSidebar}>
                Subscribed
                <span class="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    {$profile?.user.follows.length}
                </span>
            </span>
        </SidebarButton>
        
        
        <CommunityList
            expanded={$userSettings.uiState.expandSidebar}
            items={$profile.user.follows.map((i) => i.community)}
            hidden={!$userSettings.uiState.expandSubscribedList }
        />
        <!--hidden={!$userSettings.uiState.expandSubscribedList || !$userSettings.uiState.expandSidebar}-->

    {:else}
        <Button
            class="hover:bg-slate-200 {$userSettings.uiState.expandSidebar ? '' : '!p-1.5'}"
            href="/accounts"
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
    {/if}
</nav>
