<script lang="ts">
    import type { Community, Person, PersonView } from 'lemmy-js-client'

    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import DateInput from '$lib/components/input/DateInput.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import UserItem from '$lib/components/lemmy/user/UserItem.svelte'
    
    import {
        Icon,
        Check,
        NoSymbol
    } from 'svelte-hero-icons'

    let item: Person | undefined

    export let open = false
    export { item as user }
    export let community: Community | undefined = undefined
    export let banned: boolean

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
    $: if (item) resetReason()

    function invalidDateErrorToast() {
        toast({
            content: 'Invalid date. It must be an absolute date greater than the current date.',
            type: 'error',
            title: 'Invaild Date'
        })
    }

    async function submit() {
        if (!item || !$profile?.user || !$profile?.jwt) return
        
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

            if (community) {
                await getClient().banFromCommunity({
                    auth: $profile.jwt,
                    ban: !banned,
                    community_id: community.id,
                    person_id: item.id,
                    reason: reason || undefined,
                    remove_data: deleteData,
                    expires: date ? Math.floor(date / 1000) : undefined,
                })
            } else {
                await getClient().banPerson({
                    auth: $profile.jwt,
                    ban: !banned,
                    person_id: item.id,
                    reason: reason || undefined,
                    remove_data: deleteData,
                    expires: date ? Math.floor(date / 1000) : undefined,
                })
            }
            open = false
            toast({
                content: `Successfully 
                    ${ banned ? 'unbanned' : 'banned'} 
                    that user. You may need to refresh to see changes.
                `,
                type: 'success',
                title: 'Success'
            })
            //item.banned = !banned
            banned = !banned
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
        loading = false
    }
</script>

<Modal bind:open title="{banned ? 'Unbanning' : 'Banning'} User" icon={banned ? Check : NoSymbol}>
    
    {#if item}
        <form class="flex flex-col gap-4" on:submit|preventDefault={submit}>
            <div class="flex items-center gap-1">
                <Avatar url={item.avatar} alt={item.name} width={24} />
                <span class="font-bold">{item.name}</span>
            </div>
            <p>
                {banned ? 'Unbanning' : 'Banning'} from
                <span class="font-bold">{community ? community.name : 'site'}</span>
            </p>

            <TextArea required bind:value={reason} label="Reason"
                placeholder="Why are you {banned
                    ? 'unbanning'
                    : 'banning'} {item.name}?"
            />

            {#if !banned}
                <Checkbox bind:checked={deleteData}>Delete data</Checkbox>
                <DateInput
                    bind:value={expires}
                    label="Ban Expires (Leave blank for permanent ban)"
                />
            {/if}
        
            <Button submit color="primary" {loading} disabled={loading} size="lg">
                Submit
            </Button>
        </form>
    {/if}
</Modal>
