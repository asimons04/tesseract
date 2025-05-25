<script lang="ts">
    import type { BanCommunityEvent, BanUserEvent, DistinguishCommentEvent, EditCommentEvent, LockPostEvent, PurgeCommentEvent, PurgePostEvent, RemoveCommentEvent } from '$lib/ui/events'
    import { getDepthFromComment, type CommentNodeI } from './comments'
    import type { CommentView, Person, UploadImageResponse } from 'lemmy-js-client';
    
    import {
        ArrowUp,
        Bookmark,
        ChatBubbleLeftEllipsis,
        ChevronDown,
        ChevronUp,
        HandRaised,
        Icon,
        Minus,
        NoSymbol,
        Pencil,
        Plus,
        Trash,
    } from 'svelte-hero-icons'
    
    import Badge            from '$lib/components/ui/Badge.svelte'
    import Button           from '$lib/components/input/Button.svelte'
    import Card             from '$lib/components/ui/Card.svelte'
    import CommentActions   from '$lib/components/lemmy/comment/CommentActions.svelte'
    import CommentForm      from './CommentForm.svelte'
    import Markdown         from '$lib/components/markdown/Markdown.svelte'
    import MarkdownEditor   from '$lib/components/markdown/MarkdownEditor.svelte'
    import Modal            from '$lib/components/ui/modal/Modal.svelte'
    import RelativeDate     from '$lib/components/util/RelativeDate.svelte'
    import UserLink         from '$lib/components/lemmy/user/UserLink.svelte'

    import { 
        amMod, 
        amModOfAny, 
        isAdmin, 
    }                       from '../moderation/moderation'
    import { 
        getClient, 
        minAPIVersion 
    }                       from '$lib/lemmy.js'
    import { 
        createEventDispatcher, 
        onMount 
    }                       from 'svelte'
    
    import { goto }         from '$app/navigation'
    import { page }         from '$app/stores'
    import { profile }      from '$lib/auth.js'
    import { sleep }        from '../post/helpers'
    import { slide }        from 'svelte/transition'
    import { toast }        from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    
    
    export let node: CommentNodeI
    export let postId: number
    export let actions: boolean     = true
    export let open                 = true
    export let replying             = false
    export let elevation: -1|0|1|2  = getCardElevation(node)
    export let jumpTo:number        = -1
    export let onHomeInstance       = false
    export let selectable           = false

    let imageUploads                = [] as UploadImageResponse[]
    let editing                     = false
    let newComment                  = node.comment_view.comment.content
    let jumpToComment               = false
    let commentContainer: HTMLDivElement
    let op                          = (node.comment_view.post.creator_id == node.comment_view.creator.id)
    let commentText                 = node.comment_view.comment.content
    let admin                       = isAdmin($profile?.user)
    let mod                         = amMod($profile?.user, node.comment_view.community)
    let selected                    = false
    let commentBodyContainer: HTMLDivElement
    let commentBodyExpanded:boolean = false
    $: commentBodyContainerDoesScroll = commentBodyContainer?.scrollHeight > commentBodyContainer?.clientHeight || (node.comment_view.comment.content?.substring(0,150).includes('!['))
    
    interface CommentModlogLookup {
        reason: string | undefined
        moderator: Person | undefined
        when: string | undefined,
        loading: boolean
    }

    let modlogLookup: CommentModlogLookup = {
        reason: undefined,
        moderator: undefined,
        when: undefined,
        loading: false,
    }

    // If linking to a thread, scroll to the speciic comment and highlight it
    onMount(async() => {
        // Need to do this so we can lookup the modlog details to display the reason inline and add the text back for mods.
        commentText = await getCommentText()
        
        if (jumpTo > 0 && jumpTo == node.comment_view.comment.id ) { 
            jumpToComment = true
            color = 'warning'
            sleep(175).then(() => {
                commentContainer.scrollIntoView({behavior: 'smooth'})
            })
        }
    })


    const handlers = {
        BanUserEvent: function (e: BanUserEvent) {
            if (node.comment_view.creator.id == e.detail.person_id) {
                node.comment_view.creator.banned = e.detail.banned
                
                if (e.detail.remove_content) {
                    node.comment_view.comment.removed = true
                }
            }
            node = node
        },

        BanCommunityEvent: function (e: BanCommunityEvent) {
            if (node.comment_view.creator.id == e.detail.person_id) {
                node.comment_view.creator_banned_from_community = e.detail.banned
                
                if (e.detail.remove_content) {
                    node.comment_view.comment.removed = true
                    //color = 'error'
                }
            }
            node = node
        },

        DistinguishCommentEvent: function (e: DistinguishCommentEvent) {
            if (node.comment_view.comment.id == e.detail.comment_id) {
                node.comment_view.comment.distinguished = e.detail.distinguished
                node = node
                color = e.detail.distinguished ? 'success' : getCardColor(node)
            }
        },

        EditCommentEvent: function (e: EditCommentEvent) {
            if (e.detail.comment_view.comment.id == node.comment_view.comment.id) {
                node.comment_view = e.detail.comment_view
                if (selected) selected = false
                getCommentText().then((newText) => commentText = newText)
                color = getCardColor(node)
                node = node
            }
        },

        LockPostEvent: function (e: LockPostEvent) {
            if (e.detail.post_id == node.comment_view.post.id) {
                node.comment_view.post.locked = e.detail.locked
                node = node
            }
        },

        PurgeCommentEvent: function(e: PurgeCommentEvent) {
            if (node.comment_view.comment.id == e.detail.comment_id) {
                node.comment_view.comment.removed = e.detail.purged
                commentText = node.comment_view.comment.content = '*Purged*'
                node = node
            }
        },

        PurgePostEvent: function(e: PurgePostEvent) {
            if (node.comment_view.post.id == e.detail.post_id) {
                node.comment_view.comment.removed = e.detail.purged
                commentText = node.comment_view.comment.content = '*Purged*'
                node = node
            }
        },

        RemoveCommentEvent: function (e:RemoveCommentEvent) {
            if (node.comment_view.comment.id == e.detail.comment_id) {
                if (selected) selected = false
                node.comment_view.comment.removed = e.detail.removed
                getCommentText().then((newText) => commentText = newText)
                color = getCardColor(node)
            }
        },


    }

    // Render comment collapsed if bot account, on /post page, and user has enabled the collapse bot comment option
    open = (
            $page.url.pathname.startsWith('/post') &&
            node.comment_view.creator.bot_account && 
            $userSettings.hidePosts.minimizeBotComments &&
            $profile?.user?.local_user_view.person.id != node.comment_view.creator.id
    ) ? false : open

    function getCardElevation(node: CommentNodeI): 0|1|2 {
        let depth = getDepthFromComment(node.comment_view.comment)
        if (!depth) return 1
        return (depth % 2 == 0) ? 1 : 0
    }

    function getCardColor(node: CommentNodeI): 'default' | 'warning' | 'error' | 'success' | 'info' {
        let color: 'default' | 'warning' | 'error' | 'success' | 'info' = 'default'
        
        if (node.comment_view.comment.distinguished) return 'success'
        if (jumpToComment) return 'warning'
        if (selected) return 'info'
        //if (node.comment_view.comment.removed) return 'error'

        return color
    }

    async function getCommentText(forceModlogLookup:boolean = false) {
        let text = node.comment_view.comment.content

        // If the content is removed, try to append the removal reason.  If current account is a mod, append the original content from the modlog lookup
        if (onHomeInstance && node.comment_view.comment.removed && ($userSettings.autoLookupRemovedCommentReasons || forceModlogLookup) && minAPIVersion('0.19.6')) {

            // Don't lookup purged comments; return early with static 'Purged by admin' message.
            if (node.comment_view.comment.content == '*Purged*') {
                modlogLookup.reason = `Purged by Admin`
                return ''
            }

            try {
                modlogLookup.loading = true
                let results = await getClient().getModlog({comment_id: node.comment_view.comment.id})
                
                // Assume removed reason is ban w/removal if no modlog entry for the removed item.
                modlogLookup.reason = (node.comment_view.creator.banned || node.comment_view.creator_banned_from_community)
                    ? 'Creator banned with content removal'
                    : 'No reason specified'
                
                if (results?.removed_comments.length > 0) {
                    
                    modlogLookup.reason = results.removed_comments[0].mod_remove_comment.reason 
                        ?? `Failed to lookup reason automatically. Please see [modlog](/modlog?comment_id=${node.comment_view.comment.id}).`
                    modlogLookup.when = results.removed_comments[0].mod_remove_comment.when_

                    // Let mods see the mod who performed the actoin as well as the removed comments again (stupid Lemmy devs!!)
                    if (admin || mod) {
                        modlogLookup.moderator = results.removed_comments[0].moderator
                        text = admin
                            ? node.comment_view.comment.content
                            : results.removed_comments[0].comment.content
                    }
                }
             }
            catch {}
        }
        modlogLookup.loading = false
        return text
    }

    const dispatcher = createEventDispatcher<{select: CommentView, unselect: CommentView }>()

    let color: 'default' | 'warning' | 'error' | 'success' | 'info' = getCardColor(node)
