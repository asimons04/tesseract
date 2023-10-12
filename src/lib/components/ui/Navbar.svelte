<script lang="ts">
    import { profile, profileData, setUserID } from '$lib/auth.js'
    import { userSettings } from '$lib/settings.js'
    import { env } from '$env/dynamic/public'
    import { goto } from '$app/navigation'

    import Button from '$lib/components/input/Button.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
    import {
      amModOfAny,
      isAdmin,
    } from '$lib/components/lemmy/moderation/moderation.js'
    
    import ProfileButton from '$lib/components/ui/navbar/ProfileButton.svelte'


    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Logo from '$lib/components/ui/Logo.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import { LINKED_INSTANCE_URL, instance } from '$lib/instance.js'
    import { site } from '$lib/lemmy.js'
    import { theme } from '$lib/ui/colors.js'
    import {
        AdjustmentsHorizontal,
        ArrowLeftOnRectangle,
        Bars3,
        Bookmark,
        BuildingOffice,
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
        Sun,
        UserCircle,
        UserGroup,
    } from 'svelte-hero-icons'
  
    let scrollY = 0
    
    export const DISABLE_MODLOG_USERS = (env.PUBLIC_DISABLE_MODLOG_USERS ?? 'false').toLowerCase() == 'true'
    
    let expandAccountsMenu:boolean = false
</script>
  
<svelte:window bind:scrollY />
  
