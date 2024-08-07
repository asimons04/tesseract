<script lang="ts">
    import Button from "$lib/components/input/Button.svelte";
    import Card from "$lib/components/ui/Card.svelte";
    import Modal from "$lib/components/ui/modal/Modal.svelte";
    import TextInput from "$lib/components/input/TextInput.svelte";

    import { getClient } from "$lib/lemmy";
    import { profile, saveProfileToProfileData } from "$lib/auth";
    import { toast } from "$lib/components/ui/toasts/toasts";

    import { Icon, ExclamationTriangle, Key, XCircle } from "svelte-hero-icons";    
    
    export let open:boolean = false

    let oldPassword: string
    let newPassword: string
    let newPassword2: string
    let changingPassword = false

    async function changePassword() {
        if (!$profile?.jwt) return
        
        if (!oldPassword || !newPassword || !newPassword2) {
            toast({
                type: 'error',
                title: 'Validation Error',
                content: 'Password cannot be blank'
            })
            return
        }

        if (newPassword != newPassword2) {
            toast({
                type: 'error',
                title: 'Validation Error',
                content: 'New passwords do not match.'
            })
            return
        }

        if (newPassword.length < 10) {
            toast({
                type: 'error',
                title: 'Validation Error',
                content: 'New password must be at least ten characters.'
            })
            return
        }

        changingPassword = true
        try {
            const result = await getClient().changePassword({
                old_password: oldPassword,
                new_password: newPassword,
                new_password_verify: newPassword2,
            })

            
            if (result?.jwt) {
                $profile.jwt = result.jwt
                saveProfileToProfileData()

                toast({
                    type: 'success',
                    title: 'Success',
                    content:' Password successfully changed.'
                })
                changingPassword = false
                close()
            }
            else {
                throw new Error('New JWT was not returned from API');
            }
        }
        catch (err) {
            toast({
                type: 'error',
                title: 'Error',
                content:` Password was not changed. Reason: ${err}`
            })
            changingPassword = false
        }

    }

    function close() {
        oldPassword = ''
        newPassword = ''
        newPassword2 = ''
        open = false
    }   
</script>


<Modal bind:open icon={Key} title="Change Password" width="max-w-2xl" on:close={() => close()}>
    <form class="flex flex-col gap-4" autocomplete="off">
        
        <Card cardColor="warning">
            <div class="flex flex-row gap-2 items-center p-2">
                <span>
                    <Icon src={ExclamationTriangle} mini width={24}/>
                </span>
                <span class="font-normal text-sm">
                    Note that changing your password will log you out of any other active sessions. This session will be updated automatically, but 
                    you will need to login again on any other devices/sessions.
                </span>
            </div>
        </Card>

        <TextInput label="Old Password" autocomplete="current-password" type="password" bind:value={oldPassword} />
        <TextInput label="New Password" autocomplete="new-password"type="password" bind:value={newPassword} />
        <TextInput label="Confirm New Password" autocomplete="new-password" type="password" bind:value={newPassword2} />
    </form>

    <div class="flex flex-row justify-between w-full" slot="buttons">
        <Button color="danger" size="lg" icon={XCircle} iconSize={20} on:click={() => open=false}>Cancel</Button>
        
        <Button color="primary" size="lg" icon={Key} iconSize={20} loading={changingPassword} on:click={async () => await changePassword()}>Submit</Button>
    </div>
</Modal>

