<script lang="ts">
    import type { GetPersonDetails, GetPersonDetailsResponse, Person } from 'lemmy-js-client'
    
    import { getClient } from '$lib/lemmy'
    import { goto } from '$app/navigation';
    import { imageProxyURL } from '$lib/image-proxy'
    import { instance } from '$lib/instance';
    import { isAdmin } from '../moderation/moderation'
    import { isBlocked, blockUser } from '$lib/lemmy/user'
    import { isNewAccount } from '../post/helpers'
    import { profile } from '$lib/auth'
    import { toast } from '$lib/components/ui/toasts/toasts';
    import { userSettings } from '$lib/settings.js'
    
    

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import BanInstanceModal from '../moderation/BanInstanceModal.svelte'
    import Button from '$lib/components/input/Button.svelte';
    import Card from '$lib/components/ui/Card.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte';
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte';
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';
    import UserSendMessageModal from './UserSendMessageModal.svelte';

    import { 
        Icon, 
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Envelope,
        Home,
        Newspaper,
        NoSymbol, 
        PencilSquare,
        Share,
        Trash, 
        User,
        Hashtag, 
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
    
    let modal = false
    let messaging = false
    let banning = false
    let blocking = false
    let loadingPersonDetails = false
    let personDetails: GetPersonDetailsResponse | undefined = undefined
    let userBlocked = $profile?.user ? isBlocked($profile.user, user.id) : false

    
    async function getPersonDetails() {
        modal = true
        loadingPersonDetails = true
        personDetails = personDetails 
            ? personDetails
            : await getClient().getPersonDetails({
                person_id: user.id,

            })
        loadingPersonDetails = false
    }


</script>

{#if messaging && personDetails}
    <UserSendMessageModal bind:open={messaging} bind:person={personDetails.person_view} />
{/if}

{#if banning}
    <BanInstanceModal bind:open={banning} bind:user={user} bind:banned={user.banned} />
{/if}

{#if modal}
    <Modal bind:open={modal} icon={User} title="User Details" width="max-w-lg" on:click={(e) => e.stopPropagation()}>
        {#if loadingPersonDetails}
            <span class="flex mx-auto my-auto">
                <Spinner width={48}/>
            </span>
        {/if}

        {#if personDetails}
            <Card backgroundImage={($userSettings.uiState.showBannersInCards && user.banner) ? imageProxyURL(user.banner, 384, 'webp') : ''}
                class="font-normal text-slate-900 dark:text-zinc-200"
            >
                
                <div class="flex flex-row gap-3 items-center p-3">
                    <div class="flex-shrink-0">
                        <Avatar width={128} url={user.avatar} alt={user.name} />
                    </div>

                    <div class="flex flex-col gap-1 w-full">
                        <span class="font-bold text-lg">
                            <svelte:self badges user={user} showInstance={false} href admin={personDetails.person_view.is_admin}/>
                        </span>

                        <span class="text-xs font-normal">@{user.name}@{new URL(user.actor_id).hostname}</span>
                        

                        <div class="flex flex-row mt-1">
                            
                            <div class="text-sm flex flex-row flex-wrap gap-4 lg:gap-8">
                                <span class="flex flex-row items-center gap-2" title="Cake Day">
                                    <Icon src={Cake} width={16} height={16} mini />
                                    <span class="capitalize">
                                        <RelativeDate date={personDetails.person_view.person?.published}/>
                                    </span>
                                </span>
                            
                                <span class="flex flex-row items-center gap-2" title="Posts">
                                    <Icon src={PencilSquare} width={16} height={16} mini />
                                    <FormattedNumber number={personDetails.person_view.counts.post_count} />
                                </span>
                    
                                <span class="flex flex-row items-center gap-2" title="Comments">
                                    <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                                    <FormattedNumber number={personDetails.person_view.counts.comment_count} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <!--- Action Buttons for this User--->
            <div class="flex flex-col gap-2 mt-4 px-8 w-full items-center">
                
                <!---View User's Profile--->
                <Button color="tertiary-border" icon={User} alignment="left" class="w-full" on:click={() => goto(`/u/${user.name}@${new URL(user.actor_id).host}`)}>
                    View Profile
                </Button>

                <!---View on Home Instance (if not same instance as current)--->
                {#if $instance != new URL(user.actor_id).hostname}
                <Button color="tertiary-border" icon={Home} alignment="left" class="w-full" href="{user.actor_id}" newtab={true}>
                    View on User's Home Instance
                </Button>
                {/if}
                
                <!---Send Direct Message--->
                {#if $profile?.user && $profile?.user?.local_user_view.person.id != user.id}
                <Button color="tertiary-border" icon={Envelope} alignment="left" class="w-full" 
                    on:click={() => {
                        modal = false
                        messaging = true
                    }}
                >
                    Message in Lemmy
                </Button>
                {/if}

                <!---Message in Matrix--->
                {#if user.matrix_user_id && $profile?.user && $profile?.user?.local_user_view.person.id != user.id}
                <Button color="tertiary-border" icon={Hashtag} class="w-full" alignment="left" href="https://matrix.to/#/{user.matrix_user_id}" newtab={true}>
                    Message on Matrix
                </Button>
                {/if}

                

                <!---See User's Modlog History--->
                <Button color="tertiary-border" icon={Newspaper} alignment="left" class="w-full" href="/modlog?other_person_id={user.id.toString()}">
                    User Modlog
                </Button>

                <!---Copy Lemmyverse Link to User--->
                <Button color="tertiary-border" class="w-full" icon={Share} alignment="left"
                    on:click={() => {
                        navigator.clipboard.writeText(`https://lemmyverse.link/u/${user.name}@${new URL(user.actor_id).host}`)
                        toast({
                            type: 'success',
                            content: `Copied Lemmyverse link to clipboard`,
                            title: 'Copied'
                        })
                        
                    }}
                >
                    Copy Lemmyverse Link
                </Button>
                
                <!---Block User--->
                {#if $profile?.user && $profile?.user?.local_user_view.person.id != user.id}
                    <Button color="tertiary-border" class="w-full" icon={NoSymbol} alignment="left" loading={blocking} disabled={blocking}
                        on:click={async () => {
                            blocking = true
                            userBlocked = await blockUser(user.id, true, !userBlocked)
                            blocking = false
                        }}
                    >
                        {userBlocked ? 'Unblock' : 'Block'} User
                    </Button>
                {/if}
                
                <!---Ban User--->
                {#if isAdmin($profile?.user) && $profile?.user?.local_user_view.person.id != user.id}
                    <Button color="tertiary-border" icon={Trash} alignment="left" class="w-full" 
                        on:click={() => {
                            modal = false
                            banning=true
                        }}
                    >
                        {user.banned ? 'Unban User' : 'Ban User'}
                    </Button>
                {/if}

            </div>
        {/if}
    </Modal>

{/if}

<button class="inline-flex flex-col md:flex-row flex-wrap min-w-fit gap-1 items-start md:items-center hover:underline" 
    on:click={async () => {
        if (href) goto(linkFromCommunity(user))
        else  await getPersonDetails()
    }} 
>
    <span class="flex flex-row gap-1 items-center">
        {#if avatar}
            <span class="items-center">    
                <Avatar url={user.avatar} alt={user.name} width={avatarSize} />
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
