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
    export let avatarSize: number = avatar ? 24 : 0
    export let badges: boolean = true
    export let showInstance: boolean | undefined = undefined
    export let useDisplayNames:boolean|undefined = undefined    
    export let mod:boolean = false                  // Set the user-is-mod indicator
    export let admin:boolean = false                // Set the user-is-admin indicator
    export let href:boolean = false                 // Control default behavior of the link. Href=true is a normal link the profile, false will load the profile modal
    export let distinguishAdminsMods:boolean = true // Whether to badge mods/admins 
    export let ring:boolean = false                 // Add a ring effect around the avatar
    export let community_banned:boolean = false     // Set the banned from community indicator
    export let blocked: boolean = false             // Set the blocked indicator
    
    export let inline: boolean = true               // Single line or multi-line formats
    export let noClick: boolean = false             // Prevent clicking on any element / display only
    export let noEmojis:boolean = false             // Strip emojis from the display name
    export let uPrefix: boolean = false             // Prefix the username with 'u/'

    const dispatcher = createEventDispatcher()
    
    let displayName: string = user.name

    $:  user.id, $userSettings.displayNames, displayName = generateDisplayName(user)
    //$:  $userSettings.uiState.showInstances, showInstance = $userSettings.uiState.showInstances 

    function linkFromCommunity(user: Person) {
        const domain = new URL(user.actor_id).hostname
        return `/u/${user.name}@${domain}`
    }

    function generateDisplayName(p: Person) {
        const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g

        let displayName = noEmojis 
            ? p.display_name?.split('@')[0]?.replaceAll(emojiRegex, '') ?? p.name
            : p.display_name?.split('@')[0] ?? p.name 
        
        if (uPrefix) displayName = 'u/' + displayName
        
        return (useDisplayNames ?? $userSettings.displayNames) 
            ? displayName 
            : uPrefix
                ? 'u/' + p.name
                : p.name
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
    class="inline-flex flex-col md:flex-row  gap-1 items-start md:items-center hover:underline w-full 
        {noClick ? 'pointer-events-none' : ''} 
        {$$props.class}
    " 
    title="{displayName}@{new URL(user.actor_id).hostname}"
    
>
    <span class="flex flex-row w-full gap-1 items-center w-fit">
        {#if avatar}
            <Avatar url={user.avatar} alt={user.actor_id} width={avatarSize} {ring}/>
        {/if}

        <span class="flex w-full gap-0 {inline ? 'items-center flex-row' : 'items-start flex-col'}  gap-0" 
            class:ml-0.5={avatar} 
            style="width:calc(100% - {avatar ? avatarSize+2 : 0}px - 0.5rem);"
        >
             <!---User Badges--->
             <span class="flex flex-row mr-1 gap-1 items-center">
                    
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
                            <RelativeDate date={user.published} class="hidden md:flex"/>
                        {/if}
                    </Badge>
                {/if}
            </span>

            <span class="font-bold opacity-80 text-left  truncate ">
                {displayName}
                
                <span class="{inline ? '-ml-1' : 'flex flex-col'} opacity-70  font-normal truncate {showInstance ?? $userSettings.uiState.showInstances ? '' : 'ml-0'}">
                    {#if showInstance ?? $userSettings.uiState.showInstances }    
                        {inline ? '@' : ''}{new URL(user.actor_id).hostname}
                    {/if}
                </span>
            </span>
           
        </span>
    </span> 
</a>
