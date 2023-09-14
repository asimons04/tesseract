<script lang="ts">
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { setUser } from '$lib/auth.js'
    import Button from '$lib/components/input/Button.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { DEFAULT_INSTANCE_URL, LINKED_INSTANCE_URL } from '$lib/instance.js'
    import { getClient, validateInstance } from '$lib/lemmy.js'
    import { AtSymbol, Icon } from 'svelte-hero-icons'

    export let data;
    
    
    const instance = $page.params.instance
    
    let formData = {
        instance: instance,
        username: '',
        password: '',
        totp: '',
        loading: false,
    }

    async function logIn() {
        formData.loading = true

        try {
            formData.instance = formData.instance.trim()
            if (!(await validateInstance(formData.instance))) {
                throw new Error('Failed to contact that instance. Is it down?')
            }

            const response = await getClient(formData.instance).login({
                username_or_email: formData.username.trim(),
                password: formData.password,
                totp_2fa_token: formData.totp,
            })

            if (response?.jwt) {
                await setUser(response.jwt, formData.instance, formData.username)

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

<div class="max-w-lg w-full mx-auto">
    <form on:submit|preventDefault={logIn} class="flex flex-col gap-6">
        
        {#if data.site_view.site.icon}
            <span class="flex gap-4 items-center font-bold text-xl text-center mx-auto">
                <Avatar circle={false} width={48} url={data.site_view.site.icon} />
                {data.site_view.site.name}
            </span>
        {/if}
        
        <h1 class="font-bold text-2xl">Log in</h1>
        <div class="flex flex-row w-full items-center gap-2">
            <TextInput
                id="username"
                bind:value={formData.username}
                label="Username"
                placeholder="Example"
                class="flex-1"
                required
            />
        </div>
    
        <div class="flex flex-row gap-2">
            <TextInput
                id="password"
                bind:value={formData.password}
                label="Password"
                type="password"
                required
                class="w-full"
            />

            <TextInput
                id="totp"
                bind:value={formData.totp}
                label="2FA Code"
                placeholder="123456"
                pattern={'\\d{6}'}
                minlength={6}
                maxlength={6}
                class="w-24"
                on:input={(e) => {
                    if (!Number.isInteger(Number(e.detail.data))) {
                        e.preventDefault()
                        formData.totp = formData.totp.replace(e.detail.data, '')
                    }
                }}
            />
        </div>

        <Button
            loading={formData.loading}
            disabled={formData.loading}
            color="primary"
            size="lg"
            submit
        >
            Log in
        </Button>

        <hr class="dark:border-zinc-700" />
        <p class="text-sm text-center opacity-80">
            <Link href="/signup/{formData.instance}" highlight>Sign up</Link> | <Link href="/forgot_password/{formData.instance}" highlight>Forgot Password</Link>
        </p>
    </form>
</div>
