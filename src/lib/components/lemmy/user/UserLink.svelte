<script lang="ts">
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import { userSettings } from '$lib/settings.js'
    import type { Person } from 'lemmy-js-client'
    import { Icon, NoSymbol, ShieldCheck, Trash } from 'svelte-hero-icons'

    export let user: Person
    export let avatar: boolean = false
    export let avatarSize: number = 24
    export let badges: boolean = true
    //export let inComment: boolean = false
    export let showInstance: boolean = true
    export let mod:boolean = false
    export let href:string | undefined = undefined
    export let distinguishAdminsMods:boolean = true
    function linkFromCommunity(user: Person) {
        const domain = new URL(user.actor_id).hostname
        return `/u/${user.name}@${domain}`
    }
</script>

<a
    class="items-center inline-flex flex-row gap-1 hover:underline"
    href={href ?? linkFromCommunity(user)}
>
    {#if avatar}
        <Avatar url={user.avatar} alt={user.name} width={avatarSize} />
    {/if}
    <span
        class="flex flex-row gap-0"
        class:ml-0.5={avatar}
        class:text-red-500={distinguishAdminsMods && user.admin}
        class:font-bold={distinguishAdminsMods && user.admin}
    >
        {$userSettings.displayNames ? user.display_name || user.name : user.name}

        {#if $userSettings.uiState.showInstances && showInstance}
            <span class="text-slate-500 dark:text-zinc-500 font-normal">
                @{new URL(user.actor_id).hostname}
            </span>
        {/if}
    </span>
  
    {#if badges && (user.admin || user.banned || user.bot_account || user.deleted || mod )}
        <span class="flex flex-row gap-1">
            {#if distinguishAdminsMods && user.admin}
                <div class="text-red-500" title="Admin">
                    <ShieldIcon width={12} filled />
                </div>
            {/if}
            
            {#if distinguishAdminsMods && mod}
                <div class="text-green-500" title="Moderator">
                    <ShieldIcon width={12} filled />
                </div>
            {/if}

            {#if user.banned}
                <div class="text-red-500" title="Banned">
                    <Icon src={NoSymbol} mini size="12" />
                </div>
            {/if}
      
            {#if user.bot_account}
                <div class="text-blue-500 font-bold" title="Bot">BOT</div>
            {/if}

            {#if user.deleted}
                <div class="text-red-500" title="Deleted">
                    <Icon src={Trash} mini size="12" />
                </div>
                
                {/if}
        </span>
    {/if}
</a>
