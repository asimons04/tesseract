<script lang="ts">
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { toast } from '$lib/components/ui/toasts/toasts'
    import { getClient } from '$lib/lemmy.js'
    import { LINKED_INSTANCE_URL } from "$lib/instance"
    
    import Button           from '$lib/components/input/Button.svelte'
    import Card             from '$lib/components/ui/Card.svelte'
    import MainContentArea  from '$lib/components/ui/containers/MainContentArea.svelte'
    import SiteCard         from '$lib/components/lemmy/SiteCard.svelte'
    import SiteCardSmall    from '$lib/components/lemmy/SiteCardSmall.svelte'
    import SubNavbar        from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import TextInput        from '$lib/components/input/TextInput.svelte'
    

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
        if (!email) return
        
        try {
            const res = await getClient(instance).passwordReset({
                email: email,
            })

            toast({
                content: `A password reset email was sent to ${email}. Please check your inbox and follow the instructions.`,
                type: 'success',
                title: "Success"
            })
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
    <title>Forgot Password</title>
</svelte:head>

<SubNavbar home back toggleCommunitySidebar/>

<MainContentArea>
    <!---Add the Site Banner to the top of the feed below 'xl' width--->
    <div class="flex 2xl:hidden flex-col mx-auto w-full max-w-[820px] mb-4">    
        <SiteCardSmall site={data.site_view} version={data.version}/>
    </div>
        
    <Card class="mx-auto w-full max-w-4xl p-2">
        <form class="flex flex-col gap-4 w-full max-w-4xl mx-auto" on:submit|preventDefault={submit}>
            
            
            <h1 class="font-bold text-2xl">Recover Account Password</h1>
            <p class="text-sm">
                Enter your registerd email address to begin the password recovery process.  You will not be able to reset your 
                password if you did not register an email when your account was created.
            </p>
            <TextInput bind:value={email} label="Email" required={true} type="email" autocomplete="email" focus={true} />
            
            <Button submit color="primary" size="lg" loading={submitting} disabled={submitting} class="mt-auto" >
                Submit
            </Button>
        </form>
    </Card>
        
        
    
    
    <SiteCard site={data.site_view} taglines={data.taglines} admins={data.admins} version={data.version} slot="right-panel"/>
    
</MainContentArea>





