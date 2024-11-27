<script lang="ts">
    import type { MyUserInfo, SaveUserSettings } from 'lemmy-js-client'
    
    import { getClient } from '$lib/lemmy.js'
    import { onMount } from 'svelte';
    import { profile, saveProfileToProfileData } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import ChangePasswordModal from './ChangePasswordModal.svelte'
    import DeleteAccountModal from './DeleteAccountModal.svelte';
    import FileInput from '$lib/components/input/FileInput.svelte'
    import Link from '$lib/components/input/Link.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte';
    import ProfileMenuBar from '$routes/profile/ProfileMenuBar.svelte';
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte';
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte';
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'
    import TotpSetupModal from './TOTPSetupModal.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte';

    import { 
        ArrowDownTray,
        DevicePhoneMobile,
        Envelope, 
        EnvelopeOpen, 
        ExclamationTriangle, 
        FaceFrown, 
        Icon, 
        Key, 
        Sparkles, 
        Trash

    } from 'svelte-hero-icons'
    
    
    export let description = true    
    
    let data: MyUserInfo | undefined = undefined
    let formData: SaveUserSettings | undefined = undefined
    let profileImage: FileList | undefined
    let bannerImage: FileList | undefined
    let saving = false
    let loading = false
    let loadingError = false
    let loadingErrorMessage = ""
    let changingPassword = false
    let deletingAccount = false
    let updatingTotp = false
    
    onMount(async () => {
        try {
            loading = true
            data = (await getClient().getSite()).my_user
            if (!data) throw new Error('Failed to fetch user profile settings.')

            formData = {
            ...data.local_user_view?.local_user,
            ...data.local_user_view?.person,
            }
            loading = false
        }
        catch (err) {
            loading = false
            loadingError = true
            loadingErrorMessage = err as string
        }
    })

    async function save() {
        if (!formData || !$profile?.jwt) return

        saving = true
        let client = getClient()

        try {
            let pfp     = profileImage   ? (await client.uploadImage({image: profileImage[0]}))?.url    : undefined
            let banner  = bannerImage    ? (await client.uploadImage({image: bannerImage[0]}))?.url     : undefined

            const res = await client.saveUserSettings({
                ...formData,
                avatar: pfp,
                banner: banner
            })
            
            if (res.success) {
                toast({
                    content: 'Saved your user settings.',
                    type: 'success',
                    title: "Success"
                })

                // If profile avatar changes, update the stored value in localStorage so the UI uses the most recent in account selector
                if (pfp) {
                    $profile.avatar = pfp
                    saveProfileToProfileData()
                }
            }   
            else {
                throw new Error('Failed to save user settings')
            }
    
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
                title: "Error"
            })
            saving = false
        }

        saving = false
    }
</script>

<svelte:head>
    <title>Profile | Settings</title>
</svelte:head>

<SubNavbar back quickSettings scrollButtons />