</script>

<svelte:window 
    on:banUser={handlers.BanUserEvent} 
    on:banCommunity={handlers.BanCommunityEvent} 
    on:editComment={handlers.EditCommentEvent}
    on:distinguishComment={handlers.DistinguishCommentEvent}
    on:lockPost={handlers.LockPostEvent}
    on:removeComment={handlers.RemoveCommentEvent}
    on:purgeComment={handlers.PurgeCommentEvent}
    on:purgePost={handlers.PurgePostEvent}
/>


{#if editing}
    <Modal bind:open={editing} title="Editing comment" icon={ChatBubbleLeftEllipsis} width="max-w-4xl" 
        on:close={() => {
            if (newComment != node.comment_view.comment.content) {
                if (confirm('You have an edit in progress. Are you sure you want to lose those changes?')) {
                    newComment = node.comment_view.comment.content
                    editing = false
                    return
                }
                else {
                    return
                }
            }
            editing = false
        }}
    >
        <MarkdownEditor rows={7} bind:value={newComment} bind:imageUploads previewButton={true}>
            
            <Button color="primary" slot="actions" on:click={async () => {
                if (!$profile?.jwt || newComment.length <= 0) return
    
                try {
                    await getClient().editComment({
                        comment_id: node.comment_view.comment.id,
                        content: newComment,
                    })
                    commentText = node.comment_view.comment.content = newComment
                    editing = false
                    toast({
                        content: 'Successfully edited comment.',
                        type: 'success',
                        title: 'Comment Edited'
                    })
                } catch (err) {
                    toast({
                        content: "Unable to edit comment",
                        type: 'error',
                        title: 'Error'
                    })
                }
            }}>
                Save
            </Button>
        </MarkdownEditor>
    </Modal>
{/if}

<Card elevation={elevation} cardColor={color} class="pl-1" >

    <div bind:this={commentContainer} class="py-1 {$$props.class}" id="#{node.comment_view.comment.id.toString()}" >
        <details bind:open class="flex flex-col gap-0">
            
            <summary class="
                flex flex-col md:flex-row flex-wrap w-full cursor-pointer gap-2 group text-xs 
                hover:bg-slate-300 hover:dark:bg-zinc-800 hover:dark:border-zinc-700
                hover:rounded-lg overflow-hidden
                "
            >
                <span class:font-bold={op} class="flex flex-row gap-1 items-center w-full">
                    <UserLink avatarSize={20} avatar user={node.comment_view.creator} mod={node.comment_view.creator_is_moderator} admin={node.comment_view.creator_is_admin} community_banned={node.comment_view.creator_banned_from_community}/>

                    <!---Badges, published/edited date, expand/collapse button--->
                    <span class="flex flex-row items-center gap-2 ml-auto w-full">

                        <span class="ml-auto" />

                        {#if op}
                            <Badge color="blue" rightJustify={false} click={false} label="Original Poster">OP</Badge>    
                        {/if}
                        
                        {#if !open}
                            <span class="flex items-center gap-0.5 mr-1 text-slate-600 dark:text-zinc-400">
                                <Icon src={ArrowUp} mini size="14" title="Score" />
                                {node.comment_view.counts.score}
                            </span>
                        {/if}

                        <!---If updated, only show edited time on mobile--->
                        <span class="{node.comment_view.comment.updated ? 'hidden sm:flex' : 'flex'} flex-row items-center whitespace-nowrap text-slate-600 dark:text-zinc-400">
                            <RelativeDate date={node.comment_view.comment.published}/>
                        </span>

                        {#if node.comment_view.comment.updated}
                            <span class="flex flex-row whitespace-nowrap items-center gap-1 ml-1 text-slate-600 dark:text-zinc-400">
                                <Icon src={Pencil} solid size="12" title="Edited" />
                                <RelativeDate date={node.comment_view.comment.updated}/>
                            </span>
                        {/if}

                        {#if node.comment_view.saved}
                            <Badge icon={Bookmark} color="yellow" rightJustify={false} click={false} label="Saved"/>
                        {/if}

                        {#if !open && node.children.length > 0}
                            <span class="hidden md:flex text-xs opacity-50">+{node.children.length} More</span>
                        {/if}

                        <Button color="tertiary" size="sm" icon={open ? Minus : Plus} iconSize={16} on:click={() => open = !open}/>
                    </span>
                </span>
            </summary>

            <div class="flex flex-col gap-1">
                
                <!---Indicator Badges--->
                <div class="flex flex-row flex-wrap w-full gap-2 px-1 items-center">

                    <!--Deleted By Creator-->
                    {#if node.comment_view.comment.deleted} 
                        <Badge icon={Trash} color="red" rightJustify={false} click={false} class="my-1" label="Deleted">
                            Deleted by Creator
                        </Badge>
                    {/if}

                    <!---Banned from Community--->
                    {#if node.comment_view.creator_banned_from_community}
                        <Badge icon={NoSymbol} color="yellow" rightJustify={false} click={onHomeInstance} class="my-1" label="Banned from Community"
                            on:click={(e) => { 
                                if (onHomeInstance) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    goto(`/modlog?other_person_id=${node.comment_view.creator.id}&type=ModBanFromCommunity`)
                                }
                            }}
                        >
                            Community Banned
                        </Badge>
                    {/if}

                    <!---Banned from Instance--->
                    {#if node.comment_view.creator.banned}
                        <Badge icon={NoSymbol} color="red" rightJustify={false} click={onHomeInstance} class="my-1" label="Banned from Instance"
                            on:click={(e) => { 
                                if (onHomeInstance) {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    goto(`/modlog?other_person_id=${node.comment_view.creator.id}&type=ModBan`)
                                }
                            }}
                        >
                            Banned
                        </Badge>
                    {/if}

                </div>
                
                <!---Removal Notice--->
                {#if node.comment_view.comment.removed}
                    <Card cardColor='error' class="mx-2 p-1">
                        <div class="flex flex-row gap-1 items-center w-full">
                            
                            <div class="w-[42px]">
                                <Button color="tertiary" size="square-lg" icon={HandRaised} iconSize={28} 
                                    loading={modlogLookup.loading}
                                    disabled={modlogLookup.loading}
                                    title="Lookup Modlog for Comment"
                                    on:click={async () => {
                                        if (!onHomeInstance) {
                                            toast({
                                                type: 'warning',
                                                title: 'Not Supported',
                                                content: "Resolving modlog entries is only supported when you are viewing an item on your home instance."
                                            })
                                            return
                                        }
                                        if (!minAPIVersion('0.19.6')) {
                                            toast({
                                                type: 'warning',
                                                title: 'Not Supported',
                                                content: "You must be on at least API version 0.19.6 to lookup comments in the modlog."
                                            })
                                            return
                                        }
                                        if (!$userSettings.autoLookupRemovedCommentReasons) {
                                            commentText = await getCommentText(true)
                                            modlogLookup = modlogLookup
                                        }
                                        else goto(`/modlog?comment_id=${node.comment_view.comment.id}`) 
                                    }}
                                />
                            </div>
                            
                            <div class="flex flex-col w-[calc(100%-48px)] gap-0 text-xs font-normal">
                                <Markdown source={'**Removed by Moderator**'} />

                                {#if modlogLookup.when}
                                <span class="flex flex-row items-start gap-1">
                                    <span class="font-bold">When</span>: <RelativeDate date={modlogLookup.when} />
                                </span>
                                {/if}

                                {#if modlogLookup.moderator}
                                <span class="flex flex-row items-start gap-1">
                                    <span class="font-bold">Moderator</span>: <UserLink user={modlogLookup.moderator} avatar={false} avatarSize={20} badges={false}/>
                                </span>
                                {/if}

                                {#if modlogLookup.reason}
                                    <Markdown source={'**Reason**: ' + modlogLookup.reason}/>
                                {/if}
                            </div>
                        </div>
                    </Card>
                {/if}

                <!---Comment Text Body (Expandable--->
                <div bind:this={commentBodyContainer} transition:slide class="
                    max-w-full break-words text-sm
                    {$userSettings.uiState.limitCommentHeight && !commentBodyExpanded ? 'max-h-[120px] overflow-y-hidden': ''}
                    {$userSettings.uiState.limitCommentHeight && (!commentBodyExpanded && (commentBodyContainerDoesScroll || commentBodyContainer?.scrollHeight > commentBodyContainer?.clientHeight))
                        ? 'bg-gradient-to-b text-transparent from-slate-800 via-slate-800 dark:from-zinc-100 dark:via-zinc-100 bg-clip-text z-0'
                        : ''
                    }
                ">
                    <Markdown source={commentText} noImages={node.comment_view.comment.removed} class="px-1" />
                </div>
                
                {#if $userSettings.uiState.limitCommentHeight && (commentBodyExpanded || commentBodyContainerDoesScroll || commentBodyContainer?.scrollHeight > commentBodyContainer?.clientHeight)}
                <Button color="tertiary" size="sm" 
                    class="mx-auto text-xs font-bold !py-0 !px-1 w-full {commentBodyExpanded ? '' : 'mb-[5px]'}"
                    title="{commentBodyExpanded ? 'Collapse' : 'Expand'}"
                    on:click={() => {
                        commentBodyExpanded = !commentBodyExpanded
                    }}
                >
                    <span class="flex flex-row gap -1 text-xs mx-auto opacity-80">
                        <Icon src={commentBodyExpanded ? ChevronUp : ChevronDown} width={20} mini />
                        {commentBodyExpanded ? 'Show Less' : 'Show More'}
                        <Icon src={commentBodyExpanded ? ChevronUp : ChevronDown} width={20} mini />
                    </span>
                </Button>
                {/if}

                
                <div class="flex flex-row gap-2 items-center">
                    <CommentActions
                        {actions}
                        {onHomeInstance}
                        commentSelected={selected}
                        commentSelectable={selectable}
                        bind:comment={node.comment_view}
                        bind:replying
                        on:edit={() => (editing = true)}
                        on:selected={(e) => {
                            selected = e.detail
                            if (selected) {
                                color = 'info'
                                dispatcher('select', node.comment_view)
                            }
                            else {
                                color = getCardColor(node)
                                dispatcher('unselect', node.comment_view)
                            }
                        }}
                    />
                </div>
                
            </div>
            {#if replying}
                <div class="max-w-full my-2">
                    <h1 class="font-bold text-sm mb-2">Reply</h1>
                    <CommentForm {postId} parentId={node.comment_view.comment.id} bind:imageUploads
                        locked={node.comment_view.post.locked || !onHomeInstance}
                        on:comment={(e) => {
                            node.children = [
                                {
                                    children: [],
                                    comment_view: e.detail.comment_view,
                                    depth: node.depth + 1,
                                },
                                ...node.children,
                            ]
                            replying = false
                        }}
                    />
                </div>
            {/if}
            <div class="bg-transparent dark:bg-transparent">
                <slot />
            </div>
        </details>
    </div>
</Card>
