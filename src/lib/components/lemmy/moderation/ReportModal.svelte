<script lang="ts">
    import type { CommentView, PostView, PrivateMessageView } from 'lemmy-js-client'
    
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import ReportItemForm from '$lib/components/lemmy/modal/components/ReportItemForm.svelte'

    import { Flag } from 'svelte-hero-icons'

    export let open: boolean
    export let item: PostView | CommentView | PrivateMessageView
    export let reason = ''

</script>

<Modal bind:open title="Report Submission" icon={Flag} width="max-w-2xl" on:close={() => { open=false }}>
    <ReportItemForm {item} {reason} on:reported={() => history.back()} />
</Modal>
