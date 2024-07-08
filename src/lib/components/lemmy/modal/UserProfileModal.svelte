<script lang="ts">
    import type { GetPersonDetailsResponse, Person } from "lemmy-js-client"
    
    import { dispatchWindowEvent } from '$lib/ui/events'
    import { getClient } from "$lib/lemmy"
    import { goto } from "$app/navigation"
    import { imageProxyURL } from "$lib/image-proxy"
    import { instance } from "$lib/instance"
    import { isAdmin } from '$lib/components/lemmy/moderation/moderation'
    import { isBlocked, blockUser } from '$lib/lemmy/user'
    import { onMount } from "svelte"
    import { profile } from '$lib/auth'
    import { slide } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { userSettings } from '$lib/settings'
    
    import Avatar from "$lib/components/ui/Avatar.svelte"
    import BanInstanceModal from "$lib/components/lemmy/moderation/BanInstanceModal.svelte"
    import Button from "$lib/components/input/Button.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    import CollapseButton from "$lib/components/ui/CollapseButton.svelte"
    import CommunityLink from "../community/CommunityLink.svelte";
    import FormattedNumber from "$lib/components/util/FormattedNumber.svelte"
    import Markdown from "$lib/components/markdown/Markdown.svelte";
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    import UserLink from "../user/UserLink.svelte"
    import UserSendMessageModal from "./UserSendMessageModal.svelte"

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
    } from "svelte-hero-icons";
    
    
    export let user:Person | undefined
    export let open: boolean = false
    export let mod: boolean = false
    
    let loading = false
    let personDetails: GetPersonDetailsResponse
    let banning = false
    let blocking = false
    let messaging = false
    let mostRecentItem: string|undefined = undefined
    let userBlocked = false
    
    let accordions = {
        aboutMe: false
    }

    $: anyOpen = (accordions.aboutMe)

    onMount(async () => {
        if (!user) {
            open = false
            return
        }

        loading = true
        
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
    })


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
</script>



<Modal bind:open preventCloseOnClickOut={true} icon={UserCircle} card={false} width="max-w-xl"
    title={personDetails?.person_view?.person.display_name ?? personDetails?.person_view?.person.name ?? "Profile"}
>
    {#if loading}
        <span class="flex mx-auto my-auto">
            <Spinner width={24}/>
        </span>
    {/if}
    
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
        
        <Card backgroundImage={($userSettings.uiState.showBannersInCards && personDetails?.person_view.person.banner) ? imageProxyURL(personDetails.person_view.person.banner, undefined, 'webp') : ''} >
            <div class="flex flex-row gap-1 md:gap-3 items-center p-3">
                <div class="flex-shrink-0">
                    <Avatar width={128} fullRes ring url={personDetails.person_view.person.avatar} alt={personDetails.person_view.person.actor_id}  />
                </div>

                <div class="flex flex-col gap-1 w-full overflow-hidden">
                    <span class="font-bold text-lg">
                        <UserLink badges user={personDetails.person_view.person} showInstance={false} useDisplayNames href admin={personDetails.person_view.is_admin} mod={mod}/>
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

                            {#if mostRecentItem}
                                <span class="flex flex-row items-center gap-1 md:gap-2" title="Last Activity">
                                    <Icon src={Clock} width={16} height={16} mini />
                                    <RelativeDate date={mostRecentItem}/>
                                </span>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        <!---About Me--->
        <CollapseButton bind:expanded={accordions.aboutMe} icon={InformationCircle} title="About Me" innerClass="max-h-[45vh] overflow-y-scroll">
            <Markdown source={personDetails.person_view.person.bio ?? '*User has not provided a bio.*'} />

            <!---Communities This User Moderates--->
            {#if personDetails.moderates.length > 0}
                <span class="font-bold text-base my-2">Moderates:</span>

                {#each personDetails.moderates as community, idx }
                    <CommunityLink community={community.community} avatar on:click={() => open = false }/>
                {/each}
            {/if}
        </CollapseButton>


        <!--- Action Buttons for this User--->
        {#if !anyOpen}
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


                    <!---Go to Profle in New Tab--->
                    <Button color="tertiary-border" icon={ArrowTopRightOnSquare} size="square-md" title="Go to user's profile in new window"
                        on:click={()=> {
                            if (!personDetails) return

                            // If viewing own account go to /profile/user otherwise, goto /u/{user}@{instance}
                            if ($profile?.user?.local_user_view.person.id == personDetails.person_view.person.id) {
                                window.open('/profile/user')
                            }
                            else {    
                                window.open(`/u/${personDetails.person_view.person.name}@${new URL(personDetails.person_view.person.actor_id).host}`)
                            }
                        }}
                    />
                </div>

     

                <!---See User's Modlog History--->
                <div class="flex flex-row gap-2 items-center w-full">
                    <Button color="tertiary-border" icon={Newspaper} alignment="left" class="w-full"
                        on:click={() => {
                            if (!personDetails) return
                            goto(`/modlog?other_person_id=${personDetails.person_view.person.id.toString()}`)        
                            open = false
                        }}
                    >
                        Modlog History
                    </Button>

                    <!---Go to User Modlog in New Tab--->
                    <Button color="tertiary-border" icon={ArrowTopRightOnSquare} size="square-md" title="Open user's modlog history in new window."
                        on:click={()=> {
                            if (!personDetails) return
                            window.open(`/modlog?other_person_id=${personDetails.person_view.person.id.toString()}`)        
                        }}
                    />
                </div>
                
                <div class="flex flex-row gap-2 items-center w-full">
                    <!---Send Direct Message--->
                    {#if $profile?.user && $profile?.user?.local_user_view.person.id != personDetails.person_view.person.id}
                        <Button color="tertiary-border" icon={Envelope} alignment="left" class="w-full" 
                            on:click={() => {
                                messaging = true
                            }}
                        >
                            Send Message
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
                <div class="flex flex-row gap-2 items-center w-full">
                    <Button color="tertiary-border" class="w-full" icon={MagnifyingGlass} alignment="left"
                        on:click={() => {
                            if (!personDetails) return
                            goto(`/search?type=Users&q=${personDetails.person_view.person.name}`, {invalidateAll: true})
                            open=false
                        }}
                    >
                        Search for Alts
                    </Button>
                    
                    <!---Copy Lemmyverse Link to User--->
                    <Button color="tertiary-border" size="square-md" icon={Share} title="Copy Lemmyverse Link"
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
                    <Button color="tertiary-border" size="square-md" icon={LinkIcon} title="Copy Actor ID"
                        on:click={() => {
                            if (personDetails?.person_view.person) navigator.clipboard.writeText(personDetails.person_view.person.actor_id)
                            toast({
                                type: 'success',
                                content: `Copied actor ID to clipboard`,
                                title: 'Copied'
                            })
                            
                        }}
                    />
                </div>

                
                
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

        
    {/if}


</Modal>

