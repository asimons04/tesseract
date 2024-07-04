<script lang="ts">
    import type { Community, GetCommunityResponse } from "lemmy-js-client"
    
    
    import {addFavorite, isFavorite } from '$lib/favorites'
    import { 
        blockUnblockCommunity, 
        communityIsBlocked,
        createPost, 
        subscribe 
    } from '$lib/components/lemmy/community/helpers'
    import { getClient } from "$lib/lemmy"
    import { goto } from "$app/navigation"
    import { imageProxyURL } from "$lib/image-proxy"
    import { instance } from "$lib/instance"
    import { isAdmin, userProfileModal } from '$lib/components/lemmy/moderation/moderation'
    import { onMount } from "svelte";
    import { profile } from '$lib/auth'
    import { slide } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { userSettings } from '$lib/settings'
    
    import Avatar from "$lib/components/ui/Avatar.svelte"
    import Button from "$lib/components/input/Button.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    import CollapseButton from "$lib/components/ui/CollapseButton.svelte"
    import CommunityLink from "../community/CommunityLink.svelte"
    import FormattedNumber from "$lib/components/util/FormattedNumber.svelte"
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"

    import { 
        Icon,
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Clock,
        Envelope,
        Hashtag,
        Home,
        Link as LinkIcon,
        Newspaper,
        NoSymbol,
        PencilSquare,
        Share,
        Trash,
        User, 
        MagnifyingGlass,
        InformationCircle,
        HandRaised,
        UserGroup,
        Star,
        Minus,
        Rss,
    } from "svelte-hero-icons";
    import Markdown from "$lib/components/markdown/Markdown.svelte";
    import UserLink from "../user/UserLink.svelte";
    
    
    
    export let community: Community | undefined
    export let open: boolean = false
    
    let loading = false
    let blocking = false
    let communityDetails: GetCommunityResponse
    let accordions = {
        communityDetails: false,
        moderators: false
    }

    $: anyOpen = (accordions.communityDetails || accordions.moderators)
    $: subscribed = (communityDetails?.community_view?.subscribed && ['Subscribed', 'Pending'].includes(communityDetails.community_view.subscribed)) ?? false
    $: isFavorited = (communityDetails?.community_view?.subscribed && isFavorite(communityDetails.community_view.community)) ?? false
    $: communityBlocked = ($profile?.user && communityDetails?.community_view?.community) 
            ? communityIsBlocked($profile.user, communityDetails.community_view.community.id) 
            : false


    onMount(async () => {
        if (!community) {
            open = false
            return
        }

        loading = true
        
        try {
            communityDetails = await getClient().getCommunity({
                id: community.id
            })
        }
        catch {
            toast({
                type: 'error',
                title: 'Error',
                content: 'Failed to fetch data for that community.'
            })
            open = false
        }
        finally {
            loading = false
        }
    })
</script>

