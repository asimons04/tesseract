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
        InboxArrowDown,
    } from 'svelte-hero-icons'

    export let size:number = 28

</script>

{#if $profile && $profile.user}
<Menu alignment="bottom-right">
    <Button
        color="tertiary"
        slot="button"
        aria-label="Notificatoins"
        title="Notifications"
        let:toggleOpen
        on:click={toggleOpen}
        class="max-md:w-9 max-md:h-8 max-md:!p-0"
    >
        <Icon src={Bell} width={size} mini slot="icon" />
        
        <!---Notification Dots for Reports and Inbox--->
        {#if $profile?.user?.reports ?? 0 > 0}
            <div class="rounded-full w-2 h-2 bg-green-700 absolute bottom-0 right-0 z-10"/>
        {/if}
        
        {#if $profile.user.unreads > 0}
            <div class="rounded-full w-2 h-2 bg-red-500 absolute top-0 right-0 z-10"/>
        {/if}   

    </Button>
    
    <li class="text-xs font-bold opacity-80 text-left mx-4 my-1 py-1 w-48">Notifications</li>
    
    {#if amModOfAny($profile?.user)}
    <MenuButton link href="/moderation" data-sveltekit-preload-data="hover" aria-label="Moderation"
        class="max-md:w-9 max-md:h-8 max-md:!p-0 dark:text-zinc-300 text-slate-700 hover:text-inherit hover:bg-slate-200 hover:dark:text-inherit relative hover:border-slate-300"
    >
        <ShieldIcon filled width={16} />
        Reports
        <span class="text-xs font-bold bg-green-700 px-2 py-0.5 rounded-md ml-auto">
            {$profile?.user?.reports ?? 0}
        </span>
    </MenuButton>
    {/if}

    <MenuButton link href="/profile/inbox" data-sveltekit-preload-data="hover" aria-label="Moderation"
        class="max-md:w-9 max-md:h-8 max-md:!p-0 dark:text-zinc-300 text-slate-700 hover:text-inherit hover:bg-slate-200 hover:dark:text-inherit relative hover:border-slate-300"
    >
        <Icon src={InboxArrowDown} mini size="16" />
        Inbox
        <span class="text-xs font-bold bg-red-500 px-2 py-0.5 rounded-md ml-auto">
            {$profile.user.unreads ?? 0}
        </span>
    </MenuButton>


</Menu>
{/if}