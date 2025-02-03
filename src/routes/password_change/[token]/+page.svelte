<script lang="ts">
    import type { PasswordChangeAfterReset } from 'lemmy-js-client'

    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { LINKED_INSTANCE_URL, instance as Instance } from "$lib/instance.js";

    import Button           from '$lib/components/input/Button.svelte'
    import Card             from '$lib/components/ui/Card.svelte'
    import MainContentArea  from '$lib/components/ui/containers/MainContentArea.svelte';
    import SiteCard         from '$lib/components/lemmy/SiteCard.svelte';
    import SiteCardSmall    from '$lib/components/lemmy/SiteCardSmall.svelte'
    import SubNavbar        from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import TextInput        from '$lib/components/input/TextInput.svelte'
    
    
    export let data

    let instance = LINKED_INSTANCE_URL ?? $Instance;
    let submitting: boolean = false

    let formData:PasswordChangeAfterReset = {
        token: $page.params.token,
        password: "",
        password_verify: ""
    }

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
            const res = await getClient(instance).passwordChangeAfterReset({
                ...formData
            })
           
            toast({
                content: `Your password was successfully changed.`,
                type: 'success',
                title: 'Success'
            })
            submitting=false;
            
            goto(`/login/${instance}`);
            
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
                title: 'Error'
            })
        }
        submitting = false
    }
</script>

<svelte:head>
    <title>Change Password</title>
</svelte:head>

<SubNavbar home back toggleCommunitySidebar/>

<MainContentArea>
    <!---Add the Site Banner to the top of the feed below 'xl' width--->
    <div class="flex 2xl:hidden flex-col mx-auto w-full max-w-[820px] mb-4">    
        <SiteCardSmall site={data.site_view} version={data.version}/>
    </div>

    <Card class="mx-auto w-full max-w-4xl p-2"> 
        <form class="flex flex-col gap-4 w-full max-w-4xl mx-auto" on:submit|preventDefault={submit}>
            <h1 class="font-bold text-2xl">Set New Password</h1>
            <p class="text-sm">
                New password must be at least 10 characters.
            </p>
            
            <TextInput bind:value={formData.password} label="New password" required={true} type="password" autocomplete="new-password" />
        
            <TextInput bind:value={formData.password_verify} label="Confirm password" required={true} type="password" autocomplete="new-password" />
            
            <Button submit color="primary" size="lg" loading={submitting} disabled={submitting} class="mt-auto" >
                Save
            </Button>
        </form>
    </Card>
        
        
    
    
    <SiteCard site={data.site_view} taglines={data.taglines} admins={data.admins} version={data.version} slot="right-panel"/>
    
</MainContentArea>


