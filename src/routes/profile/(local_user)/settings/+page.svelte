<script lang="ts">
    import type { SaveUserSettings } from 'lemmy-js-client'

    import { getClient, uploadImage } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { profile, profileData, setUserID } from '$lib/auth.js'
    import { removeToast, toast } from '$lib/components/ui/toasts/toasts.js'

    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { Icon, Trash } from 'svelte-hero-icons'

    export let data

    let formData: Omit<SaveUserSettings, 'auth'> | undefined = {
        ...data.local_user_view?.local_user,
        ...data.local_user_view?.person,
    }

    let profileImage: FileList | undefined

    async function save() {
        if (!formData || !$profile?.jwt) return

        loading = true

        try {
            let pfp = profileImage ? await uploadImage(profileImage[0]) : undefined
            const res = await getClient().saveUserSettings({
                auth: $profile.jwt,
                ...formData,
                avatar: pfp,
            })

            toast({
                content: 'Saved your user settings.',
                type: 'success',
            })
    
            if (res.verify_email_sent) {
                toast({
                    content: 'A verification email was sent.',
                    type: 'info',
                })
            }
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        loading = false
    }

    let deletion = {
        modal: false,
        password: '',
    }

    async function deleteAccount(level: number) {
        if (!$profile?.jwt) return

        switch (level) {
            case 0: {
                toast({
                    type: "warning",
                    content: 'Are you sure you want to delete your account?',
                    action: () => deleteAccount(1),
                })
                return
            }

            case 1: {
                toast({
                    type: "warning",
                    content: 'Are you really sure?',
                    action: () => deleteAccount(2),
                })
                return
            }
    
            case 2: {
                toast({
                    type: "warning",
                    content: 'Final warning. Are you reeeeeeally sure?',
                    action: () => deleteAccount(3),
                })
                return
            }

            case 3: {
                deletion.modal = true
                deletion.password = ''
                return
            }
        }

        if (!(deletion.password || null)) {
            toast({
                content: 'You must provide your password.',
                type: 'warning',
            })
        }

        const id = toast({
            content: 'You did this. Deleting account...',
            loading: true,
        })

        try {
            const { jwt } = $profile

            await getClient().deleteAccount({
                auth: jwt,
                password: deletion.password,
            })

            profileData.update((pd) => {
                pd.profiles.splice(
                    pd.profiles.findIndex((p) => pd.profile == p.id),1
                )

                return pd
            })

            setUserID(-1)
            toast({
                content: 'Your account was deleted.',
            })

            goto('/')
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        } finally {
            removeToast(id)
        }
    }

    let loading = false
</script>

{#if deletion.modal}
    <Modal bind:open={deletion.modal} title="Delete Account" icon={Trash} action="Submit" on:action={() => deleteAccount(4)} >
        <TextInput label="Password" type="password" bind:value={deletion.password} />
    </Modal>
{/if}


<form class="flex flex-col gap-4 h-full" on:submit|preventDefault={save}>
    <h1 class="flex flex-row justify-between">
        <span class="font-bold text-2xl">User settings</span>
        <Button
            submit
            size="lg"
            color="primary"
            class="mt-auto"
            {loading}
            disabled={loading}
        >
            Save
        </Button>
    </h1>
    {#if data.local_user_view?.local_user && formData}
        <div class="flexrow">
            <div class="flexcol flexcol-66">
                <TextInput
                    label="Display name"
                    bind:value={formData.display_name}
                    placeholder="Optional"
                />
                <TextInput label="Email" bind:value={formData.email} />
                
                <TextInput
                    label="Matrix User"
                    bind:value={formData.matrix_user_id}
                    placeholder="@user:example.com"
                />
            </div>

            <div class="flexcol flexcol-33">
                <FileInput class="h-full" label="Profile image" image bind:files={profileImage} />
            </div>
        </div>
        
        <div class="flexrow">
            <div class="flexcol flexcol-66">
                <MarkdownEditor
                    images={false}
                    bind:value={formData.bio}
                    label="Bio"
                    rows={10}
                    previewButton
                />
            </div>
            <div class="flexcol flexcol-33">
                <div class="mt-2">
                    <Checkbox bind:checked={formData.show_nsfw}>Show NSFW content</Checkbox>
                    <Checkbox bind:checked={formData.show_scores}>Show Scores</Checkbox>
                    <Checkbox bind:checked={formData.bot_account}>Bot Account</Checkbox>
                    <Checkbox bind:checked={formData.show_bot_accounts}>Show Bot Accounts</Checkbox>
                    <Checkbox bind:checked={formData.show_read_posts}>Show Read Posts</Checkbox>
                </div>

            </div>
        </div>
        
        

        
    {:else}
        <Card cardColor="warning" class="p-5">
            The API didn't return your user settings.
        </Card>
    {/if}
    <Button
        on:click={() => deleteAccount(0)}
        color="danger"
        size="lg"
        class="ml-auto"
    >
        Delete account
    </Button>
</form>
