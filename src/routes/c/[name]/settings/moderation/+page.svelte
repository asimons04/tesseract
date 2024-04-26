<script lang="ts">
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth'
    import { toast } from '$lib/components/ui/toasts/toasts'
    
    import Button from '$lib/components/input/Button.svelte';
    import Checkbox from '$lib/components/input/Checkbox.svelte';
    import DateInput from '$lib/components/input/DateInput.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import MultiSelect from '$lib/components/input/MultiSelect.svelte';
    import Setting from '$routes/settings/Setting.svelte';
    import TextArea from '$lib/components/input/TextArea.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte';

    import { 
        Icon,
        Trash
    } from 'svelte-hero-icons'
    
    

    export let data
    
    let formData = {
        user: '',
        ban: false,
        expires: '',
        reason: '',
        remove_data: false,
        banning: false
    }

    async function banUnbanUser() {
        
        if (!$profile?.jwt) return
        
        if (!formData.user) {
            toast({
                content: `Please supply a user to ${formData.ban ? 'ban' : 'unban'}.`,
                type: 'warning',
                title: 'No User Provided'
            })
            return
        }

        let date: undefined | number = undefined
        
        if (formData.expires != '') {
            date = Date.parse(formData.expires)
            if (Number.isNaN(date) || date < Date.now()) {
                toast({
                    content: `Date is invalid and/or in the past.`,
                    type: 'warning',
                    title: 'Invalid Date'
                })
                
                return
            }
        }
        
        // Convert a Lemmyverse link to something that can be resolved
        if (formData.user.startsWith('https://lemmyverse.link')) {
            formData.user = formData.user.replace('https://lemmyverse.link/u/', '@')
        }

        formData.banning = true

        try {
            const res = await getClient().resolveObject({
                auth: $profile.jwt,
                q: formData.user,
            })

            if (res.person) {
                const banUserRes = await getClient().banFromCommunity({
                    auth: $profile.jwt,
                    ban: formData.ban,
                    expires: date ? Math.floor(date / 1000) : undefined,
                    person_id: res.person.person.id,
                    community_id: data.community.community_view.community.id,
                    reason: formData.reason,
                    remove_data: formData.remove_data
                })


                toast({
                    content: `${formData.ban ? 'Banned' : 'Unbanned'} ${res.person.person.name}@${new URL(res.person.person.actor_id).hostname}.`,
                    type: 'success',
                    title: 'Success'
                })

                formData.user = ''
                formData.reason = ''
                formData.expires = ''
                formData.ban = false
                formData.remove_data = false
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
                content: (err as any) ?? `API returned an error when trying to ${formData.ban ? 'ban' : 'unban'} that user.`,
                type: 'error',
                title: 'Error'
            })
        }

        formData.banning = false
    }

</script>

<svelte:head>
    <title>Community Moderation</title>
</svelte:head>


<MainContentArea>
    <h1 class="font-bold text-2xl">Moderation</h1>
    
    <Setting>
        <span slot="title">Ban/Unban a User</span>
        <span slot="description">
            Use this form to directly ban or unban a user from this community. Direct bans can be useful if there is a known troll 
            posting elsewhere and you want to prevent them from hitting your community. You can also quickly unban a user without having
            to find them in the modlog or locate a submission to find the relevant action button.
        </span>

        <div class="flex flex-row gap-2 pt-4 w-full items-end">
            <TextInput bind:value={formData.user} class="w-full" label="User" required placeholder="@user@example.com or https://example.com/u/user" />
            <MultiSelect  options={[false, true]} optionNames={['Unban', 'Ban']} bind:selected={formData.ban} />
        </div>

        <div class="flex flex-col md:flex-row gap-2 w-full">
            <div class="w-full md:w-2/3">
                <TextArea bind:value={formData.reason} rows={3} placeholder="Why are you {formData.ban ? 'banning' : 'unbanning'} this user?" class="w-full" label="Reason"/>
            </div>

            <div class="w-full md:w-1/3">
                {#if formData.ban}
                    <div class="flex flex-col gap-2 w-full">    
                        <DateInput bind:value={formData.expires} label="Ban Expires?"/> 
                        <Checkbox bind:checked={formData.remove_data}>Remove Data?</Checkbox>
                    </div>
                {/if}
            </div>
        </div>

        <div class="flex flex-row w-full">
            <Button loading={formData.banning} disabled={formData.banning} color="primary" size="lg" class="w-full flex-shrink-0" on:click={banUnbanUser}>
                <Icon slot="icon" src={Trash} mini size="16" />
                {formData.ban ? 'Ban' : 'Unban'} User
            </Button>
        </div>
    </Setting>
</MainContentArea>