<script lang="ts">
    interface LoginErrorResponse {
        error?: string,
        message?: string
    }
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import Link from '$lib/components/input/Link.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import { DEFAULT_INSTANCE_URL, LINKED_INSTANCE_URL } from '$lib/instance.js'
    import { getClient, parseAPIError } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { instance } from '$lib/instance.js';
    import { page } from '$app/stores'
    import { setUser } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { InformationCircle, XCircle } from 'svelte-hero-icons';
    import Markdown from '$lib/components/markdown/Markdown.svelte';
    import SectionTitle from '$lib/components/ui/SectionTitle.svelte';
    
    
    export let data;
    
    if (LINKED_INSTANCE_URL && LINKED_INSTANCE_URL != $page.params.instance) {
        goto(`/login/${LINKED_INSTANCE_URL}`);
    }
    
    let registrationDeniedModal = {
        open: false,
        title: '',
        reason: ''
    }

    let formData = {
        instance: $page.params.instance,
        username: '',
        password: '',
        totp: '',
        loading: false,
    }

    async function logIn() {
        formData.loading = true

        try {
            const response = await getClient(formData.instance).login({
                username_or_email: formData.username.trim(),
                password: formData.password,
                totp_2fa_token: formData.totp,
            })

            if (response?.jwt) {
                $instance = formData.instance
                await setUser(response.jwt, formData.instance)
                toast({ content: 'Successfully logged in.', type: 'success', title: 'Logged In' })
                goto('/')
            } else {
                throw new Error('Invalid credentials')
            }
        } 
        
        catch (err: any) {
            let error = parseAPIError(err)
            
            // Generic error if nothing provided by the API or if the API is unavailable
            if (!error.error) {
                toast({
                    content: 'A login error has occurred but no specific details were provied by the API.',
                    type: 'error',
                    title: 'Login Error'
                })
                formData.loading = false
                return
            }

            // Handle specific API-provided login error messages
            switch (error.error) {
                case 'registration_denied':
                    registrationDeniedModal.title="Registration Denied"
                    registrationDeniedModal.reason = error.message ?? 'None provided.'
                    registrationDeniedModal.open = true
                    break
                
                case 'incorrect_login':
                    toast({
                        title: 'Incorrect Login',
                        type: 'error',
                        content: 'Invalid username or password.'
                    })
                    break
                
                case 'incorrect_totp_token':
                    toast({
                        title: 'Incorrect TOTP Token',
                        type: 'error',
                        content: 'The provided TOTP token is invalid or expired.'
                    })
                    break

                default:
                    toast({
                        title: 'Login Error',
                        type: 'error',
                        content: JSON.stringify(error)
                    })
            }
            formData.loading = false
        }
        formData.loading = false
    }
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>

<!---If registration application was denied, open a modal with the deny reason--->
<Modal bind:open={registrationDeniedModal.open} title={registrationDeniedModal.title} icon={InformationCircle} width="max-w-3xl">
    <div class="flex flex-col text-sm gap-2 w-full">

        <div class="flex flex-col gap-1 w-full">
            <SectionTitle>Login Error</SectionTitle>
            <span class="pl-2">
                Your registration application to 
                <span class="font-bold opacity-80">{data.site_view.site.name}</span>
                was denied.
            </span>
        </div>
        
        <div class="flex flex-col gap-1 w-full">
            <SectionTitle>Reason:</SectionTitle>
            <Markdown source={registrationDeniedModal.reason} class="pl-2"/>
        </div>
    </div>

    <div class="flex flex-row justify-between w-full" slot="buttons">
        <Button color="danger" icon={XCircle} iconSize={20} size="lg" class="mx-auto"  on:click={() => registrationDeniedModal.open=false }>Close</Button>
    </div>

</Modal>


<SubNavbar home back toggleMargins toggleCommunitySidebar/>

<MainContentArea>
    <FeedContainer>
        <form on:submit|preventDefault={logIn} class="flex flex-col gap-6">
            
            <h1 class="font-bold text-2xl">Log In</h1>
            <div class="flex flex-row w-full items-center gap-2">
                <TextInput bind:value={formData.username} id="username" label="Username" class="flex-1" focus={true} required />
            </div>
        
            <div class="flex flex-row gap-2">
                <TextInput bind:value={formData.password} id="password" label="Password" type="password" required class="w-full" />

                <TextInput bind:value={formData.totp} id="totp" label="2FA Code" placeholder="123456" pattern={'\\d{6}'} minlength={6}
                    maxlength={6} class="w-24"
                    on:input={(e) => {
                        if (!Number.isInteger(Number(e.detail.data))) {
                            e.preventDefault()
                            formData.totp = formData.totp.replace(e.detail.data, '')
                        }
                    }}
                />
            </div>

            <Button loading={formData.loading} disabled={formData.loading} color="primary" size="lg" submit >
                Log in
            </Button>

            <hr class="dark:border-zinc-700" />
            
            <p class="text-sm text-center opacity-80">
                <Link href="/signup/{formData.instance}" highlight>Sign Up</Link> | <Link href="/forgot_password/{formData.instance}" highlight>Forgot Password</Link>
            </p>
        </form>
    </FeedContainer>
    
    <SiteCard site={data.site_view} taglines={data.taglines} admins={data.admins} version={data.version} slot="right-panel"/>
    
</MainContentArea>
