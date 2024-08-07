<script lang="ts">
    

    import Button from "$lib/components/input/Button.svelte"
    import Card from "$lib/components/ui/Card.svelte";
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import TextInput from "$lib/components/input/TextInput.svelte"
    import SettingToggleContainer from "$lib/components/ui/settings/SettingToggleContainer.svelte"
    import SettingToggle from "$lib/components/ui/settings/SettingToggle.svelte"
    
    import { getClient } from "$lib/lemmy"
    import { goto } from "$app/navigation"
    import { profile, profileData, setUserID } from "$lib/auth"
    import { toast } from "$lib/components/ui/toasts/toasts"
    import { Icon, ExclamationTriangle, Trash, XCircle } from "svelte-hero-icons"

    export let open:boolean = false

    let password = ''
    let delete_content = false

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
                password: password,
                delete_content: delete_content,
            })

            // Remove Profile
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



<Modal bind:open title="Delete Account" icon={Trash} width="max-w-2xl" >
    <div class="flex flex-col gap-4">
        <Card cardColor="warning">
            <div class="flex flex-row gap-2 items-center p-2">
                <span>
                    <Icon src={ExclamationTriangle} mini width={24}/>
                </span>
                <span class="font-normal text-sm">
                    <span class="font-bold">Warning</span>: 
                    Deleting your account is irreversible. If you are sure you want to do this, enter your password below.
                </span>
            </div>
        </Card>
        
        
        <SettingToggleContainer>
            <SettingToggle bind:value={delete_content} icon={Trash} title="Delete Content"
                description="Set this option to delete your submissions along with your account. Leave it off to let your content remain for posterity"
            />
        </SettingToggleContainer>
        
        <TextInput label="Password" type="password" bind:value={password} />
    </div>

    <div class="flex flex-row justify-between w-full" slot="buttons">
        <Button color="primary" icon={XCircle} iconSize={20} size="lg" on:click={() => open=false}>Cancel</Button>
        <Button color="danger" icon={Trash} iconSize={20} size="lg" on:click={() => deleteAccount()}>Delete</Button>
    </div>
</Modal>