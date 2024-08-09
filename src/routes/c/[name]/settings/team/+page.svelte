<script lang="ts">
    import type { PageData } from './$types.js'
    
    import { flip } from 'svelte/animate'
    import { isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    
    import { Icon, Plus, ShieldCheck, Trash } from 'svelte-hero-icons'
    
    
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
                q: formData.newModerator,
            })

            if (res.person) {
                const addModRes = await getClient().addModToCommunity({
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


    async function transferCommunity(personID: number) {
        if (!$profile?.jwt) return
        try {
            const res = await getClient().transferCommunity({
                community_id: data.community.community_view.community.id,
                person_id: personID
            })

            data.community.moderators = res.moderators
        }
        catch {

        }

    }
</script>

<svelte:head>
    <title>Moderator Team</title>
</svelte:head>

<MainContentArea>
    <h1 class="font-bold text-2xl">Moderator Team</h1>
    
    <p class="font-normal text-sm">
        Add or remove members of the moderation team.  The "top mod" is indicated with a green shield and is considered the owner of the community.
        {#if isAdmin($profile?.user)}
            To assign someone else as the top mod, use the transfer community button on their entry.
        {/if}
    </p>


    <Card class="p-2">
        <div class="divide-y divide-slate-200 dark:divide-zinc-500 flex flex-col">
            {#each data.community.moderators as moderator, i (moderator.moderator.id)}
                <div class="py-4 flex items-center gap-2 justify-between" animate:flip={{ duration: 300 }} >
                    <div class="flex gap-2 items-center">
                        <Avatar width={28} url={moderator.moderator.avatar} alt={moderator.moderator.name} />
                        <div class="flex flex-col gap-0">

                            <div class="flex flex-row items-center">
                                <UserLink user={moderator.moderator} showInstance={false} />
                                <!--- Badge "top mod" which I am just now realizing is a thing--->
                                {#if i == 0 }
                                    <span class="text-green-500">
                                        <Icon src={ShieldCheck} size="16" mini />
                                    </span>
                                {/if}
                            </div>

                            <span class="text-xs text-slate-600 dark:text-zinc-400">
                                {new URL(moderator.moderator.actor_id).hostname}
                            </span>
                        </div>
                    </div>
            
                    <div class="flex flex-row gap-2">
                        {#if isAdmin($profile?.user)}
                            <Button size="square-md" title="Transfer Community" on:click={() => transferCommunity(moderator.moderator.id)} icon={ShieldCheck} disabled={i == 0}/>
                        {/if}
                        <Button size="square-md" title="Remove as Moderator" on:click={() => removeMod(moderator.moderator.id)} icon={Trash} />
                    </div>
                </div>
            {/each}
            
            <!---Input Form to Add New Moderator--->
            <div class="flex flex-row gap-2 pt-4 w-full items-end">
                <TextInput bind:value={formData.newModerator} class="w-full" placeholder="@user@example.com or https://example.com/u/user" label="Add a New Moderator to the Team"
                    on:keydown={(e) => {
                        if (e.detail.key == 'Enter') {
                            addModerator()
                        }
                    }}
                />
                
                <Button loading={formData.addingModerator} disabled={formData.addingModerator} color="primary" size="md" class="w-max h-8 flex-shrink-0 h-" on:click={addModerator}>
                    <Icon slot="icon" src={Plus} mini size="16" />Add moderator
                </Button>
            </div>

            
        </div>
    </Card>
</MainContentArea>


