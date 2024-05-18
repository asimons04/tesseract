<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import { Color } from '$lib/ui/colors.js'
    import type { CommentResponse } from 'lemmy-js-client'
    import { getClient } from '$lib/lemmy.js'
    import { createEventDispatcher } from 'svelte'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'

    export let postId: number
    export let parentId: number | undefined = undefined
    export let locked: boolean = false
    export let rows: number = 7

    const dispatch = createEventDispatcher<{ comment: CommentResponse }>()

    export let value = ''
    export let actions = true
    
    
    let loading = false
    let previewing = false

    async function submit() {
        if (!$profile?.user || !$profile?.jwt || value == '') return
        
        loading = true

        try {
            const response = await getClient().createComment({
                content: value,
                post_id: postId,
                parent_id: parentId,
            });
            dispatch('comment', response);

            value = ''
           
            toast({
                content: 'Your comment was submitted.',
                type: 'success',
            })
        } catch (err) {
            console.error(err)
            toast({
                content: err as any,
                type: 'error',
            })
        }
        loading = false
    }
</script>

<div class="flex flex-col gap-2 relative">
    <MarkdownEditor
        id={`commentForm-${postId}`}
        rows={rows}
        placeholder={locked
            ? 'This post is locked.'
            : ''
        }
        bind:value
        bind:previewing
        disabled={locked || loading}
        previewButton={true}
        on:confirm={submit}
    >
        <div slot="actions" class="w-full mb-2">
            {#if actions}
                <div class="flex flex-row items-center justify-between">
                    <Button on:click={submit} color="primary" size="md" class="ml-auto w-28" {loading} disabled={locked || loading} >
                        Submit
                    </Button>
                </div>
            {/if}
        </div>
    </MarkdownEditor>
   
</div>
