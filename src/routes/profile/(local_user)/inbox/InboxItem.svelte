<script lang="ts">
    import type { InboxFeedType } from './+page'
    import type {
        CommentReplyView,
        PersonMentionView,
        PrivateMessageView,
    } from 'lemmy-js-client'
    
    import { createEventDispatcher } from 'svelte'
    import { fade } from 'svelte/transition'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { getInboxItemPublished, isRead } from '$lib/lemmy/inbox'
    import { isCommentReply, isPersonMention, isPostReply } from '$lib/lemmy/item'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte';
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte';
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte';
    import PrivateMessageItem from '$lib/components/lemmy/private_message/PrivateMessageItem.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte';
    import ReportModal from '$lib/components/lemmy/moderation/ReportModal.svelte'

    import { 
        AtSymbol, 
        ChatBubbleLeftEllipsis, 
        ChatBubbleLeftRight, 
        ChatBubbleOvalLeft, 
        Envelope, 
        EnvelopeOpen, 
        Flag, 
        Window as WindowIcon,
        Icon, 
        type IconSource 
    } from 'svelte-hero-icons'
    
    
    
    export let item: CommentReplyView | PersonMentionView | PrivateMessageView
    export let type: InboxFeedType = 'all'

    const dispatcher = createEventDispatcher()

    function isPrivateMessage(item: CommentReplyView | PersonMentionView | PrivateMessageView): item is PrivateMessageView {
        return 'private_message' in item
    }
    
    $: read = isRead(item)

    let replying = false
    let reply = ''
    let loading = false
    let reporting = false
    let itemType: InboxFeedType
   
    let subject: string
    let icon: IconSource

    $:  item, generateHeading()


    async function replyToMessage(message: PrivateMessageView | CommentReplyView | PersonMentionView) {
        if (!$profile?.jwt) return
        loading = true

        try {
            await getClient().createPrivateMessage({
                content: reply,
                recipient_id: message.creator.id,
            })

            toast({
                content: 'Successfully replied to that message.',
                type: 'success',
                title: "Reply Sent"
            })

            replying = false

            goto($page.url, {
                invalidateAll: true,
                replaceState: true,
            })
        } 
        catch (error) {
            toast({ 
                content: error as any ?? 'An error occurred while sending reply, but the API decided to not provide any details', 
                title: 'Error', 
                type: 'error' 
            })
        }
        loading = false
    }

    async function markAsRead(isRead: boolean) {
        if (!$profile?.jwt) return
        loading = true

        if ('person_mention' in item) {
            await getClient().markPersonMentionAsRead({
                person_mention_id: item.person_mention.id,
                read: isRead,
            })
            item.person_mention.read = isRead
        } 
        else if ('comment_reply' in item) {
            await getClient().markCommentReplyAsRead({
                comment_reply_id: item.comment_reply.id,
                read: isRead,
            })
            item.comment_reply.read = isRead
        }
        
        else if (isPrivateMessage(item)) {
            await getClient().markPrivateMessageAsRead({
                private_message_id: item.private_message.id,
                read: isRead
            })
            item.private_message.read = isRead
        }

        read = isRead
        if ($profile.user) $profile.user.unreads += isRead ? -1 : 1
        dispatcher('markAsRead', isRead)
        loading = false
    }


    function generateHeading() {
        let creatorName = (item.creator.id == $profile?.user?.local_user_view.person.id)
            ? 'You'
            : `u/${item.creator.name}`

        //: `${item.creator.display_name ?? item.creator.name}@${new URL(item.creator.actor_id).hostname}`

        let recipientName = (item.recipient.id == $profile?.user?.local_user_view.person.id)
            ? 'You'
            : `${item.recipient.display_name ?? item.recipient.name}@${new URL(item.recipient.actor_id).hostname}`


        if (isPersonMention(item)) {
            itemType = 'mentions'
            subject = `${creatorName} mentioned you.`
            icon = AtSymbol
        }
        
        if (isCommentReply(item, $profile?.user?.local_user_view.person.id)) {
            itemType = 'replies'
            subject = `${creatorName} replied to your comment in c/${item.community.name}`
            //@${new URL(item.community.actor_id).hostname}
            icon = ChatBubbleLeftEllipsis
        }

        if (isPostReply(item, $profile?.user?.local_user_view.person.id)) {
            itemType = 'replies'
            subject = `${creatorName} replied to your post in c/${item.community.name}`
            // @${new URL(item.community.actor_id).hostname}
            icon = WindowIcon
        }

        if (isPrivateMessage(item)) {
            itemType = 'messages'
            subject = `${creatorName} messaged ${recipientName}`
            icon = ChatBubbleLeftRight
        }
    }
        
        


