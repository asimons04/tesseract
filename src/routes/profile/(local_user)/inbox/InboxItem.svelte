<script lang="ts">
    import type {
        CommentReplyView,
        PersonMentionView,
        PrivateMessageView,
    } from 'lemmy-js-client'

    
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte';
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import PrivateMessageItem from '$lib/components/lemmy/private_message/PrivateMessageItem.svelte'
    import ReportModal from '$lib/components/lemmy/moderation/ReportModal.svelte'
    import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { isRead } from '$lib/lemmy/inbox'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import { ChatBubbleOvalLeft, Check, Flag, Icon } from 'svelte-hero-icons'

    export let item: CommentReplyView | PersonMentionView | PrivateMessageView

    function isPrivateMessage(item: CommentReplyView | PersonMentionView | PrivateMessageView): item is PrivateMessageView {
        return 'private_message' in item
    }
    
    $: read = isRead(item)

    let replying = false
    let reply = ''
    let loading = false
    let reporting = false

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
        } 
        else if ('comment_reply' in item) {
            await getClient().markCommentReplyAsRead({
                comment_reply_id: item.comment_reply.id,
                read: isRead,
            })
        }
        else if ('private_message' in item) {
            await getClient().markPrivateMessageAsRead({
                private_message_id: item.private_message.id,
                read: isRead
            })
        }

        read = isRead
        if ($profile.user) $profile.user.unreads += isRead ? -1 : 1
        loading = false
    }
</script>

<ReportModal bind:open={reporting} bind:item={item} />

<Card elevation={0} class="flex flex-col rounded-md p-5 max-w-full gap-2">
    <!---{#if !isPrivateMessage(item)}--->
    {#if 'person_mention' in item || 'comment_reply' in item}
        <PostMeta post={item}/>
        
        <div class="flex flex-col" class:mt-2={$profile?.user && item.post.creator_id != $profile.user.local_user_view.person.id}>
            <SectionTitle class="mb-2 text-xs">Reply</SectionTitle>
            
            {#if $profile?.user && item.post.creator_id != $profile.user.local_user_view.person.id}
                <div class="flex flex-row text-xs items-center gap-2">
                    <div class="border-t w-8 rounded-tl h-2 border-l ml-2 border-zinc-700"/>
                    <div>
                        <UserLink avatar avatarSize={16} user={$profile.user.local_user_view.person}/>
                    </div>
                </div>
            {/if}

            <Comment postId={item.post.id} node={{ children: [], comment_view: item, depth: 1 }} replying={false} class="!p-0" />
        </div>

        <div class="flex flex-row ml-auto gap-2">
            <Button class={read ? '!text-green-500' : ''} color="tertiary-border" size="square-md" {loading} disabled={loading} on:click={() => markAsRead(!read)} >
                <Icon slot="icon" src={Check} mini size="16" />
            </Button>

            <Button color="tertiary-border" href="/comment/{item.comment.id}" size="md" class="h-8">
                Jump
            </Button>
        </div>
    {:else}
        <PrivateMessageItem bind:item read />

        {#if item.recipient.id == $profile?.user?.local_user_view.person.id}
            <div class="flex flex-row gap-2 justify-between">
                <Button color="tertiary-border" on:click={() => (replying = !replying)}>
                    <Icon mini src={ChatBubbleOvalLeft} width={16} />
                    Reply
                </Button>
                
                <span class="flex flex-row gap-2">
                    <!---Report PM--->
                    <Button class="text-red-500" color="tertiary-border" size="square-md" on:click={() => {reporting=true} } >
                        <Icon slot="icon" src={Flag} mini size="16" />
                    </Button>
                    
                    <!---Mark PM as Read--->
                    <Button class={read ? '!text-green-500' : ''} color="tertiary-border" size="square-md" {loading} disabled={loading} on:click={() => markAsRead(!read)} >
                        <Icon slot="icon" src={Check} mini size="16" />
                    </Button>
                </span>
            </div>
        {/if}
    
        {#if isPrivateMessage(item)}
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
    {/if}
</Card>
