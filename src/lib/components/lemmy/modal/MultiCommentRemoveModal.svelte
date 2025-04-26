<script lang="ts">
    import { profile } from "$lib/auth";
    import Modal from "$lib/components/ui/modal/Modal.svelte";
    import { getClient } from "$lib/lemmy";
    import { Fire, ShieldExclamation, Trash } from "svelte-hero-icons";
    import type { ModQueue } from "../moderation/moderation";
    import MarkdownEditor from "$lib/components/markdown/MarkdownEditor.svelte";
    import Button from "$lib/components/input/Button.svelte";
    import MultiSelect from "$lib/components/input/MultiSelect.svelte";

    export let open = false
    export let modQueue: ModQueue
    
    let reason: string = ''
    let purge: boolean = false
    let remove: boolean = true
    let loading: boolean = false
</script>

<Modal bind:open icon={ShieldExclamation} title="Bulk {remove ? 'Remove' : 'Restore'}" card={true} width='max-w-3xl' on:close={() => { open = false }} >
    <div class="flex flex-col gap-2 w-full">
        <h1 class="text-sm font-bold">Bulk {remove ? 'Remove' : 'Restore'} Comments</h1>
        <div class="flex flex-row w-full justify-between">
            <p class="text-xs font-normal">
                Use this form to {remove ? 'remove' : 'restore'} the {modQueue.queue.comments.length} selected {modQueue.queue.comments.length > 1 ? 'comments' : 'comment'}.
                All selected item(s) will be moderated with the same reason provided below.
            </p>

            <MultiSelect options={[false, true]} optionNames={['Restore', 'Remove']} bind:selected={remove} class="ml-auto w-fit"/>
        </div>

        <MarkdownEditor rows={6} previewButton images={false} label="Reason" placeholder="Optional" bind:value={reason}>
            <Button 
                color={purge || remove ? 'danger' : 'primary'} 
                icon={purge ? Fire : Trash}
                iconSize={16}
                size="lg" 
                loading={loading} 
                disabled={loading} 
                slot="actions"
                on:click={async () => {
                    loading = true
                    await modQueue.removeAllComments({
                        remove: remove,
                        reason: reason
                    })
                    loading = false
                    open = false
                }}
            >
                { purge ? 'Purge' : remove ? 'Remove' : 'Restore' }
            </Button>
        </MarkdownEditor>
    </div>
</Modal>