<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import { dispatchWindowEvent, type EditPostEvent } from '$lib/ui/events'
    
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import PostForm from '$lib/components/lemmy/post/PostForm.svelte'
    
    import { PencilSquare } from 'svelte-hero-icons'

    export let post:PostView
    export let open:boolean = false
    
    let postInProgress: boolean | undefined = undefined
    let resetPostForm: () => Promise<void>
</script>

<Modal bind:open icon={PencilSquare} card={false} title="Editing Post" width="max-w-5xl" height="max-h-[95vh]"
    on:close={() => { 
        if (postInProgress) {
            if (confirm('You have work in progress.  Are you sure you want to leave?')) {
                resetPostForm().then(() => open = false)
                return
            }
            return
        }
        else {
            open = false
        }
    }}
>
    
    <PostForm editingPost={post} textEditorRows={10} inModal={true} editing 
        bind:resetForm={resetPostForm}
        bind:postInProgress
        on:submit={() => open = false}
    />
</Modal>

