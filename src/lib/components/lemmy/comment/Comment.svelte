<script lang="ts">
    import type { BanCommunityEvent, BanUserEvent, DistinguishCommentEvent, PurgeCommentEvent, RemoveCommentEvent } from '$lib/ui/events'
    import { getDepthFromComment, type CommentNodeI } from './comments'
    import type { UploadImageResponse } from 'lemmy-js-client';
    
    import {
        ArrowUp,
        Bookmark,
        ChatBubbleLeftEllipsis,
        HandRaised,
        Icon,
        Minus,
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
        isAdmin 
    }                       from '../moderation/moderation'
    import { 
        getClient, 
        minAPIVersion 
    }                       from '$lib/lemmy.js'
    import { onMount }      from 'svelte'
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


    let imageUploads                = [] as UploadImageResponse[]
    let editing                     = false
    let newComment                  = node.comment_view.comment.content
    let jumpToComment               = false
    let commentContainer: HTMLDivElement
    let op                          = (node.comment_view.post.creator_id == node.comment_view.creator.id)
    let commentText                 = node.comment_view.comment.content

    // If linking to a thread, scroll to the speciic comment and highlight it
    onMount(async() => {
        // Need to do this so we can set comment text to "Deleted by creator", "Remove by Mod", and try to lookup the modlog details to display inline.
        commentText = await getCommentText()
        
        if (jumpTo > 0 && jumpTo == node.comment_view.comment.id ) { 
            jumpToComment = true
            color = 'warning'
            sleep(175).then(() => {
                commentContainer.scrollIntoView({behavior: 'smooth'})
            })
        }
    })

    function handleBanUser(e: BanUserEvent) {
        if (node.comment_view.creator.id == e.detail.person_id) {
            node.comment_view.creator.banned = e.detail.banned
            
            if (e.detail.remove_content) {
                node.comment_view.comment.removed = true
                color = 'error'
            }
        }
        node = node
    }

    function handleBanCommunity(e: BanCommunityEvent) {
        if (node.comment_view.creator.id == e.detail.person_id) {
            node.comment_view.creator_banned_from_community = e.detail.banned
            
            if (e.detail.remove_content) {
                node.comment_view.comment.removed = true
                //color = 'error'
            }
        }
        node = node
    }

    function handleRemoveComment(e: RemoveCommentEvent) {
        if (node.comment_view.comment.id == e.detail.comment_id) {
            node.comment_view.comment.removed = e.detail.removed
            getCommentText().then((newText) => commentText = newText)

            /*
            if (e.detail.removed) color = 'error'
            else color = getCardColor(node)
            */
        }
    }   

    function handlePurgeComment(e: PurgeCommentEvent) {
        if (node.comment_view.comment.id == e.detail.comment_id) {
            node.comment_view.comment.removed = e.detail.purged
            node.comment_view.comment.content = '*Purged*'
            node = node
        }
    }

    function handleDistinguishComment(e: DistinguishCommentEvent) {
        if (node.comment_view.comment.id == e.detail.comment_id) {
            node.comment_view.comment.distinguished = e.detail.distinguished
            node = node
            color = 'success'
        }
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

    function getCardColor(node: CommentNodeI): 'default' | 'warning' | 'error' | 'success' {
        let color: 'default' | 'warning' | 'error' | 'success' = 'default'
        
        if (node.comment_view.comment.distinguished) return 'success'
        if (jumpToComment) return 'warning'
        //if (node.comment_view.comment.removed) return 'error'

        return color
    }

    async function getCommentText() {
        let text = node.comment_view.comment.content

        if (node.comment_view.comment.deleted) {
            text = '*Deleted by Creator*'
        }

        if (node.comment_view.comment.removed) {
            text =  onHomeInstance 
                ? `[*Removed by Mod*](/modlog?comment_id=${node.comment_view.comment.id})`
                : '*Removed by Mod*'
        }
        
        // If current account is admin, show the content. Second condition is for older APIs that showed the removed content to mods.
        if (onHomeInstance && (isAdmin($profile?.user) || (amMod($profile?.user, node.comment_view.community) && node.comment_view.comment.content))) {
            text =  node.comment_view.comment.content
        }

        // If the content is removed, try to append the removal reason.  If current account is a mod, append the original content from the modlog lookup
        if (onHomeInstance && node.comment_view.comment.removed) {
            // Assume removed reason is ban w/removal if no modlog entry for the removed item.
            let reason = (node.comment_view.creator.banned || node.comment_view.creator_banned_from_community)
                ? 'Creator banned with content removal'
                :'No reason specified'
            let originalContent = ''
            
            if ($userSettings.autoLookupRemovedCommentReasons && minAPIVersion('0.19.6')) {
                try {
                    let results = await getClient().getModlog({comment_id: node.comment_view.comment.id})
                    if (results?.removed_comments.length > 0) {
                        reason = results.removed_comments[0].mod_remove_comment.reason ?? 'Failed to lookup reason automatically. Please see modlog.'
                        
                        // Let mods see removed comments again (stupid Lemmy devs!!)
                        if (isAdmin($profile?.user) || amMod($profile?.user, node.comment_view.community)) {
                            originalContent = results.removed_comments[0].comment.content
                        }
                    }
                    
                    // Append the removal reason and if admin/mod, the removed content contents
                    text += `\n\n --- \n\n**Removal Reason**: ${reason}`
                    
                    if (originalContent) text += `\n\n
                        :::spoiler Removed Comment
                        ${originalContent}
                        :::\n
                    `
                }
                catch {}
            }
        }

        return text


    
    }

    let color: 'default' | 'warning' | 'error' | 'success' = getCardColor(node)
</script>

<svelte:window 
    on:banUser={handleBanUser} 
    on:banCommunity={handleBanCommunity} 
    on:distinguishComment={handleDistinguishComment}
    on:removeComment={handleRemoveComment}
    on:purgeComment={handlePurgeComment}
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

<Card elevation={elevation} cardColor={color} class="pl-1">

    <div bind:this={commentContainer} class="py-1 {$$props.class}" id="#{node.comment_view.comment.id.toString()}" transition:slide>
        <details bind:open class="flex flex-col gap-0">
            
            <summary class="
                flex flex-col md:flex-row flex-wrap w-full cursor-pointer gap-2 group text-xs 
                hover:bg-slate-300 hover:dark:bg-zinc-800 hover:dark:border-zinc-700
                hover:rounded-lg overflow-hidden
            ">
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

                        {#if node.comment_view.comment.deleted} 
                            <Badge icon={Trash} color="red" rightJustify={false} label="Deleted"/>
                        {/if}

                        {#if node.comment_view.comment.removed}
                            <Badge icon={HandRaised} color="red" rightJustify={false} click={false}  label="Removed by Mod"/>
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
                
                <div class="max-w-full mt-0.5 break-words text-sm">
                    <Markdown source={commentText} class="px-1" />
                    
                    <!---
                    <Markdown source={
                        !amModOfAny($profile?.user) && (node.comment_view.comment.removed || node.comment_view.comment.deleted)
                            ? node.comment_view.comment.deleted ? '*Deleted by creator*' : '*Removed by mod*'
                            : node.comment_view.comment.content
                        } 
                        class="px-1"
                    />
                    --->
                </div>
                
                
                <div class="flex flex-row gap-2 items-center">
                    <CommentActions
                        {actions}
                        {onHomeInstance}
                        bind:comment={node.comment_view}
                        bind:replying
                        on:edit={() => (editing = true)}
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
