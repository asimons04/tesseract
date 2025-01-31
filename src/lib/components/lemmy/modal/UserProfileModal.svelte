<script lang="ts">
    import type { GetPersonDetailsResponse, Person } from "lemmy-js-client"
    import type { UserSubmissionFeedController } from '$lib/components/lemmy/feed/helpers'
    
    import { dispatchWindowEvent, type BanUserEvent } from '$lib/ui/events'

    import { expoIn } from "svelte/easing"
    import { getClient } from "$lib/lemmy"
    import { goto } from "$app/navigation"
    import { instance } from "$lib/instance"
    import { amModOfAny, isAdmin } from '$lib/components/lemmy/moderation/moderation'
    import { isBlocked, blockUser } from '$lib/lemmy/user'
    import { onMount } from "svelte"
    import { profile } from '$lib/auth'
    import { slide } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    
    import BanUnbanCommunityForm from "./components/BanUnbanCommunityForm.svelte"
    import BanUserForm from "./components/BanUserForm.svelte"
    import Button from "$lib/components/input/Button.svelte"
    import CollapseButton from "$lib/components/ui/CollapseButton.svelte"
    import CommunityLink from "../community/CommunityLink.svelte"
    import EmbeddableModlog from "./components/EmbeddableModlog.svelte"
    import Markdown from "$lib/components/markdown/Markdown.svelte"
    
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import ModalPanel from './components/ModalPanel.svelte'
    import ModalPanelHeading from './components/ModalPanelHeading.svelte'
    import ModalScrollArea from './components/ModalScrollArea.svelte'

    import SendDMForm from "./components/SendDMForm.svelte"
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    import UserCardSmall from "../user/UserCardSmall.svelte"
    import UserSubmissionFeed from '$lib/components/lemmy/feed/UserSubmissionFeed.svelte'

    import { 
        ArrowTopRightOnSquare,
        Envelope,
        Hashtag,
        Home,
        InformationCircle,
        Link as LinkIcon,
        MagnifyingGlass,
        Newspaper,
        NoSymbol,
        Share,
        User,
        UserCircle,
        Window as WindowIcon,
        ChevronDoubleDown,
        ChevronDoubleUp,
        ArrowPath,
        Scale,
    } from "svelte-hero-icons";
    
    export let user:Person | undefined
    export let open: boolean = false
    export let mod: boolean = false
    export let action: 'none' | 'communityBanning' | 'userDetails' | 'profile' | 'banning' | 'messaging' | 'modlog' | 'submissions'  = 'none'
    
    let loading = false
    let personDetails: GetPersonDetailsResponse
    let blocking = false
    let mostRecentItem: string|undefined = undefined
    let userBlocked = false
    let aboutMe = false
    let originalUser = user
    let userFeedControler: UserSubmissionFeedController

    let defaultWidth = 'max-w-xl'
    let modalWidth = defaultWidth

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
        action = 'none'
        modalWidth = defaultWidth
    }
  
</script>

