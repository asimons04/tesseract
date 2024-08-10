<script lang="ts">
    import type { Person } from 'lemmy-js-client'
    
    import { createEventDispatcher } from 'svelte';
    import { dispatchWindowEvent } from '$lib/ui/events'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import SettingDateInput from '$lib/components/ui/settings/SettingDateInput.svelte';
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'

    import {
        CalendarDays,
        Check,
        NoSymbol,
        Trash
    } from 'svelte-hero-icons'
    

    export let open = false
    export let user: Person | undefined
    export let banned: boolean
    
    const dispatcher = createEventDispatcher<{ban:boolean}>()

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
        if (!user || !$profile?.user || !$profile?.jwt) return
        
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

            await getClient().banPerson({
                ban: !banned,
                person_id: user.id,
                reason: reason || undefined,
                remove_data: deleteData,
                expires: date ? Math.floor(date / 1000) : undefined,
            })
            
            open = false
            banned = !banned
            
            // Dispatch global event so other components can react
            dispatchWindowEvent('banUser', {
                person_id: user.id,
                banned: banned,
                remove_content: deleteData
            })

            
            toast({
                content: `Successfully ${ banned ? 'banned' : 'unbanned'}  that user.`,
                type: 'success',
                title: 'Success'
            })
            
            
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
        loading = false
        dispatcher('ban', banned)
    }
</script>

<Modal bind:open title="{banned ? 'Unbanning' : 'Banning'} User From Instance" icon={banned ? Check : NoSymbol}  width="max-w-2xl">
    
    {#if user}
        <form class="flex flex-col gap-4" on:submit|preventDefault={submit}>
            <div class="flex items-center gap-1">
                <Avatar url={user.avatar} alt={user.name} width={24} />
                <span class="font-bold">{user.name}@{new URL(user.actor_id).hostname}</span>
            </div>

            <MarkdownEditor required previewButton images={false} rows={6} 
                bind:value={reason} label="Reason"
                placeholder="Why are you { banned ? 'unbanning' : 'banning'} {user.name}@{new URL(user.actor_id).hostname}?"
            >
                <Button submit color="primary" {loading} disabled={loading} size="lg" slot="actions">
                    {banned ? 'Unban' : 'Ban'}
                </Button>
            </MarkdownEditor>

            {#if !banned}
                <SettingToggleContainer>
                    <SettingToggle bind:value={deleteData} icon={Trash} title="Remove Content" description="Remove all of this user's content when banning." />
                    <SettingDateInput bind:value={expires} icon={CalendarDays} title="Ban Expires" description="To effect a temporary ban, enter a date for the ban to expire. Leave blank for a permanent ban." />
                </SettingToggleContainer>
            {/if}
        
            
        </form>
    {/if}
</Modal>
