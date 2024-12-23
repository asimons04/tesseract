<script lang="ts">
    import type { Person } from 'lemmy-js-client'
    
    import { createEventDispatcher } from 'svelte';
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
        EyeSlash,
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
    export let ring:boolean = false
    export let community_banned:boolean = false
    export let blocked: boolean = false
    export let inline: boolean = true
    export let noClick: boolean = false
    export let noEmojis:boolean = false

    const dispatcher = createEventDispatcher()
    const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g

    function linkFromCommunity(user: Person) {
        const domain = new URL(user.actor_id).hostname
        return `/u/${user.name}@${domain}`
    }

    // Loads the user profile modal for this user if the component is set to href=false
    function loadProfileModal(e:CustomEvent) {
        dispatcher('click')
        if (!href) {
            e.preventDefault()
            e.stopPropagation()
            userProfileModal(user)
        }
    }
   
</script>


<a href={linkFromCommunity(user)} on:click={loadProfileModal} 
    class="inline-flex flex-col md:flex-row  gap-1 items-start md:items-center hover:underline min-w-fit 
        {noClick ? 'pointer-events-none' : ''} 
        {$$props.class}
    " 
    
>
    <span class="flex flex-row w-full gap-1 items-center w-fit">
        {#if avatar}
            
            <Avatar url={user.avatar} alt={user.actor_id} width={avatarSize} {ring}/>
            
        {/if}

        <span class="flex flex-wrap w-full 
                {inline ? 'items-center flex-row gap-0' : 'flex-col gap-0'} 
                {$userSettings.uiState.showInstances ? '' : inline ? '!flex-row' : ''} gap-0
            " 
            class:ml-0.5={avatar} 
        >
            
            <span class="font-bold text-left  truncate ">
                {
                    useDisplayNames ?? $userSettings.displayNames 
                        ? noEmojis
                            ? user.display_name?.split('@')[0]?.replaceAll(emojiRegex, '') || user.name 
                            : user.display_name?.split('@')[0] || user.name 
                        : user.name
                }
            </span>
            
            
            <span class="flex flex-row gap-1">
                {#if showInstance ?? $userSettings.uiState.showInstances}
                    <span class="opacity-70 font-normal truncate">
                        {inline ? '@' : ''}{new URL(user.actor_id).hostname}
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

                    {#if badges && community_banned}
                        <div class="text-green-500" title="Banned from Community">
                            <Icon src={NoSymbol} mini size="12" />
                        </div>
                    {/if}

                    {#if badges && user.banned}
                        <div class="text-red-500" title="Banned">
                            <Icon src={NoSymbol} mini size="12" />
                        </div>
                    {/if}

                    {#if badges && blocked}
                        <div class="text-red-500" title="Blocked">
                            <Icon src={EyeSlash} mini size="12" />
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

                    {#if badges && user.published && isNewAccount(user.published)}
                        <Badge label="New Account: {user.published}"  color="gray">
                            <Icon src={Cake} mini size="{inline ? '16' : '12'}"/>
                            {#if inline}
                                <RelativeDate date={user.published}/>
                            {/if}
                        </Badge>
                    {/if}
                </span>
            </span>
            
            
           
        </span>
    </span> 
  
    <!---
    {#if badges}
        <span class="flex flex-row min-w-fit flex-wrap gap-1 ml-1">
            {#if user.published && isNewAccount(user.published)}
                <Badge label="New Account"  color="gray">
                    <Icon src={Cake} mini size="{inline ? '16' : '12'}"/>
                    {#if inline}
                        <RelativeDate date={user.published}/>
                    {/if}
                </Badge>
            {/if}
        </span>
    {/if}
    --->
    
</a>