<svelte:window on:banUser={handleBanUser} on:clickIntoPost={()=> open = false} />

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
        <span class="flex">
            <Spinner width={24} class="mx-auto my-auto"/>
        </span>
    {/if}
    

    <!---Panels--->
    {#if !loading && personDetails}

        <!---Ban/Unban User--->
        {#if action == 'banning'}
            <ModalPanel>
                <ModalPanelHeading title="{personDetails.person_view.person.banned ? 'Unban' : 'Ban'} User" on:click={()=>returnMainMenu()} />

                <ModalScrollArea>
                    <BanUserForm bind:person={personDetails.person_view.person} on:ban={() => returnMainMenu() }/>
                </ModalScrollArea>
                
            </ModalPanel>
        {/if}

        <!---Ban User from All Communities--->
        {#if action == 'communityBanning'}
            <ModalPanel>
                <ModalPanelHeading title="Ban/Unban From All My Communities" on:click={() => returnMainMenu()} />
                    <ModalScrollArea>
                        <BanUnbanCommunityForm user={personDetails.person_view.person} />
                    </ModalScrollArea>
                
            </ModalPanel>
        {/if}

        <!---Send Direct Message--->
        {#if action == 'messaging'}
            <ModalPanel>                
                <ModalPanelHeading title="Send Direct Message" on:click={()=>returnMainMenu()} />
                
                <ModalScrollArea>
                    <SendDMForm person={personDetails.person_view.person} on:sendMessage={() => returnMainMenu() }/>
                </ModalScrollArea>
            </ModalPanel>
        {/if}

        
        <!---User Bio--->
        {#if action == 'userDetails'}
            <ModalPanel>
                <ModalPanelHeading title="User Details" on:click={()=>returnMainMenu()} />
                <ModalScrollArea>
                    <Markdown source={personDetails.person_view.person.bio ?? '*User has not provided a bio.*'} />

                    <!---Communities This User Moderates--->
                    {#if personDetails.moderates.length > 0}
                        <span class="font-bold text-base my-2">Moderates:</span>

                        {#each personDetails.moderates as community, idx }
                            <CommunityLink community={community.community} avatar on:click={() => open = false }/>
                        {/each}
                    {/if}
                </ModalScrollArea>
            </ModalPanel>
        {/if}

        <!---User's Modlog History--->
        {#if action == 'modlog'}
            <ModalPanel>
                <ModalPanelHeading title="User Modlog History" on:click={()=>returnMainMenu()} />
                    <ModalScrollArea card={false}>
                        <EmbeddableModlog moderatee={personDetails.person_view.person} headingRowClass="mt-[-50px]" on:gotoFullModlog={() => open = false }/>    
                    </ModalScrollArea>
            </ModalPanel>
        {/if}

        <!---User's Submission Feed--->
        {#if action == 'submissions'}
            <ModalPanel>
                <ModalPanelHeading title="Posts/Comments" on:click={()=>returnMainMenu()} >
                    <span class="flex flex-row gap-2" slot="actions">
                        <Button size="md" color="tertiary" icon={ChevronDoubleDown} iconSize={20} on:click={()=> userFeedControler.scrollBottom()}  title="Scroll to Bottom" />
                        <Button size="md" color="tertiary" icon={ChevronDoubleUp}   iconSize={20} on:click={()=> userFeedControler.scrollTop()}     title="Scroll to Top"/>
                        <Button size="md" color="tertiary" icon={ArrowPath}         iconSize={20} on:click={()=> userFeedControler.refresh(true)}   title="Refresh"/>
                    </span>
                </ModalPanelHeading>
                
                <ModalScrollArea card={false}>
                    <UserSubmissionFeed 
                        bind:controller={userFeedControler} 
                        person_name="{personDetails.person_view.person.name}@{new URL(personDetails.person_view.person.actor_id).hostname}" 
                        inModal={true} 
                    />
                </ModalScrollArea>
            </ModalPanel>
        {/if}

        <!---Main Menu--->
        {#if action == 'none'}
            <ModalPanel>
                <ModalScrollArea card={false}>
                    <!--- User Card and Action Buttons--->
                    <UserCardSmall person_view={personDetails.person_view} blocked={userBlocked} mod={mod} {mostRecentItem} href 
                        on:clickUserLink={() => open = false }
                    />

                    <!---About Me--->
                    <CollapseButton bind:expanded={aboutMe} icon={InformationCircle} title="About Me" innerClass="max-h-[45vh] overflow-y-scroll">
                        <Markdown source={personDetails.person_view.person.bio ?? '*User has not provided a bio.*'} />

                        <!---Communities This User Moderates--->
                        {#if personDetails.moderates.length > 0}
                            <span class="font-bold text-base my-2">Moderates:</span>

                            {#each personDetails.moderates as community, idx }
                                <CommunityLink community={community.community} avatar on:click={() => open = false }/>
                            {/each}
                        {/if}
                    </CollapseButton>

                    {#if !aboutMe}
                   
                        <!--- Action Buttons for this User--->
                        <div class="flex flex-col gap-2 mt-0 px-4 w-full items-center" transition:slide={{easing:expoIn}}>
                        
                            <!---View User's Profile--->
                            <div class="flex flex-row gap-2 items-center w-full">
                                <Button color="tertiary-border" icon={User} iconSize={20} alignment="left" class="w-full"
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
                                    <Button color="tertiary-border" icon={Home} iconSize={20} size="square-md" title="View on User's Home Instance"
                                        href="{personDetails.person_view.person.actor_id}" newtab={true}
                                    />
                                {/if}
                            </div>

                            <!---View Submissions--->
                            <Button color="tertiary-border" icon={WindowIcon} iconSize={20} alignment="left" class="w-full"
                                on:click={() => {
                                    if (!personDetails) return
                                    modalWidth = "max-w-4xl"
                                    action = 'submissions'
                                }}
                            >
                                View History...
                            </Button>
                

                            <!---See User's Modlog History--->
                            <Button color="tertiary-border" icon={Newspaper} iconSize={20} alignment="left" class="w-full"
                                on:click={() => {
                                    if (!personDetails) return
                                    action = 'modlog'
                                    modalWidth = "max-w-4xl"
                                    
                                }}
                            >
                                Modlog History...
                            </Button>
                        
                            <div class="flex flex-row gap-2 items-center w-full">
                                <!---Send Direct Message--->
                                {#if $profile?.user && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
                                    <Button color="tertiary-border" icon={Envelope} iconSize={20} alignment="left" class="w-full" disabled={personDetails.person_view.person.banned}
                                        on:click={() => {
                                            action='messaging'
                                            modalWidth="max-w-4xl"
                                        }}
                                    >
                                        Send Message...
                                    </Button>

                                    <!---Message in Matrix--->
                                    {#if personDetails.person_view.person.matrix_user_id && !personDetails.person_view.person.banned}
                                        <Button color="tertiary-border" icon={Hashtag} iconSize={20} size="square-md" link title="Message on Matrix"
                                            href="https://matrix.to/#/{personDetails.person_view.person.matrix_user_id}" newtab={true}
                                        />
                                    {/if}
                                {/if}
                            </div>

                        

                        
                            <!---Search for Alts, Copy Lemmyverse and Actor ID Links--->
                            <Button color="tertiary-border" class="w-full" icon={MagnifyingGlass} iconSize={20} alignment="left"
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
                                <Button color="tertiary-border" class="w-full" icon={NoSymbol} iconSize={20} alignment="left" loading={blocking} disabled={blocking}
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
                        
                            <!---Ban User From All Communities--->
                            {#if $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id && amModOfAny($profile?.user)}
                            <Button color="tertiary-border" icon={Scale} iconSize={20} alignment="left" class="w-full" 
                                on:click={() => {
                                    action = 'communityBanning'
                                    modalWidth = 'max-w-3xl'
                                }}
                            >
                                Ban/Unban All My Communities...
                            </Button>
                            {/if}

                            <!---Ban User--->
                            {#if isAdmin($profile?.user) && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
                                <Button color="tertiary-border" icon={NoSymbol} iconSize={20} alignment="left" class="w-full" 
                                    on:click={() => {
                                        action = 'banning'
                                        modalWidth = 'max-w-3xl'
                                    }}
                                >
                                    {personDetails.person_view.person.banned ? 'Unban User' : 'Ban User'}...
                                </Button>
                            {/if}

                        </div>
                    {/if}
                </ModalScrollArea>
            </ModalPanel>
        
        {/if}

    {/if}
</Modal>

