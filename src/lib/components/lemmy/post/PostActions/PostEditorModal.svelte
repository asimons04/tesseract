<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import { createEventDispatcher } from 'svelte'
    
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import PostForm from '$lib/components/lemmy/post/PostForm.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    
    import { PencilSquare } from 'svelte-hero-icons'

    export let post:PostView
    export let open:boolean = false
    
    let maximized:boolean = false
    $: textEditorRows = maximized ? 15 : 10

    const dispatcher = createEventDispatcher<{ edit: PostView }>()

</script>




<Modal bind:open={open} preventCloseOnClickOut fullHeight={false} icon={PencilSquare} bind:maximized allowMaximize={true} card={false} title="Editing Post" width="max-w-4xl">
    <PostForm editingPost={post} bind:textEditorRows inModal={true} editing
        on:submit={(e) => {
            open = false
            post = e.detail
            dispatcher('edit', e.detail)
        }}
    />
</Modal>

