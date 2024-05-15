<script lang="ts">
    import type { GetPersonDetailsResponse } from "lemmy-js-client";
    
    import { goto } from "$app/navigation";
    import { imageProxyURL } from "$lib/image-proxy";
    import { instance } from "$lib/instance";
    import { isAdmin } from '$lib/components/lemmy/moderation/moderation'
    import { isBlocked, blockUser } from '$lib/lemmy/user'
    import { profile } from '$lib/auth'
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { userSettings } from '$lib/settings'
    
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import BanInstanceModal from "$lib/components/lemmy/moderation/BanInstanceModal.svelte";
    import Button from "$lib/components/input/Button.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import FormattedNumber from "$lib/components/util/FormattedNumber.svelte"
    import Modal from "$lib/components/ui/modal/Modal.svelte";
    import RelativeDate from "$lib/components/util/RelativeDate.svelte";
    import UserLink from "./UserLink.svelte";
    import UserSendMessageModal from "./UserSendMessageModal.svelte";

    import { 
        Icon,
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Envelope,
        Hashtag,
        Home,
        Newspaper,
        NoSymbol,
        PencilSquare,
        Share,
        Trash,
        User 
    } from "svelte-hero-icons";
    
    export let personDetails: GetPersonDetailsResponse|undefined
    export let open: boolean = false
    export let mod: boolean = false
    
    let banning = false
    let blocking = false
    let messaging = false
    let userBlocked = ($profile?.user && personDetails?.person_view.person) ? isBlocked($profile.user, personDetails.person_view.person.id) : false

</script>



<Modal bind:open icon={User} title="User Details" width="min-w-full sm:min-w-[25%]">
    
    <!---DM and Ban Modals Inside This Modal--->
    {#if messaging && personDetails}
    <UserSendMessageModal bind:open={messaging} bind:person={personDetails.person_view} />
    {/if}

    <!---Ban Modal--->
    {#if banning && personDetails?.person_view.person}
        <BanInstanceModal bind:open={banning} bind:user={personDetails.person_view.person} bind:banned={personDetails.person_view.person.banned} />
    {/if}
    
    <!--- User Card and Action Buttons--->
    {#if personDetails?.person_view.person}
        <Card backgroundImage={($userSettings.uiState.showBannersInCards && personDetails?.person_view.person.banner) ? imageProxyURL(personDetails.person_view.person.banner, 384, 'webp') : ''}
            class="font-normal text-slate-900 dark:text-zinc-200"
        >
            
            <div class="flex flex-row gap-1 md:gap-3 items-center p-3">
                <div class="flex-shrink-0">
                    <Avatar width={128} url={personDetails.person_view.person.avatar} alt={personDetails.person_view.person.name} />
                </div>

                <div class="flex flex-col gap-1 w-full overflow-hidden">
                    <span class="font-bold text-lg">
                        <UserLink badges user={personDetails.person_view.person} showInstance={false} href admin={personDetails.person_view.is_admin} mod={mod}/>
                    </span>

                    <span class="text-xs font-normal">@{personDetails.person_view.person.name}@{new URL(personDetails.person_view.person.actor_id).hostname}</span>
                    

                    <div class="flex flex-row mt-1">
                        
                        <div class="text-xs md:text-sm flex flex-row w-full md:w-3/4 flex-wrap gap-2 justify-between">
                            <span class="flex flex-row items-center gap-1 md:gap-2" title="Cake Day">
                                <Icon src={Cake} width={16} height={16} mini />
                                <span class="capitalize">
                                    <RelativeDate date={personDetails.person_view.person?.published}/>
                                </span>
                            </span>
                        
                            <span class="flex flex-row items-center gap-1 md:gap-2" title="Posts">
                                <Icon src={PencilSquare} width={16} height={16} mini />
                                <FormattedNumber number={personDetails.person_view.counts.post_count} />
                            </span>
                
                            <span class="flex flex-row items-center gap-1 md:gap-2" title="Comments">
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
            <Button color="tertiary-border" icon={User} alignment="left" class="w-full"
                on:click={()=> {
                    if (personDetails) goto(`/u/${personDetails.person_view.person.name}@${new URL(personDetails.person_view.person.actor_id).host}`)
                    open = false 
                }}
                >
                View Profile
            </Button>

            <!---View on Home Instance (if not same instance as current)--->
            {#if $instance != new URL(personDetails.person_view.person.actor_id).hostname}
            <Button color="tertiary-border" icon={Home} alignment="left" class="w-full" href="{personDetails.person_view.person.actor_id}" newtab={true}>
                View on User's Home Instance
            </Button>
            {/if}
            
            <!---Send Direct Message--->
            {#if $profile?.user && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
            <Button color="tertiary-border" icon={Envelope} alignment="left" class="w-full" 
                on:click={() => {
                    //open = false
                    messaging = true
                }}
            >
                Message in Lemmy
            </Button>
            {/if}

            <!---Message in Matrix--->
            {#if personDetails.person_view.person.matrix_user_id && $profile?.user && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
            <Button color="tertiary-border" icon={Hashtag} class="w-full" alignment="left" link href="https://matrix.to/#/{personDetails.person_view.person.matrix_user_id}" newtab={true}>
                Message on Matrix
            </Button>
            {/if}

            

            <!---See User's Modlog History--->
            <Button color="tertiary-border" icon={Newspaper} alignment="left" class="w-full"
                on:click={() => {
                    if (personDetails) goto(`/modlog?other_person_id=${personDetails.person_view.person.id.toString()}`)        
                    open = false
                }}
            >
                User Modlog
            </Button>

            <!---Copy Lemmyverse Link to User--->
            <Button color="tertiary-border" class="w-full" icon={Share} alignment="left"
                on:click={() => {
                    if (personDetails?.person_view.person) navigator.clipboard.writeText(`https://lemmyverse.link/u/${personDetails.person_view.person.name}@${new URL(personDetails.person_view.person.actor_id).host}`)
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
            {#if $profile?.user && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
                <Button color="tertiary-border" class="w-full" icon={NoSymbol} alignment="left" loading={blocking} disabled={blocking}
                    on:click={async () => {
                        if (personDetails?.person_view.person) {
                            blocking = true
                            userBlocked = await blockUser(personDetails.person_view.person.id, true, !userBlocked)
                            blocking = false
                        }
                    }}
                >
                    {userBlocked ? 'Unblock' : 'Block'} User
                </Button>
            {/if}
            
            <!---Ban User--->
            {#if isAdmin($profile?.user) && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
                <Button color="tertiary-border" icon={Trash} alignment="left" class="w-full" 
                    on:click={() => {
                        //open = false
                        banning=true
                    }}
                >
                    {personDetails.person_view.person.banned ? 'Unban User' : 'Ban User'}
                </Button>
            {/if}

        </div>
    {/if}
</Modal>

