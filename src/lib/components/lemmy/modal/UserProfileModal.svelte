<script lang="ts">
    import type { GetPersonDetailsResponse, Person } from "lemmy-js-client"

    import { dispatchWindowEvent, type BanUserEvent } from '$lib/ui/events'

    import { getClient } from "$lib/lemmy"
    import { goto } from "$app/navigation"
    import { instance } from "$lib/instance"
    import { ban, isAdmin } from '$lib/components/lemmy/moderation/moderation'
    import { isBlocked, blockUser } from '$lib/lemmy/user'
    import { onMount } from "svelte"
    import { profile } from '$lib/auth'
    import { slide } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    
    import BanUserForm from "./components/BanUserForm.svelte"
    import Button from "$lib/components/input/Button.svelte"
    import CommunityLink from "../community/CommunityLink.svelte";
    import EmbeddableModlog from "./components/EmbeddableModlog.svelte"
    import Markdown from "$lib/components/markdown/Markdown.svelte";
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import SendDMForm from "./components/SendDMForm.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    import UserCardSmall from "../user/UserCardSmall.svelte";

    import { 
        Icon,
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Clock,
        Envelope,
        Hashtag,
        Home,
        InformationCircle,
        Link as LinkIcon,
        MagnifyingGlass,
        Newspaper,
        NoSymbol,
        PencilSquare,
        Share,
        Trash,
        User,
        UserCircle,
        ArrowTopRightOnSquare,
        ArrowLeft, 
    } from "svelte-hero-icons";
    import Card from "$lib/components/ui/Card.svelte";
    
    
    
    
    export let user:Person | undefined
    export let open: boolean = false
    export let mod: boolean = false
    
    let loading = false
    let personDetails: GetPersonDetailsResponse
    let blocking = false
    let messaging = false
    let mostRecentItem: string|undefined = undefined
    let userBlocked = false
    
    let aboutMe = false
    let originalUser = user
    
    let defaultWidth = 'max-w-xl'
    let modalWidth = defaultWidth

    let action: 'none' | 'userDetails' | 'profile' | 'banning' | 'messaging' | 'modlog' = 'none'

    $:  if (originalUser != user) {
        originalUser = user
        loadDetails()
    }
    
    onMount(async () => loadDetails())
        
    async function loadDetails() {
        if (!user) {
            open = false
            return
        }

        loading = true
        aboutMe = false
        
        try {
            personDetails = await getClient().getPersonDetails({
                username: `${user.name}@${new URL(user.actor_id).hostname}`,
                limit: 1,
                sort: 'New'

            })
            userBlocked = ($profile?.user && personDetails?.person_view.person) 
                ? isBlocked($profile.user, personDetails.person_view.person.id) 
                : false
            mostRecentItem = lastActivity()
        }
        catch {
            toast({
                type: 'error',
                title: 'Error',
                content: 'Failed to fetch data for that user'
            })
            open = false
        }
        finally {
            loading = false
        }
    }


    /** Returns the date of the most recent post or comment or undefined if no submissions */
    function lastActivity() {
        let latestPost: string | undefined = undefined
        let latestComment: string | undefined = undefined
    
        if ((personDetails?.comments?.length ?? 0) > 0) latestComment = personDetails?.comments[0].comment.published
        if ((personDetails?.posts?.length ?? 0) > 0) latestPost = personDetails?.posts[0].post.published

        if (latestPost && latestComment) {
            return Date.parse(latestPost) > Date.parse(latestComment)
                ? latestPost
                : latestComment
        }

        if (latestPost && !latestComment) return latestPost
        if (latestComment && !latestPost) return latestComment

        return undefined
    }
    
    function handleBanUser(e:BanUserEvent) {
        if (e.detail.person_id == personDetails?.person_view.person.id) {
            personDetails.person_view.person.banned = e.detail.banned
        }
    }

    // Returns the modal to the main menu
    function returnMainMenu() {
        modalWidth = defaultWidth
        action = 'none'
    }
  
</script>

<svelte:window on:banUser={handleBanUser} />

<Modal bind:open preventCloseOnClickOut={true} icon={UserCircle} card={false} width={modalWidth}
    title={personDetails?.person_view?.person.display_name ?? personDetails?.person_view?.person.name ?? "Profile"}
