<script lang="ts">
    import type { CommentView, PostView, PrivateMessageView } from "lemmy-js-client"

    import { createEventDispatcher } from "svelte"
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Button from "$lib/components/input/Button.svelte"
    import MarkdownEditor from "$lib/components/markdown/MarkdownEditor.svelte"
    import SettingToggle from "$lib/components/ui/settings/SettingToggle.svelte"
    import SettingToggleContainer from "$lib/components/ui/settings/SettingToggleContainer.svelte"
    
    
    
    import { ClipboardDocumentCheck, EyeSlash } from "svelte-hero-icons";

    export let item: PostView | CommentView | PrivateMessageView 
    export let reason = ''

    const isComment = (item: PostView | CommentView | PrivateMessageView): item is CommentView => 'comment' in item
    const isPost = (item: PostView | CommentView | PrivateMessageView) : item is PostView => ('post' in item && !('comment' in item))
    const isPrivateMessage = (item: PostView | CommentView | PrivateMessageView) : item is PrivateMessageView => 'private_message' in item

    let loading = false
    let confirm = false
    const dispatcher = createEventDispatcher()

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
            
            dispatcher('reported')
            
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

<form class="flex flex-col gap-4" on:submit|preventDefault={report}>
    
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
        </SettingToggleContainer>

        
    </div>
</form>
    