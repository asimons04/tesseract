<script lang="ts">
    import type { CommentView, PostView } from 'lemmy-js-client'
    import { isCommentView } from '$lib/lemmy/item'

    import Modal            from '$lib/components/ui/modal/Modal.svelte'
    import RemoveItemForm   from '$lib/components/lemmy/modal/components/RemoveItemForm.svelte'
    
    import { 
        Fire,
        HandThumbUp,
        Trash, 
    } from 'svelte-hero-icons'
    

    export let open: boolean
    export let item: PostView | CommentView
    export let purge: boolean = false
    export let reason:string 
    
    $:  removed = isCommentView(item)
            ? item.comment.removed
            : item.post.removed

   
</script>

<Modal bind:open title="{purge ? 'Purging' : removed ? 'Restoring' : 'Removing'} Submission" icon={purge ? Fire : removed ? HandThumbUp : Trash}  width="max-w-2xl">
    <RemoveItemForm {item} {removed} {purge} {reason} on:finish={()=> open = false}/>
</Modal>
