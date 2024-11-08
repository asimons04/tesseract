<script lang="ts">

    import type { CommentView, Community, PostView } from 'lemmy-js-client'
    import type { 
        PurgeCommentEvent,
        PurgePostEvent
    } from '$lib/ui/events'

    import { amMod, isAdmin } from '../moderation/moderation'
    import { dispatchWindowEvent } from '$lib/ui/events';
    import { expoIn } from 'svelte/easing'
    import { getClient } from '$lib/lemmy'
    import { isCommentView } from '$lib/lemmy/item'
    import { profile } from '$lib/auth'
    import { shortenCommunityName } from '../community/helpers'
    import { slide } from 'svelte/transition'
    import { toast } from '$lib/components/ui/toasts/toasts'



    import Avatar from '$lib/components/ui/Avatar.svelte'
    import BanUserForm from './components/BanUserForm.svelte'
    import Button from "$lib/components/input/Button.svelte"
    import Card from '$lib/components/ui/Card.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import EmbeddableModlog from './components/EmbeddableModlog.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import RemoveItemForm from './components/RemoveItemForm.svelte'
    import ReportItemForm from './components/ReportItemForm.svelte'
    import SendDMForm from "./components/SendDMForm.svelte"
    import UserLink from '../user/UserLink.svelte'
    import UserSubmissionFeed from './components/UserSubmissionFeed.svelte'
    import VoteViewer from './components/VoteViewer.svelte'

    import { 
        ArrowLeft,
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
        ShieldExclamation, 
        Sparkles, 
        Trash,
        Window as WindowIcon
    } from "svelte-hero-icons"
    
    
    
    
    
    
    
    export let open: boolean = false
    export let item: PostView | CommentView

    let action: 'none' | 'banning' | 'communityInfo' | 'modlog' | 'messaging' | 'showVotes' | 'removing' | 'reporting' | 'userSubmissions' = 'none'
    let defaultWidth = 'max-w-xl'
    let modalWidth = defaultWidth

    let locking = false
    let pinning = false
    let pinningInstance = false
    let purged  = false
    let submissionType: 'all' | 'posts' | 'comments' = 'all'
    let banCommunity: Community | undefined = undefined
    let modlogCommunityOnly = true

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
        modalWidth = defaultWidth
        action = 'none'
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

</script>


<svelte:window 
    on:purgePost={handlePurgeItem} 
    on:purgeComment={handlePurgeItem}
    on:clickIntoPost={() => open = false }
/>

