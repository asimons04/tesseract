<script lang="ts">
    import type { Person } from "lemmy-js-client"

    import { createEventDispatcher } from "svelte"
    import { getClient } from "$lib/lemmy"
    import { profile } from "$lib/auth"
    import { toast } from "$lib/components/ui/toasts/toasts"
    
    import Button from "$lib/components/input/Button.svelte"
    import MarkdownEditor from "$lib/components/markdown/MarkdownEditor.svelte"
    import UserLink from "$lib/components/lemmy/user/UserLink.svelte"
    
    
    export let person: Person
    
    let sending = false
    let message:string = ''
    const dispatcher = createEventDispatcher()

    async function sendMessage() {
        if (!$profile?.jwt || message == '') return
        
        sending = true

        try {
            await getClient().createPrivateMessage({
                content: message,
                recipient_id: person.id,
            })

            toast({
                content: 'Successfully sent that person a message.',
                type: 'success',
            })

            dispatcher('sendMessage')
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        sending = false
    }

</script>

<form on:submit|preventDefault={sendMessage} class="flex flex-col gap-4">
        
    <p class="inline-flex flex-row gap-2 items-center pointer-events-none">
        To: <UserLink avatar user={person} />
    </p>
    <MarkdownEditor bind:value={message} label="Message" rows={8} previewButton>
        <Button color="primary" size="lg" submit loading={sending} disabled={sending || !message } slot="actions">
            Send
        </Button>
    </MarkdownEditor>
</form>