<script lang="ts">

    import type { CommentView, Community, PostView } from 'lemmy-js-client'

    import type {  PurgeCommentEvent, PurgePostEvent } from '$lib/ui/events'
    import type { UserSubmissionFeedController } from '$lib/components/lemmy/feed/helpers'

    import { amMod, amModOfAny, isAdmin, type PostModerationModalPanels } from '../moderation/moderation'
    import { dispatchWindowEvent } from '$lib/ui/events';
    import { getClient, minAPIVersion } from '$lib/lemmy'
    import { goto } from '$app/navigation'
    import { isCommentView } from '$lib/lemmy/item'
    import { onMount } from 'svelte'
    import { profile } from '$lib/auth'
    import { toast } from '$lib/components/ui/toasts/toasts'

    import BanUnbanCommunityForm from './components/BanUnbanCommunityForm.svelte'
    import BanUserForm from './components/BanUserForm.svelte'
    import Button from "$lib/components/input/Button.svelte"
    import Card from '$lib/components/ui/Card.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import EmbeddableModlog from './components/EmbeddableModlog.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import ModalPanel from './components/ModalPanel.svelte'
    import ModalPanelHeading from './components/ModalPanelHeading.svelte'
    import ModalScrollArea from './components/ModalScrollArea.svelte'

    import RemoveItemForm from './components/RemoveItemForm.svelte'
    import ReportItemForm from './components/ReportItemForm.svelte'
    import SendDMForm from "./components/SendDMForm.svelte"
    import UserLink from '../user/UserLink.svelte'
    import UserSubmissionFeed from '$lib/components/lemmy/feed/UserSubmissionFeed.svelte'
    import VoteViewer from './components/VoteViewer.svelte'

    import { 
        ArrowPath,
        ArrowTopRightOnSquare,
        ChevronDoubleDown,
        ChevronDoubleUp,
        Envelope,
        Fire,
        Flag,
        HandThumbUp,
        InformationCircle,
        LockClosed,
        MapPin,
        Megaphone,
        Newspaper,
        NoSymbol,
        Scale,
        ShieldExclamation, 
        Sparkles, 
        Trash,
        Window as WindowIcon
    } from "svelte-hero-icons"
    
    
    
    export let open: boolean = false
    export let item: PostView | CommentView
    export let action: PostModerationModalPanels = 'none'
    
    let defaultWidth = 'max-w-xl'
    let modalWidth = defaultWidth

    
    let panelWidths = {
        'none': 'max-w-xl',
        'banning': 'max-w-3xl',
        'communityBanning': 'max-w-3xl',
        'communityInfo': 'max-w-3xl',
        'messaging': 'max-w-3xl',
        'modlog': 'max-w-4xl',
        'removing': 'max-w-3xl',
        'reporting': 'max-w-3xl',
        'showVotes': 'max-w-xl',
        'userSubmissions': 'max-w-4xl',
    } 

    let locking = false
    let pinning = false
    let pinningInstance = false
    let purged  = false
    let banCommunity: Community | undefined = item.community
    let modlogCommunityOnly = true
    let userFeedControler: UserSubmissionFeedController

    // Make the Post/Comment item reactive
    $: item

    // Reactive helper variable to determine if the item is removed.
    $:  removed = item
            ? isCommentView(item)
                ? item.comment.removed
                : item.post.removed
            : false

    // Object to hold the components for removing a submission
    let remove = {
        purge: false,
    }

    // Returns the modal to the main menu
    function returnMainMenu() {
        action = 'none'
        modalWidth = defaultWidth
    }

    // Lock and Unlock the Post
    async function lock(lock: boolean) {
        if (!$profile?.jwt || isCommentView(item)) return
        locking = true

        try {
            await getClient().lockPost({
                locked: lock,
                post_id: item.post.id,
            })

            dispatchWindowEvent('lockPost', {
                post_id: item.post.id,
                locked: lock
            })

            item.post.locked = lock

            toast({
                content: `Successfully ${lock ? 'locked' : 'unlocked' } that post.`,
                type: 'success',
                title: "Success"
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        locking = false
    }

    // Pin and Unpin the Post
    async function pin(pinned: boolean, toInstance: boolean = false) {
        if (!$profile?.jwt || isCommentView(item)) return
        
        toInstance 
            ? pinningInstance = true
            : pinning = true

        try {
            await getClient().featurePost({
                feature_type: toInstance ? 'Local' : 'Community',
                featured: pinned,
                post_id: item.post.id,
            })
            
            dispatchWindowEvent('featurePost', {
                featured: pinned,
                post_id: item.post.id,
                community_id: toInstance ? undefined : item.community.id
            })
            
            if (toInstance) item.post.featured_local = pinned
            else item.post.featured_community = pinned

            toast({
                content: `Successfully ${pinned ? 'pinned' : 'unpinned'} that post.`,
                type: 'success',
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
        toInstance 
            ? pinningInstance = false
            : pinning = false
    }

    // Distinguish and Un-distinguish a mod comment
    async function distinguish() {
        if (!isCommentView(item) || !$profile?.jwt) return

        let distinguished: boolean = item.comment.distinguished;
        

        try {
            await getClient(undefined).distinguishComment({
                comment_id: item.comment.id,
                distinguished: !distinguished
            });
            
            item.comment.distinguished = !distinguished;
            
            dispatchWindowEvent('distinguishComment', {
                comment_id: item.comment.id,
                distinguished: item.comment.distinguished
            })

            toast({
                    type: 'success',
                    content: `${item.comment.distinguished ? 'Distinguished' : 'Un-distinguished'} this comment.`,
                })
        }
        catch (err:any){
            toast({
                    type: 'error',
                    content: `Unable to distinguish comment: ${JSON.stringify(err)}`,
                })
        }
    }

    function handlePurgeItem(e:PurgeCommentEvent|PurgePostEvent) {
        purged = e.detail.purged
    }

    onMount(() => {
        modalWidth = panelWidths[action]
    })
</script>


<svelte:window 
    on:purgePost={handlePurgeItem} 
    on:purgeComment={handlePurgeItem}
    on:clickIntoPost={() => open = false }
/>

<Modal bind:open icon={ShieldExclamation} title="Moderation" card={false} preventCloseOnClickOut width={modalWidth} >
    
    <!---Toggle Actions for the Modal Title Bar--->
    <div class="flex flex-row gap-2 items-center" slot="title-bar-buttons">
        <span class="ml-auto" />    
        <div class="flex flex-row w-full items-center gap-2">

            <!---Toggle Actions for Comments--->
            {#if isCommentView(item)}
                <!---Distinguish Comment--->
                <!---Lemmy devs are ridiculous and changed the behavior so you could only distinguish your own comments.  Fuckin' bullshit--->
                {#if $profile?.user && item.creator_is_moderator && $profile.user.local_user_view.person.id == item.creator.id}
                    <Button color="tertiary" icon={Sparkles} iconSize={20} size="square-lg" 
                        title="{item.comment.distinguished ? 'Un-Distinguish' : 'Distinguish'} Comment"
                        iconClass={item.comment.distinguished ? 'text-green-500' : ''}
                        on:click={() => distinguish() }
                    />
                {/if}
            {/if}
        
            <!---Toggle Actions for Posts--->
            {#if !isCommentView(item)}
                <!---Feature Post (Instance)--->
                {#if isAdmin($profile?.user) && !isCommentView(item)}
                    <Button color="tertiary" icon={Megaphone} loading={pinningInstance} iconSize={20} size="square-lg" 
                        title="{item.post.featured_local ? 'Unfeature' : 'Feature'} on Instance"
                        iconClass={item.post.featured_local ? 'text-green-500' : ''}
                        on:click={() => pin(!item.post.featured_local, true)}
                    />
                {/if}

                <!---Feature Post (Community)--->
                <Button color="tertiary" icon={MapPin} loading={pinning} iconSize={20} size="square-lg" 
                    title="{item.post.featured_community ? 'Unpin' : 'Pin'} in Community"
                    iconClass={item.post.featured_community ? 'text-green-500' : ''}
                    on:click={() => pin(!item.post.featured_community, false)}
                />

                
                <!---Lock/Unlock Post--->
                <Button color="tertiary" icon={LockClosed} iconSize={20} size="square-lg" 
                    title="{item.post.locked ? 'Unlock' : 'Lock'} Post"        
                    iconClass={item.post.locked ? 'text-amber-500' : ''}    
                    loading={locking}
                    on:click={() => lock(!item.post.locked)}
                />
            {/if}
        </div>
    </div>

    <!---Ban User from All Communities--->
    {#if action == 'communityBanning'}
        <ModalPanel>
            <ModalPanelHeading title="Ban/Unban From All My Communities" on:click={() => returnMainMenu()} />
                <ModalScrollArea>
                    <BanUnbanCommunityForm user={item.creator} />
                </ModalScrollArea>
            
        </ModalPanel>
    {/if}

    <!---User Submissions in the Community--->
    {#if action == 'userSubmissions'}
        <ModalPanel>
            <ModalPanelHeading title="User's Submissions" on:click={() => returnMainMenu()}>
                <span class="flex flex-row gap-2" slot="actions">
                    <Button size="md" color="tertiary" icon={ChevronDoubleDown}     iconSize={20} title="Scroll to Bottom"  on:click={()=> userFeedControler.scrollBottom()} />
                    <Button size="md" color="tertiary" icon={ChevronDoubleUp}       iconSize={20} title="Scroll to Top"     on:click={()=> userFeedControler.scrollTop()} />
                    <Button size="md" color="tertiary" icon={ArrowPath}             iconSize={20} title="Refresh"           on:click={()=> userFeedControler.refresh(true)} />
                    <Button size="md" color="tertiary" icon={ArrowTopRightOnSquare} iconSize={20} title="Go to Profile"     on:click={()=> {
                            // If viewing own account go to /profile/user otherwise, goto /u/{user}@{instance}
                            if ($profile?.user?.local_user_view.person.id == item.creator.id) {
                                goto('/profile/user')
                                open = false
                            }
                            else {    
                                goto(`/u/${item.creator.name}@${new URL(item.creator.actor_id).host}`)
                                open = false
                            }
                        }} 
                    />
                </span>
            </ModalPanelHeading>
            
            <ModalScrollArea card={false}>
                <UserSubmissionFeed person_name="{item.creator.name}@{new URL(item.creator.actor_id).hostname}" community_id={item.community.id}
                    bind:controller={userFeedControler}
                />
            </ModalScrollArea>
        </ModalPanel>
    {/if}

    <!---Report the Submission--->
    {#if action == 'reporting'}
        <ModalPanel>
            <ModalPanelHeading title="Reporting {isCommentView(item) ? 'Comment' : 'Post'}" on:click={() => returnMainMenu()} />

            <!---Remove/Purge/Restore Form--->
            <ModalScrollArea>
                <ReportItemForm bind:item on:reported={() => returnMainMenu() }/>
            </ModalScrollArea>
        </ModalPanel>
    {/if}

    <!---Remove/Restore/Purge Content--->
    {#if action == 'removing'}
        <ModalPanel>
            <ModalPanelHeading on:click={() => returnMainMenu()} 
                title="{ remove.purge  ? 'Purging'  : removed ? 'Restoring' : 'Removing' } {isCommentView(item) ? 'Comment' : 'Post'}"    
            />

            <!---Remove/Purge/Restore Form--->
            <ModalScrollArea>
                <RemoveItemForm bind:item bind:removed bind:purged purge={remove.purge} on:finish={() => returnMainMenu()}/>
            </ModalScrollArea>
            
        </ModalPanel>
    
    {/if}

    <!---Ban/Unban--->
    {#if action == 'banning'}
        <ModalPanel>
            <ModalPanelHeading on:click={() => returnMainMenu()} 
                title="{(banCommunity ? item.creator_banned_from_community : item.creator.banned) ? 'Unban' : 'Ban'} User From {banCommunity ? 'Community' : 'Instance'}"
            />

            <!---Ban/Unban Instance/Community Form--->
            <ModalScrollArea>
                <BanUserForm bind:person={item.creator} bind:creator_banned_from_community={item.creator_banned_from_community} bind:community={banCommunity}
                    on:ban={() => returnMainMenu()}
                />
            </ModalScrollArea>
        </ModalPanel>
    {/if}
    
    <!---Vote Viewer--->
    {#if action == 'showVotes'}
        <ModalPanel>
            <ModalPanelHeading on:click={() => returnMainMenu()} title="{isCommentView(item) ? 'Comment' : 'Post'} Votes" />

            <!---Ban/Unban Instance/Community Form--->
            <ModalScrollArea>
                <VoteViewer {item} />
            </ModalScrollArea>
        </ModalPanel>
    {/if}

    <!---Community Details--->
    {#if action == 'communityInfo'}
        <ModalPanel>
            <ModalPanelHeading on:click={() => returnMainMenu()} title="Community Info" />
            
            <!---Community Details Markdown--->
            <ModalScrollArea>
                <Markdown source={item.community.description ?? 'No community description was provided.'} />
            </ModalScrollArea>
        </ModalPanel>
    {/if}
    
    <!---Modlog--->
    {#if action == 'modlog'}
        <ModalPanel>
            <ModalPanelHeading on:click={() => returnMainMenu()} title="Modlog">
                <span class="flex flex-row gap-1" slot="actions">
                    <Button size="sm" color="tertiary-border" class="h-8"
                        icon={Newspaper}
                        on:click={() => {
                            modlogCommunityOnly = !modlogCommunityOnly
                        }}
                    >
                        {modlogCommunityOnly ? 'All' : 'Community'}
                    </Button>
                </span>
            </ModalPanelHeading>

            <span class="text-sm font-normal" style="width:calc(100% - 120px);">
                {
                    modlogCommunityOnly
                        ? `Showing only modlog events for ${item.creator.display_name ?? item.creator.name}@${new URL(item.creator.actor_id).hostname} in ${item.community.name}@${new URL(item.community.actor_id).hostname}.`
                        : `Showing all modlog events for ${item.creator.display_name ?? item.creator.name}@${new URL(item.creator.actor_id).hostname}.`
                }
            </span>
            
            {#if modlogCommunityOnly}
                <EmbeddableModlog moderatee={item.creator} community={item.community} headingRowClass="mt-[-30px]"/>
            {:else}
                <EmbeddableModlog moderatee={item.creator}  headingRowClass="mt-[-30px]"/>
            {/if}

        </ModalPanel>

    {/if}

    <!---Message--->
    {#if action == 'messaging'}
        <ModalPanel>
            <ModalPanelHeading on:click={() => returnMainMenu()} title="Send Direct Message" />   

            <ModalScrollArea>
                <SendDMForm person={item.creator} on:sendMessage={() => returnMainMenu() }/>
            </ModalScrollArea>
        </ModalPanel>
    {/if}


    <!---Default/Moderation Action List--->
    {#if action == 'none'}
        <ModalPanel>
            <ModalScrollArea card={false}>
                <!---Community and User Indicators/Links--->
                <Card class="p-2 w-full">
                    <div class="flex flex-row gap-2 justify-between w-full items-center text-xs sm:text-sm overflow-hidden">
                        <span class="w-1/2">
                            <CommunityLink community={item.community} avatar inline={false} avatarSize={48} />
                        </span>

                        <span class="ml-auto">
                            <UserLink user={item.creator} avatar inline={false} avatarSize={48} community_banned={item.creator_banned_from_community} mod={item.creator_is_moderator} admin={item.creator_is_admin} />
                        </span>
                    </div>
                </Card>

                <!--Main Menu Buttons--->            
                <div class="flex flex-col gap-2 px-8 mt-0 w-full items-center">
                    
                    <!---Community Details--->
                    <Button color="tertiary-border" icon={InformationCircle} iconSize={20} alignment="left" class="w-full" 
                        on:click={() => {
                            modalWidth = panelWidths['communityInfo']
                            action = 'communityInfo' 
                        }}
                    >
                        Community Details...
                    </Button>


                    <!---Creator's Modlog History--->
                    <Button color="tertiary-border" icon={Newspaper} iconSize={20} alignment="left" class="w-full"
                        on:click={() => {
                            modalWidth = panelWidths['modlog']
                            action = 'modlog'
                        }}
                    >
                        Creator's Modlog History...
                    </Button>

                    <!---View Submissions--->
                    <Button color="tertiary-border" icon={WindowIcon} iconSize={20} alignment="left" class="w-full"
                        on:click={() => {
                            action = 'userSubmissions'
                            modalWidth = panelWidths['userSubmissions']
                        }}
                    >
                        Submissions in Community...
                    </Button>


                    <!---Vote Viewer--->
                    {#if !purged && ( isAdmin($profile?.user) || (minAPIVersion("0.19.4") && amMod($profile?.user, item.community)) )  }
                        <Button color="tertiary-border" icon={HandThumbUp} iconSize={20} alignment="left" class="w-full" 
                            on:click={() => {
                                modalWidth = panelWidths['showVotes']
                                action = 'showVotes'
                            }}
                        >
                            View Votes...
                        </Button>
                    {/if}

                    <!---Report Item Button (Only useful for local admins)--->
                    {#if !purged && !removed && $profile?.user && isAdmin($profile?.user)}
                        <Button color="tertiary-border" icon={Flag} iconSize={20} alignment="left" class="w-full" 
                            on:click={() => {
                                modalWidth = panelWidths['reporting']
                                action = 'reporting'
                            }}
                        >
                            Report {isCommentView(item) ? 'Comment' : 'Post'}...
                        </Button>
                    {/if}
                    

                    <!---Send Message Creator--->
                    <Button color="tertiary-border" icon={Envelope} iconSize={20} alignment="left" class="w-full" 
                        on:click={() => {
                            modalWidth = panelWidths['messaging']
                            action = 'messaging'
                        }}
                        >
                        Send Message to Creator...
                    </Button>


                    <!---Remove/Restore Item--->
                    {#if !purged && (amMod($profile?.user, item.community) || isAdmin($profile?.user) )}
                        <Button color="tertiary-border" icon={Trash} iconSize={20} alignment="left" class="w-full" 
                            on:click={() => {
                                modalWidth = panelWidths['removing']
                                remove.purge = false
                                action = 'removing'
                            }}
                        >
                            {removed ? 'Restore' : 'Remove'} {isCommentView(item) ? 'Comment' : 'Post'}...
                        </Button>
                    {/if}

                    
                    

                    <!---Purge Item--->
                    {#if !purged && isAdmin($profile?.user) }
                        <Button color="tertiary-border" icon={Fire} iconSize={20} alignment="left" class="w-full" 
                            on:click={() => {
                                modalWidth = panelWidths['removing']
                                remove.purge = true
                                action = 'removing'
                            }}
                        >
                            Purge {isCommentView(item) ? 'Comment' : 'Post'}...
                        </Button>
                    {/if}

                    <!---Ban User (Community) --->
                    {#if item.creator.id != $profile?.user?.local_user_view.person.id && (amMod($profile?.user, item.community) || isAdmin($profile?.user))}
                        <Button color="tertiary-border" icon={NoSymbol} iconSize={20} alignment="left" class="w-full" 
                            on:click={() => {
                                modalWidth = panelWidths['banning']
                                banCommunity = item.community
                                action = 'banning'
                            }}
                        >
                            {item.creator_banned_from_community ? 'Unban' : 'Ban'} From This Community...
                        </Button>
                    {/if}

                    <!---Ban User From All Communities--->
                    {#if item.creator.id != $profile?.user?.local_user_view.person.id && amModOfAny($profile?.user)}
                        <Button color="tertiary-border" icon={Scale} iconSize={20} alignment="left" class="w-full" 
                            on:click={() => {
                                modalWidth = panelWidths['communityBanning']
                                banCommunity = undefined
                                action = 'communityBanning'
                            }}
                        >
                            Ban/Unban All My Communities...
                        </Button>
                    {/if}
                    
                    <!---Ban User (Instance) --->
                    {#if item.creator.id != $profile?.user?.local_user_view.person.id && isAdmin($profile?.user) }
                        <Button color="tertiary-border" icon={NoSymbol} iconSize={20} alignment="left" class="w-full" 
                            on:click={() => {
                                modalWidth = panelWidths['banning']
                                banCommunity = undefined
                                action = 'banning'
                            }}
                        >
                            {item.creator.banned ? 'Unban' : 'Ban'} From Instance...
                        </Button>
                    {/if}
                </div>
            </ModalScrollArea>
        </ModalPanel>
    {/if}

</Modal>