<MainContentArea>
        
    <ProfileMenuBar />
        
    {#if loading}
        <div class="flex w-full h-[256px]">
            <span class="mx-auto my-auto">    
                <Spinner width={28} />
            </span>
        </div>
    {/if}

    {#if loadingError}
        <div class="w-full my-4">    
            <Placeholder icon={ExclamationTriangle} title="Error" description={loadingErrorMessage}/>
        </div>
    {/if}


    {#if data?.local_user_view}
        
        <!---Function Modals--->
        <DeleteAccountModal bind:open={deletingAccount} />
        <ChangePasswordModal bind:open={changingPassword} />
        <TotpSetupModal bind:open={updatingTotp} bind:totp_enabled={data.local_user_view.local_user.totp_2fa_enabled} />

        <form class="flex flex-col gap-4 h-full" on:submit|preventDefault={save}>
            {#if description}
                <p class="text-sm">
                    The settings here are only ones that affect the behavior of the API. Please see
                    <Link href="/settings" highlight>app settings</Link> for additional options.
                </p>
            {/if}

            {#if data?.local_user_view?.local_user && formData}
            <div class="flex flex-col lg:flex-row lg:justify-between gap-4">
                
                <div class="flex flex-col w-full lg:w-2/3 gap-4">
                    <TextInput label="Display name" bind:value={formData.display_name} placeholder="Optional"/>
                    <TextInput label="Email" bind:value={formData.email} />
                    <TextInput label="Matrix User" bind:value={formData.matrix_user_id} placeholder="@user:example.com"/>
                    
                    <MarkdownEditor images={false} bind:value={formData.bio} label="Bio" rows={6} previewButton />
                </div>


                <div class="flex flex-col w-full lg:w-1/3 gap-4">
                    <FileInput class="h-full" label="Profile Image" image bind:files={profileImage} preview previewURL={data.local_user_view?.person.avatar}/>
                    <FileInput class="h-full" label="Banner Image" image bind:files={bannerImage} preview previewURL={data.local_user_view?.person.banner}/>

                    
                </div>
            </div>
            
            <hr class="dark:opacity-10 w-full my-2" />

            <div class="flex flex-col lg:flex-row lg:justify-between gap-4">
                <div class="flex flex-col w-full lg:w-2/3 gap-4">
                    <SettingToggleContainer>
                        <SettingToggle icon={ExclamationTriangle} title="Show NSFW Content" bind:value={formData.show_nsfw}
                            description="Enable this option to see content flagged NSFW. Posts could be flagged NSFW for any number of reasons (porn, spoiler, gore, violence, language, etc)."
                        />
                        
                        <SettingToggle icon={Sparkles} title="Bot Account" bind:value={formData.bot_account}
                            description="Flags this account as a bot. Many instances require this if the account is submitting content in an automated manner."
                        />

                        <SettingToggle icon={FaceFrown} title="Show Bot Accounts" bind:value={formData.show_bot_accounts}
                            description="Enabling this will show content from accounts marked as bots. Disable to not see submissions from those accounts."
                        />

                        <SettingToggle icon={EnvelopeOpen} title="Show Read Posts" bind:value={formData.show_read_posts}
                            description="Disable this to automatically hide in the feed posts that have been marked as read."
                        />

                        <SettingToggle icon={Envelope} title="Send Notifications to Email" bind:value={formData.send_notifications_to_email}
                            description="Enable this if you want to get email notifications for replies, DMs, and reports."
                        />
                    </SettingToggleContainer>
                </div>
                
                <div class="flex flex-col w-full lg:w-1/3 gap-4 px-4">
                    <div class="mt-auto"/>
                    
                    
                    <Button submit size="lg" color="primary" loading={saving} disabled={saving}>
                        <Icon src={ArrowDownTray} mini width={18} />
                        Save Settings
                    </Button>

                    <Button size="lg" color="primary" on:click={()=> {changingPassword = true }}>
                        <Icon src={Key} min width={18} />
                        Change Password
                    </Button>

                    <Button size="lg" color="primary" on:click={()=> {updatingTotp = true }}>
                        <Icon src={DevicePhoneMobile} min width={18} />
                        {data.local_user_view.local_user.totp_2fa_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Button>

                    <Button size="lg" color="danger" on:click={() => { deletingAccount=true }}>
                        <Icon src={Trash} min width={18} />
                        Delete account
                    </Button>
                </div>
            </div>
                
            {:else}
                <Card cardColor="warning" class="p-5">
                    The API didn't return your user settings.
                </Card>
            {/if}
            
            
        </form>
    {/if}

    <div class="h-full" slot="right-panel">
        {#if $profile?.user}
            <UserCard  
                moderates={$profile.user.moderates} 
                person={
                    {
                        person: $profile.user.local_user_view.person,
                        is_admin: $profile.user.local_user_view.local_user.admin,
                        counts: $profile.user.local_user_view.counts
                    }
                }
            />
        {/if}
    </div>
</MainContentArea>