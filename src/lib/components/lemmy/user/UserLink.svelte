<script lang="ts">
    import type { GetPersonDetailsResponse, Person } from 'lemmy-js-client'
    
    import { goto } from '$app/navigation';
    import { isNewAccount } from '../post/helpers'
    import { userProfileModal } from '../moderation/moderation';
    import { userSettings } from '$lib/settings.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte';
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'

    import { 
        Icon, 
        Cake,
        NoSymbol, 
        Trash, 
    } from 'svelte-hero-icons'
    
    export let user: Person
    export let avatar: boolean = false
    export let avatarSize: number = 24
    export let badges: boolean = true
    export let showInstance: boolean|undefined = undefined 
    export let useDisplayNames:boolean|undefined = undefined 
    export let mod:boolean = false
    export let admin:boolean = false
    export let href:boolean = false
    export let distinguishAdminsMods:boolean = true
    export let shortenDisplayName:boolean = false
    export let ring:boolean = false

    function linkFromCommunity(user: Person) {
        const domain = new URL(user.actor_id).hostname
        return `/u/${user.name}@${domain}`
    }
   
</script>


<button class="inline-flex flex-col md:flex-row flex-wrap min-w-fit gap-1 items-start md:items-center hover:underline" 
    on:click={async () => {
        if (href) goto(linkFromCommunity(user))
        else  userProfileModal(user)
    }} 
>
    <span class="flex flex-row gap-1 items-center">
        {#if avatar}
            <span class="items-center">    
                <Avatar url={user.avatar} alt={user.actor_id} width={avatarSize} {ring}/>
            </span>
        {/if}

        <span class="flex flex-row flex-wrap gap-0" class:ml-0.5={avatar} >
            <span class="font-bold whitespace-nowrap {shortenDisplayName ? 'max-w-[100px] overflow-hidden text-ellipsis' : ''}">
                {useDisplayNames ?? $userSettings.displayNames ? user.display_name?.split('@')[0] || user.name : user.name}
            </span>
            
            {#if showInstance ?? $userSettings.uiState.showInstances}
                <span class="text-slate-500 dark:text-zinc-500 font-normal">
                    @{new URL(user.actor_id).hostname}
                </span>
            {/if}
            
            <!---User Badges--->
            <span class="flex flex-row ml-1 gap-1 items-center">
                
                {#if badges && distinguishAdminsMods && admin}
                    <div class="text-red-500" title="Admin">
                        <ShieldIcon width={12} filled />
                    </div>
                {/if}
                
                {#if badges && distinguishAdminsMods && mod}
                    <div class="text-green-500" title="Moderator">
                        <ShieldIcon width={12} filled />
                    </div>
                {/if}

                {#if badges && user.banned}
                    <div class="text-red-500" title="Banned">
                        <Icon src={NoSymbol} mini size="12" />
                    </div>
                {/if}
        
                {#if badges && user.bot_account}
                    <div class="text-blue-500 font-bold" title="Bot">BOT</div>
                {/if}

                {#if badges && user.deleted}
                    <div class="text-red-500" title="Deleted">
                        <Icon src={Trash} mini size="12" />
                    </div>
                {/if}
            </span>
        </span>
    </span> 
  
    {#if badges}
        <span class="flex flex-row min-w-fit flex-wrap gap-1 ml-1">
            {#if user.published && isNewAccount(user.published)}
                <Badge label="New Account"  color="gray">
                    <Icon src={Cake} mini size="16"/>
                    <RelativeDate date={user.published}/>
                </Badge>
            {/if}
        </span>
    {/if}
    
</button>
