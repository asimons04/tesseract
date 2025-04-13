<script lang="ts">
    import type { Person } from "lemmy-js-client"

    import { createEventDispatcher } from "svelte"
    import { dispatchWindowEvent } from "$lib/ui/events"
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth'
    import { sleep } from "$lib/components/lemmy/post/helpers"
    import { toast } from "$lib/components/ui/toasts/toasts"

    import Avatar                   from "$lib/components/ui/Avatar.svelte"
    import MarkdownEditor           from "$lib/components/markdown/MarkdownEditor.svelte"
    import Button                   from "$lib/components/input/Button.svelte"
    import SettingToggleContainer   from "$lib/components/ui/settings/SettingToggleContainer.svelte"
    import SettingToggle            from "$lib/components/ui/settings/SettingToggle.svelte"
    
    import { Fire, InformationCircle } from "svelte-hero-icons"
    

    export let person: Person
    
    const dispatcher = createEventDispatcher()
    let reason = ''
    let loading = false
    let acknowledged = false

    async function purgeUser() {
        if (!$profile?.user || !$profile?.jwt) return
    
        loading = true
            
        try {
            
            const response = await getClient().banPerson({
                ban: true,
                person_id: person.id,
                remove_data: true,
                reason: reason || undefined,
            })

            
            
            // Dispatch global event so other components can react
            dispatchWindowEvent('banUser', {
                person_id: person.id,
                banned: true,
                remove_content: true
                
            })

            await sleep(2500)
            
            await getClient().purgePerson({
                person_id: person.id,
                reason: reason || undefined
            })
            
            dispatcher('purge')

            toast({
                content: `Successfully purged that user.`,
                type: 'success',
                title: 'Success'
            })
            loading= false

        } catch (err) {
            loading = false
            toast({
                content: err as any,
                type: 'error',
                title: 'Error'
            })
        }
    
    
    }
</script>

<form class="flex flex-col gap-4" on:submit|preventDefault={purgeUser}>
                    
    <div class="flex flex-col gap-4">
        <span class="flex flex-row gap-1 text-xs items-center">
            <Avatar url={person.avatar} alt={person.actor_id} width={24} />
            <span class="font-bold">{person.name}@{new URL(person.actor_id).hostname}</span>
        </span>

        <span class="flex flex-col gap-2 text-sm font-normal">
            <p>
                Purging a user permanently deletes all of their post/comments and marks them as deleted in the database.
            </p>

            <p class="font-bold">Things to Know:</p>
            
            <ul class="list-disc" style="padding:revert;">
                <li>This operation is irreversible.</li>
                
                <li>
                    I have no idea if purging a user removes any media they have uploaded or any thumbnails stored from federated posts. 
                    You should make sure to ban with content removal and double-check that the thumbnails have been removed from pict-rs, caches, etc
                    before purging. Tesseract will issue a ban with removal as part of the purge process, but it is best practice to do this ahead of time
                    to ensure there are no media left behind.
                </li>
            </ul>

            
        </span>

        <SettingToggleContainer>
            <SettingToggle bind:value={acknowledged} icon={InformationCircle} title="Acknowledgement" description="I have read and understand the warnings above."/>
        </SettingToggleContainer>
    </div>


    <MarkdownEditor 
        previewButton ={true}
        bind:value={reason}     
        images={false} 
        emojis={false} 
        rows={3} 
        label="Reason"
        disabled={!acknowledged} 
        placeholder={
            acknowledged 
                ? `Why are you purging ${person.name}@${new URL(person.actor_id).hostname}?` 
                : 'Please acknowledge the warnings to continue.'
        }
    >
        <Button submit color="danger" loading={loading} disabled={loading ||  !acknowledged} icon={Fire} size="lg" slot="actions">
            Purge
        </Button>
    </MarkdownEditor>
</form>