</script>

{#if type == 'all' || type == itemType || (type == 'unread' && !read)}
    <span class="flex flex-row w-full" transition:fade>
        
        <span class="mt-3 mb-auto w-[50px]">
            <Button color="tertiary-border" size="sm" title="Mark as {read ? 'unread': 'read'}" on:click={() => markAsRead(!read)}>
                <Icon src={read ? EnvelopeOpen : Envelope} width={22} mini class={read ? 'opacity-60' : ''}/>
            </Button>
        </span>
        
        <CollapseButton expanded={$userSettings.notifications.expandInboxItemsByDefault} bind:icon={icon} bold={!read} truncate={true} class="w-[calc(100%-50px)]" innerClass="!pl-0 ml-[-50px]">
                <!---Title Component of Collapse Button--->
                <div class="flex flex-row gap-2 items-start" slot="title" title="{subject}">
                    <span class="opacity-70">
                        <RelativeDate date={getInboxItemPublished(item)} />
                    </span>
                    {subject}
                </div>
            
                <!---Body Component--->
                <Card class="p-2">
                    <div class="flex flex-col gap-2 w-full">
                        
                        <!--Post/Comment Reply and Mentions--->
                        {#if isPostReply(item) || isCommentReply(item) || isPersonMention(item)}
                            <span class="text-xs">
                                <CommunityLink avatar bind:community={item.community} />
                            </span>
                            
                            <a href="/comment/{item.comment.id}" class="font-bold text-base">
                                {item.post.name}
                            </a>
                            
                            <Comment elevation={-1} postId={item.post.id} node={{ children: [], comment_view: item, depth: 1 }} replying={false} class="!p-0" />
                        {/if}

                        <!---Direct Messages--->
                        {#if isPrivateMessage(item)}
                            <PrivateMessageItem bind:item read />
                            
                            {#if item.recipient.id == $profile?.user?.local_user_view.person.id}
                                <div class="flex flex-row gap-2 justify-between">
                                    <Button color="tertiary-border" on:click={() => (replying = !replying)}>
                                        <Icon mini src={ChatBubbleOvalLeft} width={16} />
                                        Reply
                                    </Button>
                                    
                                    <span class="flex flex-row gap-2">
                                        <!---Report PM--->
                                        <Button color="tertiary-border" size="square-md" on:click={() => {reporting=true} } >
                                            <Icon slot="icon" src={Flag} mini size="16" class="text-red-500" />
                                        </Button>
                                    </span>
                                </div>
                            {/if}
                            
                            {#if replying}
                                <div class="mt-2 flex flex-col gap-2">
                                    <MarkdownEditor placeholder="Message" bind:value={reply} rows={8} previewButton/>
                                    <div class="ml-auto w-24">
                                        <Button disabled={loading} {loading} on:click={() => replyToMessage(item)} color="tertiary-border" size="sm">
                                            Submit
                                        </Button>
                                    </div>
                                </div>
                            {/if}
                        {/if}
                    </div>
                </Card>

        </CollapseButton>
    </span>
{/if}


<ReportModal bind:open={reporting} bind:item={item} />


