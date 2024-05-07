<script lang="ts">
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import Link from '$lib/components/input/Link.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import { DEFAULT_INSTANCE_URL, LINKED_INSTANCE_URL } from '$lib/instance.js'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { setUser } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    
    export let data;
    
    if (LINKED_INSTANCE_URL && LINKED_INSTANCE_URL != $page.params.instance) {
        goto(`/login/${LINKED_INSTANCE_URL}`);
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
                await setUser(response.jwt, formData.instance)

                toast({ content: 'Successfully logged in.', type: 'success' })
                goto('/')
            } else {
                throw new Error('Invalid credentials')
            }
        } catch (error) {
            toast({
                content: error as any,
                type: 'error',
            })
        }
        formData.loading = false
    }
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>

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
