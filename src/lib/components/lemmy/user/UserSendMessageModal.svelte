<script lang="ts">
    import type { LocalUserView, PersonView } from "lemmy-js-client"
    
    import Button from "$lib/components/input/Button.svelte"
    import MarkdownEditor from "$lib/components/markdown/MarkdownEditor.svelte"
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import UserLink from "$lib/components/lemmy/user/UserLink.svelte";

    import { getClient } from "$lib/lemmy"
    import { profile } from "$lib/auth"
    import { toast } from "$lib/components/ui/toasts/toasts"
    
    import { Envelope } from "svelte-hero-icons"
    

    export let open:boolean = false
    export let person: PersonView | LocalUserView
    
    let sending = false
    let message:string = ''
    
    async function sendMessage() {
        if (!$profile?.jwt || message == '') return
        
        sending = true

        try {
            await getClient().createPrivateMessage({
                content: message,
                recipient_id: person.person.id,
            })

            toast({
                content: 'Successfully sent that person a message.',
                type: 'success',
            })

            open = false
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        sending = false
    }
</script>


<Modal bind:open icon={Envelope} title="Send Direct Message">
    <form on:submit|preventDefault={sendMessage} class="flex flex-col gap-4">
        
        <p class="inline-flex flex-row gap-2 items-center">
            To: <UserLink avatar user={person.person} />
        </p>
        <MarkdownEditor bind:value={message} label="Message" rows={8} previewButton>
            <Button color="primary" size="lg" submit loading={sending} disabled={sending} slot="actions">
                Send
            </Button>
        </MarkdownEditor>
    </form>
</Modal>