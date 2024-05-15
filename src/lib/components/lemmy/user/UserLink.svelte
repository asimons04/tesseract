<script lang="ts">
    import type { GetPersonDetailsResponse, Person } from 'lemmy-js-client'
    
    import { getClient } from '$lib/lemmy'
    import { goto } from '$app/navigation';
    import { isNewAccount } from '../post/helpers'
    import { toast } from '$lib/components/ui/toasts/toasts';
    import { userProfileModal } from '../moderation/moderation';
    import { userSettings } from '$lib/settings.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte';
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';
    

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
    export let showInstance: boolean = $userSettings.uiState.showInstances ?? true
    export let useDisplayNames:boolean = $userSettings.displayNames ?? true
    export let mod:boolean = false
    export let admin:boolean = false
    export let href:boolean = false
    export let distinguishAdminsMods:boolean = true
    export let shortenDisplayName:boolean = false
    
    function linkFromCommunity(user: Person) {
        const domain = new URL(user.actor_id).hostname
        return `/u/${user.name}@${domain}`
    }
    
    
    let loadingPersonDetails = false
    let personDetails: GetPersonDetailsResponse | undefined = undefined
    
    async function getPersonDetails() {
        loadingPersonDetails = true
        try {
            personDetails = personDetails 
                ? personDetails
                : await getClient().getPersonDetails({
                    username: `${user.name}@${new URL(user.actor_id).hostname}`

                })
            userProfileModal(personDetails)
        }
        catch {
            toast({
                type: 'error',
                title: 'Error',
                content: 'Failed to fetch data for that user'
            })
        }
        finally {
            loadingPersonDetails = false
        }
    }


</script>


<button class="inline-flex flex-col md:flex-row flex-wrap min-w-fit gap-1 items-start md:items-center hover:underline" 
    on:click={async () => {
        if (href) goto(linkFromCommunity(user))
        else  await getPersonDetails()
    }} 
>
    <span class="flex flex-row gap-1 items-center">
        {#if avatar || loadingPersonDetails}
            <span class="items-center">    
                {#if loadingPersonDetails}
                    <Spinner width={avatarSize} />
                {:else}                    
                    <Avatar url={user.avatar} alt={user.name} width={avatarSize} />
                {/if}
            </span>
        {/if}

        <span class="flex flex-row flex-wrap gap-0" class:ml-0.5={avatar} >
            <span class="font-bold whitespace-nowrap {shortenDisplayName ? 'max-w-[100px] overflow-hidden text-ellipsis' : ''}">
                {useDisplayNames ? user.display_name?.split('@')[0] || user.name : user.name}
            </span>
            
            {#if showInstance}
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
