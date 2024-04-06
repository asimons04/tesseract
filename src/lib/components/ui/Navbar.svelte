<script lang="ts">
    
    
    import { amModOfAny,isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { env } from '$env/dynamic/public'
    import { goto } from '$app/navigation'
    import { instance } from '$lib/instance.js'
    import { page } from '$app/stores'
    import { profile, profileData, setUserID } from '$lib/auth.js'
    import { site } from '$lib/lemmy.js'
    import { slide} from 'svelte/transition'
    import { theme } from '$lib/ui/colors.js'
    import { userSettings } from '$lib/settings.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CreateButton from './navbar/CreateButton.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Logo from '$lib/components/ui/Logo.svelte'
    import FavoritesButton from '$lib/components/ui/navbar/FavoritesButton.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import NotificationButton from '$lib/components/ui/navbar/NotificationButton.svelte'
    import ProfileButton from '$lib/components/ui/navbar/ProfileButton.svelte'
    //import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    //import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
    //import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import {
        AdjustmentsHorizontal,
        ArrowLeftOnRectangle,
        Bars3,
        Bookmark,
        BuildingOffice,
        ChevronDoubleLeft,
        ChevronDown,
        ChevronUp,
        Cog6Tooth,
        CommandLine,
        ComputerDesktop,
        GlobeAlt,
        Icon,
        Inbox,
        InformationCircle,
        MagnifyingGlass,
        Moon,
        Newspaper,
        PencilSquare,
        Plus,
        Star,
        Sun,
        UserCircle,
        UserGroup,
    } from 'svelte-hero-icons'
    //import { searchParam } from '../../util';
  
    let scrollY = 0
    
    export const DISABLE_MODLOG_USERS = (env.PUBLIC_DISABLE_MODLOG_USERS ?? 'false').toLowerCase() == 'true'
    
    let expandAccountsMenu:boolean = false;
    
    let searchTerm:string = '';
    let searchType:string = 'All';
    
    function search() {
        let url = new URL(window.location.href);
        url.pathname = '/search';
        url.searchParams.set('type', searchType)
        url.searchParams.set('q', searchTerm);
        
        goto(url, {
            invalidateAll: true,
        })
    }
</script>
  
<svelte:window bind:scrollY />
  

