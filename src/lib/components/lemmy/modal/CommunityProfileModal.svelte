<script lang="ts">
    import type { Community, GetCommunityResponse, SortType } from "lemmy-js-client"
    import type { FeedController } from '../feed/helpers'
    
    import {addFavorite, isFavorite } from '$lib/favorites'
    import { 
        blockUnblockCommunity, 
        communityIsBlocked,
        createPost, 
        shortenCommunityName,
        subscribe 
    } from '$lib/components/lemmy/community/helpers'
    
    import { StorageController } from '$lib/storage-controller'

    import { amMod, isAdmin } from '$lib/components/lemmy/moderation/moderation'
    import { dispatchWindowEvent } from '$lib/ui/events'
    import { expoIn } from "svelte/easing"
    import { fullCommunityName } from "$lib/util";
    import { getClient } from "$lib/lemmy"
    import { goto } from "$app/navigation"
    import { onMount } from "svelte";
    import { profile } from '$lib/auth'
    import { slide } from "svelte/transition"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { userSettings } from '$lib/settings'

    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
    import BanUnbanCommunityForm from "./components/BanUnbanCommunityForm.svelte"
    import Button from "$lib/components/input/Button.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    import CommunityCardSmall from "$lib/components/lemmy/community/CommunityCardSmall.svelte";
    import PostFeed from "../feed/PostFeed.svelte";
    import EmbeddableModlog from "./components/EmbeddableModlog.svelte";
    import Markdown from "$lib/components/markdown/Markdown.svelte";
    import MarkdownEditor from "$lib/components/markdown/MarkdownEditor.svelte";
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import PostForm from "../post/PostForm.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte"
    import UserLink from "../user/UserLink.svelte";
    
    import { 
        ArrowLeft,
        ArrowPath,
        ArrowTopRightOnSquare,
        Check,
        Cog6Tooth,
        Eye,
        EyeSlash,
        InformationCircle,
        Newspaper,
        NoSymbol,
        PencilSquare,
        Rss,
        Scale,
        Star,
        Trash,
        UserGroup,
        Window as WindowIcon
    } from "svelte-hero-icons";
    
    export let community: Community | undefined
    export let open: boolean = false
    
    const storage = new StorageController({
        type: 'session',
        ttl: 15,
        useCompression: true   
    })
    
    let loading = false
    let blocking = false
    let subscribing = false

    let communityDetails: GetCommunityResponse
    let communityGroupModal = false
    let communityDetailsOpen = false
    let feedController: FeedController
    let action: 
        'none'              |   
        'banning'           | 
        'blocking'          | 
        'browsing'          | 
        'communityDetails'  | 
        'createPost'        | 
        'hiding'            | 
        'modlog'            |
        'removing'           
    = 'none'


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
        const communityLookupName = `${community.name}@${new URL(community.actor_id).hostname}`
        const storageKey = `getCommunity:${communityLookupName}`
        
        try {
            communityDetails = await storage.get(storageKey)
            if (!communityDetails) {    
                
                communityDetails = await getClient().getCommunity({
                    name: communityLookupName
                })

                await storage.put(storageKey, communityDetails)
            }
        }
        catch {
            try {
                // Only resolve if logged in
                if ($profile?.user) {
                    await getClient().resolveObject({
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

    async function block() {
        blocking = true
        try {
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
        }
        catch {
            toast({
                    type: 'error',
                    title: 'Error',
                    content: 'Failed to block/unblock the community'
                })
        }
        returnMainMenu()
        blocking = false
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
                returnMainMenu()

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

<svelte:window on:clickIntoPost={() => open = false } />

<Modal bind:open preventCloseOnClickOut={true} icon={UserGroup} card={false} width={modalWidth}
    capitalizeTitle={true}
    title={
        shortenCommunityName(communityDetails?.community_view?.community?.title, 35) ?? 
        communityDetails?.community_view?.community?.name ?? 
        'Community Details'
    }
>

    <!---Quick Actions (These are placed into the modal title bar)--->
    <div class="flex flex-row gap-2 items-center" slot="title-bar-buttons">
        {#if communityDetails}
            <span class="ml-auto"/>
            
            {#if $profile?.user && !communityBlocked}
                <!---Subscribe/Unsubscribe--->
                <Button color="tertiary" icon={Rss} iconSize={20} size="square-lg"
                    title="{subscribed ? 'Unsubscribe from' : 'Subscribe to'} Community"    
                    iconClass="{subscribed ? 'text-amber-500' : ''}" 
                    loading={subscribing}
                    on:click={async ()=> {
                        subscribing = true
                        subscribed = await subscribe(communityDetails.community_view.community, subscribed)
                        subscribing = false
                        subscribed = subscribed
                        communityDetails.community_view.subscribed = subscribed
                            ? 'Subscribed'
                            : 'NotSubscribed'
                    }}
                />


                <!---Favorite Community--->
                <Button color="tertiary" icon={Star} iconSize={20} size="square-lg" 
                    title="{isFavorited ? 'Un-Favorite' : 'Favorite'} Community"
                    iconClass="{isFavorited ? 'text-amber-500' : ''}" 
                    on:click={()=> {
                        isFavorited = !isFavorited
                        addFavorite(communityDetails.community_view.community, isFavorited)
                    }}
                />

                <!---Add to Group--->
                <Button color="tertiary" icon={UserGroup} iconSize={20} size="square-lg"
                    title="Add/Remove to Group"
                    on:click={(e) => { communityGroupModal = true }}
                />
                
            {/if}
            
        {/if}
    </div>

    {#if loading}
        <span class="flex mx-auto my-auto">
            <Spinner width={24}/>
        </span>
    {/if}

    {#if !loading && communityDetails?.community_view}
        <AddCommunityGroup bind:open={communityGroupModal} community={communityDetails.community_view.community} />

        <!---Ban/Unban Tool--->
        {#if action == 'banning'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>
                    
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={()=> returnMainMenu()}  
                    />
                    <span class="text-lg">
                        Ban/Unban User From Community
                    </span>
                </div>
                
                <Card class="flex flex-col p-4 gap-4">
                    <BanUnbanCommunityForm community={communityDetails.community_view.community} on:ban={() => returnMainMenu() }/>
                </Card>
            </div>
        {/if}

        {#if action == 'blocking'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>
                        
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={()=> returnMainMenu()}  
                    />
                    <span class="text-lg">
                        {communityBlocked ? 'Unblock' : 'Block'} Community
                    </span>
                </div>
                
                <Card class="flex flex-col p-4 gap-4">
                    <span class="text-sm font-normal">
                        <span class="font-bold">Confirm</span>:
                        Are you sure you want to {communityBlocked ? 'unblock' : 'block'}
                        {communityDetails.community_view.community.title ?? communityDetails.community_view.community.name}@{new URL(communityDetails.community_view.community.actor_id).hostname}?
                    </span>

                    <Button loading={blocking} disabled={blocking} icon={NoSymbol}
                        color={communityBlocked ? 'primary' : 'danger'} 
                        size="lg" class="w-full flex-shrink-0" 
                        title="{communityBlocked ? 'Unblock' : 'Block'} Community"
                        on:click={block}
                    >
                        {communityBlocked ? 'Unblock' : 'Block'} Community
                    </Button>


                </Card>
            </div>
        {/if}

        {#if action == 'browsing'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>
                        
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={()=> returnMainMenu()}  
                    />
                    <span class="text-lg">
                        Browse
                    </span>

                    <span class="ml-auto" />

                    <Button size="square-md" color="tertiary-border" icon={ArrowPath} title="Refresh" iconSize={24}
                        on:click={() => {
                            feedController.refresh(true)
                        }}
                    />
                    
                    <Button size="square-md" color="tertiary-border" icon={ArrowTopRightOnSquare} title="Go to Community" iconSize={24}
                        on:click={ () => {
                            goto(`/c/${communityDetails.community_view.community.name}@${new URL(communityDetails.community_view.community.actor_id).hostname}`)
                            open = false
                        }}
                    />
                </div>

                <div class="flex flex-col gap-2 w-full {$userSettings.uiState.infiniteScroll ? 'max-h-[70vh]' : 'max-h-[60vh]'} overflow-y-scroll" >
                    <PostFeed bind:controller={feedController} actions={false} 
                        community_name={`${communityDetails.community_view.community.name}@${new URL(communityDetails.community_view.community.actor_id).hostname}`} 
                    />
                </div>
            </div>
        {/if}
        
        <!---Community Details Panel--->
        {#if action == 'communityDetails'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>
                    
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={()=> returnMainMenu()}  
                    />
                    <span class="text-lg">
                        Community Details
                    </span>
                </div>
                

                <Card class="flex flex-col p-4 max-h-[45vh] overflow-y-auto">
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
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>
                
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
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>
                    
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
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>
                        
                <!---Section Header--->
                <div class="flex flex-row gap-4 items-center">
                    <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                        on:click={()=> returnMainMenu()}  
                    />
                    <span class="text-lg truncate">
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
                    on:submit={(e) => {
                        goto(`/post/${e.detail.post.id}`)
                        open = false
                    }}
                />
            </div>
        {/if}

        <!---User's Modlog History--->
        {#if action == 'modlog'}
            <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>     
        
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
                
                <EmbeddableModlog community={communityDetails.community_view.community} headingRowClass="mt-[-50px]" on:gotoFullModlog={() => open = false }/>    
            </div>
        
        {/if}

        <!---Main Menu--->
        {#if action == 'none'}
            <div class="flex flex-col gap-2 w-full" transition:slide={{easing:expoIn}}>
                <!---Community Card--->
                <CommunityCardSmall bind:community_view={communityDetails.community_view} href on:communityLinkClick={() => open = false } />

                <span class="mt-2" />

                <!--- Action Buttons for this Community--->
                <div class="flex flex-col gap-2 mt-0 px-8 w-full items-center" >
                    
                    {#if !communityBlocked}

                        <!---Go to Community--->
                        <Button color="tertiary-border" icon={UserGroup} iconSize={20} alignment="left" class="w-full"
                            on:click={()=> {
                                goto(`/c/${communityDetails.community_view.community.name}@${new URL(communityDetails.community_view.community.actor_id).hostname}`)
                                open = false
                            }}
                        >
                            Go to Community
                        </Button> 

                        <!--- Community Details/Info--->
                        <Button color="tertiary-border" icon={InformationCircle} iconSize={20} alignment="left" class="w-full"
                            on:click={()=> {
                                modalWidth='max-w-3xl'
                                action='communityDetails'
                            }}
                        >
                            Community Details...
                        </Button>

                           
                        <!---Browse Community's Posts in the  Modal--->
                        <Button color="tertiary-border" icon={WindowIcon} iconSize={20} alignment="left" class="w-full"
                            on:click={()=> {
                                modalWidth = 'max-w-3xl'
                                action = 'browsing'
                            }}
                        >
                            Browse Community...
                        </Button>
                    {/if}
                    

                    <!---Create Post--->
                    {#if $profile?.user && !communityBlocked}
                        <Button color="tertiary-border" icon={PencilSquare} iconSize={20} alignment="left" class="w-full"
                            disabled={
                                (communityDetails.community_view.community.posting_restricted_to_mods && !amMod($profile.user, communityDetails.community_view.community)) ||
                                communityDetails.community_view.community.removed
                            }
                            on:click={()=> {
                                modalWidth = 'max-w-4xl'
                                action='createPost'
                            }}
                        >
                            Create Post...
                        </Button>
                    {/if}

                    <!---Community Modlog--->
                    <Button color="tertiary-border" icon={Newspaper} iconSize={20} alignment="left" class="w-full"
                        on:click={()=> {
                            modalWidth = 'max-w-3xl'
                            action='modlog'
                        }}
                    >
                        Community Modlog...
                    </Button>
                    

                    <!---Options that Required Authenticated User--->
                    {#if $profile?.user}

                        <!---Community Settings (if mod or local admin of a local community)--->
                        {#if $profile?.user && amMod($profile.user, communityDetails.community_view.community)}
                            <Button color="tertiary-border" icon={Cog6Tooth} iconSize={20} alignment="left" class="w-full"
                                on:click={ () => {
                                    goto(`/c/${fullCommunityName(communityDetails.community_view.community.name, communityDetails.community_view.community.actor_id)}/settings`)
                                    open = false
                                }}
                            >
                                Community Settings
                        </Button>
                        {/if} 

                        <!---Ban User Tool--->
                        {#if $profile?.user && (amMod($profile.user, communityDetails.community_view.community) || isAdmin($profile.user) )}
                            <Button color="tertiary-border" icon={Scale} iconSize={20} alignment="left" class="w-full"
                                on:click={ () => {
                                    modalWidth = 'max-w-3xl'
                                    action = 'banning'
                                }}
                            >
                                Ban/Unban User...
                        </Button>
                        {/if} 

                        <!---Block Community--->
                        <Button color="tertiary-border" icon={NoSymbol} iconSize={20} alignment="left" class="w-full" loading={blocking}
                            title="{communityBlocked ? 'Unblock' : 'Block'} Community"
                            on:click={async ()=> {
                                action = 'blocking'
                            }}
                        >
                            {communityBlocked ? 'Unblock' : 'Block'} Community...
                        </Button>

                        <!---Admin-Only Options--->
                        {#if isAdmin($profile.user) }
                            <!---Remove Community--->
                            <Button color="tertiary-border" icon={Trash} iconSize={20} alignment="left" class="w-full" loading={remove.removing} 
                                title="{communityDetails.community_view.community.removed ? 'Restore' : 'Remove'} Community"
                                on:click={()=> {
                                    modalWidth="max-w-2xl"
                                    action='removing'
                                }}
                            >
                                {communityDetails.community_view.community.removed ? 'Restore' : 'Remove'} Community...
                            </Button>

                            <!---Hide Community--->
                            <Button color="tertiary-border" icon={EyeSlash} iconSize={20} alignment="left" class="w-full" loading={hide.hiding} 
                                title="{communityDetails.community_view.community.hidden ? 'Restore' : 'Hide'} Community"
                                on:click={() => {
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