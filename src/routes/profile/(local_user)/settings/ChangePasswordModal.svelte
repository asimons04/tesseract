<script lang="ts">
    import Button from "$lib/components/input/Button.svelte";
    import Modal from "$lib/components/ui/modal/Modal.svelte";
    import TextInput from "$lib/components/input/TextInput.svelte";
    
    

    
    import { getClient } from "$lib/lemmy";
    import { instance } from "$lib/instance";
    import { profile, setUser } from "$lib/auth";
    import { toast } from "$lib/components/ui/toasts/toasts";

    import { Key } from "svelte-hero-icons";    
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
                auth: $profile.jwt
            })

            
            if (result?.jwt) {
                setUser(result.jwt, $instance)
                toast({
                    type: 'success',
                    title: 'Success',
                    content:' Password successfully changed.'
                })
                changingPassword = false
                open = false
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
</script>


<Modal bind:open icon={Key} title="Change Password">
    <form class="flex flex-col gap-4" autocomplete="off">

        <TextInput label="Old Password" autocomplete="new-password" type="password" bind:value={oldPassword} />
        <TextInput label="New Password" autocomplete="new-password"type="password" bind:value={newPassword} />
        <TextInput label="Confirm New Password" autocomplete="new-password" type="password" bind:value={newPassword2} />

        <div class="flex flex-row justify-between mt-4">
            <Button color="primary" size="lg" on:click={() => open=false}>Cancel</Button>
            <Button color="primary" size="lg" loading={changingPassword} on:click={async () => await changePassword()}>Change Password</Button>
        </div>
    </form>
</Modal>

