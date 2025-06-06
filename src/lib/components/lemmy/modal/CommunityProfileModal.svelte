<script lang="ts">
    import type { Community, GetCommunityResponse } from "lemmy-js-client"
    import type { FeedController } from '../feed/helpers'
    
    import {addFavorite, isFavorite } from '$lib/favorites'
    import { 
        blockUnblockCommunity, 
        communityIsBlocked,
        createPost, 
        shortenCommunityName,
        subscribe 
    } from '$lib/components/lemmy/community/helpers'
    
    import { addCommunityToGroup, amMod, isAdmin } from '$lib/components/lemmy/moderation/moderation'
    import { dispatchWindowEvent, type BlockCommunityEvent, type HideCommunityEvent, type RemoveCommunityEvent } from '$lib/ui/events'
    import { fullCommunityName } from "$lib/util"
    import { getClient } from "$lib/lemmy"
    import { goto, replaceState } from "$app/navigation"
    import { onMount } from "svelte";
    import { page } from "$app/stores"
    import { profile } from '$lib/auth'
    import { toast } from "$lib/components/ui/toasts/toasts"

    import BanUnbanCommunityForm    from "./components/BanUnbanCommunityForm.svelte"
    import Button                   from "$lib/components/input/Button.svelte"
    import CommunityCardSmall       from "$lib/components/lemmy/community/CommunityCardSmall.svelte"
    import PostFeed                 from "$lib/components/lemmy/feed/PostFeed.svelte"
    import EmbeddableModlog         from "$lib/components/lemmy/modal/components/EmbeddableModlog.svelte"
    import Markdown                 from "$lib/components/markdown/Markdown.svelte"
    import MarkdownEditor           from "$lib/components/markdown/MarkdownEditor.svelte"
    import Modal                    from "$lib/components/ui/modal/Modal.svelte"
    import ModalPanel               from '$lib/components/lemmy/modal/components/ModalPanel.svelte'
    import ModalPanelHeading        from '$lib/components/lemmy/modal/components/ModalPanelHeading.svelte'
    import ModalScrollArea          from "$lib/components/lemmy/modal/components/ModalScrollArea.svelte"
    import PostForm                 from "$lib/components/lemmy/post/PostForm.svelte"
    import Spinner                  from "$lib/components/ui/loader/Spinner.svelte"
    import UserLink                 from "$lib/components/lemmy/user/UserLink.svelte"
    
    import { 
        ArrowLeft,
        ArrowPath,
        ArrowTopRightOnSquare,
        Check,
        ChevronDoubleDown,
        ChevronDoubleUp,
        Cog6Tooth,
        Eye,
        EyeSlash,
        Folder,
        Funnel,
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
    import { userSettings } from "$lib/settings";
    
    
    
    
    export let community: Community | undefined
    export let open: boolean = false
   
    let loading = false
    let blocking = false
    let subscribing = false

    let communityDetails: GetCommunityResponse
    let communityDetailsOpen = false
    let feedController: FeedController
    let action: 
        'none'              |   
        'banning'           | 
        'blocking'          | 
        'browsing'          | 
        'communityDetails'  | 
        'createPost'        | 
        'filtering'         |
        'hiding'            | 
        'modlog'            |
        'removing'           
    = 'none'

    let postInProgress: boolean | undefined = undefined
    let resetPostForm: () => Promise<void>

    let defaultWidth = 'max-w-xl'
    let modalWidth = defaultWidth

    let communityLookupName: string     // Set by loadDetails()
    let communityFiltered = false

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

    $:  communityFiltered = (communityDetails?.community_view?.community?.actor_id && $userSettings.hidePosts.communityList.includes(communityDetails.community_view.community.actor_id)) ? true : false


    onMount(async () => await loadDetails() )
        
    async function loadDetails() {
        if (!community) {
            open = false
            return
        }
        
        communityDetailsOpen = false
        loading = true
        
        communityLookupName = `${community.name}@${new URL(community.actor_id).hostname}`
        
        try {
            communityDetails = await getClient().getCommunity({
                name: communityLookupName
            })
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

            communityDetails.community_view.blocked = communityBlocked

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

    function filter() {
        if  (!communityDetails?.community_view) return
        
        //Un-Filter
        if (communityFiltered) {
            const index = $userSettings.hidePosts.communityList.findIndex((e) => e == communityDetails.community_view.community.actor_id)
            if (index >=0 ) $userSettings.hidePosts.communityList.splice(index, 1)
            communityFiltered = false
        }
        // Add community actor_id to community filter list
        else {
            $userSettings.hidePosts.communityList.push(communityDetails.community_view.community.actor_id)
            $userSettings.hidePosts.communityList.sort()
            communityFiltered = true
        }
        
        $userSettings = $userSettings
        dispatchWindowEvent('filterCommunity', {
            actor_id: communityDetails.community_view.community.actor_id,
            filtered: communityFiltered
        })
        returnMainMenu()
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

<svelte:window on:clickIntoPost={() => open = false }  />

<Modal bind:open 
    icon={UserGroup} 
    iconImage={communityDetails?.community_view?.community?.icon}  
    card={false} 
    width={modalWidth} 
    capitalizeTitle={true}
    title={
        shortenCommunityName(communityDetails?.community_view?.community?.title, 35) ?? 
        communityDetails?.community_view?.community?.name ?? 
        'Community Details'
    }
    on:close={() => { 
        if (postInProgress) {
            let confirmation = confirm('You have work in progress.  Are you sure you want to leave?')
            if (confirmation) {
                resetPostForm().then(() => history.back())
                return
            }
            return
        }
        else {
            history.back() 
        }
    }}
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
                    disabled={communityDetails.community_view.banned_from_community}
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
                <Button color="tertiary" icon={Folder} iconSize={20} size="square-lg"
                    title="Add/Remove to Group"
                    on:click={(e) => { addCommunityToGroup(communityDetails.community_view.community) }}
                />
                
            {/if}
            
        {/if}
    </div>

    {#if loading}
        <span class="flex">
            <Spinner width={24} class="mx-auto my-auto"/>
        </span>
    

    {:else if communityDetails?.community_view}

        <!---Ban/Unban Tool--->
        {#if action == 'banning'}
            <ModalPanel>
                <ModalPanelHeading title="Ban/Unban User From Community" on:click={()=> returnMainMenu()} />
                
                <ModalScrollArea>
                    <BanUnbanCommunityForm community={communityDetails.community_view.community} on:ban={() => returnMainMenu() }/>
                </ModalScrollArea>
            </ModalPanel>
        {/if}

        {#if action == 'blocking'}
            
            <ModalPanel>
                <ModalPanelHeading title="{communityBlocked ? 'Unblock' : 'Block'} Community" on:click={()=> returnMainMenu()} />
                
                <ModalScrollArea>
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


                </ModalScrollArea>
            </ModalPanel>
        {/if}

        {#if action == 'filtering'}
            <ModalPanel>
                <ModalPanelHeading title="{communityFiltered ? 'Un-Filter' : 'Filter'} Community" on:click={() => returnMainMenu()} />

                <ModalScrollArea>
                    <span class="flex flex-col gap-4 text-sm font-normal">
                        <span>
                            Filtering a community is like a soft block.  Unlike blocking, filtering a community will still return posts when fetching,
                            but Tesseract will minimize them in the feed with a placeholder.  If you want to see the filtered content, you can 
                            click the "show" button in the placeholder to reveal the hidden content.
                        </span>

                        <span>
                            <span class="font-bold">Confirm</span>:
                                
                            {#if communityFiltered}
                                Are you sure you want to remove
                                {communityDetails.community_view.community.title ?? communityDetails.community_view.community.name}@{new URL(communityDetails.community_view.community.actor_id).hostname}
                                from your filters?
                            {:else}
                                Are you sure you want to add
                                {communityDetails.community_view.community.title ?? communityDetails.community_view.community.name}@{new URL(communityDetails.community_view.community.actor_id).hostname}
                                to your filter list?
                            {/if}
                        </span>

                        <Button icon={Funnel}
                            color={communityFiltered ? 'primary' : 'danger'} 
                            size="lg" class="w-full flex-shrink-0" 
                            title="{communityFiltered ? 'Un-Filter' : 'Filter'} Community"
                            on:click={filter}
                        >
                            {communityFiltered ? 'Un-Filter' : 'Filter'} Community
                        </Button>
                        
                    </span>
                </ModalScrollArea>
            </ModalPanel>

        {/if}

        {#if action == 'browsing'}
            <ModalPanel>
               <ModalPanelHeading title="Browse Community" on:click={()=> returnMainMenu()} >
                    <span class="flex flex-row gap-2" slot="actions">
                        <Button size="md" color="tertiary" icon={ChevronDoubleDown} iconSize={20} title="Scroll to Bottom" on:click={()=> feedController.scrollBottom()} />
                        <Button size="md" color="tertiary" icon={ChevronDoubleUp} iconSize={20} title="Scroll to Top" on:click={()=> feedController.scrollTop()} />
                        <Button size="md" color="tertiary" icon={ArrowPath} title="Refresh" iconSize={20} on:click={() => feedController.refresh(true) } />
                        <Button size="md" color="tertiary" icon={ArrowTopRightOnSquare} title="Go to Community" iconSize={20}
                            on:click={ () => {
                                goto(`/c/${communityDetails.community_view.community.name}@${new URL(communityDetails.community_view.community.actor_id).hostname}/${feedController.sort}`)
                                open = false
                            }}
                        />
                    </span>
               </ModalPanelHeading>
                
                <ModalScrollArea card={false}>
                    <PostFeed bind:controller={feedController} inModal={true} actions={false} 
                        community_name={`${communityDetails.community_view.community.name}@${new URL(communityDetails.community_view.community.actor_id).hostname}`} 
                    />
                </ModalScrollArea>
            </ModalPanel>
        {/if}
        
        <!---Community Details Panel--->
        {#if action == 'communityDetails'}
            <ModalPanel>
                <ModalPanelHeading title="Community Details" on:click={()=> returnMainMenu()} /> 

                <ModalScrollArea>
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
                </ModalScrollArea>

            </ModalPanel>
        {/if}

        <!---Remove Community Panel--->
        {#if action == 'removing'}
            <ModalPanel>
                <ModalPanelHeading title="{communityDetails.community_view.community.removed ? 'Restore' : 'Remove'} Community" on:click={()=> returnMainMenu()}  />
                
                <!---Remove/Purge/Restore Form--->
                <ModalScrollArea>
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
                </ModalScrollArea>
            </ModalPanel>
        {/if}

        <!---Hiding Community--->
        {#if action == 'hiding'}
            <ModalPanel>
                <ModalPanelHeading title="{communityDetails.community_view.community.hidden ? 'Restore' : 'Hide'} Community"  on:click={()=> returnMainMenu()} /> 
                
                <!---Remove/Purge/Restore Form--->
                <ModalScrollArea>
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
                </ModalScrollArea>
            </ModalPanel>
        {/if}

        <!---Create Post Form--->
        {#if action == 'createPost'}
            <ModalPanel>
                <ModalPanelHeading title="Create Post"
                    on:click={()=> {
                        // If post has any data set, confirm before returning to main menu
                        if (!postInProgress) returnMainMenu()
                        else if (confirm("You have a post in progress. Are you sure you want to cancel?")) {
                            resetPostForm().then(() => returnMainMenu())
                        }
                        
                    }}
                >
                    <span slot="actions">
                        <Button size="square-lg" color="tertiary-border" icon={ArrowTopRightOnSquare} iconSize={24}
                            on:click={() => { 
                                createPost(communityDetails.community_view.community) 
                                open=false
                            }}
                        />
                    </span>
                </ModalPanelHeading>

                <ModalScrollArea card={false}>
                    <PostForm bind:community={communityDetails.community_view.community} hideCommunityInput={true} inModal={true} editing={false} 
                        bind:resetForm={resetPostForm}
                        bind:postInProgress
                        on:submit={(e) => {
                            replaceState('', {
                                modals: {
                                    ...$page.state.modals,
                                    CommunityProfileModal: false
                                }
                            })
                            goto(`/post/${e.detail.post.id}`)
                        }}
                    />
                </ModalScrollArea>
            </ModalPanel>
        {/if}

        <!---User's Modlog History--->
        {#if action == 'modlog'}
            <ModalPanel>
                <ModalPanelHeading on:click={()=>returnMainMenu()} title="Modlog" />
                <EmbeddableModlog community={communityDetails.community_view.community} headingRowClass="mt-[-50px]" on:gotoFullModlog={() => open = false }/>    
            </ModalPanel>
        
        {/if}

        <!---Main Menu--->
        {#if action == 'none'}
            <ModalPanel>
                <ModalScrollArea card={false}>
                    <!---Community Card--->
                    <CommunityCardSmall bind:community_view={communityDetails.community_view} filtered={communityFiltered} href on:communityLinkClick={() => open = false } />

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
                                    action='communityDetails'
                                    modalWidth='max-w-4xl'
                                }}
                            >
                                Community Details...
                            </Button>

                            
                            <!---Browse Community's Posts in the  Modal--->
                            <Button color="tertiary-border" icon={WindowIcon} iconSize={20} alignment="left" class="w-full"
                                on:click={()=> {
                                    action = 'browsing'
                                    modalWidth = 'max-w-4xl'
                                }}
                            >
                                Browse Community...
                            </Button>
                        {/if}
                        

                        <!---Create Post--->
                        {#if $profile?.user && !communityBlocked}
                            <Button color="tertiary-border" icon={PencilSquare} iconSize={20} alignment="left" class="w-full"
                                disabled={
                                    (
                                        communityDetails.community_view.community.posting_restricted_to_mods && 
                                        !amMod($profile.user, communityDetails.community_view.community)
                                    ) ||
                                    communityDetails.community_view.community.removed || 
                                    communityDetails.community_view.banned_from_community || 
                                    (
                                        communityDetails.community_view.community.visibility == 'LocalOnly' && 
                                        new URL($profile.user.local_user_view.person.actor_id).hostname != new URL(communityDetails.community_view.community.actor_id).hostname
                                    )
                                }
                                on:click={()=> {
                                    action='createPost'
                                    modalWidth = 'max-w-5xl'
                                }}
                            >
                                Create Post...
                            </Button>
                        {/if}

                        <!---Community Modlog--->
                        <div class="flex flex-row gap-2 items-center w-full">
                            <Button color="tertiary-border" icon={Newspaper} iconSize={20} alignment="left" class="w-full"
                                on:click={()=> {
                                    modalWidth = 'max-w-3xl'
                                    action='modlog'
                                }}
                            >
                                Community Modlog...
                            </Button>

                            <Button color="tertiary-border" icon={ArrowTopRightOnSquare} iconSize={20} size="square-md" title="Open in Full Modlog"
                                href="/modlog?community={communityDetails.community_view.community.id}"
                            />
                        </div>
                        

                        <!---Options that Required Authenticated User--->
                        {#if $profile?.user}

                            <!---Community Settings (if mod or local admin of a local community)--->
                            {#if $profile?.user && amMod($profile.user, communityDetails.community_view.community)}
                                <Button color="tertiary-border" icon={Cog6Tooth} iconSize={20} alignment="left" class="w-full"
                                    disabled={communityDetails.community_view.banned_from_community}
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
                                    disabled={communityDetails.community_view.banned_from_community}
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
                        {/if}

                        <!---Filter Community--->
                        <Button color="tertiary-border" icon={Funnel} iconSize={20} alignment="left" class="w-full"
                            title="{communityFiltered ? 'Un-Filter' : 'Filter'} Community"
                            on:click={async ()=> {
                                action = 'filtering'
                            }}
                        >
                            {communityFiltered ? 'Un-Filter' : 'Filter'} Community...
                        </Button>

                        <!---Admin-Only Options--->
                        {#if isAdmin($profile?.user) }
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
                                {communityDetails.community_view.community.hidden ? 'Un-Hide' : 'Hide'} Community...
                            </Button>

                        {/if}

                        
                    </div>
                </ModalScrollArea>
            </ModalPanel>
        {/if}

    {/if}

</Modal>