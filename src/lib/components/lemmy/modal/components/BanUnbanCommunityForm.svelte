<script lang="ts">
    interface BanAllCommunitiesForm {
        person_id: Number,
        ban: Boolean,
        reason: string,
        expiry?: number

    }
    import type { Community, Person } from 'lemmy-js-client'
    
    import { createEventDispatcher } from 'svelte'
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth'
    import { toast } from '$lib/components/ui/toasts/toasts'
    
    import Button from '$lib/components/input/Button.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { CalendarDays, HandRaised, Icon, Trash } from 'svelte-hero-icons';
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte';
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte';
    import SettingDateInput from '$lib/components/ui/settings/SettingDateInput.svelte';
    import { dispatchWindowEvent } from '$lib/ui/events';
    import UserLink from '../../user/UserLink.svelte';
    
    
    export let community: Community | undefined = undefined
    export let user: Person | undefined = undefined


    let formData = {
        username: user ? `@${user.name}@${new URL(user.actor_id).hostname}` : '',
        expires: '',
        ban: false,
        reason: '',
        remove_data: false
    }
    
    let banning = false
    let ban_all_communities = false

    const dispatcher = createEventDispatcher()

    /** Converts a string date into a numeric suitable for passing to the API
     * @param expiry String date (e.g. 2024-12-01)
    */
    function expiryDate(expiry?:string): number | undefined {
        let date: undefined | number = undefined
        if (!expiry || expiry == '') return undefined

        date = Date.parse(expiry)
        if (Number.isNaN(date) || date < Date.now()) {
            return undefined
        }
        date = Math.floor(date / 1000)
        return date
        
    }

    async function banUnbanUser() {
        
        if (!$profile?.jwt || !$profile?.user) return
        
        if (!formData.username) {
            toast({
                content: `Please supply a user to ${formData.ban ? 'ban' : 'unban'}.`,
                type: 'warning',
                title: 'No User Provided'
            })
            return
        }

        // Validate date and format into the expected format for Lemmy's API
        let date = expiryDate(formData.expires)
        if (formData.expires && formData.expires != '' && !date) {
            toast({
                content: `Date is invalid and/or in the past.`,
                type: 'warning',
                title: 'Invalid Date'
            })
            
            return
        }
        
        
        
        // Convert a Lemmyverse link to something that can be resolved
        if (formData.username.startsWith('https://lemmyverse.link')) {
            formData.username = formData.username.replace('https://lemmyverse.link/u/', '@')
        }

        banning = true

        try {
            const res = await getClient().resolveObject({
                q: formData.username,
            })

            if (!res.person) {
                toast({
                    content: 'Could not find that user.',
                    type: 'warning',
                    title: 'User Not Found'
                })

                return
            }
                
            if (ban_all_communities || !community) {
                
                $profile.user.moderates.forEach(async (c) => {
                    await getClient().banFromCommunity({
                        ban: formData.ban,
                        expires: date || undefined,
                        person_id: res.person!.person.id,
                        community_id: c.community.id,
                        reason: formData.reason,
                        remove_data: formData.remove_data
                    })

                    dispatchWindowEvent('banCommunity', {
                        person_id: res.person!.person.id,
                        banned: formData.ban,
                        community_id: c.community.id,
                        remove_content: formData.remove_data

                    })
                })
            }

            else {
                await getClient().banFromCommunity({
                    ban: formData.ban,
                    expires: date || undefined,
                    person_id: res.person.person.id,
                    community_id: community.id,
                    reason: formData.reason,
                    remove_data: formData.remove_data
                })

                dispatchWindowEvent('banCommunity', {
                    person_id: res.person!.person.id,
                    banned: formData.ban,
                    community_id: community.id,
                    remove_content: formData.remove_data

                })
            }


            toast({
                content: (ban_all_communities || !community)
                    ? `${formData.ban ? 'Banned' : 'Unbanned'} ${res.person.person.name}@${new URL(res.person.person.actor_id).hostname} from all moderated communities..`
                    : `${formData.ban ? 'Banned' : 'Unbanned'} ${res.person.person.name}@${new URL(res.person.person.actor_id).hostname} from ${community.name}.`,
                type: 'success',
                title: 'Success'
            })

            dispatcher('ban')

            formData.username = ''
            formData.reason = ''
            formData.expires = ''
            formData.ban = false
            formData.remove_data = false
        } 
        catch (err) {
            toast({
                content: (err as any) ?? `API returned an error when trying to ${formData.ban ? 'ban' : 'unban'} that user.`,
                type: 'error',
                title: 'Error'
            })
        }

        banning = false
    }
</script>

<div class="flex flex-col w-full gap-4">
    <span class="text-base font-bold">
        {formData.ban ? 'Banning' : 'Unbanning'} from {!community || ban_all_communities ? 'All My Communities' : `${community.name}@${new URL(community.actor_id).hostname}`}
    </span>
    
    <div class="flex flex-row gap-2 pt-4 w-full items-end">
        {#if user}
            <UserLink user={user} avatar avatarSize={20} noClick class="my-auto" />
        {:else}
            <TextInput bind:value={formData.username} class="w-full" label="User" required placeholder="@user@example.com, https://example.com/u/user, or https://lemmyverse.link/u/user@example.com" />
        {/if}
        
        <MultiSelect  options={[false, true]} optionNames={['Unban', 'Ban']} bind:selected={formData.ban} />
    </div>

    <TextArea bind:value={formData.reason} rows={3} placeholder="Why are you {formData.ban ? 'banning' : 'unbanning'} this user?" class="w-full" label="Reason"/>


    <SettingToggleContainer>
        <SettingDateInput icon={CalendarDays} bind:value={formData.expires} condition={formData.ban} title="Ban Expires" 
            description="Leave this blank to effect a permanent ban. For a temporary ban, enter a date when the ban should expire."
        />
        <SettingToggle icon={Trash} bind:value={formData.remove_data} condition={formData.ban} title="Remove Submissions" 
            description="Remove user's submissions from {ban_all_communities || !community ? 'all moderated communities' : 'this community'}." 
        />
        
        <!---Only show "Ban all communities" if community is not set--->
        <SettingToggle icon={HandRaised} bind:value={ban_all_communities} condition={community ? true : false} title="{formData.ban ? 'Ban' : 'Unban'} from All" 
            description="{formData.ban ? 'Ban' : 'Unban'} the user from all communities I moderate."
        />
    </SettingToggleContainer>

    
    <Button loading={banning} disabled={banning} color={formData.ban ? 'danger' : 'primary'} size="lg" class="w-full flex-shrink-0" on:click={() => {
            banning = true
            banUnbanUser().then(() => banning = false)
        }}
    >
        <Icon slot="icon" src={Trash} mini size="16" />
        {formData.ban ? 'Ban' : 'Unban'} User {ban_all_communities ? 'From All' : ''}
    </Button>
    
</div>