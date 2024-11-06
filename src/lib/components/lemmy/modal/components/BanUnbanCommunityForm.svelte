<script lang="ts">
    import type { Community } from 'lemmy-js-client'
    
    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth'
    import { toast } from '$lib/components/ui/toasts/toasts'
    
    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import DateInput from '$lib/components/input/DateInput.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { Icon, Trash } from 'svelte-hero-icons';
    

    let username = ''
    let expires = ''
    let ban = false
    let banning = false
    let reason = ''
    let remove_data = false

    const dispatcher = createEventDispatcher()

    export let community: Community
    
    async function banUnbanUser() {
        
        if (!$profile?.jwt) return
        
        if (!username) {
            toast({
                content: `Please supply a user to ${ban ? 'ban' : 'unban'}.`,
                type: 'warning',
                title: 'No User Provided'
            })
            return
        }

        // Validate date and format into the expected format for Lemmy's API
        let date: undefined | number = undefined
        if (expires != '') {
            date = Date.parse(expires)
            if (Number.isNaN(date) || date < Date.now()) {
                toast({
                    content: `Date is invalid and/or in the past.`,
                    type: 'warning',
                    title: 'Invalid Date'
                })
                
                return
            }
            date = Math.floor(date / 1000)
        }
        
        // Convert a Lemmyverse link to something that can be resolved
        if (username.startsWith('https://lemmyverse.link')) {
            username = username.replace('https://lemmyverse.link/u/', '@')
        }

        banning = true

        try {
            const res = await getClient().resolveObject({
                q: username,
            })

            if (res.person) {
                const banUserRes = await getClient().banFromCommunity({
                    ban: ban,
                    expires: date || undefined,
                    person_id: res.person.person.id,
                    community_id: community.id,
                    reason: reason,
                    remove_data: remove_data
                })


                toast({
                    content: `${ban ? 'Banned' : 'Unbanned'} ${res.person.person.name}@${new URL(res.person.person.actor_id).hostname}.`,
                    type: 'success',
                    title: 'Success'
                })

                dispatcher('ban')

                username = ''
                reason = ''
                expires = ''
                ban = false
                remove_data = false
            } 
            else {
                toast({
                    content: 'Could not find that user.',
                    type: 'warning',
                    title: 'User Not Found'
                })
            }
        } 
        catch (err) {
            toast({
                content: (err as any) ?? `API returned an error when trying to ${ban ? 'ban' : 'unban'} that user.`,
                type: 'error',
                title: 'Error'
            })
        }

        banning = false
    }
</script>


<div class="flex flex-row gap-2 pt-4 w-full items-end">
    <TextInput bind:value={username} class="w-full" label="User" required placeholder="@user@example.com, https://example.com/u/user, or https://lemmyverse.link/u/user@example.com" />
    <MultiSelect  options={[false, true]} optionNames={['Unban', 'Ban']} bind:selected={ban} />
</div>

<div class="flex flex-col md:flex-row gap-2 w-full">
    <div class="w-full md:w-2/3">
        <TextArea bind:value={reason} rows={3} placeholder="Why are you {ban ? 'banning' : 'unbanning'} this user?" class="w-full" label="Reason"/>
    </div>

    <div class="w-full md:w-1/3">
        {#if ban}
            <div class="flex flex-col gap-2 w-full">    
                <DateInput bind:value={expires} label="Ban Expires?"/> 
                <Checkbox bind:checked={remove_data}>Remove Submissions?</Checkbox>
            </div>
        {/if}
    </div>
</div>

<div class="flex flex-row w-full">
    <Button loading={banning} disabled={banning} color={ban ? 'danger' : 'primary'} size="lg" class="w-full flex-shrink-0" on:click={banUnbanUser}>
        <Icon slot="icon" src={Trash} mini size="16" />
        {ban ? 'Ban' : 'Unban'} User
    </Button>
</div>