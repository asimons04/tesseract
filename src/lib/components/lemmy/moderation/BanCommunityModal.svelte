<script lang="ts">
    import type { Community, Person } from 'lemmy-js-client'

    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import DateInput from '$lib/components/input/DateInput.svelte'
    
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    
    
    import {
        Check,
        NoSymbol
    } from 'svelte-hero-icons'
    import { create } from '@dicebear/initials';


    export let open = false
    export let user: Person
    export let community: Community | undefined = undefined
    export let banned: boolean

    const dispatcher = createEventDispatcher<{banCommunity:boolean}>()

    let reason = ''
    let deleteData = false
    let expires = ''
    let loading = false

    // hack due to svelte's reactive declarations
    const resetReason = () => {
        reason = ''
        deleteData = false
        expires = ''
    }
    $: if (user) resetReason()

    function invalidDateErrorToast() {
        toast({
            content: 'Invalid date. It must be an absolute date greater than the current date.',
            type: 'error',
            title: 'Invaild Date'
        })
    }

    async function submit() {
        if (!user || !community || !$profile?.user || !$profile?.jwt) return
        
        loading = true

        try {
            let date: number | undefined
            // Validate ban expiry date
            if (expires != '') {
                date = Date.parse(expires)
                if (Number.isNaN(date) || date < Date.now()) {
                    invalidDateErrorToast()
                    loading = false
                    return
                }
            }

            
            await getClient().banFromCommunity({
                auth: $profile.jwt,
                ban: !banned,
                community_id: community.id,
                person_id: user.id,
                reason: reason || undefined,
                remove_data: deleteData,
                expires: date ? Math.floor(date / 1000) : undefined,
            })
             
            open = false
            banned = !banned
            
            toast({
                content: `Successfully ${ banned ? 'unbanned' : 'banned'} that user from the community.`,
                type: 'success',
                title: 'Success'
            })
            
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
                title: "Error"
            })
        }
        loading = false
        dispatcher('banCommunity', banned)

    }
</script>

<Modal bind:open title="{banned ? 'Unbanning' : 'Banning'} User From Community" icon={banned ? Check : NoSymbol}>
    
    {#if user && community}
        <form class="flex flex-col gap-4" on:submit|preventDefault={submit}>
            <div class="flex items-center gap-1">
                <Avatar url={user.avatar} alt={user.name} width={24} />
                <span class="font-bold">{user.name}@{new URL(user.actor_id).hostname}</span>
            </div>
            
            <p>
                {banned ? 'Unbanning' : 'Banning'} from
                <span class="font-bold">{community.name}@{new URL(community.actor_id).hostname}</span>
            </p>
                
            <MarkdownEditor required previewButton images={false} label="Reason" rows={6}
                bind:value={reason}
                placeholder="Why are you {banned ? 'unbanning' : 'banning'} {user.name}@{new URL(user.actor_id).hostname} from {community.title ?? community.name}?"
            >
                <div class="flex flex-row flex-wrap w-full items-center justify-between" slot="actions">
                    {#if !banned}
                        <Checkbox bind:checked={deleteData} class="ml-auto mr-4 md:mr-0 md:mx-auto">Remove Content</Checkbox>
                        <DateInput bind:value={expires} class="ml-auto" label="Ban Expires" />
                    {/if}
                </div>
            </MarkdownEditor>

            <Button submit color="primary" {loading} disabled={loading} size="lg">
                Submit
            </Button>
        </form>
    {/if}
</Modal>