<nav class="flex flex-row gap-2 items-center sticky top-0 bg-slate-100/80 dark:bg-black/80 backdrop-blur-3xl w-full z-50 mx-auto px-4 py-2  box-border h-16">
    
    <div class="hidden md:flex mr-4">
    <Button
        alignment="left"
        on:click={() =>
            ($userSettings.uiState.expandSidebar = !$userSettings.uiState.expandSidebar)
        }
        color="tertiary"
        aria-label="{$userSettings.uiState.expandSidebar ? 'Collapse': 'Expand'} Sidebar"
        title="{$userSettings.uiState.expandSidebar ? 'Collapse': 'Expand'} Sidebar"
    >
        <Icon src={ChevronDoubleLeft} mini size="16" class="transition-transform {$userSettings.uiState.expandSidebar ? '' : 'rotate-180'}"/>
    </Button>
    </div>
    
    <!---Site Logo and Name on left--->
    <div data-sveltekit-preload-data="hover" class="flex flex-row gap-2 items-center mr-auto">
        <a href="/" class="flex flex-row items-center gap-2">
            {#if $site}
                <Avatar url={$site.site_view.site.icon} alt={$site.site_view.site.name} width={32} res={64} circle={false}/>
                <div class="flex flex-row items-center gap-2 max-[500px]:hidden">
                    
                    <div class="text-base font-bold inline-flex flex-col">
                        <span>{$site.site_view.site.name}</span>
                    </div>
                </div>
            {:else}
                <Logo width={40} />
                <div class="flex flex-row items-center gap-2 max-[1000px]:hidden">
                    <span class="text-sm font-bold">
                        {$instance}
                    </span>
                </div>
            {/if}
        </a>
    </div>

    <!---Inline Search in Middle--->
    <!---
    <form class="hidden lg:flex lg:flex-row gap-1 items-center ml-auto mr-auto"
        class:lg:hidden={$page.url.pathname.includes('/search')}
        on:submit={(e) => {
            e.preventDefault();
            search();
        }}
    >

        <TextInput type="search" placeholder="Search" bind:value={searchTerm}/>

        <Button
            class="max-md:w-9 max-md:h-8 max-md:!p-0 dark:text-zinc-300 text-slate-700 hover:text-inherit hover:dark:text-inherit hover:bg-slate-200 hover:border-slate-300 !px-1"
            on:click={search}
        >
            <Icon src={MagnifyingGlass} mini width={18} />
        </Button>
    </form>
    --->

    <!---Right-side Buttons--->
    <div class="flex flex-row gap-2 py-2 px-2 items-center">
       
        <!--- Search (Hide in large width since inline search is present--->
        <Button
            href="/search"
            color="tertiary"
            aria-label="Search"
            title="Search"
            class="max-md:w-9 max-md:h-8 max-md:!p-0"
        >
            <Icon mini src={MagnifyingGlass} width={24} slot="icon" />
        </Button>
      
        <!--- Explore/Communities --->
        <Button
            href="/communities"
            color="tertiary"
            data-sveltekit-preload-data="hover"
            aria-label="Explore Communities"
            title="Explore Communities"
            class="max-md:w-9 max-md:h-8 max-md:!p-0"
        >
            <Icon mini src={GlobeAlt} width={24} slot="icon" />
        </Button>
        
        
        <!--- Favorites Menu--->
        <FavoritesButton size={24}/>
      
        <!--- 'Create' Menu--->
        <CreateButton size={24} />

        <!---Notification Menu--->
        <NotificationButton size={24}/>
    </div>

    <!--- Profile Menu --->
    <Menu
        alignment="bottom-right"
        itemsClass="h-8 md:h-8"
        containerClass="!max-h-[90vh] !bg-slate-100 dark:!bg-zinc-950"
    >
        <!---Profile Button / Avatar Image--->
        <button
            class="w-8 h-8 rounded-full ring-1 ring-slate-300 bg-slate-100 dark:bg-zinc-800 relative"
            aria-label="Profile"
            slot="button"
            let:toggleOpen
            on:click={toggleOpen}
        >
            {#if $profile?.user}
                <div class="w-8 h-8 aspect-square object-cover rounded-full">
                    <Avatar width={32} ring={true}
                        url={$profile.user.local_user_view.person.avatar}
                        alt={$profile.user.local_user_view.person.name}
                    />
                </div>

            {:else}
                <div class="w-full h-full grid place-items-center">
                    <Icon src={Bars3} mini size="18" />
                </div>
            {/if}
        </button>

        <!--- User-Specific Options--->

        <!--- Account Selection Submenu--->
        {#if $profileData?.profiles?.length > 0}
        <MenuButton>
            <button class="flex flex-row gap-2 font-bold items-center w-full py-1 text-sm transition-colors"
                on:click={(e) => {
                    e.stopPropagation();
                    expandAccountsMenu = !expandAccountsMenu;
                }}
            >
                {#if $profile?.user}
                    <Avatar width={28} 
                        url={$profile.user.local_user_view.person.avatar}
                        alt={$profile.user.local_user_view.person.name}
                        
                    />
                {:else}
                    <Icon src={UserGroup} mini width={16} />
                {/if}

                {$profile?.user ? $profile.user.local_user_view.person.display_name ?? $profile.user.local_user_view.person.name : 'Profiles'}
                <span class="text-xs font-bold px-1 py-0.5 ml-auto">
                    <Icon src={expandAccountsMenu ? ChevronUp : ChevronDown} mini width={16}  />
                </span>
            </button>
        </MenuButton>
        <!---If no profiles defined, show "Manage Accounts" button instead--->
        {:else}
            <MenuButton link href="/accounts">
                <Icon src={AdjustmentsHorizontal} mini width={16} />
                Manage Accounts
            </MenuButton>
        {/if}
        
        <!--- Accounts List --->
        {#if expandAccountsMenu}
            <div class="flex flex-col w-full" transition:slide>
                <div class="flex flex-col items-start w-full">
                    {#each $profileData.profiles as prof, index (prof.id)}
                        <ProfileButton {index} {prof}/>
                    {/each}
                </div>

                <MenuButton link href="/accounts">
                    <Icon src={AdjustmentsHorizontal} mini width={16} />
                    Manage Accounts
                </MenuButton>
            </div>

            <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        {/if}


        {#if $profile?.user}
            <MenuButton link href="/profile/user" data-sveltekit-preload-data="hover">
                    <Icon src={UserCircle} mini width={16} /> Profile
            </MenuButton>
        
            <MenuButton link href="/profile/inbox"data-sveltekit-preload-data="hover" >
                <Icon src={Inbox} mini width={16} />
                Inbox

                {#if $profile.user.unreads > 0}
                    <div class="rounded-full w-auto flex items-center px-2 h-5 justify-center font-bold bg-red-500 ml-auto">
                        {$profile.user.unreads}
                    </div>
                {/if}
            </MenuButton>
        
            <MenuButton link href="/profile/saved" >
                <Icon src={Bookmark} mini width={16} /> Saved
            </MenuButton>

            <MenuButton link href="/profile/settings" >
                <Icon src={Cog6Tooth} mini width={16} /> User Settings
            </MenuButton>
        {/if}
      
        
        

        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        
        <!--- Site-specific Links--->
        <li class="text-xs px-4 py-1 my-1 opacity-80">
                {#if $site && $site.site_view}
                    {$site.site_view.site.name}
                {:else if $instance}
                    {$instance}
                {:else}
                    Instance
                {/if}
        </li>
        
        <!--- /admin Button --->
        {#if $profile?.user && isAdmin($profile.user)}
            <MenuButton link href="/admin"
                aria-label="Admin Panel"
            >
                <Icon src={CommandLine} mini width={16} />
                Admin Panel
            </MenuButton>
        {/if}

        <!--- Optionally hide the modlog from non-moderators/non-admins. --->
        {#if 
            !DISABLE_MODLOG_USERS || 
            ($profile?.user && isAdmin($profile.user)) || 
            ($profile?.user && amModOfAny($profile?.user))  
        }
                <MenuButton link href="/modlog">
                    <Icon src={Newspaper} mini width={16} />
                    Modlog
                </MenuButton>
        {/if}
        
        <MenuButton link href="/legal">
            <Icon src={BuildingOffice} mini width={16} />
            Legal
        </MenuButton>
        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />

        <!--- Application Settings/Info --->
        <li class="text-xs px-4 py-1 my-1 opacity-80">App</li>
        <MenuButton link href="/settings">
            <Icon src={Cog6Tooth} mini width={16} />
            App Settings
        </MenuButton>

        <MenuButton link href="/about">
            <Icon src={InformationCircle} mini width={16} />
            About Tesseract
        </MenuButton>

        <MenuButton>
            <button class="flex flex-row w-full gap-2"
            on:click={ (e) => {
                e.stopPropagation();
                //@ts-ignore
                $theme = dark() ? 'light' : 'dark'
            }}
            >
                <Icon mini size="16"
                    src={$theme == 'system'
                        ? ComputerDesktop
                        : $theme == 'light'
                            ? Sun
                            : $theme == 'dark'
                                ? Moon
                                : Moon
                    }
                    />
                <div class="flex flex-row gap-2 justify-between w-full">
                    <span class="mr-4">Theme</span>
                    <select
                        bind:value={$theme}
                        on:click|stopPropagation
                        class="ml-auto w-full text-sm py-0 px-1 rounded-sm cursor-pointer bg-slate-200 dark:bg-zinc-900 border dark:border-zinc-700"
                    >
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </button>
        </MenuButton>

        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        <li class="flex flex-col px-4 py-1 mx-auto my-1 text-xs w-full">
            <div class="flex flex-row gap-2 w-full">
              <!-- svelte-ignore missing-declaration -->
                <span class="mr-auto">v{__VERSION__}</span>
                <span class="ml-auto">
                    <Link href="https://github.com/asimons04/Tesseract/" title="Tesseract on Github" newtab={$userSettings.openInNewTab.links}>GitHub</Link>
                </span>
            </div>
        </li>
    </Menu>
</nav>