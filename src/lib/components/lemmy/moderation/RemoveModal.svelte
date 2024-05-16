<script lang="ts">
    import type { CommentView, PostView } from 'lemmy-js-client'

    import { amMod, isAdmin } from './moderation'
    import { createEventDispatcher } from 'svelte'
    import { fullCommunityName } from '$lib/util.js'
    import { getClient } from '$lib/lemmy.js'
    import { isCommentView, isPostView } from '$lib/lemmy/item.js'
    import { profile } from '$lib/auth.js'
    import { removalTemplate } from '$lib/components/lemmy/moderation/moderation.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'

    

    import { 
        Icon,
        Fire,
        HandThumbUp,
        Trash, 
        ChatBubbleLeft,

        ChatBubbleLeftRight


    } from 'svelte-hero-icons'

    export let open: boolean
    export let item: PostView | CommentView | undefined = undefined
    export let purge: boolean = false
    export let reason:string 
    
    const dispatcher = createEventDispatcher<{remove: { removed:boolean, purged:boolean}}>()

    let replyWithReason: boolean = false
    let privateMessage: boolean = false
    let loading = false

    $: removed = item
        ? isCommentView(item)
            ? item.comment.removed
            : item.post.removed
        : false

    const getReplyReason = (reason: string) => {
        if (!item) return `no template`

        return removalTemplate($userSettings.moderation.removalReasonPreset, {
            communityLink: `!${fullCommunityName(item!.community.name, item!.community.actor_id)}`,
            postTitle: item.post.name,
            reason: reason,
            username: item.creator.name,
        })
    }

    $: replyReason = replyWithReason ? getReplyReason(reason) : ''

    async function remove() {
        if (!item) return
        if (!$profile?.jwt) throw new Error('Unauthenticated')

        loading = true
        try {
            if (purge) {
                if (isCommentView(item)) {
                    await getClient(undefined).purgeComment({
                        comment_id: item.comment.id,
                        reason: reason,
                    })
                } else {
                    await getClient(undefined).purgePost({
                        post_id: item.post.id,
                        reason: reason,
                    })
                }
                toast({
                    content: 'Successfully purged that submission.',
                    type: 'success',
                    title: 'Success'
                })
                

                loading = false
                open = false
                return
            }

            if (replyWithReason) {
                if (replyReason == '') {
                    toast({
                        content: 'Your reply cannot be empty if "Reply reason" is enabled.',
                        type: 'warning',
                        title: 'Reply Text is Required'
                    })
                    return
                }

                if (privateMessage) {
                    await getClient()
                        .createPrivateMessage({
                            content: replyReason,
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
                        content: replyReason,
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

            if (isCommentView(item)) {
                await getClient().removeComment({
                    comment_id: item.comment.id,
                    removed: !removed,
                    reason: reason || undefined,
                })
                item.comment.removed = !removed
            } 
            else if (isPostView(item)) {
                await getClient().removePost({
                    post_id: item.post.id,
                    removed: !removed,
                    reason: reason || undefined,
                })
                item.post.removed = !removed
            }
            open = false

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
        loading = false

        dispatcher('remove', {removed: item.post.removed, purged: purge})

    }

    const resetText = () => {
        replyReason = ''
        replyWithReason = false
    }
    
    // Reset text on load
    $: if (item) resetText()
</script>

<Modal bind:open title="{purge ? 'Purging' : removed ? 'Restoring' : 'Removing'} Submission" icon={purge ? Fire : removed ? HandThumbUp : Trash}  width="max-w-2xl">
  
    {#if item}
        <form class="flex flex-col gap-4 list-none" on:submit|preventDefault={remove}>
            

            <MarkdownEditor rows={6} previewButton images={false} label="Reason" placeholder="Optional" bind:value={reason}>
                <Button color={purge ? 'danger' : 'primary'} size="lg" {loading} disabled={loading} submit slot="actions">
                    <Icon src={purge ? Fire : Trash} mini size="16" slot="icon" />
                    { purge ? 'Purge' : removed ? 'Restore' : 'Remove' }
                </Button>
            </MarkdownEditor>
            
            <!--- Only show "Reply with reason" if you're a mod of the community or an admin and the content is local--->
            {#if !removed &&  !purge && ( amMod($profile?.user, item.community) || (isAdmin($profile?.user) && item.community.local))}
                <SettingToggleContainer>
                    <SettingToggle bind:value={replyWithReason} icon={ChatBubbleLeft} title="Reply with Reason" 
                        description="Send the user a comment or DM with the reason for the the mod action" 
                    />
                    
                    <SettingMultiSelect icon={ChatBubbleLeftRight} title="Message Type" 
                        description="Choose whether to reply as a comment to the removed item or as a direct message"
                        options={[false, true]} optionNames={['Comment', 'Message']} bind:selected={privateMessage}
                        condition={replyWithReason}
                    />
                </SettingToggleContainer>

                {#if replyWithReason}
                    <MarkdownEditor previewButton images={false} bind:value={replyReason} placeholder={replyReason} rows={6} label="Reply"/>
                {/if}
            {/if}

            
            
            <!---
            <div class="pointer-events-none list-none overflow-x-hidden">
                {#if isCommentView(item)}
                    <Comment
                        node={{
                            children: [],
                            comment_view: item,
                            depth: 1,
                        }}
                        postId={item.post.id}
                        actions={false}
                    />
                {:else if isPostView(item)}
                    <Post actions={false} post={item} forceCompact={true}/>
                {/if}
            </div>
            --->
        </form>
    {/if}
</Modal>
