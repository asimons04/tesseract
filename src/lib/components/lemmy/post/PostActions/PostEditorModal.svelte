<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import { createEventDispatcher } from 'svelte'
    
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import PostForm from '$lib/components/lemmy/post/PostForm.svelte'
    
    import { PencilSquare } from 'svelte-hero-icons'

    export let post:PostView
    export let open:boolean = false

    const dispatcher = createEventDispatcher<{ edit: PostView }>()

</script>




<Modal bind:open={open} preventCloseOnClickOut icon={PencilSquare} card={false} title="Editing Post" width="max-w-5xl" height="max-h-[95vh]">
    <PostForm editingPost={post} textEditorRows={10} inModal={true} editing
        on:submit={(e) => {
            open = false
            post = e.detail
            dispatcher('edit', e.detail)
        }}
    />
</Modal>

