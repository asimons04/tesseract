<script lang="ts">
    import { amModOfAny,isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { profile } from '$lib/auth'

    
    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
    
    import {
        Icon,
        Bell,
        Clipboard,
        InboxArrowDown,
    } from 'svelte-hero-icons'

    export let size:number = 28

    let selectedClass = '!text-sky-700 dark:!text-sky-500 font-bold'
</script>

{#if $profile && $profile.user}
<Menu alignment="bottom-right">
    <Button
        color="tertiary"
        slot="button"
        aria-label="Notificatoins"
        title="Notifications"
        let:toggleOpen
        let:open
        on:click={toggleOpen}
        class="max-md:w-9 max-md:h-8 max-md:!p-0"
    >
        <Icon src={Bell} width={size} mini slot="icon" class="{open ? selectedClass : ''}"/>
        
        <!---Notification Dots for Reports and Inbox--->
        {#if $profile?.user?.registration_applications ?? 0 > 0}
            <div class="rounded-full w-2 h-2 bg-sky-800 absolute top-0 left-0 z-10"/>
        {/if}

        {#if $profile?.user?.reports ?? 0 > 0}
            <div class="rounded-full w-2 h-2 bg-green-700 absolute bottom-0 right-0 z-10"/>
        {/if}
        
        {#if $profile.user.unreads > 0}
            <div class="rounded-full w-2 h-2 bg-red-800 absolute top-0 right-0 z-10"/>
        {/if}   

    </Button>
    
    <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left px-4 py-1 min-w-48">
        Notifications
        <span class="ml-auto"/>
        <Icon src={Bell} width={16} mini />
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />

    <!----Messages--->
    <MenuButton link href="/profile/inbox" data-sveltekit-preload-data="hover" aria-label="Moderation"
        class="max-md:h-8 dark:text-zinc-300 text-slate-700 hover:text-inherit hover:bg-slate-200 hover:dark:text-inherit relative hover:border-slate-300"
    >
        <Icon src={InboxArrowDown} mini size="16" />
        Inbox
        <span class="text-xs font-bold text-zinc-100 bg-red-800 px-2 py-0.5 rounded-md ml-auto">
            {$profile.user.unreads ?? 0}
        </span>
    </MenuButton>

    <!---Reports--->
    {#if amModOfAny($profile?.user)}
    <MenuButton link href="/moderation" data-sveltekit-preload-data="hover" aria-label="Moderation"
        class="max-md:h-8 dark:text-zinc-300 text-slate-700 hover:text-inherit hover:bg-slate-200 hover:dark:text-inherit relative hover:border-slate-300"
    >
        <ShieldIcon filled width={16} />
        Reports
        <span class="text-xs font-bold text-zinc-100 bg-green-700 px-2 py-0.5 rounded-md ml-auto">
            {$profile?.user?.reports ?? 0}
        </span>
    </MenuButton>
    {/if}

    <!---Registration Applications--->
    {#if isAdmin($profile.user)}
    <MenuButton link href="/admin/applications/" data-sveltekit-preload-data="hover" aria-label="Registration Applications"
        class="max-md:h-8 dark:text-zinc-300 text-slate-700 hover:text-inherit hover:bg-slate-200 hover:dark:text-inherit relative hover:border-slate-300"
    >
        <Icon src={Clipboard} mini size="16" />
        Registration Applications
        <span class="text-xs font-bold text-zinc-100 bg-sky-800 px-2 py-0.5 rounded-md ml-auto">
            {$profile.user.registration_applications ?? 0}
        </span>
    </MenuButton>
    {/if}


</Menu>
{/if}