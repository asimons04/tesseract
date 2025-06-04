<script lang="ts">
    import type { BanCommunityEvent, BanUserEvent, DistinguishCommentEvent, EditCommentEvent, FilterUserEvent, LockPostEvent, PurgeCommentEvent, PurgePostEvent, RemoveCommentEvent } from '$lib/ui/events'
    import { getDepthFromComment, type CommentNodeI } from './comments'
    import type { CommentView, Person, UploadImageResponse } from 'lemmy-js-client';
    
    import {
        ArrowUp,
        BarsArrowDown,
        Bookmark,
        ChatBubbleLeftEllipsis,
        ChevronDown,
        ChevronUp,
        Eye,
        EyeSlash,
        HandRaised,
        Icon,
        Megaphone,
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

    import { amMod,  amModOfAny,  isAdmin } from '../moderation/moderation'
    import {  getClient, minAPIVersion } from '$lib/lemmy.js'
    import { createEventDispatcher, onMount }  from 'svelte'
    import { goto }         from '$app/navigation'
    import { page }         from '$app/stores'
    import { profile }      from '$lib/auth.js'
    import { isNewAccount, sleep }        from '../post/helpers'
    import { slide }        from 'svelte/transition'
    import { toast }        from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    import Avatar from '$lib/components/ui/Avatar.svelte';
    import { userIsInstanceBlocked } from '$lib/lemmy/user';
    import { instance } from '$lib/instance';
    
    export let node: CommentNodeI
    export let postId: number
    export let actions: boolean     = true
    export let open                 = true
    export let replying             = false
    export let standalone: boolean  = false
    export let jumpTo:number        = -1
    export let onHomeInstance       = false
    export let selectable           = false

    let imageUploads                = [] as UploadImageResponse[]
    let editing                     = false
    let newComment                  = node.comment_view.comment.content
    let jumpToComment               = false
    let commentContainer: HTMLDivElement
    let commentBodyContainer: HTMLDivElement
    let op                          = (node.comment_view.post.creator_id == node.comment_view.creator.id)
    let commentText                 = node.comment_view.comment.content
    let admin                       = isAdmin($profile?.user)
    let mod                         = amMod($profile?.user, node.comment_view.community)
    let selected                    = false
    let commentBodyExpanded:boolean = false
    let depth                       = getDepthFromComment(node.comment_view.comment) ?? 0
    let color: 'default' | 'warning' | 'error' | 'success' | 'info' = getCardColor(node)
    let threadLineColor = ''
    let commentBodyContainerDoesScroll = false
    let commentContainsImage            = false

    const dispatcher                = createEventDispatcher<{select: CommentView, unselect: CommentView }>()
    
    $: node, commentText, commentContainsImage = commentText.includes('![')
    $: node, commentText, commentBodyContainerDoesScroll = (commentBodyContainer?.scrollHeight > commentBodyContainer?.clientHeight) || commentContainsImage
    $: node, threadLineColor = getThreadLineColor()
    
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
                    color = getCardColor(node)
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

        FilterUserEvent: function (e:FilterUserEvent) {
            if (node.comment_view.creator.actor_id == e.detail.actor_id) {
                overrideHideComment = false
                hideComment = shouldHideComment()
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

    function getCardColor(node: CommentNodeI): 'default' | 'warning' | 'error' | 'success' | 'info' {
        let color: 'default' | 'warning' | 'error' | 'success' | 'info' = 'default'
        if (node.comment_view.comment.distinguished) return 'success'
        if (node.comment_view.comment.removed) return 'error'
        if (jumpToComment) return 'warning'
        if (selected) return 'info'
        return color
    }

    async function getCommentText(forceModlogLookup:boolean = false) {
        let text = node?.comment_view?.comment?.content
            ? node.comment_view.comment.content
            : ''

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

    function getThreadLineColor(): string {
        if (standalone || (depth == 0 && node.comment_view.counts.child_count < 1 && node.children.length < 1)) return 'hidden'
        const baseClasses = "ml-[0.65rem] w-[4px] bg-cover bg-center hover:scale-x-[1.75]"
        //const baseClasses = "ml-1 md:ml-2 w-[4px] bg-cover bg-center hover:scale-x-[1.75]"
        
        // If conversation line colors are disabled, return black/white 
        if (!$userSettings.uiState.coloredCommentThreadLines) return baseClasses + ' bg-black/80      dark:bg-white/80'

        switch((depth % 8)) {
            case 0:
                return baseClasses + ' bg-red-500/80    dark:bg-red-500/80'
            case 1:
                return baseClasses + ' bg-green-500/80  dark:bg-green-500/80'
            case 2:
                return baseClasses + ' bg-sky-700/80    dark:bg-sky-500/80'
            case 3: 
                return baseClasses + ' bg-amber-500/80  dark:bg-amber-500/80'
            case 4:
                return baseClasses + ' bg-indigo-500/80 dark:bg-indigo-500/80'    
            case 5:
                return baseClasses + ' bg-orange-500/80 dark:bg-orange-500/80'    
            case 6:
                return baseClasses + ' bg-pink-500/80   dark:bg-pink-500/80'
            case 7:
                return baseClasses + ' bg-cyan-500/80   dark:bg-cyan-500/80'
            default:
                return baseClasses + ' bg-black/80      dark:bg-white/80'
        }
    }

    function getAvatarRingColor() {
        if (standalone || (depth == 0 && node.comment_view.counts.child_count < 1 && node.children.length < 1)) return undefined
        
        // If conversation line colors are disabled, return black/white 
        if (!$userSettings.uiState.coloredCommentThreadLines) return 'ring-black/80      dark:ring-white/80'

        switch((depth % 8)) {
            case 0:
                return 'ring-red-500/80    dark:ring-red-500/80'
            case 1:
                return 'ring-green-500/80  dark:ring-green-500/80'
            case 2:
                return 'ring-sky-700/80    dark:ring-sky-500/80'
            case 3: 
                return 'ring-amber-500/80  dark:ring-amber-500/80'
            case 4:
                return 'ring-indigo-500/80 dark:ring-indigo-500/80'    
            case 5:
                return 'ring-orange-500/80 dark:ring-orange-500/80'
            case 6:
                return 'ring-pink-500/80   dark:ring-pink-500/80'
            case 7:
                return 'ring-cyan-500/80   dark:ring-cyan-500/80'
            default:
                return 'ring-black/80      dark:ring-white/80'
        }
    }

    function toggleThread() {
        open = !open
    }
    
    let hideComment = false
    let hideCommentReason = ''
    let overrideHideComment = false
    
    $:  node, $userSettings, $profile?.user, overrideHideComment, hideComment = shouldHideComment()
    
    function shouldHideComment(): boolean {
        // Safety checks
        if (overrideHideComment) return false
        
        if (standalone) return false

        // Don't hide your own submissions
        if (node.comment_view.creator.id == $profile?.user?.local_user_view?.person?.id) return false

        // If moderator or instance admin of a local community
        if (amMod($profile?.user, node.comment_view.community)) return false

        // If jumping to a comment in a thread
        if (node.comment_view.comment.path.split('.').includes(jumpTo.toString())) return false

        
        // Hide comments from new accounts
        if ( $userSettings.hidePosts.newAccounts &&  isNewAccount(node.comment_view.creator.published) ) {
            hideCommentReason = "New account."
            return true
        }

        // Hide comments from users without avatars
        if ( $userSettings.hidePosts.usersWithNoAvatar && !node.comment_view.creator.avatar && !node.comment_view.creator.bio) {
            hideCommentReason = "Creator has blank profile."
            return true
        }

        // Hide comments from users of blocked instances
        if ( $userSettings.hidePosts.hideUsersFromBlockedInstances && userIsInstanceBlocked($profile?.user, node.comment_view.creator.instance_id) ) {
            hideCommentReason = `Creator is from a blocked instance: ${new URL(node.comment_view.creator.actor_id).hostname}`
            return true
        }

        // Hide content from users in your filter list
        if ($userSettings.hidePosts.userList.includes(node.comment_view.creator.actor_id)) {
            hideCommentReason = `Creator is filtered: ${node.comment_view.creator.actor_id}`
            return true
        }

        // Hide comments containing filtered keywords
        if ($userSettings.hidePosts.keywords) {
            const keywords = $userSettings.hidePosts.keywordList
            let keywordsFound: string[] = []

            for (let i:number = 0; i<keywords.length; i++) {
                let keyword = keywords[i].replace('^', '').replace('*', '').replace('!', '')
                
                if (node.comment_view.comment.content?.toLowerCase().includes(keyword.toLowerCase())) {
                    keywordsFound.push(keyword.toLowerCase())
                }
            }

            if (keywordsFound.length > 0) {
                hideCommentReason = `Contains filtered ${keywordsFound.length == 1 ? 'keyword' : 'keywords'}: ${keywordsFound.toString().replaceAll(',',', ')}`
                return true
            }
        }

        // If no other checks hit, don't hide the comment
        hideCommentReason = ""
        return false
    }
</script>

<svelte:window 
    on:banUser={handlers.BanUserEvent} 
    on:banCommunity={handlers.BanCommunityEvent} 
    on:editComment={handlers.EditCommentEvent}
    on:filterUser={handlers.FilterUserEvent}
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

<div bind:this={commentContainer} class="{standalone ? '' : 'pt-2'} {$$props.class}" id="#{node.comment_view.comment.id.toString()}" >
    <div class="flex flex-col gap-0">
        
        
        <!---Comment Header--->
        <button on:click={() => toggleThread()}
            class="
                flex flex-col md:flex-row flex-wrap w-full cursor-pointer gap-2 group text-xs 
                hover:bg-slate-300 hover:dark:bg-zinc-800 hover:dark:border-zinc-700
                rounded-lg overflow-hidden
            "
        >
            <span class:font-bold={op} class="flex flex-row gap-1 items-center w-full">
                {#if hideComment}
                    <Avatar url="/logo_512.png"  alt="Tesseract Logo" width={20} ring ringColor={getAvatarRingColor()}/>
                {:else}
                    <Avatar url={node.comment_view.creator.avatar} alt={node.comment_view.creator.actor_id} width={20} ring ringColor={getAvatarRingColor()}/>
                {/if}
            
                <span class="flex w-[calc(100%-150px)]">
                    {#if hideComment}
                        <span class="flex flex-row gap-0 font-bold opacity-80 text-left  truncate ">
                            Tesseract
                            {#if $userSettings.uiState.showInstances }    
                                <span class="opacity-70  font-normal truncate {$userSettings.uiState.showInstances ? '' : 'ml-0'}">
                                    @{$instance}
                                </span>
                            {/if}
                        </span>
                    {:else}
                        <UserLink 
                            avatar={false}
                            user={node.comment_view.creator} 
                            mod={node.comment_view.creator_is_moderator} 
                            admin={node.comment_view.creator_is_admin} 
                            community_banned={node.comment_view.creator_banned_from_community}
                        />
                    {/if}
                </span>

                <!---Badges, published/edited date, expand/collapse button--->
                <span class="flex flex-row items-center gap-2 ml-auto w-full w-[120px]">
                    <span class="ml-auto" />

                    {#if op}
                        <Badge color="blue" rightJustify={false} click={false} label="Original Poster">OP</Badge>    
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

                    <Icon src={open ? Minus : Plus} width={16} mini/>
                </span>
            </span>
        </button>
        

        <!---Comment Body--->
        {#if open}
            <div class="flex flex-row w-full" transition:slide>
                
                <!---Coler-coded thread depth line; clickable to collapse the thread--->
                <button title="{open ? 'Collapse' : 'Expand'} this Thread: {hideComment ? `Comment hidden - ${hideCommentReason}` : commentText}" class="{threadLineColor}" on:click={() => toggleThread()} />

                <div class="flex flex-col gap-1 mt-1 {threadLineColor != 'hidden' ? 'pl-1 md:pl-2 w-[calc(100%-14px)]' : 'w-full'}">
                    
                    <!---If Comment is hidden, show notice and button to view it--->
                    {#if hideComment}
                        <Card class="flex flex-col px-2 py-1 gap-2 mx-auto opacity-70 w-full">
                            <div class="flex flex-row gap-1 items-start w-full p-1">
                                <div class="w-[42px]">
                                    <Button color="tertiary" size="square-lg" icon={EyeSlash} iconSize={28} 
                                        title="Show Hidden Comment"
                                        on:click={async () => { overrideHideComment = true }}
                                    />
                                </div>
                                <div class="flex flex-col w-[calc(100%-48px)] gap-0 text-xs font-normal">
                                    <span class="font-bold">Comment Hidden</span>
                                    <span>{hideCommentReason}</span>
                                </div>
                            </div>
                        </Card>    
                    
                    <!---Show Actual Comment--->
                    {:else}
                        <Card elevation={-1} cardColor={color} class={color != 'default' ? 'p-2' : ''}>
                            
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
                                <div class="flex flex-row gap-1 items-start w-full p-1">
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
                            {/if}

                            <!---Comment Text Body (Expandable)--->
                            {#if commentText}
                                <!---Show Distinguished Comments in a Special Way--->
                                {#if node.comment_view.comment.distinguished}
                                    <div class="flex flex-row gap-1 items-start w-full p-1">
                                        <div class="w-[42px]">
                                            <Icon src={Megaphone} width={28} mini />
                                        </div>
                                        <div class="flex flex-col w-[calc(100%-48px)] gap-1 text-xs font-normal">
                                            <Markdown source={'**Message from Moderator**\n\n' + commentText} />
                                        </div>
                                    </div>
                                {:else}
                                    <div bind:this={commentBodyContainer} transition:slide class="
                                        max-w-full break-words text-sm
                                        {   $userSettings.uiState.limitCommentHeight && 
                                            !commentBodyExpanded && 
                                            !jumpToComment 
                                                ? 'max-h-[120px] overflow-hidden'
                                                : ''
                                        }
                                        "
                                    >
                                        <Markdown source={commentText} 
                                            noImages={
                                                node.comment_view.comment.removed || 
                                                ($userSettings.uiState.limitCommentHeight && !commentBodyExpanded)
                                            } 
                                        />
                                    </div>
                                {/if}

                            {/if}
                            
                            <!---Expand/Collapse Button--->
                            {#if $userSettings.uiState.limitCommentHeight && !jumpToComment && (commentBodyContainerDoesScroll || commentBodyExpanded)}
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

                            <!---Comment Actions Bar--->
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

                            <!---Reply Field--->
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
                        </Card>
                    {/if}

                    <!---Slot to receive nested Comments component--->
                    <div class="bg-transparent dark:bg-transparent">
                        <slot />
                    </div>
                </div>

            </div>
        {/if}
    </div>
    
    
    
    <!--Show a stub convo line and button to expand the comment if it has children--->
    {#if !open}
        <div class="flex flex-row w-full" transition:slide>
            <button title="{open ? 'Collapse' : 'Expand'} this Thread" class="{threadLineColor}" on:click={() => toggleThread()}/>
            {#if threadLineColor != 'hidden'}
                <Button
                    class="ml-4 mt-4 text-xs"
                    loading={node.loading}
                    disabled={node.loading}
                    size="sm"
                    color="tertiary-border"
                    icon={BarsArrowDown}
                    iconSize={16}
                    on:click={() => toggleThread() }
                >
                    {#if node.comment_view.counts.child_count > 0}
                        Expand {node.comment_view.counts.child_count} more in thread
                    {:else}
                        Expand comment
                    {/if}
                </Button>
            {/if}
        </div>
    {/if}
</div>

