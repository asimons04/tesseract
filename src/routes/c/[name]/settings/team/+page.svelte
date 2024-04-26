<script lang="ts">
    import type { PageData } from './$types.js'
    
    import { flip } from 'svelte/animate'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import EditableList from '$lib/components/ui/list/EditableList.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    
    import { Icon, Plus, Trash } from 'svelte-hero-icons'
    
    
    export let data: PageData

    let formData = {
        newModerator: '',
        addingModerator: false,
    }

    async function addModerator() {
        if (!$profile?.jwt) return
        
        if (!formData.newModerator) {
            toast({
                content: 'Please supply a user to add as a moderator in the format @username@instance.xyz',
                type: 'warning',
                title: 'No User Provided'
            })
            return
        }
        
        formData.addingModerator = true

        try {
            const res = await getClient().resolveObject({
                auth: $profile.jwt,
                q: formData.newModerator,
            })

            if (res.person) {
                const addModRes = await getClient().addModToCommunity({
                    auth: $profile.jwt,
                    added: true,
                    person_id: res.person.person.id,
                    community_id: data.community.community_view.community.id,
                })

                data.community.moderators = addModRes.moderators

                toast({
                    content: 'Added that user as a moderator.',
                    type: 'success',
                    title: 'Success'
                })

                formData.newModerator = ''
            } 
            else {
                toast({
                    content: 'Could not find that user. Please confirm their username and that it is in @user@instance.xyz format.',
                    type: 'warning',
                    title: 'User Not Found'
                })
            }
        } 
        catch (err) {
            toast({
                content: (err as any) ?? 'API returned an error when trying to add that user as a moderator',
                type: 'error',
                title: 'Error'
            })
        }

        formData.addingModerator = false
    }

    async function removeMod(id: number) {
        if (!$profile?.jwt) return

        try {
            const res = await getClient().addModToCommunity({
                added: false,
                auth: $profile.jwt,
                community_id: data.community.community_view.community.id,
                person_id: id,
            })

            data.community.moderators = res.moderators

            toast({
                content: 'Successfully updated community moderators.',
                type: 'success',
                title: 'Success'
            })
        } 
        catch (err) {
            toast({
                content: (err as any) ?? 'API returned an error when trying to remove that user as a moderator',
                type: 'error',
                title: 'Error'
            })
        }
    }
</script>

<svelte:head>
    <title>Moderator Team</title>
</svelte:head>

<MainContentArea>
    <h1 class="font-bold text-2xl">Moderator Team</h1>
    <EditableList let:action
        on:action={(e) => {
            toast({
                content: `Are you sure you want to remove ${e.detail.name} as a moderator?`,
                action: () => removeMod(e.detail.id),
                title: 'Confirm'
            })
        }}
    >
        {#each data.community.moderators as moderator (moderator.moderator.id)}
            <div class="py-4 flex items-center gap-2 justify-between" animate:flip={{ duration: 300 }} >
                <div class="flex gap-2 items-center">
                    <Avatar width={28} url={moderator.moderator.avatar} alt={moderator.moderator.name} />
                    <div class="flex flex-col gap-0">
                        <UserLink user={moderator.moderator} showInstance={false} />
                        <span class="text-xs text-slate-600 dark:text-zinc-400">
                            {new URL(moderator.moderator.actor_id).hostname}
                        </span>
                    </div>
                </div>
        
                <Button size="square-md" on:click={() => action(moderator.moderator)} icon={Trash} />
            </div>
        {/each}

        <div class="flex flex-row gap-2 pt-4 w-full items-end">
            <TextInput bind:value={formData.newModerator} class="w-full" placeholder="@user@example.com or https://example.com/u/user" label="Add a New Moderator to the Team"/>
            <Button loading={formData.addingModerator} disabled={formData.addingModerator} color="primary" size="md" class="w-max h-8 flex-shrink-0 h-" on:click={addModerator}>
                <Icon slot="icon" src={Plus} mini size="16" />Add moderator
            </Button>
        </div>
    </EditableList>
</MainContentArea>


