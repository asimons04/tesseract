<script lang="ts">
    import type { EditSite } from 'lemmy-js-client'
    import type { PageData } from './$types.js'
    
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import Setting from '$lib/components/ui/Setting.svelte'
    import Switch from '$lib/components/input/Switch.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import {
        Icon,
        ArrowDown,
        BellAlert,
        BuildingOffice,
        ClipboardDocumentCheck,
        ClipboardDocumentList,
        Cloud,
        Cog6Tooth,
        DocumentText,
        Envelope,
        ExclamationTriangle,
        FingerPrint,
        Funnel,
        Identification,
        InformationCircle,
        Key,
        LockClosed,
        PuzzlePiece,
        ShieldExclamation,
        UserGroup

    } from 'svelte-hero-icons'

    export let data: PageData;
    
    const formData: Omit<EditSite, 'auth'> | undefined = data.site
        ? {
            ...data.site.site_view.local_site,
            ...data.site.site_view.site,
        }
        : undefined

    async function save() {
        if (!$profile?.jwt){
            toast({
                content: "Not authorized",
                type: 'error',
            })   
            return
        }
        
        saving = true
        
        const { jwt } = $profile
        try {
            await getClient().editSite({
                auth: jwt,
                ...formData,
            })
            
            toast({
                content: 'Updated your site.',
                type: 'success',
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        saving = false
    }

    let saving = false
    let selected: 'general' | 'registration' | 'federation' | 'sidebar' | 'legal' | 'slurs' = 'general';

</script>

<svelte:head>
  <title>Administration</title>
</svelte:head>

<form class="flex flex-col gap-4 p-2" on:submit|preventDefault={save}>
    <h1 class="flex flex-row justify-between">
        <span class="font-bold text-2xl">Site Configuration</span>
        
        <Button color="primary" loading={saving} disabled={saving} submit>
            Save
        </Button>
    </h1>
    
    
    {#if formData}
    
    <div class="flex flex-col lg:flex-row gap-2">
        <!---Section Selection Menu--->
        <div class="flex flex-row justify-center w-full lg:flex-col lg:max-w-[15%] lg:justify-start gap-2">
            <Button
                color="tertiary"
                title="General"
                alignment="left"
                on:click={()=> { selected = 'general' }}
            >
                <Icon src={Cog6Tooth} mini width={16} slot="icon"/>
                <span class="hidden sm:block">General</span>
            </Button>

            <Button
                color="tertiary"
                title="Registration"
                alignment="left"
                on:click={()=> { selected = 'registration' }}
            >
                <Icon src={ClipboardDocumentCheck} mini width={16} slot="icon"/>
                <span class="hidden sm:block">Registration</span>
            </Button>

            <Button
                color="tertiary"
                title="Federation"
                alignment="left"
                on:click={()=> { selected = 'federation' }}
            >
                <Icon src={Cloud} mini width={16} slot="icon"/>
                <span class="hidden sm:block">Federation</span>
            </Button>

            <Button
                color="tertiary"
                title="Slur Filters"
                alignment="left"
                on:click={()=> { selected = 'slurs' }}
            >
                <Icon src={Funnel} mini width={16} slot="icon"/>
                <span class="hidden sm:block">Slur Filters</span>
            </Button>

            <Button
                color="tertiary"
                title="Sidebar"
                alignment="left"
                on:click={()=> { selected = 'sidebar' }}
            >
                <Icon src={InformationCircle} mini width={16} slot="icon"/>
                <span class="hidden sm:block">Sidebar</span>
            </Button>

            <Button
                color="tertiary"
                title="Legal"
                alignment="left"
                on:click={()=> { selected = 'legal' }}
            >
                <Icon src={BuildingOffice} mini width={16} slot="icon"/>
                <span class="hidden sm:block">Legal</span>
            </Button>
        </div>
        <!--- End Section Selection Menu--->

        <!---Section Panels--->
        <div class="flex flex-col w-full lg:w-[85%]">
            
            <!---General Options--->
            <div class:hidden={selected!='general'}>
                <Setting>
                    <span class="flex flex-row gap-2" slot="title">
                        <Icon src={Cog6Tooth} mini width={24} />General Options
                    </span>
                    
                    <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">

                        <!---Site Name--->
                        <div class="flex flex-col md:flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Identification} mini width={16}/>
                                    Site Name
                                </p>
                                <p class="text-xs font-normal">The name of your Lemmy instance. Maximum length: 20 characters.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <TextInput bind:value={formData.name} maxlength={20} class="w-full md:w-[250px]"/>
                        </div>

                        <!---Site Description--->
                        <div class="flex flex-col md:flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={DocumentText} mini width={16}/>
                                    Site Description
                                </p>
                                <p class="text-xs font-normal">A short description of your site, motto, or other tagline to show with the site name. Maximum length: 150 characters.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <TextInput bind:value={formData.description} maxlength={150} class="w-full md:w-[250px]"/>
                        </div>

                        <!---Enable Downvotes--->
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={ArrowDown} mini width={16}/>
                                    Enable Downvotes
                                </p>
                                <p class="text-xs font-normal">Enable downvotes on your instance. When disabled, downvotes will not be processed.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={formData.enable_downvotes}  defaultValue={true}/>
                        </div>

                        <!---Enable NSFW--->
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={ExclamationTriangle} mini width={16}/>
                                    Enable NSFW
                                </p>
                                <p class="text-xs font-normal">Enable content that carries the NSFW tag.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={formData.enable_nsfw}  defaultValue={false}/>
                        </div>

                        <!---Restrict Community Creation to Admins--->
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={UserGroup} mini width={16}/>
                                    Only Admins Can Create Communities
                                </p>
                                <p class="text-xs font-normal">Restrict the creation of new communities to admins only.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={formData.community_creation_admin_only}  defaultValue={true}/>
                        </div>

                        <!---Hide Moglog Mod Names--->
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={ShieldExclamation} mini width={16}/>
                                    Hide Moderator Names
                                </p>
                                <p class="text-xs font-normal">Hide the names of moderators when unprivileged users view the modlog.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={formData.hide_modlog_mod_names}  defaultValue={true}/>
                        </div>

                        <!---Email Reports to Admins--->
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={BellAlert} mini width={16}/>
                                    Email Reports to Admins
                                </p>
                                <p class="text-xs font-normal">When users report a post/comment, email the admins a copy of the report.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={formData.reports_email_admins}  defaultValue={true}/>
                        </div>

                        <!---Private Instance--->
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={LockClosed} mini width={16}/>
                                    Private Instance
                                </p>
                                <p class="text-xs font-normal">If private instance is enabled, visitors will have to be logged in to see any posts.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={formData.private_instance}  defaultValue={true}/>
                        </div>

                        <!---Federation Enabled--->
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Cloud} mini width={16}/>
                                    Federation Enabled
                                </p>
                                <p class="text-xs font-normal">
                                    If federation is disabled, your instance will not interact with any others; only users of your instance will be able to interact with it.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={formData.federation_enabled}  defaultValue={true}/>
                        </div>
                    </div>

                </Setting>
            </div>

            <!---Registration Options--->
            <div class:hidden={selected!='registration'}>
                <Setting>
                    <span class="flex flex-row gap-2" slot="title">
                        <Icon src={ClipboardDocumentCheck} mini width={24} />Registration Options
                    </span>
                    
                    <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                        
                        {#if 
                            formData.registration_mode == 'Open' &&
                            (!formData.captcha_enabled || formData.captcha_difficulty != 'hard' || !formData.require_email_verification)
                        }
                        <div class="flex flex-col p-2 gap-4 bg-red-700/30 text-zinc-950 dark:text-slate-200 rounded-md">
                            <span class="text-sm font-normal">
                                <span class="flex flex-row gap-2 items-center">
                                    <Icon src={ExclamationTriangle} mini width={28}/>
                                    <p class="font-bold">Warning:  This configuration is insecure!</p>
                                </span>
                                <p>
                                    Open registration with no or weak captchas and/or no email verification is an invitation to spammers.  Instances using this configuration are quickly
                                    discovered and overrun with spam accounts. To avoid that, and the resultant de-federation that typically follows such events, please
                                    consider stronger signup requirements.
                                </p>
                            </span>
                        </div>
                        {/if}

                        <!---Registration Mode--->
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Key} mini width={16}/>
                                    Registration Mode
                                </p>
                                <p class="text-xs font-normal">
                                    Set the requirements for user sign-ups or disable them by closing registrations.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <MultiSelect
                                options={['Closed', 'RequireApplication', 'Open']}
                                optionNames={['Closed', 'Require Application', 'Open Registration']}
                                selected={formData.registration_mode ?? 'Open'}
                                items={0}
                                headless={true}
                                class="min-w-[180px]"
                                on:select={(e) => {
                                    // @ts-ignore
                                    formData.registration_mode = e.detail
                                }}
                            />
                        </div>

                        <!---Captcha--->
                        {#if formData.registration_mode != 'Closed'}
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={PuzzlePiece} mini width={16}/>
                                    Captcha
                                </p>
                                <p class="text-xs font-normal">
                                    Enable/disable CAPTCHAs and set their difficulty level.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <MultiSelect
                                items={0}
                                headless={true}
                                options={['off', 'easy', 'medium', 'hard']}
                                optionNames={['Off', 'Easy', 'Medium', 'Hard']}
                                
                                selectedFunc={() => {
                                    if (formData.captcha_enabled && formData.captcha_difficulty) { return formData.captcha_difficulty.toLowerCase(); }
                                    if (formData.captcha_enabled && !formData.captcha_difficulty) { return 'easy'; }
                                    if (!formData.captcha_enabled) { return 'off'; }
                                }}
                                
                                on:select={(e) => {
                                    // @ts-ignore
                                    if (e.detail == 'off') { formData.captcha_enabled = false; }
                                    else {
                                        formData.captcha_enabled = true;
                                        formData.captcha_difficulty = e.detail
                                    }
                                }}
                            />
                        </div>
                        {/if}

                        <!---Require Email Verification--->
                        {#if formData.registration_mode != 'Closed'}
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Envelope} mini width={16}/>
                                    Require Email Verification
                                </p>
                                <p class="text-xs font-normal">
                                    Require users to verify their email addresses during signup. This also makes providing an email address
                                    mandatory during signup. Please consider enabling this for both spam prevention as well as ensuring users are able to reset
                                    their passwords.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={formData.require_email_verification}  defaultValue={true}/>
                        </div>
                        {/if}

                        <!---Email Admins on New Application--->
                        {#if formData.registration_mode == 'RequireApplication'}
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={BellAlert} mini width={16}/>
                                    Notify Admins of New Applications
                                </p>
                                <p class="text-xs font-normal">Send admins an email when new signup applications are received.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={formData.application_email_admins}  defaultValue={true}/>
                        </div>
                        {/if}

                        <!---Application Questionnaire--->
                        {#if formData.registration_mode == 'RequireApplication'}
                        <div class="flex flex-col lg:flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={ClipboardDocumentList} mini width={16}/>
                                    Application Question
                                </p>
                                <p class="text-xs font-normal">The questionnaire to present to applicants when registering.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <MarkdownEditor
                                previewButton
                                placeholder="Briefly describe why you want to join this instance"
                                bind:value={formData.application_question}
                            />
                        </div>
                        {/if}

                    </div>
                </Setting>
            </div>

            <!---Slur Filters--->
            <div class:hidden={selected!='slurs'}>
                <Setting>
                    <span class="flex flex-row gap-2" slot="title">
                        <Icon src={Funnel} mini width={24} />
                        Slur Filters
                    </span>

                    
                    <span title="description">
                        A regex containing the slurs you want to prohibit in content. Be careful since a malformed regex will prevent the site from working,
                        and you will have to clear the value from the database directly to resolve.
                    </span>
        
                    <TextInput
                        bind:value={formData.slur_filter_regex}
                        label="Slur Filter Regex"
                        placeholder="(word1|word2)"
                    />
                </Setting>

            </div>

            <!---Site Sidebar--->
            <div class:hidden={selected!='sidebar'}>
                <Setting>
                    <span class="flex flex-row gap-2" slot="title">
                        <Icon src={InformationCircle} mini width={24} />
                        Sidebar
                    </span>
                    
                    <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                        <div class="flex flex-col lg:flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={DocumentText} mini width={16}/>
                                    Sidebar Contents
                                </p>
                                <p class="text-xs font-normal">
                                    The information to be displayed in the site sidebar.  Welcome your visitors, define the site rules, or otherwise provide a general
                                    description of your instance.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <MarkdownEditor
                                previewButton
                                bind:value={formData.sidebar}
                                rows={15}
                            />
                            
                        </div>
                    </div>
                    
                    
                </Setting>
            </div>

            <!---Legal Page--->
            <div class:hidden={selected!='legal'}>
                <Setting>
                    <span class="flex flex-row gap-2" slot="title">
                        <Icon src={BuildingOffice} mini width={24} />
                        Legal
                    </span>
                    
                    <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                        <div class="flex flex-col lg:flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={DocumentText} mini width={16}/>
                                    Legal Page Contents
                                </p>
                                <p class="text-xs font-normal">
                                    The contents provided here will be used to generate what is shown on the `/legal` page of your instance.
                                </p>

                                <p class="text-xs font-normal">
                                    Provide any relevant information such as DMCA contact points, privacy, data retention, and any other policy that is applicable to your instance.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <MarkdownEditor
                                previewButton
                                bind:value={formData.legal_information}
                                rows={15}
                            />
                            
                        </div>
                    </div>
                </Setting>
            </div>

        </div>

    </div>
    <!---End "new" version-->

        
        
        
    {/if}
</form>