<nav class="flex flex-row gap-2 items-center sticky top-0 bg-slate-100/80 dark:bg-black/80 backdrop-blur-3xl w-full mx-auto px-4 py-2 z-50 box-border h-16">
    <div class="flex flex-row gap-2 items-center mr-auto">
        <a href="/" class="flex flex-row items-center gap-2">
            {#if $site}
                <Avatar
                    url={$site.site_view.site.icon}
                    alt={$site.site_view.site.name}
                    width={32}
                    res={64}
                    circle={false}
                    class="rounded-md"
                />
                <div class="flex flex-row items-center gap-2 max-[500px]:hidden">
                    <span class="opacity-30 text-xl">/</span>
                    <div class="text-sm font-bold inline-flex flex-col">
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

    <div class="flex flex-row gap-2 py-2 px-2">
        
        <!--- Show Reports Button if Mod --->
        {#if amModOfAny($profile?.user)}
            <Button
                href="/moderation"
                aria-label="Moderation"
                class="max-md:w-9 max-md:h-8 max-md:!p-0 dark:text-zinc-300 text-slate-700 hover:text-inherit hover:bg-slate-200 hover:dark:text-inherit relative hover:border-slate-300"
            >
                {#if $profile?.user?.reports ?? 0 > 0}
                    <div class="rounded-full w-2 h-2 bg-red-500 absolute -top-1 -left-1"/>
                {/if}

                <ShieldIcon filled width={15} />
                <span class="hidden md:inline">Reports</span>
            </Button>
        {/if}
        
        <!--- Search --->
        <Button
            href="/search"
            aria-label="Search"
            class="max-md:w-9 max-md:h-8 max-md:!p-0 dark:text-zinc-300 text-slate-700 hover:text-inherit hover:dark:text-inherit hover:bg-slate-200 hover:border-slate-300"
        >
            <Icon mini src={MagnifyingGlass} width={16} slot="icon" />
            <span class="hidden md:inline">Search</span>
        </Button>
      
        <!--- Explore/Communities --->
        <Button
            href="/communities"
            aria-label="Communities"
            class="max-md:w-9 max-md:h-8 max-md:!p-0 dark:text-zinc-300 text-slate-700 hover:text-inherit hover:dark:text-inherit hover:bg-slate-200 hover:border-slate-300"
        >
            <Icon mini src={GlobeAlt} size="16" slot="icon" />
            <span class="hidden md:inline">Explore</span>
        </Button>
      
        <!--- 'Create' Menu--->
        <Menu alignment="bottom-right">
            <Button
                color="primary"
                slot="button"
                aria-label="Create"
                let:toggleOpen
                on:click={toggleOpen}
                class="max-md:w-9 max-md:h-8 max-md:!p-0"
            >
                <Icon src={Plus} width={18} mini slot="icon" />
                <span class="hidden md:inline">Create</span>
            </Button>
        
            <li class="text-xs opacity-80 text-left mx-4 my-1 py-1">Create</li>
            <MenuButton
                link
                href="/create/post"
                disabled={$profile?.jwt == undefined}
            >
                <Icon src={PencilSquare} mini width={16} />
                Post
            </MenuButton>

            <MenuButton
                link
                href="/create/community"
                disabled={
                    !$profile?.jwt ||
                    !$profile?.user ||
                    ($site?.site_view.local_site.community_creation_admin_only && !isAdmin($profile.user))
                }
            >
                <Icon src={Newspaper} mini width={16} />
                Community
            </MenuButton>
        
            {#if !$profile?.jwt}
            <span class="text-sm mx-4 my-1 py-1">
                <Link highlight href="/login">Log in</Link> to create content.
            </span>
            {/if}
        </Menu>
    </div>

    <!--- Profile Menu --->
    <Menu
        alignment="bottom-right"
        itemsClass="h-8 md:h-8"
        containerClass="!max-h-[90vh]"
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
                    <Avatar
                        url={$profile.user.local_user_view.person.avatar}
                        width={32}
                        alt={$profile.user.local_user_view.person.name}
                    />
                </div>

                {#if $profile.user.unreads > 0}
                    <div class="rounded-full w-2 h-2 bg-red-500 absolute top-0 left-0 z-10"/>
                {/if}
            {:else}
                <div class="w-full h-full grid place-items-center">
                    <Icon src={Bars3} mini size="18" />
                </div>
            {/if}
        </button>

        <!--- User-Specific Options--->
        <li class="text-xs opacity-80 text-left mx-4 my-1 py-1">
            {$profile?.user ? $profile.user.local_user_view.person.display_name ?? $profile.user.local_user_view.person.name : 'Profile'}
        </li>
        
        {#if $profile?.user}
            <MenuButton link href="/profile/user" >
                    <Icon src={UserCircle} mini width={16} /> Profile
            </MenuButton>
        
            <MenuButton link href="/profile/inbox" >
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
        {/if}
      
        <!--- Account Selection Submenu--->
        <MenuButton>
            <div class="flex flex-row gap-2 items-center w-full text-sm transition-colors"
                aria-role="button"
                on:click={(e) => {
                    e.stopPropagation();
                    expandAccountsMenu = !expandAccountsMenu;
                }}
            >
                <Icon src={UserGroup} mini width={16} />
                Accounts
                <span class="text-xs font-bold bg-slate-100 dark:bg-zinc-700 px-2 py-0.5 rounded-md ml-auto">
                    {$profileData.profiles.length}
                </span>
            </div>
        </MenuButton>
        
        <!--- Accounts List --->
        <div class="flex flex-col w-full pl-3" class:hidden={!expandAccountsMenu}>
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
            Settings
        </MenuButton>

        <MenuButton link href="/about">
            <Icon src={InformationCircle} mini width={16} />
            About
        </MenuButton>

        <MenuButton>
            <span class="flex flex-row w-full gap-2"
            on:click={ (e) => {
                e.stopPropagation();
                $theme = dark() ? 'light' : 'dark'
            }}
            >
                <Icon
                    src={$theme == 'system'
                        ? ComputerDesktop
                        : $theme == 'light'
                            ? Sun
                            : $theme == 'dark'
                                ? Moon
                                : Moon
                    }
                    mini
                    size="16"
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
            </span>
        </MenuButton>

        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        <li class="flex flex-col px-4 py-1 mx-auto my-1 text-xs w-full">
            <div class="flex flex-row gap-2 w-full">
              <!-- svelte-ignore missing-declaration -->
                <span class="mr-auto">v{__VERSION__}</span>
                <span class="ml-auto">
                    <Link href="https://github.com/asimons04/Tesseract/" title="Tesseract on Github" newtab={$userSettings.openInNewTab.postLinks}>GitHub</Link>
                </span>
            </div>
        </li>
    </Menu>
</nav>