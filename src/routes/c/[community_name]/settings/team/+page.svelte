<script lang="ts">
    import { flip } from 'svelte/animate'
    import { isAdmin, isTopMod } from '$lib/components/lemmy/moderation/moderation.js'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { refreshProfile } from '$lib/lemmy/user.js';
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar           from '$lib/components/ui/Avatar.svelte'
    import Button           from '$lib/components/input/Button.svelte'
    import Card             from '$lib/components/ui/Card.svelte'
    import MainContentArea  from '$lib/components/ui/containers/MainContentArea.svelte'
    import Modal            from '$lib/components/ui/modal/Modal.svelte';
    import TextInput        from '$lib/components/input/TextInput.svelte'
    import UserLink         from '$lib/components/lemmy/user/UserLink.svelte'
    
    import { Icon, ArrowsRightLeft, Plus, ShieldCheck, Trash, XCircle } from 'svelte-hero-icons'
    
    export let data

    let formData = {
        newModerator: '',
        addingModerator: false,
    }

    let modals = {
        transfer: {
            open: false,
            personID: -1
        },
        removeMod: {
            open: false,
            personID: -1
        }
    }

    let isAdminOrTopMod = false
    $: isAdminOrTopMod = isAdmin($profile?.user) || isTopMod($profile?.user, data.community)

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

                // If you add yourself (e.g. if you're an admin), refresh you profile to reflect that
                if ($profile.user?.local_user_view.person.id == res.person.person.id) {
                    await refreshProfile()
                }
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

            // If you add yourself (e.g. if you're an admin), refresh you profile to reflect that
            if ($profile.user?.local_user_view.person.id == id) {
                await refreshProfile()
            }
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
        catch (err) {
            toast({
                type: 'error',
                title: 'Error',
                content: err as any
            })
        }
    }

    
</script>

<svelte:head>
    <title>Moderator Team</title>
</svelte:head>

<!---Remove Mod Confirmation Modal--->
<Modal bind:open={modals.removeMod.open} title="Confirm Remove Mod" width="max-w-md" on:close={() => modals.removeMod.open = false}>
    <p class="text-sm">
        Are you sure you want to remove this member from the mod team?
    </p>

    <div class="flex flex-row justify-between w-full" slot="buttons">
        <Button color="primary" size="lg" icon={XCircle} on:click={() => {
                modals.removeMod.open = false
                modals.removeMod.personID = -1
            }}
        >
            Cancel
        </Button>

        <Button color="danger" size="lg" icon={Trash} on:click={() => {
                removeMod(modals.removeMod.personID)
                modals.removeMod.personID = -1
                modals.removeMod.open = false
                toast({
                    type: 'success',
                    content: 'Successfully removed that member from the mod team.',
                    title: 'Confirmation'
                })
            }}
        >
            Remove
        </Button>
    </div>
</Modal>

<!---Transfer Community Confirmation Modal--->
<Modal bind:open={modals.transfer.open} title="Confirm Transfer Community" width="max-w-md" on:close={() => modals.transfer.open = false}>
    <p class="text-sm">
        Are you sure you want to transfer the community to this moderator?
    </p>
    {#if !isAdmin($profile?.user) }
        <p class="text-sm mt-2">        
            Once you transfer the community, you will not be able to transfer it back
            without help from an admin or the new "top mod" transferring it back
            to you.
        </p>
    {/if}
    

    <div class="flex flex-row justify-between w-full" slot="buttons">
        <Button color="primary" size="lg" icon={XCircle} on:click={() => {
                modals.transfer.open = false
                modals.transfer.personID = -1
            }}
        >
            Cancel
        </Button>

        <Button color="info" size="lg" icon={ArrowsRightLeft} on:click={() => {
                transferCommunity(modals.transfer.personID)
                modals.transfer.personID = -1
                modals.transfer.open = false
                toast({
                    type: 'success',
                    content: 'Successfully transferred the community to that user.',
                    title: 'Confirmation'
                })
            }}
        >
            Transfer
        </Button>
    </div>
</Modal>


<MainContentArea class="gap-2">
    <h1 class="font-bold text-2xl">Moderator Team</h1>
    
    <p class="font-normal text-sm">
        Add or remove members of the moderation team.  The "top mod" is indicated with a green shield and is considered the owner of the community.
        {#if isAdminOrTopMod}
            To assign someone else as the top mod, use the transfer community button on their entry.
        {/if}
    </p>


    <Card class="p-2">
        <div class="divide-y divide-slate-200 dark:divide-zinc-500 flex flex-col">
            {#each data.community.moderators as moderator, i (moderator.moderator.id)}
                <div class="py-4 flex items-center gap-2 justify-between" animate:flip={{ duration: 300 }} >
                    <div class="flex gap-2 w-full items-center">
                        <Avatar width={28} url={moderator.moderator.avatar} alt={moderator.moderator.name} />
                        <div class="flex flex-col gap-0 w-[calc(100%-30px-0.5rem)]">

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
                        <!---Transfer Community Button--->
                        {#if isAdminOrTopMod}
                            <Button size="square-md" title="Transfer Community" icon={ArrowsRightLeft} disabled={i == 0}
                                on:click={() => {
                                    modals.transfer.personID = moderator.moderator.id
                                    modals.transfer.open = true
                                }}
                            
                            />
                        {/if}
                        
                        <!---Remove Mod Button--->
                        <Button size="square-md" title="Remove as Moderator" icon={Trash} on:click={() => {
                                modals.removeMod.personID = moderator.moderator.id
                                modals.removeMod.open = true
                            }} 
                        />
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


