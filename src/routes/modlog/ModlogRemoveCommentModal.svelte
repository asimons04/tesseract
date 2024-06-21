<script lang="ts">
    import type { Comment } from 'lemmy-js-client'

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
    export let comment: Comment

    const dispatcher = createEventDispatcher<{
        remove?: boolean,
        purge?: boolean
    }>()

    let loading = false

    $: removed = comment.removed
 

    
    async function remove() {
        if (!comment) return
        
        if (!$profile?.jwt) throw new Error('Unauthenticated')

        loading = true
        
        if (purge) {
            try {
                await getClient().purgeComment({
                    comment_id: comment.id,
                    reason: reason || undefined,
                })
            
                toast({
                    content: `Successfully purged that comment.`,
                    type: 'success',
                })

                comment.removed = !removed
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
            await getClient().removeComment({
                comment_id: comment.id,
                removed: !removed,
                reason: reason || undefined,
            })
        
            toast({
                content: `Successfully ${
                removed ? 'restored' : 'removed'
                } that comment.`,
                type: 'success',
            })
            comment.removed = !removed
            open = false
            loading = false
            dispatcher('remove', comment.removed)
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

<Modal bind:open title="{purge ? 'Purging' : removed ? 'Restoring' : 'Removing'} Comment" icon={purge ? Fire : removed ? HandThumbUp : Trash} width="max-w-2xl">
  
    {#if comment}
        <form class="flex flex-col gap-4 list-none" on:submit|preventDefault={remove}>

            <MarkdownEditor rows={6} previewButton images={false} label="Reason" placeholder="Optional" bind:value={reason}>

                <Button color={purge ? 'danger' : 'primary'} size="lg" {loading} disabled={loading} submit slot="actions">
                    <Icon src={purge ? Fire : Trash} mini size="16" slot="icon" />
                    {#if purge}
                        Purge
                    {:else}
                        {removed ? 'Restore' : 'Remove'}
                    {/if}
                </Button>
            </MarkdownEditor>
            
        </form>
    {/if}
</Modal>
