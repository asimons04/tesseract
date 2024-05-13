<script lang="ts">
    import type { Post } from 'lemmy-js-client'

    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Button from '$lib/components/input/Button.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'

    import { 
        Icon,
        Fire,
        HandThumbUp,
        Trash 
    } from 'svelte-hero-icons'

    export let open: boolean
    export let purge: boolean = false
    export let reason:string 
    export let post: Post

    const dispatcher = createEventDispatcher<{
        remove?: boolean,
        purge?: boolean
    }>()

    let loading = false

    $: removed = post.removed
 

    
    async function remove() {
        if (!post) return
        
        if (!$profile?.jwt) throw new Error('Unauthenticated')

        loading = true
        
        if (purge) {
            try {
                await getClient().purgePost({
                    post_id: post.id,
                    reason: reason || undefined,
                })
            
                toast({
                    content: `Successfully purged that post.`,
                    type: 'success',
                })

                post.removed = !removed
                open = false
                loading = false
                dispatcher('purge', true)
                return
            
            } catch (err) {
                toast({
                    content: err as any,
                    title: "Error",
                    type: 'error',
                })
            }
        }

        else {
            try {
            await getClient().removePost({
                post_id: post.id,
                removed: !removed,
                reason: reason || undefined,
            })
        
            toast({
                content: `Successfully ${
                removed ? 'restored' : 'removed'
                } that submission.`,
                type: 'success',
            })
            post.removed = !removed
            open = false
            loading = false
            dispatcher('remove', post.removed)
            return

        } catch (err) {
            toast({
                content: err as any,
                title: "Error",
                type: 'error',
            })
        }

        }
        
        loading = false
    }
</script>

<Modal bind:open title="{purge ? 'Purging' : removed ? 'Restoring' : 'Removing'} Post" icon={purge ? Fire : removed ? HandThumbUp : Trash}>
  
    {#if post}
        <form class="flex flex-col gap-4 list-none" on:submit|preventDefault={remove}>

            <MarkdownEditor rows={6} previewButton images={false} label="Reason" placeholder="Optional" bind:value={reason} />

            <Button color={purge ? 'danger' : 'primary'} size="lg" {loading} disabled={loading} submit >
                <Icon src={purge ? Fire : Trash} mini size="16" slot="icon" />
                {#if purge}
                    Purge
                {:else}
                    {removed ? 'Restore' : 'Remove'}
                {/if}
            </Button>
            
        </form>
    {/if}
</Modal>
