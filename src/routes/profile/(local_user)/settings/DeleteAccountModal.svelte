<script lang="ts">
    

    import Button from "$lib/components/input/Button.svelte"
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import TextInput from "$lib/components/input/TextInput.svelte"

    import { getClient } from "$lib/lemmy"
    import { goto } from "$app/navigation"
    import { profile, profileData, setUserID } from "$lib/auth"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { Trash } from "svelte-hero-icons"

    export let open:boolean = false

    let password = ''

    async function deleteAccount() {
        if (!$profile?.jwt) return

        if (!(password || null)) {
            toast({
                content: 'You must provide your password.',
                type: 'error',
                title: 'Error'
            })
            return
        }

        open = false

        toast({
            content: 'Please wait while you account is deleted...',
            loading: true,
            title: "Deletion in Progress",
        })

        try {
            const { jwt } = $profile

            await getClient().deleteAccount({
                auth: jwt,
                password: password,
                //delete_content: deletion.delete_content,
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
                type: 'success',
                title: 'Deletion Complete'
            })

            goto('/')

        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
                title: 'Error'
            })
        }
    }
</script>



<Modal bind:open title="Delete Account" icon={Trash} >
    <div class="flex flex-col gap-4">
        
        <span class="font-normal text-base">
            <span class="font-bold">Warning</span>: Deleting your account is irreversible. If you are sure you want to do this, enter your
            password below. 
            <!---If you want to leave your content visible for posterity, leave the "delete content" checkbox empty.--->
        </span>
        
        <!---<Checkbox bind:checked={deletion.delete_content}>Delete Content</Checkbox>--->
        <TextInput label="Password" type="password" bind:value={password} />

        <div class="flex flex-row justify-between mt-4">
            <Button color="primary" size="lg" on:click={() => open=false}>Cancel</Button>
            <Button color="danger" size="lg" on:click={() => deleteAccount()}>Delete Account</Button>
        </div>
    </div>
</Modal>