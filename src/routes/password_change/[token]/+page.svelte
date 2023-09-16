<script lang="ts">
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'

    import Button from '$lib/components/input/Button.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { getClient } from '$lib/lemmy.js'
    
    import type { PasswordChangeAfterReset } from 'lemmy-js-client'
    import { LINKED_INSTANCE_URL, instance as Instance } from "$lib/instance.js";

    export let data

    export let instance = LINKED_INSTANCE_URL ?? $Instance;

    let formData:PasswordChangeAfterReset = {
        token: $page.params.token,
        password: "",
        password_verify: ""
    }

    let submitting: boolean = false
  


    async function submit() {
        submitting = true
        if (formData.password != formData.password_verify) {
            toast({
                content: "Passwords do not match.",
                type: 'error'

            })
            submitting=false;
            return;
        }
        
        try {
            const res = await getClient(instance, fetch).passwordChangeAfterReset({
                ...formData
            })
            
            console.log(res);
            
            toast({
                content: `Your password was successfully changed.`,
                type: 'success',
            })
            submitting=false;
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
    <title>Change Password</title>
</svelte:head>

<form class="flex flex-col gap-4 max-w-2xl mx-auto" on:submit|preventDefault={submit}>
    <span class="flex gap-4 items-center font-bold text-xl text-center mx-auto">
        {#if data.site_view.site.icon}
            <Avatar circle={false} width={48} url={data.site_view.site.icon} />
        {/if}
        {data.site_view.site.name}
    </span>
  
    <h1 class="font-bold text-3xl">Set New Password</h1>
    <p class="text-sm">
        
    </p>
    <TextInput
        bind:value={formData.password}
        label="New password"
        required={true}
        type="password"
    />

    <TextInput
        bind:value={formData.password_verify}
        label="Confirm password"
        required={true}
        type="password"
    />
    
    <Button
        submit
        color="primary"
        size="lg"
        loading={submitting}
        disabled={submitting}
        class="mt-auto"
    >
        Save
    </Button>
</form>
