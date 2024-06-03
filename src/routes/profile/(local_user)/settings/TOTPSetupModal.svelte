<script lang="ts">
    import Button from "$lib/components/input/Button.svelte";
    import Modal from "$lib/components/ui/modal/Modal.svelte";
    import Spinner from "$lib/components/ui/loader/Spinner.svelte";
    import TextInput from "$lib/components/input/TextInput.svelte";

    import { getClient, parseAPIError } from "$lib/lemmy";
    import { profile } from "$lib/auth";
    import { site } from '$lib/lemmy'
    import { toast } from "$lib/components/ui/toasts/toasts";
    
    import QRCode from 'qrcode'

    import { DevicePhoneMobile } from "svelte-hero-icons";    
    
    export let open:boolean = false
    export let totp_enabled: boolean
    
    let loading = false
    let totpSecret:string
    let totpToken: string
    let QRCodeURL: string

    $:  if ($profile?.jwt && !totp_enabled && !totpSecret && !QRCodeURL && !loading) {
            
            loading = true    
            
            getClient().generateTotpSecret().then( (response) => {
                totpSecret = response?.totp_secret_url
                
                QRCode.toDataURL(totpSecret).then((url:string) => {
                    QRCodeURL = url
                })
                
                loading = false
            })
        }

    

    function close() {
        totpSecret = ''
        QRCodeURL = ''
        totpToken = ''
        open = false
    }

    async function updateTotp(enabled:boolean) {
        if (!totpToken) return
        loading = true
        
        try {
            const result = await getClient().updateTotp({
                enabled: enabled,
                totp_token: totpToken
            })
            
            totpToken = ''
            totp_enabled = result.enabled
            
            toast({
                type: 'success',
                title: `2FA ${enabled ? 'Enabled' : 'Disabled'}`,
                content: `Two-factor authentication has been successfully ${enabled ? 'enabled' : 'disabled'} on your account`
            })
            
            close()

        }
        catch (err) {
            toast({
                type: 'error',
                title: 'Error',
                content: `API call failed when ${enabled ? 'enabling' : 'disabling'} TOTP: ${parseAPIError(err)}`
            })
        }
        finally {
            loading = false
        }
    }

</script>


<Modal bind:open icon={DevicePhoneMobile} title="{totp_enabled ? 'Disable' : 'Enable'} Two-Factor Authentication" width="max-w-4xl" on:close={()=> close() } >
    
    {#if $site && $profile?.jwt}
        <!---Enable TOTP if not enabled--->
        {#if !totp_enabled && QRCodeURL}
            <form class="flex flex-col gap-4" autocomplete="off" on:submit|preventDefault={async () => updateTotp(true)}>
                
                <div class="flex flex-col lg:flex-row w-full gap-4">
                    
                    <!---Left Column--->
                    <div class="flex flex-col w-full gap-2 items-center">
                        
                        <!---QR Code--->
                        <span class="flex flex-col gap-2 w-fit mx-auto items-center">
                            <img src="{QRCodeURL}" class="aspect-square flex w-48 h-48" alt="QR Code for TOTP Secret">
                            
                            <Button color="primary" size="lg" class="w-full" on:click={() => { 
                                    navigator.clipboard.writeText(totpSecret)
                                    toast({
                                        type: 'success',
                                        title: 'Copied',
                                        content: 'TOTP secret copied to clipboard.'
                                    })
                                }}
                            >
                                Copy TOTP Secret
                            </Button>
                        </span>
                        
                    </div>

                    <!---RightColumn--->
                    <div class="flex flex-col gap-2">
                        <span class="font-normal text-sm">
                            Scan the QR code into your authenticator app or copy the TOTP secret and load it in manually.  Once your TOTP
                            secret has been loaded into your authenticator, generate a valid code and enter it below to enable 2FA on your account.
                        </span>

                        <span class="font-normal text-sm">
                            Each time you load this modal, a new TOTP secret will be generated. If you add the secret to your app but do not complete
                            the enrollment, you will need to remove the old secret from your auth app before trying again.
                        </span>

                        <TextInput label="Enter TOTP Code From Authenticator App" autocomplete="one-time-code" type="number" class="mt-auto"
                            bind:value={totpToken} 
                            on:input={(e) => {
                                totpToken = totpToken.length > 6
                                    ? totpToken.slice(0,6)
                                    : totpToken
                            }}
                        />
                    </div>
                </div>


                <div class="flex flex-row justify-between mt-4">
                    <Button color="danger" size="lg" on:click={() => close() }>Cancel</Button>
                    <Button color="primary" size="lg" loading={loading} submit>Enroll</Button>
                </div>
            </form>
        {/if}

        <!--- Disable TOTP if Already Enabled--->
        {#if totp_enabled}
            <form class="flex flex-col gap-4" autocomplete="off" on:submit|preventDefault={async () => updateTotp(false)}>
                
                <div class="flex flex-col gap-2">
                    <span class="font-normal text-sm">
                        To disable 2FA on your account, you will need to provide a current TOTP token.  Please enter that below
                        to proceed.
                    </span>

                    <span class="font-normal text-sm">
                        If you have lost your authentication device/secret, you will need to contact your instance administrators for
                        assistance.
                    </span>

                    <TextInput label="Enter TOTP Code From Authenticator App" autocomplete="one-time-code" type="number" class="mt-4"
                        bind:value={totpToken} 
                        on:input={(e) => {
                            totpToken = totpToken.length > 6
                                ? totpToken.slice(0,6)
                                : totpToken
                        }}
                    />
                </div>

                <div class="flex flex-row justify-between mt-4">
                    <Button color="danger" size="lg" on:click={() => close() }>Cancel</Button>
                    <Button color="primary" size="lg" loading={loading} submit>Submit</Button>
                </div>
            </form>
        {/if}
    {:else}
        <div class="flex mx-auto my-auto">    
            <Spinner width={48}/>
        </div>
    {/if}
</Modal>

