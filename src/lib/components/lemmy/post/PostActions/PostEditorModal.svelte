<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import { dispatchWindowEvent, type EditPostEvent } from '$lib/ui/events'
    
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import PostForm from '$lib/components/lemmy/post/PostForm.svelte'
    
    import { PencilSquare } from 'svelte-hero-icons'

    export let post:PostView
    export let open:boolean = false

    const handlers = {
        EditPostEvent: function (e:EditPostEvent) {
            if (post.post.id == e.detail.post.post.id) open = false
        }
    }

</script>

<svelte:window on:editPost={handlers.EditPostEvent} />




<Modal bind:open preventCloseOnClickOut icon={PencilSquare} card={false} title="Editing Post" width="max-w-5xl" height="max-h-[95vh]">
    <PostForm editingPost={post} textEditorRows={10} inModal={true} editing />
</Modal>

