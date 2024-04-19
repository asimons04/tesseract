<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import { createEventDispatcher } from 'svelte'
    
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    
    import { PencilSquare } from 'svelte-hero-icons'

    export let post:PostView
    export let open:boolean = false

    const dispatcher = createEventDispatcher<{ edit: PostView }>()

</script>



{#if open}
    <Modal bind:open={open} fullHeight={false} icon={PencilSquare} title="Editing Post">
        
        {#await import('$lib/components/lemmy/post/PostForm.svelte')}
            <div class="mx-auto flex justify-center items-center">
                <Spinner width={32} />
            </div>
        {:then { default: PostForm }}
            <PostForm editingPost={post}
                on:submit={(e) => {
                    open = false
                    post = e.detail
                    dispatcher('edit', e.detail)
                }}
            >

                <svelte:fragment slot="formtitle">
                    <!-- Have the title not exist at all -->
                    {''}
                </svelte:fragment>
            </PostForm>
        {/await}
    </Modal>
{/if}
