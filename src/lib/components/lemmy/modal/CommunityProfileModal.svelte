<script lang="ts">
    import type { Community, GetCommunityResponse } from "lemmy-js-client"
    
    
    import {addFavorite, isFavorite } from '$lib/favorites'
    import { 
        blockUnblockCommunity, 
        communityIsBlocked,
        createPost, 
        shortenCommunityName,
        subscribe 
    } from '$lib/components/lemmy/community/helpers'
    
    import { dispatchWindowEvent } from '$lib/ui/events'
    import { fullCommunityName } from "$lib/util";
    import { getClient, hideCommunity } from "$lib/lemmy"
    import { goto } from "$app/navigation"
    import { imageProxyURL } from "$lib/image-proxy"
    import { instance } from "$lib/instance"
    import { amMod, isAdmin } from '$lib/components/lemmy/moderation/moderation'
    import { onMount } from "svelte";
    import { profile } from '$lib/auth'
    import { slide } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { userSettings } from '$lib/settings'
    
    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
    import Avatar from "$lib/components/ui/Avatar.svelte"
    import Button from "$lib/components/input/Button.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    import CollapseButton from "$lib/components/ui/CollapseButton.svelte"
    import CommunityLink from "../community/CommunityLink.svelte"
    import FormattedNumber from "$lib/components/util/FormattedNumber.svelte"
    import Markdown from "$lib/components/markdown/Markdown.svelte";
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    import UserLink from "../user/UserLink.svelte";
    
    import { 
        Icon,
        ArrowTopRightOnSquare,
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
        UserGroup,
        Star,
        Minus,
        Rss,
        Cog6Tooth,
        EyeSlash,
        ArrowLeft,
        Check,
        Eye,
    } from "svelte-hero-icons";
    import MarkdownEditor from "$lib/components/markdown/MarkdownEditor.svelte";
    import PostForm from "../post/PostForm.svelte";
    
    
    export let community: Community | undefined
    export let open: boolean = false
    
    
    let loading = false
    let blocking = false
    let removing = false

    let communityDetails: GetCommunityResponse
    let communityGroupModal = false
    let communityDetailsOpen = false
    

    let action: 'none' | 'communityDetails' | 'removing' | 'hiding' | 'createPost' = 'none'
    let defaultWidth = 'max-w-xl'
    let modalWidth = defaultWidth

    // Reactive hack (rather than just monitoring community directly) since updating the modal store changes the community (though back to its original value)
    // and causes the loader to re-run needlessly.

    let originalCommunity = community
    $:  if (originalCommunity != community) {
        originalCommunity = community
        loadDetails()
    }
    $: subscribed = (communityDetails?.community_view?.subscribed && ['Subscribed', 'Pending'].includes(communityDetails.community_view.subscribed)) ?? false
    $: isFavorited = (communityDetails?.community_view?.subscribed && isFavorite(communityDetails.community_view.community)) ?? false
    $: communityBlocked = ($profile?.user && communityDetails?.community_view?.community) 
            ? communityIsBlocked($profile.user, communityDetails.community_view.community.id) 
            : false


    onMount(async () => await loadDetails() )
        
    async function loadDetails() {
        if (!community) {
            open = false
            return
        }
        
        communityDetailsOpen = false
        loading = true

        try {
            communityDetails = await getClient().getCommunity({
                name: `${community.name}@${new URL(community.actor_id).hostname}`
            })
        }
        catch {
            try {
                // Only resolve if logged in
                if ($profile?.user) {
                    let resolve = await getClient().resolveObject({
                        q: `!${community.name}@${new URL(community.actor_id).hostname}`
                    })
                
                    // Re-fetch after resolve
                    communityDetails = await getClient().getCommunity({
                        name: `${community.name}@${new URL(community.actor_id).hostname}`
                    })
                }
                else {
                    toast({
                        type: 'warning',
                        title: 'Unauthenticated',
                        content: 'Must be logged in to resolve an unknown community.'
                    })
                    open = false
                }
            }
            catch { 
                toast({
                    type: 'error',
                    title: 'Error',
                    content: 'Failed to fetch data for that community.'
                })
                open = false
            }
        }
        finally {
            loading = false
        }
    }



    let remove = {
        removing: false,
        reason: undefined,
        remove: async function () {
            if (!$profile?.jwt) return
            
            remove.removing = true
            
            const removed = communityDetails.community_view.community.removed

            try {
                await getClient().removeCommunity({
                    community_id: communityDetails.community_view.community.id,
                    removed: !removed,
                    reason: remove.reason
                })
                communityDetails.community_view.community.removed = !removed

                dispatchWindowEvent('removeCommunity', {
                    community_id: communityDetails.community_view.community.id,
                    removed: communityDetails.community_view.community.removed
                })
                
                remove.reset()
                returnMainMenu()

            } catch (error) {
                toast({ content: error as any, type: 'error' })
            }
            remove.removing = false
        },
        reset: function () {
            remove.removing = false
            remove.reason = undefined
        }
    }

    let hide = {
        reason: undefined,
        hiding: false,

        hide: async function () {
            if (!$profile?.jwt) return
            
            hide.hiding = true
            
            const hidden = communityDetails.community_view.community.hidden;
            try {
                await getClient().hideCommunity({
                    community_id: communityDetails.community_view.community.id,
                    hidden: !hidden,
                    reason: hide.reason
                })

                communityDetails.community_view.community.hidden = !hidden

                dispatchWindowEvent('hideCommunity', {
                    community_id: communityDetails.community_view.community.id,
                    hidden: communityDetails.community_view.community.hidden
                })

                hide.reset()

            } catch (error) {
                toast({content: error as any, type: 'error'})
            }
            hide.hiding = false
        },
        
        reset: function() {
            hide.hiding = false,
            hide.reason = undefined
        }
    }


    // Returns the modal to the main menu
    function returnMainMenu() {
        modalWidth = defaultWidth
        action = 'none'
    }
