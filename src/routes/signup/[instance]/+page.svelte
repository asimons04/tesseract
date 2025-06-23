<script lang="ts">
    
    import type { GetCaptchaResponse } from 'lemmy-js-client'
    
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { LINKED_INSTANCE_URL, instance as Instance } from "$lib/instance.js";
    import { page } from '$app/stores'
    import { setUser } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import Button           from '$lib/components/input/Button.svelte'
    import Card             from '$lib/components/ui/Card.svelte'
    import Logo             from '$lib/components/ui/Logo.svelte'
    import MainContentArea  from '$lib/components/ui/containers/MainContentArea.svelte'
    import Markdown         from '$lib/components/markdown/Markdown.svelte'
    import Placeholder      from '$lib/components/ui/Placeholder.svelte'
    import SiteCard         from '$lib/components/lemmy/SiteCard.svelte'
    import SiteCardSmall    from '$lib/components/lemmy/SiteCardSmall.svelte'
    import Spinner          from '$lib/components/ui/loader/Spinner.svelte'
    import SubNavbar        from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import TextArea         from '$lib/components/input/TextArea.svelte'
    import TextInput        from '$lib/components/input/TextInput.svelte'
    
    import {
        ArrowPath,
        ExclamationCircle,
        ExclamationTriangle,
        Icon,
        Plus,
        QuestionMarkCircle,
        XCircle,
    } from 'svelte-hero-icons'
    

    export let data

    // If locked to a specific instance, redirect to that instance's login route
    if (LINKED_INSTANCE_URL && LINKED_INSTANCE_URL != $page.params.instance) {
        goto(`/signup/${LINKED_INSTANCE_URL}`);
    }
    
    const instance =  $page.params.instance

    let captchaRequired = data.site_view.local_site.captcha_enabled
    let email: string | undefined = ''

    $: if (email == '') email = undefined

    let username = '',
    password = '',
    passwordVerify = '',
    captcha: GetCaptchaResponse | null = null,
    verifyCaptcha: string | undefined = undefined,
    application: string | undefined = undefined,
    submitting: boolean = false,
    honeypot: string | undefined = undefined

    const getCaptcha = async () => (captcha = await getClient(instance).getCaptcha())

    $: captchaAudio = captcha?.ok?.wav
        ? `data:audio/wav;base64,${captcha.ok.wav}`
        : ''

    async function submit() {
        submitting = true

        try {
            const res = await getClient(instance).register({
                username: username,
                email: email,
                password: password,
                password_verify: passwordVerify,
                show_nsfw: true,
                answer: application,
                captcha_answer: verifyCaptcha,
                captcha_uuid: captcha?.ok?.uuid,
                honeypot,
            })

            toast({
                content: `Signed up. ${res.verify_email_sent ? 'A verification email was sent. Please check your email and click the verification link.' : ''}`,
                type: 'success',
                title: "Email Verification Sent"
            })
            
            // If email verification is enabled, a JWT will not be returned.
            if (res.verify_email_sent) { 
                goto(`/login/${instance}`)
                return 
            }

            if (res?.jwt) {
                $Instance = instance
                await setUser(res.jwt, $page.params.instance)
                toast({ 
                    content: 'Successfully registered and logged in. Welcome!', 
                    type: 'success',
                    title: "Successfully Registered"
                })
                
                goto('/')
            
            } else {
                throw new Error('Invalid credentials')
            }
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
    <title>Sign up</title>
</svelte:head>


<SubNavbar home back toggleCommunitySidebar />

<MainContentArea>
    <!---Add the Site Banner to the top of the feed below 'xl' width--->
    <div class="flex 2xl:hidden flex-col mx-auto w-full max-w-[820px] mb-4">    
        <SiteCardSmall site={data.site_view} version={data.version}/>
    </div>
    
    {#if data.site_view.local_site.registration_mode != 'Closed'}
        <Card class="mx-auto w-full max-w-4xl p-2">
            <form class="flex flex-col gap-4 w-full max-w-4xl mx-auto" on:submit|preventDefault={submit}>
            
                <h1 class="flex flex-row font-bold text-2xl justify-between">
                    Create Account
                    <Logo width={40} />
                </h1>
                <TextInput bind:value={username} focus={true} label="Username" required />
        
                <TextInput bind:value={email} label="Email" required={data.site_view.local_site.require_email_verification} type="email" />
        
                <TextInput bind:value={password} label="Password" required type="password" />
                
                <TextInput bind:value={passwordVerify} label="Confirm Password" required type="password" />
        
                {#if data.site_view.local_site.registration_mode == 'RequireApplication'}
                    <Card class="p-4 dark:text-yellow-200 text-yellow-800" cardColor="warning" >
                        <span class="flex flex-row gap-1">
                            <Icon src={ExclamationTriangle} mini size="20" />
                            <p>
                                To join this instance, you need to fill out this application, and wait to
                                be accepted.
                            </p>
                        </span>
                    </Card>
        
                    {#if data.site_view.local_site.application_question}
                        <Markdown source={data.site_view.local_site.application_question} />
                    {/if}
                    <TextArea bind:value={application} label="Application" required  />
                {/if}
        
                {#if captchaRequired}
                    <div>
                        <div class="flex flex-row items-center justify-between">
                            <div class="block my-1 font-bold text-sm">Captcha</div>
                            <Button title="Refresh Captcha" color="tertiary-border" on:click={() => getCaptcha()} size="square-md" icon={ArrowPath} iconSize={16} />
                        </div>
                        
                        <div class="flex flex-col gap-4">
                            {#await getCaptcha()}
                                <Spinner width={32} />
                            {:then}
                                {#if captcha?.ok}
                                    <div class="flex flex-col gap-1 items-start">
                                        <img src="data:image/png;base64,{captcha.ok.png}" alt="Captcha" class="w-[250px]" />
                                        <audio controls src={captchaAudio} class="w-[250px]" />
                                    </div>
                                {:else}
                                    <Card cardColor="warning" class="p-3 flex gap-2">
                                        <span class="flex flex-row gap-1">
                                            <Icon src={QuestionMarkCircle} mini size="24" />
                                            <p>No captcha was returned</p>
                                        </span>
                                    </Card>
                                {/if}
                            {:catch err}
                                <Card cardColor="error" class="p-3 flex gap-2">
                                    <span class="flex flex-row gap-1">    
                                        <Icon src={ExclamationCircle} mini size="24" />
                                        <p>{err}</p>
                                    </span>
                                </Card>
                            {/await}
                            
                            <TextInput required bind:value={verifyCaptcha} placeholder="CAPTCHA Answer" />
                        </div>
                    </div>
                {/if}
        
                <input type="dn" name="honeypot" bind:value={honeypot} class="hidden" />
                <Button submit color="primary" size="lg" loading={submitting} disabled={submitting} class="mt-auto">
                    Submit
                </Button>
            </form>
        </Card>
    {:else}
        <div class="mx-auto my-auto">
            <Placeholder icon={XCircle} title="Registrations Closed" description="New account creation has been disabled on this instance.">
                <Button icon={Plus} href="/signup">
                    Choose Another Instance
                </Button>
            </Placeholder>
        </div>
    {/if}
        
    

    <SiteCard site={data.site_view} taglines={data.taglines} admins={data.admins} version={data.version} slot="right-panel"/>
</MainContentArea>


