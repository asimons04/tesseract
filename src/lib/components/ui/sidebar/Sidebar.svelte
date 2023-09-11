<script lang="ts">
    import {
        ArrowLeftOnRectangle,
        ArrowTrendingUp,
        ChevronDoubleLeft,
        ChevronDoubleDown,
        Cog6Tooth,
        GlobeAlt,
        Home,
        Icon,
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

    export let expanded = {
        moderating: true,
        subscribed: true
    };

</script>

<nav
    class="hidden sm:flex flex-col pl-4 pr-4 py-4 overflow-auto sticky top-16 bottom-0
        gap-1 max-h-[calc(100svh-4rem)] w-full bg-slate-100 dark:bg-black
        {$userSettings.expandSidebar
            ? 'max-w-[20%] resize-x min-w-[12rem]'
            : 'w-max max-w-max min-w-max'
        }
    "
>

    <Button
        alignment="left"
        on:click={() =>
            ($userSettings.expandSidebar = !$userSettings.expandSidebar)
        }
        class="w-max !p-2 hover:bg-slate-200"
        aria-label={$userSettings.expandSidebar
            ? 'Collapse sidebar'
            : 'Expand sidebar'
        }
        title={$userSettings.expandSidebar
            ? 'Collapse sidebar'
            : 'Expand sidebar'
        }
    >
        <Icon
            src={ChevronDoubleLeft}
            mini
            size="16"
            class="transition-transform {$userSettings.expandSidebar
                ? ''
                : 'rotate-180'}"
        />
    </Button>
    

    <!---Frontpage--->
    <SidebarButton href="/" expanded={$userSettings.expandSidebar}>
        <Icon src={Home} mini size="18" title="Home" />
        <span class:hidden={!$userSettings.expandSidebar}>Home</span>
    </SidebarButton>

    <!---Popular --->
    <SidebarButton href="/?sort=Active" expanded={$userSettings.expandSidebar}>
        <Icon src={ArrowTrendingUp} mini size="18" title="Popular" />
        <span class:hidden={!$userSettings.expandSidebar}>Popular</span>
    </SidebarButton>
    
    <!---Settings--->
    <SidebarButton href="/settings" expanded={$userSettings.expandSidebar}>
        <Icon src={Cog6Tooth} mini size="18" title="Settings" />
        <span class:hidden={!$userSettings.expandSidebar}>Settings</span>
    </SidebarButton>

    <!---Communities--->
    <SidebarButton href="/communities" expanded={$userSettings.expandSidebar}>
        <Icon src={GlobeAlt} mini size="18" title="Communities" />
        <span class:hidden={!$userSettings.expandSidebar}>Communities</span>
    </SidebarButton>

    <SidebarButton href="/modlog" expanded={$userSettings.expandSidebar}>
        <Icon src={Newspaper} size="16" mini />
        <span class:hidden={!$userSettings.expandSidebar}>Modlog</span>
        
    </SidebarButton>

    <!--- Account Selector --->
    {#if $profileData.profiles.length >= 1}
        <hr class="border-slate-300 dark:border-zinc-800 my-1" />
        {#each $profileData.profiles as prof, index (prof.id)}
            <div animate:flip={{ duration: 300, easing: expoOut }} class="w-full">
                <ProfileButton {index} {prof} expanded={$userSettings.expandSidebar} />
            </div>
        {/each}
        <SidebarButton href="/accounts" expanded={$userSettings.expandSidebar}>
            <Icon src={UserGroup} mini size="18" />
            <span class:hidden={!$userSettings.expandSidebar}>Accounts</span>
        </SidebarButton>
    {/if}
    

    {#if $profile?.user}
        <!--- Moderating --->
        {#if $profile?.user.moderates.length > 0}
            
            <hr class="border-slate-300 dark:border-zinc-800 my-1" class:hidden={!$userSettings.expandSidebar && !expanded.moderating} />
            <h1 class="flex flex-row font-bold justify-between" class:hidden={!$userSettings.expandSidebar} >
                <span>Moderating 
                    <span class="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                        {$profile?.user.moderates.length}
                    </span>
                </span>
                <Button
                    on:click={() =>
                        (expanded.moderating = !expanded.moderating)
                    }
                    class="!p-2 hover:bg-slate-200"
                    aria-label={expanded.moderating
                        ? 'Collapse my communities'
                        : 'Expand my Communities'
                    }
                    title={expanded.moderating
                        ? 'Collapse my communities'
                        : 'Expand my Communities'
                    }
                >
                    <Icon
                        src={ChevronDoubleDown}
                        mini
                        size="16"
                        class="transition-transform {expanded.moderating
                            ? 'rotate-180'
                            : ''}"
                    />
                </Button>
            </h1>   

            
            <CommunityList
                expanded={$userSettings.expandSidebar}
                items={$profile.user.moderates.map((i) => i.community)}
                hidden={!expanded.moderating || !$userSettings.expandSidebar}
            />
            
        
        {/if}
        
        <!--- Subscribed Community List --->
        <hr class="border-slate-300 dark:border-zinc-800 my-1" class:hidden={!$userSettings.expandSidebar && !expanded.subscribed}/>
        <h1 class="flex flex-row text-base font-bold justify-between" class:hidden={!$userSettings.expandSidebar} >
            
            <span>Subscribed
                <span class="bg-gray-100 text-gray-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    {$profile?.user.follows.length}
                </span>
            </span>
        
            <Button
                on:click={() =>
                    (expanded.subscribed = !expanded.subscribed)
                }
                class="!p-2 hover:bg-slate-200"
                aria-label={expanded.subscribed
                    ? 'Collapse my subscriptions'
                    : 'Expand my subscriptions'
                }
                title={expanded.subscribed
                    ? 'Collapse my subscriptions'
                    : 'Expand my subscriptions'
                }
            >
                <Icon
                    src={ChevronDoubleDown}
                    mini
                    size="16"
                    class="transition-transform {expanded.subscribed
                        ? 'rotate-180'
                        : ''}"
                />
            </Button>

        </h1>
        
        <CommunityList
            expanded={$userSettings.expandSidebar}
            items={$profile.user.follows.map((i) => i.community)}
            hidden={!expanded.subscribed || !$userSettings.expandSidebar}
        />
        
        

        
    {:else}
        <Button
            class="hover:bg-slate-200 {$userSettings.expandSidebar ? '' : '!p-1.5'}"
            href="/accounts"
            color="tertiary"
            alignment="left"
        >
            <Icon mini src={ArrowLeftOnRectangle} size="18" />
            <span class:hidden={!$userSettings.expandSidebar}>Log in</span>
        </Button>

        <Button
            class="hover:bg-slate-200 {$userSettings.expandSidebar ? '' : '!p-1.5'}"
            href="/signup"
            color="tertiary"
            alignment="left"
        >
            <Icon mini src={Identification} size="18" title="Sign Up"/>
            <span class:hidden={!$userSettings.expandSidebar}>Sign Up</span>
        </Button>
    {/if}
</nav>