</script>

<Modal bind:open preventCloseOnClickOut={true} icon={UserGroup} card={false} width={modalWidth}
    capitalizeTitle={true}
    title={
        shortenCommunityName(communityDetails?.community_view?.community?.title, 45) ?? 
        communityDetails?.community_view?.community?.name ?? 
        'Community Details'
    }
>

    {#if loading}
        <span class="flex mx-auto my-auto">
            <Spinner width={24}/>
        </span>
    {/if}

    {#if !loading && communityDetails?.community_view}
        <AddCommunityGroup bind:open={communityGroupModal} community={communityDetails.community_view.community} />

        
        <!---Community Details Panel--->
        {#if action == 'communityDetails'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>
                    
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={()=> returnMainMenu()}  
                    />
                    <span class="text-lg">
                        Community Details
                    </span>
                </div>
                

                <!---Remove/Purge/Restore Form--->
                <Card class="flex flex-col p-4 max-h-[50vh] overflow-y-auto">
                    <!---Community details/sidebar info--->
                    <Markdown source={communityDetails.community_view.community.description ?? '*No community details were provided.*'}/>

                    <!---Moderators---->
                    {#if communityDetails.moderators.length > 0}
                        <span class="font-bold text-base my-2">Moderators:</span>
                        <span class="flex flex-col gap-2 w-full">
                            {#each communityDetails.moderators as moderator, idx }
                                <UserLink user={moderator.moderator} avatar={true} badges={false} showInstance={true} />
                            {/each}
                        </span>
                    {/if}
                </Card>
            </div>
        {/if}

        <!---Remove Community Panel--->
        {#if action == 'removing'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>
                
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={()=> returnMainMenu()}  
                    />
                    <span class="text-lg">
                        {communityDetails.community_view.community.removed ? 'Restore' : 'Remove'} Community
                    </span>
                </div>
                

                <!---Remove/Purge/Restore Form--->
                <Card class="flex flex-col p-4 max-h-[50vh] overflow-y-auto">
                    <form class="flex flex-col gap-4 list-none" on:submit|preventDefault={remove.remove}>
                        <MarkdownEditor rows={6} previewButton images={false} label="Reason" placeholder="Optional" bind:value={remove.reason}>
                            <Button 
                                color={communityDetails.community_view.community.removed ? 'primary' : 'danger'} 
                                icon={communityDetails.community_view.community.removed ? Check : Trash}
                                iconSize={16}
                                size="lg" 
                                loading={remove.removing} 
                                disabled={remove.removing} 
                                submit 
                                slot="actions"
                            >
                                { communityDetails.community_view.community.removed ? 'Restore' : 'Remove' }
                            </Button>
                        </MarkdownEditor>
                    </form>
                </Card>
            </div>
        {/if}

        <!---Hiding Community--->
        {#if action == 'hiding'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>
                    
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={()=> returnMainMenu()}  
                    />
                    <span class="text-lg">
                        {communityDetails.community_view.community.hidden ? 'Restore' : 'Hide'} Community
                    </span>
                </div>
                

                <!---Remove/Purge/Restore Form--->
                <Card class="flex flex-col p-4 max-h-[50vh] overflow-y-auto">
                    <form class="flex flex-col gap-4 list-none" on:submit|preventDefault={hide.hide}>
                        <MarkdownEditor rows={6} previewButton images={false} label="Reason" placeholder="Optional" bind:value={hide.reason}>
                            <Button 
                                color={communityDetails.community_view.community.hidden ? 'primary' : 'danger'} 
                                icon={communityDetails.community_view.community.hidden ? Eye : EyeSlash}
                                iconSize={16}
                                size="lg" 
                                loading={hide.hiding} 
                                disabled={hide.hiding} 
                                submit 
                                slot="actions"
                            >
                                { communityDetails.community_view.community.hidden ? 'Restore' : 'Hide' }
                            </Button>
                        </MarkdownEditor>
                    </form>
                </Card>
            </div>
        {/if}

        <!---Create Post Form--->
        {#if action == 'createPost'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>
                        
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={()=> returnMainMenu()}  
                    />
                    <span class="text-lg">
                        Create Post in {communityDetails.community_view.community.title ?? communityDetails.community_view.community.name}
                    </span>
                    
                    <span class="ml-auto"/>
                    
                    <Button size="square-lg" color="tertiary-border" icon={ArrowTopRightOnSquare} iconSize={24}
                        on:click={() => { 
                            createPost(communityDetails.community_view.community) 
                            open=false
                        }}
                    />
                </div>
        
                <PostForm bind:community={communityDetails.community_view.community} hideCommunityInput={true} inModal editing={false}
                    on:submit={(e) => goto(`/post/${e.detail.post.id}`)}
                />
            </div>
        {/if}

        <!---Main Menu--->
        {#if action == 'none'}
            
            <!---Quick Actions--->
            <div class="flex flex-row gap-2 px-8 w-full items-center">
                <span class="ml-auto"/>
                
                {#if $profile?.user && !communityBlocked}
                    <!---Favorite Community--->
                    <Button color="tertiary-border" icon={Star} iconSize={24} size="square-lg" 
                        title="{isFavorited ? 'Un-Favorite' : 'Favorite'} Community"
                        iconClass="{isFavorited ? 'text-amber-500' : ''}" 
                        on:click={()=> {
                            isFavorited = !isFavorited
                            addFavorite(communityDetails.community_view.community, isFavorited)
                        }}
                    />

                    <!---Add to Group--->
                    <Button color="tertiary-border" icon={UserGroup} iconSize={24} size="square-lg"
                        title="Add/Remove to Group"
                        on:click={(e) => { communityGroupModal = true }}
                    />
                {/if}

                <!---Modlog--->
                <Button color="tertiary-border" icon={Newspaper} iconSize={24} size="square-lg" 
                    title="Modlog"
                    on:click={()=> {
                        goto(`/modlog?community=${communityDetails.community_view.community.id.toString()}`)
                        open = false
                    }}
                />
                

            </div>
        
            <span class="mt-2" />

            <!---Community Card--->
            <Card backgroundImage={($userSettings.uiState.showBannersInCards && communityDetails?.community_view.community.banner) ? imageProxyURL(communityDetails?.community_view.community.banner, undefined, 'webp') : ''} >
                <div class="flex flex-row gap-1 md:gap-3 items-center p-3">
                    <div class="flex-shrink-0">
                        <Avatar width={128} fullRes ring url={communityDetails.community_view.community.icon} alt={communityDetails.community_view.community.name} community />
                    </div>

                    <div class="flex flex-col gap-1 w-full overflow-hidden">
                        <span class="font-bold text-lg">
                            <CommunityLink name href useDisplayNames showInstance={false} community={communityDetails.community_view.community} 
                                on:click={ () => open=false }
                            />
                        </span>

                        <span class="text-xs font-normal">
                            !{communityDetails.community_view.community.name}@{new URL(communityDetails.community_view.community.actor_id).hostname}
                        </span>
                        
                        <div class="mt-2" />

                        <Card elevation={0} class="p-1 w-fit opacity-80 w-full">
                            <div class="flex flex-row">
                                
                                <div class="mx-auto text-xs md:text-sm flex flex-row gap-4 flex-wrap justify-between">
                                    <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Cake Day">
                                        <Icon src={Cake} width={16} height={16} mini />
                                        <span class="capitalize">
                                            <RelativeDate date={communityDetails.community_view.community.published}/>
                                        </span>
                                    </span>
                                    
                                    <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Subscribers">
                                        <Icon src={UserGroup} width={16} height={16} mini />
                                        
                                        {#if communityDetails.community_view.counts.subscribers_local}
                                            <FormattedNumber number={communityDetails.community_view.counts.subscribers_local} /> / 
                                        {/if}
                                        <FormattedNumber number={communityDetails.community_view.counts.subscribers} />
                                    </span>

                                    <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Posts">
                                        <Icon src={PencilSquare} width={16} height={16} mini />
                                        <FormattedNumber number={communityDetails.community_view.counts.posts} />
                                    </span>
                        
                                    <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Comments">
                                        <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                                        <FormattedNumber number={communityDetails.community_view.counts.comments} />
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </Card>

            <span class="mt-2" />

            <div class="flex flex-col gap-2 w-full">

                <!--- Action Buttons for this Community (Fade away if any of the accordions are open)--->
                <div class="flex flex-col gap-2 mt-0 px-8 w-full items-center" transition:slide>
                    
                    <Button color="tertiary-border" icon={InformationCircle} alignment="left" class="w-full"
                        on:click={()=> {
                            //modalWidth="max-w-2xl"
                            action='communityDetails'
                        }}
                    >
                        Community Details...
                    </Button>
                    
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
                                //createPost(communityDetails.community_view.community) 
                                //open = false
                                modalWidth = 'max-w-4xl'
                                action='createPost'
                            }}
                        >
                            Create Post...
                        </Button>
                    {/if}
                    
                    {#if $profile?.user}

                        {#if !communityBlocked}    
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

                        <!---Community Settings (if mod or local admin of a local community)--->
                        {#if $profile?.user && amMod($profile.user, communityDetails.community_view.community)}
                            <Button color="tertiary-border" icon={Cog6Tooth} alignment="left" class="w-full"
                                on:click={ () => {
                                    goto(`/c/${fullCommunityName(communityDetails.community_view.community.name, communityDetails.community_view.community.actor_id)}/settings`)
                                    open = false
                                }}
                            >
                                Community Settings
                        </Button>
                        {/if} 

                        <!---Block Community--->
                        <Button color="tertiary-border" icon={NoSymbol} alignment="left" class="w-full" loading={blocking}
                            on:click={async ()=> {
                                blocking = true
                                communityBlocked = await blockUnblockCommunity(communityDetails.community_view.community.id, !communityBlocked)
                                
                                dispatchWindowEvent('blockCommunity', { 
                                    community_id: communityDetails.community_view.community.id,
                                    blocked: communityBlocked
                                })

                                // If community is blocked, remove it from favorites and mark subscribed as false since the API will unsubscribe you as part of the block procedure.
                                if (communityBlocked) {
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

                        <!---Admin-Only Options--->
                        {#if isAdmin($profile.user) }
                            <!---Remove Community--->
                            <Button color="tertiary-border" icon={NoSymbol} alignment="left" class="w-full" loading={remove.removing} 
                                on:click={()=> {
                                    modalWidth="max-w-2xl"
                                    action='removing'
                                }}
                            >
                                {communityDetails.community_view.community.removed ? 'Restore' : 'Remove'} Community...
                            </Button>

                            <!---Hide Community--->
                            <Button color="tertiary-border" icon={EyeSlash} alignment="left" class="w-full" loading={hide.hiding} on:click={() => {
                                    modalWidth="max-w-2xl"
                                    action="hiding"
                                }}
                            >
                                {communityDetails.community_view.community.hidden ? 'Restore' : 'Hide'} Community...
                            </Button>

                        {/if}

                    {/if}
                </div>
                
            </div>
        {/if}

        <span class="mt-2" />

    {/if}

</Modal>