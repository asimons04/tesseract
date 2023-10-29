<script lang="ts">
  import type { CommentView, PostView } from 'lemmy-js-client'

  import { getClient } from '$lib/lemmy.js'
  import { profile } from '$lib/auth.js'
  import { toast } from '$lib/components/ui/toasts/toasts.js'

  import Button from '$lib/components/input/Button.svelte'
  import Checkbox from '$lib/components/input/Checkbox.svelte'
  import Comment from '$lib/components/lemmy/comment/Comment.svelte'
  import Modal from '$lib/components/ui/modal/Modal.svelte'
  import Post from '$lib/components/lemmy/post/Post.svelte'
  import TextArea from '$lib/components/input/TextArea.svelte'
  
  import {
    Icon,
    Flag
  } from 'svelte-hero-icons'

  export let open: boolean
  export let item: PostView | CommentView | undefined = undefined
  export let reason = ''

  const isComment = (item: PostView | CommentView): item is CommentView => 'comment' in item

  const isPost = (item: PostView | CommentView): item is PostView => !isComment(item)

  let loading = false
  let confirm = false
  

  async function report() {
    if (!item || !$profile?.jwt || reason == '') return
    loading = true

    try {
      if (isComment(item)) {
        await getClient().createCommentReport({
          auth: $profile.jwt,
          comment_id: item.comment.id,
          reason: reason,
        })
      } else if (isPost(item)) {
        await getClient().createPostReport({
          auth: $profile.jwt,
          post_id: item.post.id,
          reason: reason,
        })
      }
      open = false
      toast({
        content: 'That submission has been reported.',
        type: 'success',
      })
    } catch (err) {
      toast({ content: err as any, type: 'error' })
    }

    loading = false
  }

</script>

<Modal bind:open title="Report Submission" icon={Flag}>
  
    <form class="flex flex-col gap-4" on:submit|preventDefault={report}>
        {#if item}
            <div class="flex flex-col gap-4 w-full">
                <span class="text-sm">Reporting this submission to the moderators of {item.community?.name}@{new URL(item.community?.actor_id).host}</span>
                <TextArea
                    required
                    rows={3}
                    label="Reason"
                    bind:value={reason}
                />
                

                <Checkbox bind:checked={confirm} defaultvalue={false} class="px-2">
                    I confirm that this report is being made in good faith.
                </Checkbox>


                <Button submit {loading} disabled={loading || !confirm} color="primary" size="lg">
                    Submit
                </Button>
            </div>

            <div class="pointer-events-none list-none">
                {#if isComment(item)}
                    <Comment
                        actions={false}
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
        
    </form>
</Modal>