<Modal bind:open icon={ShieldExclamation} title="Moderation" card={false} preventCloseOnClickOut width={modalWidth}>
    
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



    <!---User Submissions in the Community--->
    {#if action == 'userSubmissions'}
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

                <div class="flex flex-row w-full items-center justify-between">
                    <span class="text-lg">
                        Posts/Comments
                    </span>

                    <MultiSelect headless
                        options={['all', 'posts', 'comments']}
                        optionNames={['All', 'Posts', 'Comments']}
                        bind:selected={submissionType}
                    />
                </div>
            </div>
            
            <div class="flex flex-col w-full max-h-[70vh]">
                <UserSubmissionFeed person_id={item.creator.id} community_id={item.community.id} bind:type={submissionType} />    
            </div>
        </div>
    {/if}

    <!---Report the Submission--->
    {#if action == 'reporting'}
        <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>
                
            <!---Section Header--->
            <div class="flex flex-row gap-4 items-center">
                <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                    on:click={()=> returnMainMenu()}  
                />
                <span class="text-lg">
                    Reporting
                    {isCommentView(item) ? 'Comment' : 'Post'}
                </span>
            </div>
            

            <!---Remove/Purge/Restore Form--->
            <Card class="flex flex-col p-4">    
                <ReportItemForm bind:item on:reported={() => returnMainMenu() }/>
            </Card>
        </div>
    {/if}

    <!---Remove/Restore/Purge Content--->
    {#if action == 'removing'}
    
        <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>
            
            <!---Section Header--->
            <div class="flex flex-row gap-4 items-center">
                <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                    on:click={()=> returnMainMenu()}  
                />
                <span class="text-lg">
                    { remove.purge  ? 'Purging'  : removed ? 'Restoring' : 'Removing' } 
                    {isCommentView(item) ? 'Comment' : 'Post'}
                </span>
            </div>
            

            <!---Remove/Purge/Restore Form--->
            <Card class="flex flex-col p-4">
                <RemoveItemForm bind:item bind:removed bind:purged purge={remove.purge} on:finish={() => returnMainMenu()}/>
            </Card>
            
        </div>
    
    {/if}

    <!---Ban/Unban--->
    {#if action == 'banning'}
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
                <span class="text-lg">
                    {(banCommunity ? item.creator_banned_from_community : item.creator.banned) ? 'Unban' : 'Ban'} User From {banCommunity ? 'Community' : 'Instance'}
                </span>
            </div>

            <!---Ban/Unban Instance/Community Form--->
            <Card class="flex flex-col p-4">
                <BanUserForm bind:person={item.creator} bind:creator_banned_from_community={item.creator_banned_from_community} bind:community={banCommunity}
                    on:ban={() => returnMainMenu()}
                />
            </Card>
        </div>
    {/if}
    
    <!---Vote Viewer--->
    {#if action == 'showVotes'}
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
                <span class="text-lg">
                    {isCommentView(item) ? 'Comment' : 'Post'} Votes
                </span>
            </div>

            <!---Ban/Unban Instance/Community Form--->
            <Card class="flex flex-col p-4">
                <VoteViewer {item} />
            </Card>
        </div>
    {/if}

    <!---Community Details--->
    {#if action == 'communityInfo'}
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
                <span class="text-lg">
                    Community Info
                </span>
            </div>

            <!--- Community Icon, Name, and Instance Header--->
            <div class="flex flex-col gap-2">
                <span class="flex flex-row gap-4 items-center font-bold text-center">
                    <Avatar width={64} community={true} alt={item.community.name} url={item.community.icon} />
                    
                    <span class="flex flex-col items-start gap-0">
                        <span class="text-2xl capitalize truncate">
                            {shortenCommunityName(item.community.title, 40) ?? item.community.name}
                        </span>
                        
                        <span class="text-slate-500 dark:text-zinc-500 text-xl font-normal">
                            {new URL(item.community.actor_id).hostname}
                        </span>
                    </span>
                </span>
            </div>

            <!---Ban/Unban Instance/Community Form--->
            <Card class="flex flex-col p-4 gap-4 max-h-[50vh] overflow-y-auto">
                <!---Community Details Markdown--->
                <Markdown source={item.community.description ?? 'No community description was provided.'} />
            </Card>
        </div>
    {/if}
    
    <!---Modlog--->
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

                    <span class="flex flex-row gap-1">
                        <Button size="sm" color="tertiary-border" class="h-8"
                            icon={Newspaper}
                            on:click={() => {
                                modlogCommunityOnly = !modlogCommunityOnly

                            }}
                        >
                            {modlogCommunityOnly ? 'All' : 'Community'}
                        </Button>
                    </span>
                </div>
            </div>

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

        </div>

    {/if}

    <!---Message--->
    {#if action == 'messaging'}
        <div class="flex flex-col gap-4 mt-0 w-full" transition:slide={{easing:expoIn}}>     
                    
            <!---Section Header--->
            <div class="flex flex-row gap-4 items-center">
                <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                    disabled={item.creator.banned}
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
                <SendDMForm person={item.creator} on:sendMessage={() => returnMainMenu() }/>
            </Card>
        </div>
    {/if}


    <!---Default/Moderation Action List--->
    {#if action == 'none'}
        <div class="flex flex-col gap-2 mt-0 w-full items-center" transition:slide={{easing:expoIn}}>
            
            <Card class="p-2 w-full">
                <div class="flex flex-row gap-2 justify-between w-full items-center text-xs sm:text-sm overflow-hidden">
                    <CommunityLink community={item.community} avatar inline={false} avatarSize={48} />
                    <UserLink user={item.creator} avatar inline={false} avatarSize={48} community_banned={item.creator_banned_from_community} mod={item.creator_is_moderator} admin={item.creator_is_admin} />
                </div>
            </Card>

            
            <div class="flex flex-col gap-2 px-8 mt-0 w-full items-center">
                <!---Community Info--->
                <Button color="tertiary-border" icon={InformationCircle} alignment="left" class="w-full" 
                    on:click={() => {
                        modalWidth='max-w-3xl'
                        action = 'communityInfo' 
                    }}
                >
                    Community Details...
                </Button>


                <!---Creator's Modlog History--->
                <Button color="tertiary-border" icon={Newspaper} alignment="left" class="w-full"
                    on:click={() => {
                        modalWidth = 'max-w-4xl'
                        action = 'modlog'
                    }}
                >
                    Creator's Modlog History...
                </Button>

                <!---View Submissions--->
                <Button color="tertiary-border" icon={WindowIcon} alignment="left" class="w-full"
                    on:click={() => {
                        modalWidth = "max-w-3xl"
                        action = 'userSubmissions'
                    }}
                >
                    Posts/Comments in Community...
                </Button>


                <!---Vote Viewer--->
                {#if !purged && isAdmin($profile?.user)}
                    <Button color="tertiary-border" icon={HandThumbUp} alignment="left" class="w-full" 
                        on:click={() => {
                            action = 'showVotes' 
                        }}
                    >
                        View Votes...
                    </Button>
                {/if}

                <!---Report Item Button (Only useful for local admins)--->
                {#if !purged && !removed && $profile?.user && isAdmin($profile?.user)}
                    <Button color="tertiary-border" icon={Flag} alignment="left" class="w-full" 
                        on:click={() => {
                            modalWidth='max-w-3xl'
                            action = 'reporting'
                        }}
                    >
                        Report {isCommentView(item) ? 'Comment' : 'Post'}...
                    </Button>
                {/if}
                

                <!---Send Message Creator--->
                <Button color="tertiary-border" icon={Envelope} alignment="left" class="w-full" 
                    on:click={() => {
                        modalWidth='max-w-3xl'
                        action = 'messaging'
                    }}
                    >
                    Send Message to Creator...
                </Button>


                <!---Remove/Restore Item--->
                {#if !purged && (amMod($profile?.user, item.community) || isAdmin($profile?.user) )}
                    <Button color="tertiary-border" icon={Trash} alignment="left" class="w-full" 
                        on:click={() => {
                            modalWidth='max-w-3xl'
                            remove.purge = false
                            action = 'removing'
                        }}
                    >
                        {removed ? 'Restore' : 'Remove'} {isCommentView(item) ? 'Comment' : 'Post'}...
                    </Button>
                {/if}

                
                

                <!---Purge Item--->
                {#if !purged && isAdmin($profile?.user) }
                    <Button color="tertiary-border" icon={Fire} alignment="left" class="w-full" 
                        on:click={() => {
                            modalWidth='max-w-3xl'
                            remove.purge = true
                            action = 'removing'
                        }}
                    >
                        Purge {isCommentView(item) ? 'Comment' : 'Post'}...
                    </Button>
                {/if}

                <!---Ban User (Community) --->
                {#if item.creator.id != $profile?.user?.local_user_view.person.id && (amMod($profile?.user, item.community) || isAdmin($profile?.user))}
                    <Button color="tertiary-border" icon={NoSymbol} alignment="left" class="w-full" 
                        on:click={() => {
                            modalWidth='max-w-3xl'
                            banCommunity = item.community
                            action = 'banning'
                        }}
                    >
                        {item.creator_banned_from_community ? 'Unban' : 'Ban'} Community...
                    </Button>
                {/if}
                
                <!---Ban User (Instance) --->
                {#if item.creator.id != $profile?.user?.local_user_view.person.id && isAdmin($profile?.user) }
                    <Button color="tertiary-border" icon={NoSymbol} alignment="left" class="w-full" 
                        on:click={() => {
                            modalWidth='max-w-3xl'
                            banCommunity = undefined
                            action = 'banning'
                        }}
                    >
                        {item.creator.banned ? 'Unban' : 'Ban'} Instance...
                    </Button>
                {/if}
            </div>
        </div>
    {/if}

</Modal>