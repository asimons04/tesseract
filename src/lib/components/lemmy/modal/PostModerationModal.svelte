<script lang="ts">
   
    interface RemoveItemContainer {
        purge: boolean
        reason: string
        loading: boolean
        replyWithReason: boolean
        replyReason: string
        privateMessage: boolean

        reset: any
        remove: any
        setReplyReason: any
    }

    interface ShowVoteContainer {
        loading: boolean
        fetchError: boolean
        scrollArea: HTMLDivElement | undefined
        votes: VoteView[] 
        
        page: number
        limit: number
        infiniteScrollState: InfiniteScrollStateVars
        
        init: any 
        listCommentLikes: any
        listPostLikes: any
        loadMore: any
    }

    import type { CommentView, Community, Person, PostView, VoteView } from 'lemmy-js-client'
    import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'

    import { amMod, isAdmin, removalTemplate } from '../moderation/moderation';
    import { dispatchWindowEvent } from '$lib/ui/events';
    import { fullCommunityName } from '$lib/util';
    import { getClient } from '$lib/lemmy'
    import { goto } from '$app/navigation';
    import { isCommentView } from '$lib/lemmy/item';
    import { isPostView } from '$lib/components/lemmy/post/helpers'
    import { profile } from '$lib/auth'
    import { shortenCommunityName } from '../community/helpers';
    import { slide } from 'svelte/transition'
    import { toast } from '$lib/components/ui/toasts/toasts'
    import { userSettings } from '$lib/settings'


    import Avatar from '$lib/components/ui/Avatar.svelte'
    import BanUserForm from './components/BanUserForm.svelte';
    import Button from "$lib/components/input/Button.svelte"
    import Card from '$lib/components/ui/Card.svelte'
    import CommentMeta from '../comment/CommentMeta.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import EmbeddableModlog from './components/EmbeddableModlog.svelte';
    import InfiniteScrollDiv from '$lib/components/ui/infinitescroll/InfiniteScrollDiv.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import PostMeta from '../post/PostMeta.svelte'
    import ReportItemForm from './components/ReportItemForm.svelte'
    import SendDMForm from "./components/SendDMForm.svelte"
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '../user/UserLink.svelte'

    import { 
        ArrowDown,
        ArrowLeft,
        ArrowUp,
        ChatBubbleLeft,
        ChatBubbleLeftRight,
        Envelope,
        ExclamationTriangle,
        Fire,
        Flag,
        HandThumbUp,
        Icon,
        InformationCircle,
        LockClosed,
        MapPin,
        Megaphone,
        Newspaper,
        NoSymbol,
        ShieldExclamation, 
        Sparkles, 
        Trash,
    } from "svelte-hero-icons"
    
    
    
    export let open: boolean = false
    export let item: PostView | CommentView

    let action: 'none' | 'banning' | 'communityInfo' | 'modlog' | 'messaging' | 'showVotes' | 'removing' | 'reporting' = 'none'
    let defaultWidth = 'max-w-xl'
    let modalWidth = defaultWidth

    let locking = false
    let pinning = false
    let pinningInstance = false
    let purged  = false
    
    let banCommunity: Community | undefined = undefined
    let modlogCommunityOnly = true

    // Make the Post/Comment item reactive
    $: item
    
    // Watch the reply reason options and automatically update the mod reply based on the removal / restore reason.
    $: remove.replyReason = remove.replyWithReason ? remove.setReplyReason(remove.reason) : ''

    // Reactive helper variable to determine if the item is removed.
    $:  removed = item
            ? isCommentView(item)
                ? item.comment.removed
                : item.post.removed
            : false

    // Object to hold the components for removing a submission
    let remove = {
        purge: false,
        reason: '',
        loading: false,
        replyWithReason: false,
        replyReason: '',
        privateMessage: false,
        
        reset: function() {
            remove.purge = false
            remove.reason = ''
            remove.loading = false
            remove.replyWithReason = false
            remove.replyReason = ''
            remove.privateMessage = false
        },

        remove: async function () {
            if (!item) return
            if (!$profile?.jwt) throw new Error('Unauthenticated')

            remove.loading = true

            try {
                if (remove.purge) {
                    
                    // Purge Comment
                    if (isCommentView(item)) {
                        await getClient(undefined).purgeComment({
                            comment_id: item.comment.id,
                            reason: remove.reason,
                        })

                        dispatchWindowEvent('purgeComment', {
                            comment_id: item.comment.id,
                            purged: true
                        })
                    } 
                    // Purge Post
                    else {
                        await getClient(undefined).purgePost({
                            post_id: item.post.id,
                            reason: remove.reason,
                        })

                        dispatchWindowEvent('purgePost', {
                            post_id: item.post.id,
                            purged: true
                        })
                    }
                    
                    toast({
                        content: 'Successfully purged that submission.',
                        type: 'success',
                        title: 'Success'
                    })
                    
                    // Return to mod menu and set purged flag to true
                    purged = true
                    remove.reset()
                    returnMainMenu()
                    return
                }

            
                // Remove Comment
                if (isCommentView(item)) {
                    await getClient().removeComment({
                        comment_id: item.comment.id,
                        removed: !removed,
                        reason: remove.reason || undefined,
                    })
                    item.comment.removed = !removed
                    
                    dispatchWindowEvent('removeComment', {
                        comment_id: item.comment.id,
                        removed: item.comment.removed
                    })
                } 

                // Remove Post
                else if (isPostView(item)) {
                    await getClient().removePost({
                        post_id: item.post.id,
                        removed: !removed,
                        reason: remove.reason || undefined,
                    })
                    item.post.removed = !removed
                    
                    dispatchWindowEvent('removePost', {
                        post_id: item.post.id,
                        removed: item.post.removed
                    })
                }

                // Send reply with removal reason if selected
                if (remove.replyWithReason) {
                    if (remove.replyReason == '') {
                        toast({
                            content: 'Your reply cannot be empty if "Reply reason" is enabled.',
                            type: 'warning',
                            title: 'Reply Text is Required'
                        })
                        return
                    }
                    
                    // Send a DM or comment depending on selected option
                    if (remove.privateMessage) {
                        await getClient()
                            .createPrivateMessage({
                                content: remove.replyReason,
                                recipient_id: isCommentView(item)
                                    ? item.comment.creator_id
                                    : item.post.creator_id,
                            })
                            .catch(() => {
                                toast({
                                    content: 'Failed to message user. Removing anyway...',
                                    type: 'warning',
                                })
                            })
                    } else {
                        await getClient().createComment({
                            content: remove.replyReason,
                            post_id: item.post.id,
                            parent_id: isCommentView(item) ? item.comment.id : undefined,
                        })
                        .catch(() => {
                            toast({
                                content: 'Failed to post reply. Removing anyway...',
                                type: 'warning',
                            })
                        })
                    }
                }
                

                // Return to the mod menu and reset the reason value
                remove.reset()
                returnMainMenu()

                toast({
                    content: `Successfully ${removed ? 'restored' : 'removed'} that submission.`,
                    type: 'success',
                    title: 'Success'
                })
            } catch (err) {
                toast({
                    content: (err as any) ?? 'The API returned an error when processing this request, but no details were provided.',
                    type: 'error',
                    title: 'Error'
                })
            }
        },

        setReplyReason: function (reason: string) {
            if (!item) return `no template`

            return removalTemplate($userSettings.moderation.removalReasonPreset, {
                communityLink: `!${fullCommunityName(item!.community.name, item!.community.actor_id)}`,
                postTitle: item.post.name,
                reason: reason,
                username: item.creator.name,
            })
        }

    } as RemoveItemContainer
    

    
    // Object to hold the vote viewer components
    let showVotes = {
        loading: false,
        fetchError: false,
        scrollArea: undefined,
        votes: [] as VoteView[],
        page: 1,
        limit: 50,
        
        init:  async function() {
            showVotes.loading = true
            showVotes.page  = 1
            showVotes.votes = []
            showVotes.votes = (isCommentView(item))
                ? await showVotes.listCommentLikes(item.comment.id)
                : await showVotes.listPostLikes(item.post.id)
        
            if (showVotes.page == 1 && showVotes.votes.length < showVotes.limit) {
                showVotes.infiniteScrollState.exhausted = true
            }
        
            showVotes.loading = false
        },

        listCommentLikes: async function(commentID:number):Promise<VoteView[]> {
            try {
                let result = await getClient().listCommentLikes({
                    comment_id: commentID,
                    limit: showVotes.limit,
                    page: showVotes.page
                })
                if (result.comment_likes) return result.comment_likes
                return [] as VoteView[]
            }
            catch {
                showVotes.fetchError = true
                return [] as VoteView[]
            }
        },

        listPostLikes: async function (postID:number):Promise<VoteView[]> {
            try {
                let result = await getClient().listPostLikes({
                    post_id: postID,
                    limit: showVotes.limit,
                    page: showVotes.page
                })
                if (result.post_likes) return result.post_likes
                return [] as VoteView[]
            }
            catch {
                showVotes.fetchError = true
                return [] as VoteView[]
            }
        },

        loadMore: async function() {
            showVotes.page++
            let nextBatch = (isCommentView(item))
                ? await showVotes.listCommentLikes(item.comment.id)
                : await showVotes.listPostLikes(item.post.id)
            
            if (nextBatch.length < 1) { 
                showVotes.page--
                showVotes.infiniteScrollState.exhausted = true
                showVotes.infiniteScrollState.loading = false
                return
            }
            
            nextBatch.forEach((vote:VoteView) => {
                const index = showVotes.votes?.findIndex((v) => v.creator.id == vote.creator.id)
                if (index< 0) showVotes.votes.push(vote)
            })
            showVotes.votes = showVotes.votes
            showVotes.infiniteScrollState.loading = false
        }
    } as ShowVoteContainer


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
</script>


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

    <!---Report the Submission--->
    {#if action == 'reporting'}
        <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>
                
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
    
        <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>
            
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
                <form class="flex flex-col gap-4 list-none" on:submit|preventDefault={remove.remove}>
                    
                    {#if !isCommentView(item)}
                        <PostMeta post={item} actions={false} expandCompact={false} noClick/>
                    {:else}
                        <CommentMeta comment={item} content noClick/>
                    {/if}


                    <MarkdownEditor rows={6} previewButton images={false} label="Reason" placeholder="Optional" bind:value={remove.reason}>
                        <Button 
                            color={remove.purge ? 'danger' : 'primary'} 
                            icon={remove.purge ? Fire : Trash}
                            iconSize={16}
                            size="lg" 
                            loading={remove.loading} 
                            disabled={remove.loading} 
                            submit 
                            slot="actions"
                        >
                            { remove.purge ? 'Purge' : removed ? 'Restore' : 'Remove' }
                        </Button>
                    </MarkdownEditor>
                    
                    <!--- Only show "Reply with reason" if you're a mod of the community or an admin and the content is local--->
                    {#if !removed &&  !remove.purge && ( amMod($profile?.user, item.community) || (isAdmin($profile?.user) && item.community.local))}
                        <SettingToggleContainer>
                            <SettingToggle bind:value={remove.replyWithReason} icon={ChatBubbleLeft} title="Reply with Reason" 
                                description="Send the user a comment or DM with the reason for the the mod action" 
                            />
                            
                            <SettingMultiSelect icon={ChatBubbleLeftRight} title="Message Type" 
                                description="Choose whether to reply as a comment to the removed item or as a direct message"
                                options={[false, true]} optionNames={['Comment', 'Message']} bind:selected={remove.privateMessage}
                                condition={remove.replyWithReason}
                            />
                        </SettingToggleContainer>

                        {#if remove.replyWithReason}
                            <MarkdownEditor previewButton images={false} bind:value={remove.replyReason} placeholder={remove.replyReason} rows={6} label="Reply"/>
                        {/if}
                    {/if}
                </form>
            </Card>
            
        </div>
    
    {/if}

    <!---Ban/Unban--->
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
                <span class="text-lg">
                    {isCommentView(item) ? 'Comment' : 'Post'} Votes
                </span>
            </div>

            <!---Ban/Unban Instance/Community Form--->
            <Card class="flex flex-col p-4">
                {#if showVotes.loading}
                    <div class="flex w-full">
                        <span class="flex flex-col gap-4 mx-auto my-auto">
                            <Spinner width={64} />
                        </span>
                    </div>
                {/if}
            
                {#if !showVotes.loading && showVotes.fetchError}
                    <Placeholder icon={ExclamationTriangle} title="Fetch Error" description="There was an error during the fetch for this request. Please try again later." />    
                {/if}
            
                {#if showVotes.votes}
                    <div bind:this={showVotes.scrollArea} class="flex flex-col overflow-y-scroll max-h-[500px] divide-y divide-slate-200 dark:divide-zinc-500 px-4">
                        {#each showVotes.votes as vote}
                            <div class="flex flex-row w-full items-center gap-2 py-2 text-base">
                                <span class="flex w-full">
                                    <UserLink bind:user={vote.creator} avatar avatarSize={24} ring />
                                </span>
                                
                                <span class="flex ml-auto {vote.score > 0 ? 'text-sky-500' : 'text-red-500'} font-bold">
                                    <Icon mini width={24} src={vote.score > 0 ? ArrowUp : ArrowDown}/>
                                </span>
                            </div>
                        {/each}
                        
                        
                        <div class="flex flex-col items-center pt-2 w-full">
                            <InfiniteScrollDiv bind:state={showVotes.infiniteScrollState} bind:element={showVotes.scrollArea} threshold={500}
                                on:loadMore={ () => showVotes.loadMore() }
                            />
                        </div>
                    
                    </div>
                {/if}
            </Card>
        </div>
    {/if}

    <!---Community Details--->
    {#if action == 'communityInfo'}
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
                <EmbeddableModlog moderatee={item.creator} community={item.community} headingRowClass="mt-[-50px]"/>
            {:else}
                <EmbeddableModlog moderatee={item.creator}  headingRowClass="mt-[-50px]"/>
            {/if}

        </div>

    {/if}

    <!---Message--->
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
                <SendDMForm person={item.creator} on:sendMessage={() => returnMainMenu() }/>
            </Card>
        </div>
    {/if}


    <!---Default/Moderation Action List--->
    {#if action == 'none'}
        <div class="flex flex-col gap-2 mt-0 w-full items-center" transition:slide>
            
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


                <!---Vote Viewer--->
                {#if !purged && isAdmin($profile?.user)}
                    <Button color="tertiary-border" icon={HandThumbUp} alignment="left" class="w-full" 
                        on:click={() => {
                            showVotes.init()
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

                <!---Send Message Creator--->
                <Button color="tertiary-border" icon={Envelope} alignment="left" class="w-full" 
                    on:click={() => {
                        modalWidth='max-w-3xl'
                        action = 'messaging'
                    }}
                >
                    Send Message to Creator...
                </Button>
                

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