>

    <!---Title Bar Buttons--->
    <div class="flex flex-row gap-2 items-center" slot="title-bar-buttons">
        <span class="ml-auto" />
        
        {#if personDetails}
            <!---Copy Lemmyverse Link--->
            <Button color="tertiary" size="square-lg" icon={Share} iconSize={20} title="Copy Lemmyverse Link"
                on:click={() => {
                    if (personDetails?.person_view.person) navigator.clipboard.writeText(`https://lemmyverse.link/u/${personDetails.person_view.person.name}@${new URL(personDetails.person_view.person.actor_id).host}`)
                    toast({
                        type: 'success',
                        content: `Copied Lemmyverse link to clipboard`,
                        title: 'Copied'
                    })
                    
                }}
            />

            <!--- Copy Actor ID--->
            <Button color="tertiary" size="square-lg" icon={LinkIcon} iconSize={20} title="Copy Actor ID"
                on:click={() => {
                    if (personDetails?.person_view.person) navigator.clipboard.writeText(personDetails.person_view.person.actor_id)
                    toast({
                        type: 'success',
                        content: `Copied actor ID to clipboard`,
                        title: 'Copied'
                    })
                    
                }}
            />
            
            <!---Go to Profile Page--->
            <Button color="tertiary" icon={ArrowTopRightOnSquare} iconSize={20} size="square-lg" title="Go to User's Profile"
                on:click={()=> {
                    if (!personDetails) return

                    // If viewing own account go to /profile/user otherwise, goto /u/{user}@{instance}
                    if ($profile?.user?.local_user_view.person.id == personDetails.person_view.person.id) {
                        goto('/profile/user')
                        open = false
                    }
                    else {    
                        goto(`/u/${personDetails.person_view.person.name}@${new URL(personDetails.person_view.person.actor_id).host}`)
                        open = false
                    }
                }}
            />
        {/if}
    </div>
    
    <!---Loading Spinner--->
    {#if loading}
        <span class="flex mx-auto my-auto">
            <Spinner width={24}/>
        </span>
    {/if}
    
    {#if !loading && personDetails}
    
    
        <!---Ban User--->
        {#if action == 'banning'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>     
                    
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={(e)=> {
                            e.preventDefault()
                            e.stopPropagation()
                            returnMainMenu() 
                        }}
                    />
                    <div class="flex flex-row w-full justify-between">
                        <span class="text-lg">
                            Ban User
                        </span>
                    </div>
                </div>
                <Card class="flex flex-col p-4">
                    <BanUserForm bind:person={personDetails.person_view.person} on:ban={() => returnMainMenu() }/>
                </Card>
                
            </div>
        {/if}

        <!---DM and Ban Modals Inside This Modal--->
        {#if action == 'messaging'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>     
                
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={(e)=> {
                            e.preventDefault()
                            e.stopPropagation()
                            returnMainMenu() 
                        }}
                    />
                    <div class="flex flex-row w-full justify-between">
                        <span class="text-lg">
                            Send Direct Message
                        </span>
                    </div>
                </div>
                <Card class="flex flex-col p-4">
                    <SendDMForm person={personDetails.person_view.person} on:sendMessage={() => returnMainMenu() }/>
                </Card>
            </div>
        {/if}

        
        <!---User Bio--->
        {#if action == 'userDetails'}
        <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>     
                
            <!---Section Header--->
            <div class="flex flex-row gap-4 items-center">
                <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                    on:click={(e)=> {
                        e.preventDefault()
                        e.stopPropagation()
                        returnMainMenu() 
                    }}
                />
                <div class="flex flex-row w-full justify-between">
                    <span class="text-lg">
                        User Details
                    </span>
                </div>
            </div>
            
            <Markdown source={personDetails.person_view.person.bio ?? '*User has not provided a bio.*'} />
        </div>

            <!---Communities This User Moderates--->
            {#if personDetails.moderates.length > 0}
                <span class="font-bold text-base my-2">Moderates:</span>

                {#each personDetails.moderates as community, idx }
                    <CommunityLink community={community.community} avatar on:click={() => open = false }/>
                {/each}
            {/if}
        {/if}

        <!---User's Modlog History--->
        {#if action == 'modlog'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>     
        
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={(e)=> {
                            e.preventDefault()
                            e.stopPropagation()
                            returnMainMenu() 
                        }}
                    />
                    <div class="flex flex-row w-full justify-between">
                        <span class="text-lg">
                            Modlog
                        </span>
                    </div>
                </div>
                
                <EmbeddableModlog moderatee={personDetails.person_view.person} headingRowClass="mt-[-50px]" on:gotoFullModlog={() => open = false }/>    
            </div>
        
        {/if}


        {#if action == 'none'}
            <!--- User Card and Action Buttons--->
            <UserCardSmall person_view={personDetails.person_view} blocked={userBlocked} mod={mod} {mostRecentItem} href 
                on:clickUserLink={() => open = false }
            />

            <span class="mt-2"/>

            <!--- Action Buttons for this User--->
        
            <div class="flex flex-col gap-2 mt-0 px-4 w-full items-center" transition:slide>
                
                <!---View User's Profile--->
                <div class="flex flex-row gap-2 items-center w-full">
                    <Button color="tertiary-border" icon={User} alignment="left" class="w-full"
                        on:click={()=> {
                            if (!personDetails) return

                            // If viewing own account go to /profile/user otherwise, goto /u/{user}@{instance}
                            if ($profile?.user?.local_user_view.person.id == personDetails.person_view.person.id) {
                                goto ('/profile/user')
                                open = false
                            }
                            else {    
                                goto(`/u/${personDetails.person_view.person.name}@${new URL(personDetails.person_view.person.actor_id).host}`)
                                open = false
                            }
                        }}
                    >
                        Go to Profile
                    </Button>

                    <!---View on Home Instance (if not same instance as current)--->
                    {#if $instance != new URL(personDetails.person_view.person.actor_id).hostname}
                        <Button color="tertiary-border" icon={Home} size="square-md" title="View on User's Home Instance"
                            href="{personDetails.person_view.person.actor_id}" newtab={true}
                        />
                    {/if}
                </div>

    

                <!---See User's Modlog History--->
                <Button color="tertiary-border" icon={Newspaper} alignment="left" class="w-full"
                    on:click={() => {
                        if (!personDetails) return
                        modalWidth = "max-w-3xl"
                        action = 'modlog'
                    }}
                >
                    Modlog History...
                </Button>
                
                <div class="flex flex-row gap-2 items-center w-full">
                    <!---Send Direct Message--->
                    {#if $profile?.user && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
                        <Button color="tertiary-border" icon={Envelope} alignment="left" class="w-full" 
                            on:click={() => {
                                modalWidth="max-w-3xl"
                                action='messaging'
                            }}
                        >
                            Send Message...
                        </Button>

                        <!---Message in Matrix--->
                        {#if personDetails.person_view.person.matrix_user_id}
                            <Button color="tertiary-border" icon={Hashtag} size="square-md" link title="Message on Matrix"
                                href="https://matrix.to/#/{personDetails.person_view.person.matrix_user_id}" newtab={true}
                            />
                        {/if}
                    {/if}
                </div>

                

                
                <!---Search for Alts, Copy Lemmyverse and Actor ID Links--->
                <Button color="tertiary-border" class="w-full" icon={MagnifyingGlass} alignment="left"
                    on:click={() => {
                        if (!personDetails) return
                        goto(`/search?type=Users&q=${personDetails.person_view.person.name}`, {invalidateAll: true})
                        open=false
                    }}
                >
                    Search for Alts
                </Button>
                
                
                <!---Block User--->
                {#if $profile?.user && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
                    <Button color="tertiary-border" class="w-full" icon={NoSymbol} alignment="left" loading={blocking} disabled={blocking}
                        on:click={async () => {
                            if (personDetails?.person_view.person) {
                                blocking = true
                                userBlocked = await blockUser(personDetails.person_view.person.id, true, !userBlocked)
                                
                                dispatchWindowEvent('blockUser', { 
                                    person_id: personDetails.person_view.person.id,
                                    blocked: userBlocked
                                })
                                blocking = false
                            }
                        }}
                    >
                        {userBlocked ? 'Unblock' : 'Block'} User
                    </Button>
                {/if}
                
                <!---Ban User--->
                {#if isAdmin($profile?.user) && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
                    <Button color="tertiary-border" icon={NoSymbol} alignment="left" class="w-full" 
                        on:click={() => {
                            //open = false
                            //ban(personDetails.person_view.person.banned, personDetails.person_view.person)
                            modalWidth = 'max-w-3xl'
                            action = 'banning'
                        }}
                    >
                        {personDetails.person_view.person.banned ? 'Unban User' : 'Ban User'}...
                    </Button>
                {/if}

                

            </div>
        
        {/if}

            

    {/if}
</Modal>

