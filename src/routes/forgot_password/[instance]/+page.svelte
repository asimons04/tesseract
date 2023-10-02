<script lang="ts">
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import Button from '$lib/components/input/Button.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { getClient } from '$lib/lemmy.js'
    import type { GetCaptchaResponse } from 'lemmy-js-client'
    import { LINKED_INSTANCE_URL } from "$lib/instance.js";

    export let data

    if (LINKED_INSTANCE_URL && LINKED_INSTANCE_URL != $page.params.instance) {
        goto(`/forgot_password/${LINKED_INSTANCE_URL}`);
    }

    const instance = $page.params.instance
    
    
    let email: string | undefined = ''
    let submitting: boolean = false
  
    $: if (email == '') email = undefined


    async function submit() {
        submitting = true
        try {
            const res = await getClient(instance, fetch).passwordReset({
                email: email,
            })

            toast({
                content: `A password reset email was sent to ${email}. Please check your inbox and follow the instructions.`,
                type: 'success',
            })
            goto('/login');
            
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
        submitting = false
    }
</script>

<svelte:head>
    <title>Forgot Password</title>
</svelte:head>

<form class="flex flex-col gap-4 max-w-2xl mx-auto" on:submit|preventDefault={submit}>
    <span class="flex gap-4 items-center font-bold text-xl text-center mx-auto">
        {#if data.site_view.site.icon}
            <Avatar circle={false} width={48} url={data.site_view.site.icon} />
        {/if}
        {data.site_view.site.name}
    </span>
  
    <h1 class="font-bold text-3xl">Recover Account Password</h1>
    <p class="text-sm">
        Enter your registerd email address to begin the password recovery process.  You will not be able to reset your 
        password if you did not register an email when your account was created.
    </p>
    <TextInput
        bind:value={email}
        label="Email"
        required={true}
        type="email"
        focus={true}
    />
    
    <Button
        submit
        color="primary"
        size="lg"
        loading={submitting}
        disabled={submitting}
        class="mt-auto"
    >
        Submit
    </Button>
</form>
