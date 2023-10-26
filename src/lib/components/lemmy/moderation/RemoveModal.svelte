<script lang="ts">
    import type { CommentView, PostView } from 'lemmy-js-client'

    import { amMod, isAdmin } from './moderation'
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
    import TextArea from '$lib/components/input/TextArea.svelte'

    import { 
        Icon,
        Fire,
        HandThumbUp,
        Trash 
    } from 'svelte-hero-icons'

    export let open: boolean
    export let item: PostView | CommentView | undefined = undefined
    export let purge: boolean = false
    export let reason:string 
    
    let commentReason: boolean = false
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
            communityLink: `!${fullCommunityName(
                item!.community.name,
                item!.community.actor_id
            )}`,
            postTitle: item.post.name,
            reason: reason,
            username: item.creator.name,
        })
    }

    $: replyReason = commentReason ? getReplyReason(reason) : ''

    async function remove() {
        if (!item) return
        if (!$profile?.jwt) throw new Error('Unauthenticated')

        loading = true
        try {
            if (purge) {
                if (isCommentView(item)) {
                    await getClient(undefined, fetch).purgeComment({
                        auth: $profile.jwt,
                        comment_id: item.comment.id,
                        reason: reason,
                    })
                } else {
                    await getClient(undefined, fetch).purgePost({
                        auth: $profile.jwt,
                        post_id: item.post.id,
                        reason: reason,
                    })
                }
                toast({
                    content: 'Successfully purged that submission.',
                    type: 'success',
                })

                loading = false
                open = false
                return
            }

            if (commentReason) {
                if (replyReason == '') {
                    toast({
                        content: 'Your reply cannot be empty if "Reply reason" is enabled.',
                    })
                    return
                }

                if (privateMessage) {
                    await getClient()
                        .createPrivateMessage({
                            auth: $profile.jwt,
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
                        auth: $profile.jwt,
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
                    auth: $profile.jwt,
                    comment_id: item.comment.id,
                    removed: !removed,
                    reason: reason || undefined,
                })
                item.comment.removed = !removed
            } else if (isPostView(item)) {
                await getClient().removePost({
                    auth: $profile.jwt,
                    post_id: item.post.id,
                    removed: !removed,
                    reason: reason || undefined,
                })
                item.post.removed = !removed
            }
            open = false

            toast({
                content: `Successfully ${
                removed ? 'restored' : 'removed'
                } that submission.`,
                type: 'success',
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
        loading = false
    }

    const resetText = () => {
        replyReason = ''
        commentReason = false
    }

    $: {
        if (item) {
            resetText()
        }
    }
</script>

<Modal bind:open title="{purge ? 'Purging' : removed ? 'Restoring' : 'Removing'} Submission" icon={purge ? Fire : removed ? HandThumbUp : Trash}>
  
    {#if item}
        <form class="flex flex-col gap-4 list-none" on:submit|preventDefault={remove}>
            

            <TextArea
                rows={5}
                label="Reason"
                placeholder="Optional"
                bind:value={reason}
            />
            
            <!--- Only show "Reply with reason" if you're a mod of the community or an admin and the content is local--->
            {#if !removed && ( amMod($profile.user, item.community) || (isAdmin($profile.user) && item.community.local))}
                <div class="flex flex-row gap-2 items-center justify-between">
                    <Checkbox bind:checked={commentReason}>Reply with reason</Checkbox>
                    {#if commentReason}
                        <MultiSelect
                            options={[false, true]}
                            optionNames={['Comment', 'Message']}
                            bind:selected={privateMessage}
                        />
                    {/if}
                </div>
                {#if commentReason}
                    <MarkdownEditor
                        bind:value={replyReason}
                        placeholder={replyReason}
                        rows={3}
                        label="Reply"
                    />
                {/if}
            {/if}

            <Button
                color={purge ? 'danger' : 'primary'}
                size="lg"
                {loading}
                disabled={loading}
                submit
            >
                <Icon src={purge ? Fire : Trash} mini size="16" slot="icon" />
                {#if purge}
                    Purge
                {:else}
                    {removed ? 'Restore' : 'Remove'}
                {/if}
            </Button>

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
        </form>
    {/if}
</Modal>
