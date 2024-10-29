<script lang="ts">
    import type { CommentView, Community, PostView } from 'lemmy-js-client'

    import { amMod, isAdmin, removalTemplate, voteViewerModal } from '../moderation/moderation';
    import { dispatchWindowEvent } from '$lib/ui/events';
    import { fullCommunityName, objectCopy } from '$lib/util';
    import { getClient } from '$lib/lemmy'
    import { goto } from '$app/navigation';
    import { isComment, isCommentView } from '$lib/lemmy/item';
    import { isPostView } from '$lib/components/lemmy/post/helpers';
    import { profile } from '$lib/auth'
    import { slide } from 'svelte/transition'
    import { toast } from '$lib/components/ui/toasts/toasts'
    import { userSettings } from '$lib/settings'


    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from "$lib/components/input/Button.svelte"
    import Card from '$lib/components/ui/Card.svelte'
    import CommentMeta from '../comment/CommentMeta.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import PostMeta from '../post/PostMeta.svelte'
    import SettingDateInput from '$lib/components/ui/settings/SettingDateInput.svelte'
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'
    
    import { 
        ArrowLeft,
        CalendarDays,
        ChatBubbleLeft,
        ChatBubbleLeftRight,
        Fire,
        HandThumbUp,
        LockClosed,
        LockOpen,
        Megaphone,
        Newspaper,
        NoSymbol,
        ShieldExclamation, 
        Trash

    } from "svelte-hero-icons"
    


    export let open: boolean = false
    export let item: PostView | CommentView

    let action: 'none' | 'banning' | 'banningInstance' | 'removing' = 'none'
    let defaultWidth = 'max-w-xl'
    let modalWidth = defaultWidth
    let cardClass = 'p-2 list-none border border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 rounded-lg'

    let locking = false
    let pinning = false
    let pinningInstance = false
    let purged  = false
    
    //$: acting = locking || pinning 
    
    // Object to hold the options for removing a submission
    interface RemovalOptions {
        purge: boolean
        reason: string
        loading: boolean
        replyWithReason: boolean
        replyReason: string
        privateMessage: boolean
    }
    let removeOpts = {
        purge: false,
        reason: '',
        loading: false,
        replyWithReason: false,
        replyReason: '',
        privateMessage: false
    } as RemovalOptions
    
    let defaultRemoveOpts = {...removeOpts}

    // Object to hhold the options for banning a user
    interface BanOptions {
        reason: string
        loading: boolean
        removeContent: boolean
        community?: Community
        expiry: string
    }
    
    let banOpts = {
        community: undefined,
        reason: '',
        expiry: '',
        loading: false,
        removeContent: false


    } as BanOptions
    
    let defaultBanOpts = {...banOpts}
    
    $: item
    
    // Watch the reply reason options and automatically update the mod reply based on the removal / restore reason.
    $: removeOpts.replyReason = removeOpts.replyWithReason ? setReplyReason(removeOpts.reason) : ''
    const setReplyReason = (reason: string) => {
        if (!item) return `no template`

        return removalTemplate($userSettings.moderation.removalReasonPreset, {
            communityLink: `!${fullCommunityName(item!.community.name, item!.community.actor_id)}`,
            postTitle: item.post.name,
            reason: reason,
            username: item.creator.name,
        })
    }


    // Reactive helper variable to determine if the item is removed.
    $:  removed = item
            ? isCommentView(item)
                ? item.comment.removed
                : item.post.removed
            : false

    // Processes the submission removal form
    async function removeSubmission() {
        if (!item) return
        if (!$profile?.jwt) throw new Error('Unauthenticated')

        removeOpts.loading = true

        try {
            if (removeOpts.purge) {
                
                // Purge Comment
                if (isCommentView(item)) {
                    await getClient(undefined).purgeComment({
                        comment_id: item.comment.id,
                        reason: removeOpts.reason,
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
                        reason: removeOpts.reason,
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
                resetRemoveForm()
                returnMainMenu()
                return
            }

           
            // Remove Comment
            if (isCommentView(item)) {
                await getClient().removeComment({
                    comment_id: item.comment.id,
                    removed: !removed,
                    reason: removeOpts.reason || undefined,
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
                    reason: removeOpts.reason || undefined,
                })
                item.post.removed = !removed
                
                dispatchWindowEvent('removePost', {
                    post_id: item.post.id,
                    removed: item.post.removed
                })
            }

            // Send reply with removal reason if selected
            if (removeOpts.replyWithReason) {
                if (removeOpts.replyReason == '') {
                    toast({
                        content: 'Your reply cannot be empty if "Reply reason" is enabled.',
                        type: 'warning',
                        title: 'Reply Text is Required'
                    })
                    return
                }
                
                // Send a DM or comment depending on selected option
                if (removeOpts.privateMessage) {
                    await getClient()
                        .createPrivateMessage({
                            content: removeOpts.replyReason,
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
                        content: removeOpts.replyReason,
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
            resetRemoveForm()
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
    }

    // Resets the removal form to defaults
    function resetRemoveForm() {
        removeOpts = { ...defaultRemoveOpts }
    }

    
    
    // Processes the ban user form
    async function banUser() {
        if (!$profile?.user || !$profile?.jwt) return
        
        
        banOpts.loading = true
        let bannedInstance = item.creator.banned
        let bannedCommunity = item.creator_banned_from_community
        
        try {
            let date: number | undefined
            // Validate ban expiry date
            if (banOpts.expiry != '') {
                date = Date.parse(banOpts.expiry)
                if (Number.isNaN(date) || date < Date.now()) {
                    //invalidDateErrorToast()
                    banOpts.loading = false
                    return
                }
            }

            // Ban from community if `community` is provided in the call
            if (banOpts.community) {
                const response = await getClient().banFromCommunity({
                    ban: item.creator_banned_from_community ? false : true ,
                    community_id: item.community.id,
                    person_id: item.creator.id,
                    reason: banOpts.reason || undefined,
                    remove_data: banOpts.removeContent,
                    expires: date ? Math.floor(date / 1000) : undefined,
                })

                bannedCommunity = response?.banned
                
                // Dispatch global event so other components can react
                dispatchWindowEvent('banCommunity', {
                    person_id: item.creator.id,
                    community_id: item.community.id,
                    banned: bannedCommunity,
                    remove_content: banOpts.removeContent
                })

            }
            
            // Ban from instance if no community provided
            else {
                const response = await getClient().banPerson({
                    ban: !item.creator.banned,
                    person_id: item.creator.id,
                    reason: banOpts.reason || undefined,
                    remove_data: banOpts.removeContent,
                    expires: date ? Math.floor(date / 1000) : undefined,
                })

                bannedInstance = response?.person_view.person.banned

                // Dispatch global event so other components can react
                dispatchWindowEvent('banUser', {
                    person_id: item.creator.id,
                    banned: bannedInstance,
                    remove_content: banOpts.removeContent
                })

            }
            
            toast({
                content: `Successfully ${ (banOpts.community ? bannedCommunity : bannedInstance ) ? 'banned' : 'unbanned'}  ${item.creator.name}@${new URL(item.creator.actor_id).hostname} ${banOpts.community ? 'from the community' : 'from the instance'}.`,
                type: 'success',
                title: 'Success'
            })

            resetBanForm()
            returnMainMenu()
            
            
        } catch (err) {
            banOpts.loading = false
            toast({
                content: err as any,
                type: 'error',
                title: 'Error'
            })
        }
        
        
    }

    //Reset the ban user form
    function resetBanForm() {
        banOpts = {...defaultBanOpts}
    }

    // Returns the modal to the main menu
    function returnMainMenu() {
        modalWidth = defaultWidth
        action = 'none'
    }


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
</script>


<Modal bind:open icon={ShieldExclamation} title="Moderation" card={false} width={modalWidth}>
    
    <!---Remove/Restore/Purge Content--->
    {#if action == 'removing'}
    
        <div class="flex flex-col gap-4 mt-0 w-full" transition:slide>
            
            <!---Section Header--->
            <div class="flex flex-row gap-4 items-center">
                <Button size="square-md" color="tertiary-border" icon={ArrowLeft} title="Back" 
                    on:click={()=> returnMainMenu()}  
                />
                <span class="text-lg">
                    { removeOpts.purge  ? 'Purging'  : removed ? 'Restoring' : 'Removing' } 
                    {isCommentView(item) ? 'Comment' : 'Post'}
                </span>
            </div>
            

            <!---Remove/Purge/Restore Form--->
            <Card class="flex flex-col p-4">
                <form class="flex flex-col gap-4 list-none" on:submit|preventDefault={removeSubmission}>
                    
                    {#if !isCommentView(item)}
                        <PostMeta post={item} noClick/>
                    {:else}
                        <CommentMeta comment={item} noClick/>
                    {/if}


                    <MarkdownEditor rows={6} previewButton images={false} label="Reason" placeholder="Optional" bind:value={removeOpts.reason}>
                        <Button 
                            color={removeOpts.purge ? 'danger' : 'primary'} 
                            icon={removeOpts.purge ? Fire : Trash}
                            iconSize={16}
                            size="lg" 
                            loading={removeOpts.loading} 
                            disabled={removeOpts.loading} 
                            submit 
                            slot="actions"
                        >
                            { removeOpts.purge ? 'Purge' : removed ? 'Restore' : 'Remove' }
                        </Button>
                    </MarkdownEditor>
                    
                    <!--- Only show "Reply with reason" if you're a mod of the community or an admin and the content is local--->
                    {#if !removed &&  !removeOpts.purge && ( amMod($profile?.user, item.community) || (isAdmin($profile?.user) && item.community.local))}
                        <SettingToggleContainer>
                            <SettingToggle bind:value={removeOpts.replyWithReason} icon={ChatBubbleLeft} title="Reply with Reason" 
                                description="Send the user a comment or DM with the reason for the the mod action" 
                            />
                            
                            <SettingMultiSelect icon={ChatBubbleLeftRight} title="Message Type" 
                                description="Choose whether to reply as a comment to the removed item or as a direct message"
                                options={[false, true]} optionNames={['Comment', 'Message']} bind:selected={removeOpts.privateMessage}
                                condition={removeOpts.replyWithReason}
                            />
                        </SettingToggleContainer>

                        {#if removeOpts.replyWithReason}
                            <MarkdownEditor previewButton images={false} bind:value={removeOpts.replyReason} placeholder={removeOpts.replyReason} rows={6} label="Reply"/>
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
                    {(banOpts.community ? item.creator_banned_from_community : item.creator.banned) ? 'Unban' : 'Ban'} User From {banOpts.community ? 'Community' : 'Instance'}
                </span>
            </div>

            <!---Ban/Unban Instance/Community Form--->
            <Card class="flex flex-col p-4">
                <form class="flex flex-col gap-4" on:submit|preventDefault={banUser}>
                    
                    <div class="flex flex-col gap-1">
                        
                        
                        <span class="text-sm">
                            {(banOpts.community ? item.creator_banned_from_community : item.creator.banned) ? 'Unbanning' : 'Banning'} from
                            <span class="font-bold">
                                {
                                    banOpts.community 
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
                        bind:value={banOpts.reason} label="Reason"
                        placeholder="Why are you { (banOpts.community ? item.creator_banned_from_community : item.creator.banned) ? 'unbanning' : 'banning'} {item.creator.name}@{new URL(item.creator.actor_id).hostname}?"
                    >
                        <Button submit color="primary" loading={banOpts.loading} disabled={banOpts.loading} size="lg" slot="actions">
                            {(banOpts.community ? item.creator_banned_from_community : item.creator.banned) ? 'Unban' : 'Ban'}
                        </Button>
                    </MarkdownEditor>

                    {#if !(banOpts.community ? item.creator_banned_from_community : item.creator.banned)}
                        <SettingToggleContainer>
                            <SettingToggle bind:value={banOpts.removeContent} icon={Trash} title="Remove Content" description="Remove all of this user's content when banning." />
                            <SettingDateInput bind:value={banOpts.expiry} icon={CalendarDays} title="Ban Expires" description="To effect a temporary ban, enter a date for the ban to expire. Leave blank for a permanent ban." />
                        </SettingToggleContainer>
                    {/if}
                
                    
                </form>
            </Card>
        </div>
    {/if}


    <!---Next
    {#if action == 'banningInstance'}
        banningInstance
    {/if}
    --->


    <!---Default/Moderation Action List--->
    {#if action == 'none'}
        <div class="flex flex-col gap-2 mt-0 px-4 w-full items-center" transition:slide>

            <!---Creator's Modlog History--->
            <Button color="tertiary-border" icon={Newspaper} alignment="left" class="w-full"
                on:click={() => {
                    goto(`/modlog?other_person_id=${item.creator.id.toString()}`)        
                    open = false
                }}
            >
                Creator's Modlog History...
            </Button>

            <!---Vote Viewer--->
            {#if !purged && isAdmin($profile?.user)}
                <Button color="tertiary-border" icon={HandThumbUp} alignment="left" class="w-full" 
                    on:click={() => voteViewerModal('post', item.post.id)}
                >
                    View Votes...
                </Button>
            {/if}


            <!---Feature Post (Community)--->
            {#if !isCommentView(item)}
                <Button color="tertiary-border" icon={Megaphone} loading={pinning} alignment="left" class="w-full" 
                    on:click={() => pin(!item.post.featured_community, false)}
                >
                    {item.post.featured_community ? 'Unfeature' : 'Feature'} Post in Community
                </Button>
            {/if}

            <!---Feature Post (Instance)--->
            {#if isAdmin($profile?.user) && !isCommentView(item)}
                <Button color="tertiary-border" icon={Megaphone} loading={pinningInstance} alignment="left" class="w-full" 
                    on:click={() => pin(!item.post.featured_local, true)}
                >
                    {item.post.featured_local ? 'Unfeature' : 'Feature'} Post on Instance
                </Button>
            {/if}

            <!---Lock/Unlock Post--->
            {#if !isCommentView(item)}
                <Button color="tertiary-border" icon={item.post.locked ? LockOpen : LockClosed} alignment="left" class="w-full" 
                    loading={locking}
                    on:click={() => lock(!item.post.locked)}
                >
                    {item.post.locked ? 'Unlock' : 'Lock'} Post
                </Button>
            {/if}
            
            <!---Remove/Restore Item--->
            {#if !purged && (amMod($profile?.user, item.community) || isAdmin($profile?.user) )}
                <Button color="tertiary-border" icon={Trash} alignment="left" class="w-full" 
                    on:click={() => {
                        modalWidth='max-w-3xl'
                        removeOpts.purge = false
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
                        removeOpts.purge = true
                        action = 'removing'
                    }}
                >
                    Purge {isCommentView(item) ? 'Comment' : 'Post'}...
                </Button>
            {/if}

            <!---Ban User (Community) --->
            {#if amMod($profile?.user, item.community) || isAdmin($profile?.user)}
                <Button color="tertiary-border" icon={NoSymbol} alignment="left" class="w-full" 
                    on:click={() => {
                        modalWidth='max-w-3xl'
                        resetBanForm()
                        banOpts.community = item.community
                        action = 'banning'
                    }}
                >
                    {item.creator_banned_from_community ? 'Unban' : 'Ban'} User From Community...
                </Button>
            {/if}
            
            <!---Ban User (Instance) --->
            {#if isAdmin($profile?.user) }
                <Button color="tertiary-border" icon={NoSymbol} alignment="left" class="w-full" 
                    on:click={() => {
                        modalWidth='max-w-3xl'
                        resetBanForm()
                        action = 'banning'
                    }}
                >
                    {item.creator.banned ? 'Unban' : 'Ban'} User From Instance...
                </Button>
            {/if}
            
        </div>
    {/if}

</Modal>