<script lang="ts">
    
    import type { GetCaptchaResponse } from 'lemmy-js-client'
    
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { LINKED_INSTANCE_URL } from "$lib/instance.js";
    import { page } from '$app/stores'
    import { setUser } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte';
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import TextArea from '$lib/components/input/TextArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    
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
                goto('/')
                return 
            }

            if (res?.jwt) {
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


<SubNavbar home back toggleMargins toggleCommunitySidebar />

<MainContentArea>
    <FeedContainer>
        <form class="flex flex-col gap-4" on:submit|preventDefault={submit}>
            <!---
            <span class="flex gap-4 items-center font-bold text-xl text-center mx-auto">
                {#if data.site_view.site.icon}
                    <Avatar circle={false} width={48} url={data.site_view.site.icon} />
                {/if}
                {data.site_view.site.name}
            </span>
            --->
        
            {#if data.site_view.local_site.registration_mode != 'Closed'}
                <h1 class="font-bold text-3xl">Create account</h1>
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
                        <div class="block my-1 font-bold text-sm">Captcha</div>
                        <div class="flex flex-col gap-4">
                            {#await getCaptcha()}
                                <Spinner width={32} />
                            {:then}
                                {#if captcha?.ok}
                                    <img src="data:image/png;base64,{captcha.ok.png}" alt="Captcha" class="w-max" />
                                    <audio controls src={captchaAudio} />
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
                            
                            <Button on:click={() => getCaptcha()} size="square-md">
                                <Icon src={ArrowPath} size="16" mini />
                            </Button>
                            
                            <TextInput required bind:value={verifyCaptcha} />
                        </div>
                    </div>
                {/if}
        
                <input type="dn" name="honeypot" bind:value={honeypot} class="hidden" />
                <Button submit color="primary" size="lg" loading={submitting} disabled={submitting} class="mt-auto">
                    Submit
                </Button>
            {:else}
                <div class="my-auto">
                    <Placeholder icon={XCircle} title="Registrations closed" description="New account creation has been disabled on this instance.">
                        <Button icon={Plus} href="https://join-lemmy.org">
                            Find another instance
                        </Button>
                    </Placeholder>
                </div>
            {/if}
        </form>
    </FeedContainer>

    <SiteCard site={data.site_view} taglines={data.taglines} admins={data.admins} version={data.version} slot="right-panel"/>
</MainContentArea>


