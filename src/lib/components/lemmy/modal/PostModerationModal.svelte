<script lang="ts">
    interface BanContainer {
        reason: string
        loading: boolean
        removeContent: boolean
        community?: Community
        expiry: string

        banUser: any
        reset: any
    }
    
    interface ModlogContainer {
        loading: boolean   
        searchURL: URL
        page: number
        fetchError: boolean
        results: ModLog[]
        containerDiv: HTMLDivElement | undefined
        showThisCommunityOnly: boolean

        init: any
        load: any
        clearCommunity: any
        setCommunity: any
        clearUser: any
        setUser: any
        setPage: any
        reset: any
    }
    
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

    import type { CommentView, Community, PostView, VoteView } from 'lemmy-js-client'
    import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'
    import type { ModLog } from '$routes/modlog/+page'

    import { amMod, isAdmin, removalTemplate } from '../moderation/moderation';
    import { dispatchWindowEvent } from '$lib/ui/events';
    import { fullCommunityName } from '$lib/util';
    import { getClient } from '$lib/lemmy'
    import { goto } from '$app/navigation';
    import { isComment, isCommentView } from '$lib/lemmy/item';
    import { isPostView } from '$lib/components/lemmy/post/helpers'
    import { load as loadModlog } from '$routes/modlog/+page'
    import { profile } from '$lib/auth'
    import { shortenCommunityName } from '../community/helpers';
    import { slide } from 'svelte/transition'
    import { toast } from '$lib/components/ui/toasts/toasts'
    import { userSettings } from '$lib/settings'


    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from "$lib/components/input/Button.svelte"
    import Card from '$lib/components/ui/Card.svelte'
    import CommentMeta from '../comment/CommentMeta.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import InfiniteScrollDiv from '$lib/components/ui/infinitescroll/InfiniteScrollDiv.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import ModlogItemList from '$routes/modlog/item/ModlogItemList.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import PostMeta from '../post/PostMeta.svelte'
    import SettingDateInput from '$lib/components/ui/settings/SettingDateInput.svelte'
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '../user/UserLink.svelte'

    import { 
        ArrowDown,
        ArrowLeft,
        ArrowPath,
        ArrowUp,
        CalendarDays,
        ChatBubbleLeft,
        ChatBubbleLeftRight,
        ExclamationTriangle,
        Fire,
        HandThumbUp,
        Icon,
        InformationCircle,
        LockClosed,
        LockOpen,
        Megaphone,
        Newspaper,
        NoSymbol,
        ShieldExclamation, 
        Sparkles, 
        Trash,
    } from "svelte-hero-icons"
    
    export let open: boolean = false
    export let item: PostView | CommentView

    let action: 'none' | 'banning' | 'communityInfo' | 'modlog' | 'showVotes' | 'removing' = 'none'
    let defaultWidth = 'max-w-xl'
    let modalWidth = defaultWidth

    let locking = false
    let pinning = false
    let pinningInstance = false
    let purged  = false
    
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
    

    // Object to hold the components for banning a user
    let ban = {
        community: undefined,
        reason: '',
        expiry: '',
        loading: false,
        removeContent: false,

        banUser: async function() {
            if (!$profile?.user || !$profile?.jwt) return
        
        
            ban.loading = true
            let bannedInstance = item.creator.banned
            let bannedCommunity = item.creator_banned_from_community
        
            try {
                let date: number | undefined
                // Validate ban expiry date
                if (ban.expiry != '') {
                    date = Date.parse(ban.expiry)
                    if (Number.isNaN(date) || date < Date.now()) {
                        //invalidDateErrorToast()
                        ban.loading = false
                        return
                    }
                }

                // Ban from community if `community` is provided in the call
                if (ban.community) {
                    const response = await getClient().banFromCommunity({
                        ban: item.creator_banned_from_community ? false : true ,
                        community_id: item.community.id,
                        person_id: item.creator.id,
                        reason: ban.reason || undefined,
                        remove_data: ban.removeContent,
                        expires: date ? Math.floor(date / 1000) : undefined,
                    })

                    bannedCommunity = response?.banned
                    
                    // Dispatch global event so other components can react
                    dispatchWindowEvent('banCommunity', {
                        person_id: item.creator.id,
                        community_id: item.community.id,
                        banned: bannedCommunity,
                        remove_content: ban.removeContent
                    })

                }
                
                // Ban from instance if no community provided
                else {
                    const response = await getClient().banPerson({
                        ban: !item.creator.banned,
                        person_id: item.creator.id,
                        reason: ban.reason || undefined,
                        remove_data: ban.removeContent,
                        expires: date ? Math.floor(date / 1000) : undefined,
                    })

                    bannedInstance = response?.person_view.person.banned

                    // Dispatch global event so other components can react
                    dispatchWindowEvent('banUser', {
                        person_id: item.creator.id,
                        banned: bannedInstance,
                        remove_content: ban.removeContent
                    })

                }
                
                toast({
                    content: `Successfully ${ (ban.community ? bannedCommunity : bannedInstance ) ? 'banned' : 'unbanned'}  ${item.creator.name}@${new URL(item.creator.actor_id).hostname} ${ban.community ? 'from the community' : 'from the instance'}.`,
                    type: 'success',
                    title: 'Success'
                })

                returnMainMenu()
                ban.reset()

            } catch (err) {
                ban.loading = false
                toast({
                    content: err as any,
                    type: 'error',
                    title: 'Error'
                })
            }
        
        
        },

        reset: function() {
            ban.community = undefined
            ban.reason = ''
            ban.expiry = ''
            ban.loading = false
            ban.removeContent = false
        }
    } as BanContainer

    
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

    // Object to hold the modlog viewer components
    let modlog = {
        loading: false,
        searchURL: new URL('https://localhost'),
        page: 1,
        results: [] as ModLog[], 
        fetchError: false,
        containerDiv: undefined,
        showThisCommunityOnly: true,

        init: async function() {
            modlog.reset()
            modlog.setPage()
            modlog.setUser()
            modlog.setCommunity()
            modlog.load()
        },

        load: async function () {
            modlog.loading = true
            
            try {
                modlog.results = (await loadModlog({url: modlog.searchURL})).modlog
            }
            catch {
                modlog.fetchError = true
                modlog.results = [] as ModLog[]
            }
            modlog.loading = false
        },

        setPage: function(pageNum?:number) {
            if (pageNum) modlog.page = pageNum
            modlog.searchURL.searchParams.set('page', modlog.page.toString())
        },

        clearCommunity: function() {
            modlog.searchURL.searchParams.delete('community')
        },

        setCommunity: function() {
            modlog.searchURL.searchParams.set('community', item.community.id.toString())
        },

        clearUser: function() {
            modlog.searchURL.searchParams.delete('other_person_id')
        },

        setUser: function() {
            modlog.searchURL.searchParams.set('other_person_id', item.creator.id.toString())
        },

        reset: function() {
            modlog.page = 1
            modlog.fetchError = false
            modlog.loading = false
            modlog.showThisCommunityOnly = true
        }
    } as ModlogContainer
    


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
                        <PostMeta post={item} noClick/>
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
                    {(ban.community ? item.creator_banned_from_community : item.creator.banned) ? 'Unban' : 'Ban'} User From {ban.community ? 'Community' : 'Instance'}
                </span>
            </div>

            <!---Ban/Unban Instance/Community Form--->
            <Card class="flex flex-col p-4">
                <form class="flex flex-col gap-4" on:submit|preventDefault={ban.banUser}>
                    
                    <div class="flex flex-col gap-1">
                        
                        
                        <span class="text-sm">
                            {(ban.community ? item.creator_banned_from_community : item.creator.banned) ? 'Unbanning' : 'Banning'} from
                            <span class="font-bold">
                                {
                                    ban.community 
                                    ? `${item.community.name}@${new URL(item.community.actor_id).hostname}`
                                    : 'Instance'
                                }
                            </span>
                        </span>
                        
                        
                        <span class="flex flex-row gap-1 text-xs items-center">
                            <Avatar url={item.creator.avatar} alt={item.creator.actor_id} width={24} />
                            <span class="font-bold">{item.creator.name}@{new URL(item.creator.actor_id).hostname}</span>
                        </span>
                    
                    
                        

                    </div>


                    <MarkdownEditor required previewButton images={false} rows={6} 
                        bind:value={ban.reason} label="Reason"
                        placeholder="Why are you { (ban.community ? item.creator_banned_from_community : item.creator.banned) ? 'unbanning' : 'banning'} {item.creator.name}@{new URL(item.creator.actor_id).hostname}?"
                    >
                        <Button submit color="primary" loading={ban.loading} disabled={ban.loading} size="lg" slot="actions">
                            {(ban.community ? item.creator_banned_from_community : item.creator.banned) ? 'Unban' : 'Ban'}
                        </Button>
                    </MarkdownEditor>

                    {#if !(ban.community ? item.creator_banned_from_community : item.creator.banned)}
                        <SettingToggleContainer>
                            <SettingToggle bind:value={ban.removeContent} icon={Trash} title="Remove Content" description="Remove all of this user's content when banning." />
                            <SettingDateInput bind:value={ban.expiry} icon={CalendarDays} title="Ban Expires" description="To effect a temporary ban, enter a date for the ban to expire. Leave blank for a permanent ban." />
                        </SettingToggleContainer>
                    {/if}
                
                    
                </form>
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
                    <div class="flex w-full min-h-[30vh]">
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
                        <Button size="square-sm" class="h-8 w-8" color="tertiary-border" icon={ArrowPath} title="Refresh" on:click={() => modlog.load()} />

                        <Button size="sm" color="tertiary-border" class="h-8"
                            icon={Newspaper}
                            on:click={() => {
                                modlog.showThisCommunityOnly = !modlog.showThisCommunityOnly
                                modlog.showThisCommunityOnly
                                    ? modlog.setCommunity()
                                    : modlog.clearCommunity()
                                modlog.load()

                            }}
                        >
                            {modlog.showThisCommunityOnly ? 'All' : 'Community'}
                        </Button>
                    </span>
                </div>
            </div>

            <span class="text-sm font-normal">
                {
                    modlog.showThisCommunityOnly
                        ? 'Showing only modlog events for this user in the current community.'
                        : 'Showing all modlog events for this user.'
                }
                You may also 
                <Link href={`/modlog?other_person_id=${item.creator.id}`} highlight>
                    view the full modlog
                </Link>
                for the user.
            </span>

            <!---Modlog View--->
            <!--<Card class="flex flex-col p-4">-->
                {#if modlog.loading}
                    <div class="flex w-full"> <!---min-h-[30vh]--->
                        <span class="flex flex-col gap-4 mx-auto my-auto">
                            <Spinner width={64} />
                        </span>
                    </div>
                
                {:else}

                    <div class="flex flex-col w-full gap-4">
                        
                        <div bind:this={modlog.containerDiv} class="flex flex-col gap-4 mt-2 max-h-[50vh] overflow-y-scroll p-2">
                            {#if modlog.results.length > 0}
                                {#each modlog.results as modlogItem}
                                    <div class="bg-slate-100 dark:bg-zinc-800 text-black dark:text-slate-100 border border-slate-900 dark:border-zinc-100 p-2 text-sm rounded-md leading-[22px]">    
                                        <ModlogItemList bind:item={modlogItem} actions={false} hideCommunity={modlog.showThisCommunityOnly}/>
                                    </div>
                                {/each}
                            {:else}
                                {#if !modlog.fetchError}
                                    <span class="mx-auto my-auto">
                                        <Placeholder icon={Newspaper} title="No Results" description="No modlog results returned" />
                                    </span>
                                {:else}
                                    <span class="mx-auto my-auto">
                                        <Placeholder icon={ExclamationTriangle} title="Fetch Error" description="Unable to load the modlog from the API." />
                                    </span>
                                {/if}
                            {/if}
                        </div>
                        
                        <Pageination bind:page={modlog.page} on:change={(e) => {
                            modlog.setPage(e.detail)
                            modlog.load()
                            modlog.containerDiv?.scrollTo(0,0)
                        }}/>
                    </div>
                {/if}

            <!--/Card>-->
        </div>

    {/if}


    <!---Default/Moderation Action List--->
    {#if action == 'none'}
        <div class="flex flex-col gap-2 mt-0 px-4 w-full items-center" transition:slide>
            
            <Card class="p-2 w-full">
                <div class="flex flex-row gap-2 justify-between w-full items-center text-xs overflow-hidden">
                    <CommunityLink community={item.community} avatar inline={false} avatarSize={36} />

                    <UserLink user={item.creator} avatar inline={false} avatarSize={36} community_banned={item.creator_banned_from_community} mod={item.creator_is_moderator} admin={item.creator_is_admin} />
                </div>
            </Card>

            <!---Pin Community, Pin Local, Lock/Unlock--->
            {#if !isCommentView(item)}
                <div class="flex flex-row w-full my-4 items-center gap-2">
                    
                    <!---Feature Post (Community)--->
                    <Button color="tertiary-border" icon={Megaphone} loading={pinning} alignment="left" class="w-full" 
                        on:click={() => pin(!item.post.featured_community, false)}
                    >
                        {item.post.featured_community ? 'Unpin' : 'Pin'}
                    </Button>

                    <!---Feature Post (Instance)--->
                    {#if isAdmin($profile?.user)}
                        <Button color="tertiary-border" icon={Megaphone} loading={pinningInstance} alignment="left" class="w-full" 
                            on:click={() => pin(!item.post.featured_local, true)}
                        >
                            {item.post.featured_local ? 'Unfeature' : 'Feature'}
                        </Button>
                    {/if}
                    
                    <!---Lock/Unlock Post--->
                    <Button color="tertiary-border" icon={item.post.locked ? LockOpen : LockClosed} alignment="left" class="w-full" 
                        loading={locking}
                        on:click={() => lock(!item.post.locked)}
                    >
                        {item.post.locked ? 'Unlock' : 'Lock'}
                    </Button>

                </div>
            {/if}

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
                    modlog.init()
                }}
            >
                Creator's Modlog History...
            </Button>

            <!---Distinguish Comment--->
            <!---Lemmy devs are ridiculous and changed the behavior so you could only distinguish your own comments.  Fuckin' bullshit--->
            {#if isCommentView(item) && $profile?.user && item.creator_is_moderator && $profile.user.local_user_view.person.id == item.creator.id}
                <Button color="tertiary-border" icon={Sparkles} alignment="left" class="w-full"
                    on:click={() => distinguish() }
                >
                    {item.comment.distinguished ? 'Un-Distinguish' : 'Distinguish'}
                </Button>
            {/if}

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


            <!---Remove/Restore Item--->
            {#if !purged && (amMod($profile?.user, item.community) || isAdmin($profile?.user) )}
                <Button color="{removed ? 'tertiary-border' : 'tertiary-border'}" icon={Trash} alignment="left" class="w-full" 
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
                        ban.reset()
                        ban.community = item.community
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
                        ban.reset()
                        action = 'banning'
                    }}
                >
                    {item.creator.banned ? 'Unban' : 'Ban'} Instance...
                </Button>
            {/if}
            
        </div>
    {/if}

</Modal>