<script lang="ts">
    import type { CommentView, PostView, PrivateMessageView } from 'lemmy-js-client'

    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte';
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte';
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte';
    import Switch from '$lib/components/input/Switch.svelte'

    import {
        ClipboardDocumentCheck,
        EyeSlash,
        Flag
    } from 'svelte-hero-icons'
   


    export let open: boolean
    export let item: PostView | CommentView | PrivateMessageView | undefined = undefined
    export let reason = ''

    const isComment = (item: PostView | CommentView | PrivateMessageView): item is CommentView => 'comment' in item
    const isPost = (item: PostView | CommentView | PrivateMessageView) : item is PostView => ('post' in item && !('comment' in item))
    const isPrivateMessage = (item: PostView | CommentView | PrivateMessageView) : item is PrivateMessageView => 'private_message' in item

    let loading = false
    let confirm = false
    let hideSubmission = true

    async function report() {
        if (!item || !$profile?.jwt || reason == '') return
        loading = true

        try {
            if (isPrivateMessage(item)) {
                await getClient().createPrivateMessageReport({
                    private_message_id: item.private_message.id,
                    reason: reason,
                })  
            }
            else if (isComment(item)) {
                await getClient().createCommentReport({
                    comment_id: item.comment.id,
                    reason: reason,
                })
            } 
            else if (isPost(item)) {
                await getClient().createPostReport({
                    post_id: item.post.id,
                    reason: reason,
                })
            }
            
            open = false
            toast({
                content: 'That submission has been reported.',
                type: 'success',
                title: 'Success'
            })
        } 
        catch (err) {
            toast({ content: 'Unable to report submission.', type: 'error', title:"Error" })
        }
        loading = false
    }

</script>

<Modal bind:open title="Report Submission" icon={Flag} width="max-w-2xl">
  
    <form class="flex flex-col gap-4" on:submit|preventDefault={report}>
        {#if item}
            <div class="flex flex-col gap-4 w-full">
                <span class="text-sm">Reporting this submission 
                    {isComment(item) || isPost(item) ? `to the moderators of ${item.community?.name}@${new URL(item.community?.actor_id).host}` : ''}
                    {isPrivateMessage(item) ? `to the admins of ${new URL(item.creator.actor_id).hostname}` : ''}
                </span>
                
                <MarkdownEditor required rows={6} label="Reason" previewButton images={false} bind:value={reason}>
                    <Button submit {loading} disabled={loading || !confirm} color="primary" size="lg" slot="actions">
                        Submit
                    </Button>
                </MarkdownEditor>
                
                <SettingToggleContainer>
                    <SettingToggle bind:value={confirm} icon={ClipboardDocumentCheck} title="Confirm" description="I confirm that this report is being made in good faith" />
                    <SettingToggle bind:value={hideSubmission} icon={EyeSlash} title="Hide Submission" description="Hide the post/comment preview." />
                </SettingToggleContainer>

                
            </div>
            {#if !hideSubmission}
                <div class="flex flex-col pointer-events-none list-none overflow-hidden">
                    {#if isComment(item)}
                        <Comment actions={false}
                            node={{
                                children: [],
                                comment_view: item,
                                depth: 1,
                                loading: false,
                            }}
                            postId={item.post.id}
                        />
                    {:else if isPost(item)}
                        <Post actions={false} post={item} forceCompact={true}/>
                    {/if}
                </div>
            {/if}
        {/if}
        
    </form>
</Modal>