<Modal bind:open preventCloseOnClickOut={true} icon={UserGroup} card={false} title="Community Details" width="max-w-xl">
    {#if loading}
        <span class="flex mx-auto my-auto">
            <Spinner width={24}/>
        </span>
    {/if}

    {#if communityDetails?.community_view}
        <Card backgroundImage={($userSettings.uiState.showBannersInCards && communityDetails?.community_view.community.banner) ? imageProxyURL(communityDetails?.community_view.community.banner, undefined, 'webp') : ''} >
            <div class="flex flex-row gap-1 md:gap-3 items-center p-3">
                <div class="flex-shrink-0">
                    <Avatar width={128} fullRes ring url={communityDetails.community_view.community.icon} alt={communityDetails.community_view.community.actor_id}  />
                </div>

                <div class="flex flex-col gap-1 w-full overflow-hidden">
                    <span class="font-bold text-lg">
                        <CommunityLink name href useDisplayNames showInstance={false} community={communityDetails.community_view.community} />
                    </span>

                    <span class="text-xs font-normal">
                        @{communityDetails.community_view.community.name}@{new URL(communityDetails.community_view.community.actor_id).hostname}
                    </span>
                    

                    <div class="flex flex-row mt-1">
                        
                        <div class="text-xs md:text-sm flex flex-row w-full md:w-3/4 flex-wrap gap-2 justify-between">
                            <span class="flex flex-row items-center gap-1 md:gap-2" title="Cake Day">
                                <Icon src={Cake} width={16} height={16} mini />
                                <span class="capitalize">
                                    <RelativeDate date={communityDetails.community_view.community.published}/>
                                </span>
                            </span>
                        
                            <span class="flex flex-row items-center gap-1 md:gap-2" title="Posts">
                                <Icon src={PencilSquare} width={16} height={16} mini />
                                <FormattedNumber number={communityDetails.community_view.counts.posts} />
                            </span>
                
                            <span class="flex flex-row items-center gap-1 md:gap-2" title="Comments">
                                <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                                <FormattedNumber number={communityDetails.community_view.counts.comments} />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        <span class="mt-2" />
        
        <div class="flex flex-col gap-2 w-full">
            
            
            <!--- Action Buttons for this Community (Fade away if any of the accordions are open)--->
            {#if !anyOpen}
                <div class="flex flex-col gap-2 mt-4 px-8 w-full items-center" transition:slide>
                
                    <!---Go to Community--->
                    {#if !communityBlocked}
                        <Button color="tertiary-border" icon={UserGroup} alignment="left" class="w-full"
                            on:click={()=> {
                                goto(`/c/${communityDetails.community_view.community.name}@${new URL(communityDetails.community_view.community.actor_id).hostname}`)
                                open = false
                            }}
                        >
                            Browse Community
                        </Button>
                    {/if}


                    <!---Create Post--->
                    {#if $profile?.user && !communityBlocked}
                        <Button color="tertiary-border" icon={PencilSquare} alignment="left" class="w-full"
                            on:click={()=> {
                                createPost(communityDetails.community_view.community) 
                                open = false
                            }}
                        >
                            Create Post
                        </Button>
                    {/if}

                    <!---Modlog--->
                    <Button color="tertiary-border" icon={Newspaper} alignment="left" class="w-full"
                        on:click={()=> {
                            goto(`/modlog?community=${communityDetails.community_view.community.id.toString()}`)
                            open = false
                        }}
                    >
                        Modlog
                    </Button>

                    <!---Add To Favorites--->
                    {#if $profile?.user}

                        {#if !communityBlocked}    
                            <Button color="tertiary-border" icon={Star} alignment="left" class="w-full"
                                on:click={()=> {
                                    isFavorited = !isFavorited
                                    addFavorite(communityDetails.community_view.community, isFavorited)
                                }}
                            >
                                {isFavorited ? 'Un-Favorite Community' : 'Favorite Community'}
                            </Button>
                        
                            <!---Unsubscribe--->
                            <Button color="tertiary-border" icon={subscribed ? Minus : Rss} alignment="left" class="w-full"
                                on:click={async () => {
                                    subscribed = await subscribe(communityDetails.community_view.community, subscribed)
                                    subscribed = subscribed
                                    communityDetails.community_view.subscribed = subscribed
                                        ? 'Subscribed'
                                        : 'NotSubscribed'
                                }}
                            >
                                {subscribed ? 'Unsubscribe' : 'Subscribe'}
                            </Button>
                        {/if}

                        <!---Block Community--->
                        <Button color="tertiary-border" icon={NoSymbol} alignment="left" class="w-full" loading={blocking}
                            on:click={async ()=> {
                                blocking = true
                                communityBlocked = await blockUnblockCommunity(communityDetails.community_view.community.id, !communityBlocked)
                                
                                if (communityBlocked) {
                                    // If community is blocked, remove it from favorites and mark subscribed as false since the API
                                    // will unsubscribe you as part of the block procedure.
                                    subscribed = false
                                    
                                    if (isFavorited) {
                                        addFavorite(communityDetails.community_view.community, false)
                                        isFavorited = false
                                    }
                                }
                                blocking = false
                            }}
                        >
                            {communityBlocked ? 'Unblock' : 'Block'} Community
                        </Button>

                        
                    {/if}
                </div>
            {/if}

            <!---Community Description--->
            <CollapseButton bind:expanded={accordions.communityDetails} icon={InformationCircle} title="Community Details" innerClass="max-h-[45vh] overflow-y-scroll">
                <Markdown source={communityDetails.community_view.community.description ?? '*No community details were provided.*'} />
            </CollapseButton>

            <!---Moderators---->
            {#if communityDetails.moderators.length > 0}
                <CollapseButton bind:expanded={accordions.moderators} icon={HandRaised} title="Moderators" innerClass="max-h-[45vh] overflow-y-scroll">
                    {#each communityDetails.moderators as moderator, idx }
                        <UserLink user={moderator.moderator} avatar={true} badges={false} showInstance={true} />
                    {/each}
                </CollapseButton>
            {/if}


        </div>



    {/if}

</Modal>