<script lang="ts">
    import type { Instance, Tagline } from 'lemmy-js-client'
    import type { PageData } from './$types.js'
    
    
    import { addAdmin } from '$lib/lemmy/user.js'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { instance } from '$lib/instance.js'
    import { profile } from '$lib/auth.js'
    import { removeItem, trycatch } from '$lib/util.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import EditableList from '$lib/components/ui/list/EditableList.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Setting from '$lib/components/ui/Setting.svelte'
    import SettingEditArray from '$lib/components/ui/settings/SettingEditArray.svelte'
    import Switch from '$lib/components/input/Switch.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Icon,
        ArrowDown,
        ArrowsRightLeft,
        ArrowUpTray,
        AtSymbol,
        BellAlert,
        BugAnt,
        BuildingOffice,
        Camera,
        ChatBubbleBottomCenterText,
        ChatBubbleLeft,
        Check,
        ClipboardDocumentCheck,
        ClipboardDocumentList,
        Cog6Tooth,
        CommandLine,
        DocumentText,
        Envelope,
        ExclamationTriangle,
        Funnel,
        Identification,
        InformationCircle,
        Key,
        LockClosed,
        MagnifyingGlass,
        Megaphone,
        NoSymbol,
        PauseCircle,
        Photo,
        Plus,
        PuzzlePiece,
        QuestionMarkCircle,
        Rss,
        ServerStack,
        ShieldCheck,
        ShieldExclamation,
        Trash,
        UserGroup,
        UserPlus,
        Window,
    } from 'svelte-hero-icons'
    

    export let data: PageData;

    let formData =  {
        ...data.site.site_view.local_site,
        ...data.site.site_view.site,
        
        rate_limit_comment:             data.site.site_view.local_site_rate_limit.comment,
        rate_limit_comment_per_second:  data.site.site_view.local_site_rate_limit.comment_per_second,

        rate_limit_image:               data.site.site_view.local_site_rate_limit.image,
        rate_limit_image_per_second:    data.site.site_view.local_site_rate_limit.image_per_second,

        rate_limit_message:             data.site.site_view.local_site_rate_limit.message,
        rate_limit_message_per_second:  data.site.site_view.local_site_rate_limit.message_per_second,

        rate_limit_post:                data.site.site_view.local_site_rate_limit.post,
        rate_limit_post_per_second:     data.site.site_view.local_site_rate_limit.post_per_second,

        rate_limit_register:            data.site.site_view.local_site_rate_limit.register,
        rate_limit_register_per_second: data.site.site_view.local_site_rate_limit.register_per_second,

        rate_limit_search:              data.site.site_view.local_site_rate_limit.search,
        rate_limit_search_per_second:   data.site.site_view.local_site_rate_limit.search_per_second,
        
        allowed_instances: data.federated_instances?.allowed.map(
            (i:Instance) => {
                return i.domain;
            }
        ).sort() ?? [],

        blocked_instances: data.federated_instances?.blocked.map(
            (i:Instance) => {
                return i.domain;
            }
        ).sort() ?? [],

        taglines: [...(data.site?.taglines.map((t:Tagline) => t.content) ?? [])],
        federation_debug: false,
    }
     
    
    let saving = false
    let selected: 'general' | 'logo' | 'limits' |  'registration' | 'federation' | 'admins' | 'taglines' | 'sidebar' | 'legal' | 'slurs' = 'general';

    // Federation mode helper variable
    let federation_mode = (data?.federated_instances?.allowed && data.federated_instances.allowed.length > 0)
        ? 'allow'
        : 'block'
    
    // Tagline Helpers
    let newTagline = ''

    // Site logo and banner
    let siteIcon: FileList | undefined
    let siteBanner: FileList | undefined
    let siteIconPreviewURL:string
    let siteBannerPreviewURL:string

    // Submit the formData object
    async function save() {
        if (!$profile?.jwt){
            toast({
                content: "Not authorized",
                type: 'error',
                title: 'Unauthorized'
            })   
            return
        }

        if (!formData) return;
        
        saving = true
        
        // Parse all of the rate_limit_ keys as integers
        let keys = Object.keys(formData);
        for (let key of keys) {
            if (key.startsWith('rate_limit_')) {
                //@ts-ignore
                formData[key] = parseInt(formData[key]);
            }
        }

        // Upload icon and banner
        try {
            // Upload the site icon and banner if defined
            if (siteIcon) {
                formData.icon   =  (await getClient().uploadImage({image: siteIcon[0]}))?.url
            }
            
            if (siteBanner) {
                formData.banner = (await getClient().uploadImage({image: siteBanner[0]}))?.url
            }
        }
        catch {
            toast({
                content: "There was an error uploading the icon/banner image(s).",
                type: 'error',
                title: 'Error'
            });
            
            return;
        }
        
        // Submit the formData object to the editSite API endpoint        
        try {
            // Configure federation mode data and status
            if (formData) {
                // Clear allowed instances if federation mode selector is set to 'block' mode.
                if (federation_mode == 'block') {
                    formData.allowed_instances = [];
                }

                // If there are no domains in the allowed list, set federation mode to 'block' mode.
                if (formData?.allowed_instances && formData.allowed_instances.length < 1) {
                    federation_mode = 'block';
                }

            }
           

            await getClient().editSite({...formData})
            
            toast({
                content: 'Updated your site.',
                type: 'success',
                title: "Site Settings Saved"
            })
            
            // Reset the icon and banner helper variables
            siteIcon = undefined;
            siteBanner = undefined;
            siteIconPreviewURL = '';
            siteBannerPreviewURL = '';
            
            // Reload the admin page with the new values pulled from the server.
            goto('/admin/config',{ invalidateAll: true });

        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        saving = false
    }

    // Add/Remove Admin Helper Functions
    let newAdmin: string = ''
    let addingAdmin: boolean = false

    async function removeAdmin(id: number, confirm: boolean): Promise<any> {
        if (!confirm) {
            return toast({
                content: 'Are you sure you want to remove that admin?',
                action: () => removeAdmin(id, true),
            })
        }

        if (!$profile?.jwt) return
        
        addingAdmin = true;
        
        const result = await trycatch(() => getClient().addAdmin({
            added: false,
            person_id: id,
        }))

        addingAdmin = false;
        
        if (result) {
            data.site!.admins = result.admins
            toast({
                content: 'Removed that admin.',
                type: 'success',
            })
        }
    }

    async function addNewAdmin(): Promise<any> {
        if (!$profile?.jwt || newAdmin == '') return

        try {
            addingAdmin = true
            const r = await addAdmin(`${newAdmin}@${$instance}`, true, $profile.jwt)
        
            if (!r) {
                toast({
                    content: `Unable to add ${newAdmin} as an administrator.`,
                    type: 'error',
                })
                return;
            }
                
            toast({
                content: 'Successfully added that admin.',
                type: 'success',
            })
                
            if (data.site) {  data.site.admins = r.admins }
                
            newAdmin = ''
            addingAdmin = false
        }
        catch (err) {
            toast({
                    content: `Unable to add ${newAdmin} as an administrator.`,
                    type: 'error',
            })
        }

    }
    
    
</script>

<svelte:head>
  <title>Administration</title>
</svelte:head>

<form class="flex flex-col gap-4 p-2" >
    <h1 class="text-xl font-bold flex justify-between">
        <span class="flex flex-row items-center gap-2">
            <Icon src={CommandLine} mini width={36}/>
            {data?.site?.site_view?.site?.name ?? 'Instance'} Configuration 
        </span>

        <Button color="primary" class="h-8" icon={ArrowUpTray} loading={saving} disabled={saving} on:click={save}>
            Save
        </Button>
        
    </h1>

  
    
    {#if formData}
        <div class="flex flex-col lg:flex-row gap-2">
            <!---Section Selection Menu--->
            <div class="flex flex-shrink-0 flex-row w-full overflow-auto overflow-y-hidden py-2 lg:py-0 lg:flex-col lg:max-w-[15%] lg:justify-start gap-2">
                <Button
                    color="tertiary"
                    title="General"
                    alignment="left"
                    on:click={()=> { selected = 'general' }}
                >
                    <Icon src={Cog6Tooth} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">General</span>
                </Button>

                <Button
                    color="tertiary"
                    title="Logo and Banner"
                    alignment="left"
                    on:click={()=> { selected = 'logo' }}
                >
                    <Icon src={Photo} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">Logo/Banner</span>
                </Button>

                <Button
                    color="tertiary"
                    title="Registration"
                    alignment="left"
                    on:click={()=> { selected = 'registration' }}
                >
                    <Icon src={ClipboardDocumentCheck} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">Registration</span>
                </Button>

                <Button
                    color="tertiary"
                    title="Federation"
                    alignment="left"
                    on:click={()=> { selected = 'federation' }}
                >
                    <Icon src={Rss} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">Federation</span>
                </Button>

                
                <Button
                    color="tertiary"
                    title="Admin Team"
                    alignment="left"
                    on:click={()=> { selected = 'admins' }}
                >
                    <Icon src={UserGroup} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">Admin Team</span>
                </Button>
                
                
                <Button
                    color="tertiary"
                    title="Slur Filters"
                    alignment="left"
                    on:click={()=> { selected = 'slurs' }}
                >
                    <Icon src={Funnel} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">Slur Filters</span>
                </Button>

                <Button
                    color="tertiary"
                    title="Rate Limits"
                    alignment="left"
                    on:click={()=> { selected = 'limits' }}
                >
                    <Icon src={PauseCircle} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">Rate Limits</span>
                </Button>
                
                <Button
                    color="tertiary"
                    title="Taglines"
                    alignment="left"
                    on:click={()=> { selected = 'taglines' }}
                >
                    <Icon src={Megaphone} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">Taglines</span>
                </Button>

                <Button
                    color="tertiary"
                    title="Sidebar"
                    alignment="left"
                    on:click={()=> { selected = 'sidebar' }}
                >
                    <Icon src={InformationCircle} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">Sidebar</span>
                </Button>

                <Button
                    color="tertiary"
                    title="Legal"
                    alignment="left"
                    on:click={()=> { selected = 'legal' }}
                >
                    <Icon src={BuildingOffice} mini width={16} slot="icon"/>
                    <span class="hidden lg:block">Legal</span>
                </Button>
            </div>
            <!--- End Section Selection Menu--->

            <!---Section Panels--->
            <div class="flex flex-col w-full lg:w-[85%]">
                
                <!---General Options--->
                <div class:hidden={selected!='general'}>
                    <Setting>
                        <span class="flex flex-row gap-2" slot="title">
                            <Icon src={Cog6Tooth} mini width={24} />
                            General Options
                        </span>
                        <span slot="description" class="text-xs font-normal">
                            Configure the primary attributes of your site.
                        </span>
                        
                        <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">

                            <!---Site Name--->
                            <div class="flex flex-col md:flex-row w-full gap-2 py-2">
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={Identification} mini width={16}/>
                                        Site Name
                                    </p>
                                    <p class="text-xs font-normal">The name of your Lemmy instance.</p>
                                    <p class="text-xs font-normal"><span class="font-bold">Maximum length</span>: 20 characters.</p>
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
                                    <p class="text-xs font-normal">A short description of your site, motto, or other tagline to show with the site name.</p>
                                    <p class="text-xs font-normal"><span class="font-bold">Maximum length</span>: 150 characters.</p>
                                </div>
                                
                                <div class="mx-auto"/>
                                
                                <TextArea bind:value={formData.description} maxlength={150} class="w-full md:w-[250px]"/>
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

                            
                        </div>

                    </Setting>
                </div>

                <!---Logo/Banner--->
                <div class:hidden={selected!='logo'}>
                    <Setting>
                        <span class="flex flex-row gap-2" slot="title">
                            <Icon src={Photo} mini width={24} />
                            Site Logo and Banner
                        </span>
                        <span slot="description" class="text-xs font-normal">
                            <p>Configure your instance logo and banner images.</p>
                        </span>
                        
                        <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">

                            <!---Logo--->
                            <div class="flex flex-col w-full gap-2 py-2">
                                <div class="flex flex-col w-full">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={Camera} mini width={16}/>
                                        Site Logo
                                    </p>
                                    <p class="text-xs font-normal">
                                        The logo shown for your Lemmy instance. 
                                    </p>
                                </div>
                                
                                <!--- Old and New Logo Displays and upload button--->
                                <div class="flex flex-col lg:flex-row w-full gap-2 justify-between">
                                    
                                    <div class="flex flex-row justify-between w-full lg:w-2/3">                                    
                                        {#if formData?.icon}
                                            <div class="mt-2 gap-2 mx-auto lg:mx-0 w-[130px] inline-block relative">
                                            
                                                <p class="text-sm font-bold">
                                                    Current
                                                </p>
                                                <Avatar url={formData?.icon} width={96} circle={false} />
                                                
                                                <div class="mt-2 px-4">
                                                    <Button class="!px-1 absolute top-[18px] right-0" color="danger" on:click={() => { 
                                                            if (formData) formData.icon = ''
                                                            siteIcon = undefined; 
                                                            
                                                        }}
                                                    >
                                                        <Icon src={Trash} mini width={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        {/if}
                                        
                                        
                                        {#if siteIconPreviewURL}
                                            <div class="mt-2 gap-2 mx-auto lg:mx-0 w-[130px] inline-block relative">
                                                <p class="text-sm font-bold">
                                                    New
                                                </p>
                                                <Avatar url={siteIconPreviewURL} width={96} circle={false} />
                                                
                                                <div class="mt-2 px-4">
                                                    <Button class="!px-1 absolute top-[18px] right-0" color="danger" on:click={() => { siteIconPreviewURL = ''; siteIcon = undefined; }}>
                                                        <Icon src={Trash} mini width={16} /> 
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                        {/if}

                                        <!--Placeholder for spacing--->
                                        {#if formData?.icon && siteIconPreviewURL}
                                            <div class="hidden lg:block"/>
                                        {/if}
                                    </div>

                                    <div class="mt-2 flex flex-col gap-2 w-full lg:w-auto lg:ml-auto  mt-auto mb-auto">
                                        <FileInput class="flex items-center" image bind:files={siteIcon} bind:previewURL={siteIconPreviewURL} preview={false}/>
                                    </div>
                                </div>

                            </div>

                            <!---Banner--->
                            <div class="flex flex-col w-full gap-2 py-2">
                                <div class="flex flex-col w-full">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={Camera} mini width={16}/>
                                        Site Banner
                                    </p>
                                    <p class="text-xs font-normal">Select the banner shown for your instance (when acccessed by a frontend that utilizes the banner).</p>
                                </div>
                                
                                <!--- Old and New Banner Displays and upload button--->
                                <div class="flex flex-col lg:flex-row w-full gap-2 justify-between">
                                    
                                    <div class="flex flex-row gap-4 w-full lg:w-2/3">                                    
                                        {#if formData?.banner}
                                        <div class="mt-2 gap-2 mx-auto lg:mx-0 inline-block relative">
                                            
                                                <p class="text-sm font-bold">
                                                    Current
                                                </p>
                                                <div class="w-full">
                                                    <img src="{formData.banner}" class="w-full h-auto" alt="Site banner"/>
                                                    
                                                    <div class="mt-2 px-4">
                                                        <Button class="!px-1 absolute top-[22px] right-0" color="danger" on:click={() => { 
                                                                if (formData) formData.banner = ''
                                                                siteBanner = undefined; 
                                                            }}
                                                        >
                                                            <Icon src={Trash} mini width={16} /> 
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        {/if}
                                        
                                        
                                        {#if siteBannerPreviewURL}
                                        <div class="mt-2 gap-2 mx-auto lg:mx-0 inline-block relative">
                                                <p class="text-sm font-bold">
                                                    New
                                                </p>
                                                <div class="w-full">
                                                    <img src="{siteBannerPreviewURL}" class="w-full h-auto" alt="Site banner"/>
                                                    
                                                    <div class="mt-2 px-4">
                                                        <Button class="!px-1 absolute top-[22px] right-0" color="danger" on:click={() => { siteBannerPreviewURL = ''; siteBanner = undefined; }}> 
                                                            <Icon src={Trash} mini width={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        {/if}
                                    </div>

                                    <div class="mt-2 flex flex-col gap-2 w-full lg:w-auto lg:ml-auto mt-auto mb-auto">
                                        <FileInput class="flex items-center" image bind:files={siteBanner} bind:previewURL={siteBannerPreviewURL} preview={false}/>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Setting>
                </div>

                <!---Registration Options--->
                <div class:hidden={selected!='registration'}>
                    <Setting>
                        <span class="flex flex-row gap-2" slot="title">
                            <Icon src={ClipboardDocumentCheck} mini width={24} />
                            Registration Options
                        </span>
                        <span slot="description" class="text-xs font-normal">
                            Configure the requirements for the signup process.
                        </span>
                        
                        <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                            
                            {#if 
                                formData.registration_mode == 'Open' &&
                                (!formData.captcha_enabled || formData.captcha_difficulty != 'hard' || !formData.require_email_verification)
                            }
                            <div class="flex flex-col p-2 gap-4 bg-yellow-400/30 text-zinc-950 dark:text-slate-100 rounded-md">
                                <span class="text-sm font-normal">
                                    <span class="flex flex-row gap-2 items-center">
                                        <Icon src={ExclamationTriangle} mini width={28}/>
                                        <p class="font-bold">Warning:  This configuration is insecure!</p>
                                    </span>
                                    <p class="pl-[2.3rem]">
                                        Open registration with no or weak captchas and/or no email verification is an invitation to spammers.  Instances using this configuration are quickly
                                        discovered and overrun with spam accounts. To avoid that, please consider stronger signup requirements.
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
                                <!---
                                    selectedFunc={() => {
                                        if (formData?.captcha_enabled && formData?.captcha_difficulty) { return formData.captcha_difficulty.toLowerCase(); }
                                        if (formData?.captcha_enabled && !formData?.captcha_difficulty) { return 'easy'; }
                                        if (!formData?.captcha_enabled) { return 'off'; }
                                    }}
                                --->
                                <MultiSelect
                                    items={0}
                                    headless={true}
                                    options={['off', 'easy', 'medium', 'hard']}
                                    optionNames={['Off', 'Easy', 'Medium', 'Hard']}
                                    selected = {
                                        formData.captcha_enabled
                                        ? formData.captcha_difficulty
                                            ? formData.captcha_difficulty.toLowerCase()
                                            : 'easy'
                                        : 'off'
                                    }
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

                <!---Federation Options--->
                <div class:hidden={selected!='federation'}>
                    <Setting>
                        <span class="flex flex-row gap-2" slot="title">
                            <Icon src={Rss} mini width={24} />
                            Federation
                        </span>
                        <span slot="description" class="text-xs font-normal">
                            Enable or disable federation and control what instances to federate with.
                        </span>
                        
                        <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">

                            <!---Federation Enabled--->
                            <div class="flex flex-row w-full gap-2 py-2">
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={ArrowsRightLeft} mini width={16}/>
                                        Enable Federation
                                    </p>
                                    <p class="text-xs font-normal">
                                        If federation is disabled, your instance will not interact with any others; only users of your instance will be able to interact with it.
                                    </p>
                                </div>
                                
                                <div class="mx-auto"/>
                                
                                <Switch bind:enabled={formData.federation_enabled}  defaultValue={true}/>
                            </div>

                            <!---Federation Debug Mode--->
                            <div class="flex flex-row w-full gap-2 py-2" class:hidden={!formData.federation_enabled}>
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={BugAnt} mini width={16}/>
                                        Federation Debug Mode
                                    </p>
                                    <p class="text-xs font-normal">
                                        Enable federation debug to show content of ActivityPub messages in the Lemmy server logs.
                                    </p>
                                </div>
                                
                                <div class="mx-auto"/>
                                
                                <Switch bind:enabled={formData.federation_debug}  defaultValue={false}/>
                            </div>
                            
                            <!---Federation Mode--->
                            <div class="flex flex-row w-full gap-2 py-2" class:hidden={!formData.federation_enabled}>
                                
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={ShieldCheck} mini width={16}/>
                                        Federation Mode
                                    </p>
                                    <p class="text-xs font-normal">
                                        <span class="font-bold">Block List Mode</span>: Federate with any instances <em>except</em> the ones on the block list
                                    </p>
                                    
                                    <p class="text-xs font-normal">
                                        <span class="font-bold">Allow List Mode</span>: Federate <em>only</em> with the instances on the allow list.
                                    </p>
                                </div>
                                
                                <div class="mx-auto"/>
                                
                                <MultiSelect
                                    options={['allow', 'block']}
                                    optionNames={['Allow List', 'Block List']}
                                    selected={federation_mode}
                                    items={0}
                                    headless={true}
                                    class="min-w-[180px]"
                                    on:select={(e) => {
                                        // @ts-ignore
                                        federation_mode = e.detail
                                        federation_mode = federation_mode;
                                    }}
                                />
                            </div>

                            {#if formData.federation_enabled}
                                <!--- Federation Blocklists --->
                                <div class="flex w-full gap-2 py-2">
                                    <SettingEditArray 
                                        bind:list={formData.blocked_instances}
                                        condition={federation_mode == 'block'}
                                        title="Blocked Instances"
                                        description="Block the following instances from interacting with yours. You can enter multiple 
                                            domains by separating them with a comma. You can also paste in a comma-delimited list of 
                                            domains to block. Any duplicates will be ignored."
                                        icon={NoSymbol}
                                        textInputPlaceholder="Domain to Block"
                                        filterable={true}
                                        showPlaceholder={true}
                                        placeholderText="You have not blocked any domains."
                                        placeholderTitle="No Blocked Domains"
                                        placeholderIcon={ServerStack}
                                    />

                                    <SettingEditArray 
                                        bind:list={formData.allowed_instances}
                                        condition={federation_mode == 'allow'}
                                        title="Allowed Instances"
                                        description="Allow the following instances to interact with yours.   You can enter multiple domains by separating them with a comma.
                                            You can also paste in a comma-delimited list of domains to allow. Any duplicates will be ignored.
                                            Note that at least one domain has to be allowed before federation mode can be set to 'allow' mode.  If you do not want to federate with anyone,
                                            you should disable federation instead.
                                            "
                                        icon={Check}
                                        textInputPlaceholder="Domain to Allow"
                                        filterable={true}
                                        showPlaceholder={true}
                                        placeholderText="You have not allowed any domains."
                                        placeholderTitle="No Allowed Domains"
                                        placeholderIcon={ServerStack}
                                    />
                                </div>

                            {/if}
                        </div>
                    </Setting>
                </div>

                <!---Manage Instance Admins--->
                <div class:hidden={selected!='admins'}>
                    <Setting>
                        <span class="flex flex-row gap-2" slot="title">
                            <Icon src={UserGroup} mini width={24} />
                            Instance Administrators
                        </span>

                        <span slot="description" class="text-xs font-normal">
                            Only local users can be added as admins.
                        </span>
                        
                        <!---Admin Team--->
                        <div class="flex flex-col lg:flex-row w-full gap-2 py-2">
                            <div class="flex flex-col w-full lg:w-1/3">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={UserPlus} mini width={16}/>
                                    Admin Team
                                </p>
                                <p class="text-xs font-normal">
                                    The users shown here are administrators of this instance.
                                </p>
                            </div>
                            
                        
                            {#if data.site}
                            <div class="flex flex-col gap-4 w-full lg:w-2/3">
                                <EditableList let:action on:action={(e) => removeAdmin(e.detail, false)}>
                                    {#if data.site.admins.length <= 0}
                                        <Placeholder
                                            icon={QuestionMarkCircle}
                                            title="No admins"
                                            description="Somehow there's no admins of this site. How?!"
                                        />
                                    {:else}
                                        {#each data.site?.admins ?? [] as admin}
                                            <div class="py-3 flex items-center justify-between">
                                                <UserLink avatar showInstance={false} user={admin.person} distinguishAdminsMods={false}/>
                                                <Button icon={Trash} size="square-md" 
                                                    on:click={() => action(admin.person.id)}
                                                />
                                            </div>
                                        {/each}
                                    {/if}
                                </EditableList>
                        
                                <form class="flex flex-row items-center gap-2 mt-auto w-full"
                                    on:submit|preventDefault={addNewAdmin}
                                >
                                    <TextInput
                                        bind:value={newAdmin}
                                        placeholder="@user"
                                        class="flex-1"
                                        pattern={'@[^ |]{1,}'}
                                    />
                                    <Button
                                        loading={addingAdmin}
                                        disabled={addingAdmin}
                                        icon={Plus}
                                        size="md"
                                        class="h-full"
                                        submit
                                    >
                                        Add Admin
                                    </Button>
                                </form>
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
                        
                        <span slot="description" class="text-xs font-normal">
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

                <!---Rate Limits--->
                <div class:hidden={selected!='limits'}>
                    <Setting>
                        <span class="flex flex-row gap-2" slot="title">
                            <Icon src={PauseCircle} mini width={24} />
                            Rate Limits
                        </span>
                        <span slot="description" class="text-xs font-normal">
                            <p>
                                Configure rate limiting for your instance. 
                            </p>
                            <p class="mt-2">
                                The value for the limit refers to the number of submissions per interval (defined in seconds). Example: a limit of 120 with an interval of 60 means a limit of 120 requests per 60 seconds per IP.
                            </p>
                            <p class="mt-2">
                                Rate limts are applied for client to API requests and are per IP address of the client. Make sure you are correctly setting your X-Forwarded-For header in
                                your reverse proxy so that Lemmy limits the correct client IP and not the IP of your load balancer.
                            </p>
                        </span>
                        
                        <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">

                            <!---Posts--->
                            <div class="flex flex-col md:flex-row w-full gap-2 py-2">
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={Window} mini width={16}/>
                                        Posts
                                    </p>
                                    <p class="text-xs font-normal">The number of requests to allow to API endpoints covered by the "post" bucket per client IP, per interval.</p>
                                    
                                    <details class="mt-2">
                                        <summary class="cursor-pointer">
                                            <span class="text-xs font-bold">API Endpoints</span>
                                        </summary>
                                        <ul class="list-disc pl-8 text-xs">
                                            <li>/api/v3/post/create_post</li>
                                            <li>/api/v3/user/get_captcha</li>
                                        </ul>
                                        
                                    </details>
                                </div>
                                
                                <div class="mx-auto"/>
                                
                                <div class="flex flex-row gap-2">
                                    <TextInput type="number" bind:value={formData.rate_limit_post} min={1} max={9999} class="w-full" label="Limit"/>
                                    <TextInput type="number" bind:value={formData.rate_limit_post_per_second} min={1} max={9999} class="w-full" label="Interval"/>
                                </div>
                            </div>

                            <!---Comments--->
                            <div class="flex flex-col md:flex-row w-full gap-2 py-2">
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={ChatBubbleLeft} mini width={16}/>
                                        Comments
                                    </p>
                                    <p class="text-xs font-normal">The number of requests to allow to API endpoints covered by the "comment" bucket per client IP, per interval.</p>

                                    <details class="mt-2">
                                        <summary class="cursor-pointer">
                                            <span class="text-xs font-bold">API Endpoints</span>
                                        </summary>
                                        <ul class="list-disc pl-8 text-xs">
                                            <li>/api/v3/comment/create_comment</li>
                                        </ul>
                                        
                                    </details>
                                </div>
                                
                                <div class="mx-auto"/>
                                <div class="flex flex-row gap-2">
                                    <TextInput type="number" bind:value={formData.rate_limit_comment} min={1} max={9999} class="w-full" label="Limit"/>
                                    <TextInput type="number" bind:value={formData.rate_limit_comment_per_second} min={1} max={9999} class="w-full" label="Interval"/>
                                </div>
                            </div>

                            <!---Images--->
                            <div class="flex flex-col md:flex-row w-full gap-2 py-2">
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={Photo} mini width={16}/>
                                        Images
                                    </p>
                                    <p class="text-xs font-normal">The number of requests to allow to API endpoints covered by the "image" bucket per client IP, per interval.</p>
                                    <details class="mt-2">
                                        <summary class="cursor-pointer">
                                            <span class="text-xs font-bold">API Endpoints</span>
                                        </summary>
                                        <ul class="list-disc pl-8 text-xs">
                                            <li>/api/v3/pictrs/image</li>
                                        </ul>
                                        
                                    </details>
                                </div>
                                
                                <div class="mx-auto"/>
                                <div class="flex flex-row gap-2">
                                    <TextInput type="number" bind:value={formData.rate_limit_image} min={1} max={9999} class="w-full" label="Limit"/>
                                    <TextInput type="number" bind:value={formData.rate_limit_image_per_second} min={1} max={9999} class="w-full" label="Interval"/>
                                </div>
                            </div>

                            <!---Messages--->
                            <div class="flex flex-col md:flex-row w-full gap-2 py-2">
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={AtSymbol} mini width={16}/>
                                        Messages
                                    </p>
                                    <p class="text-xs font-normal">The number of requests to allow to API endpoints covered by the "message" bucket per client IP, per interval.</p>
                                    <p class="mt-2 text-xs font-normal">
                                        The "message" bucket is used for the general limit that applies to all endpoints which don't have a more specific limit.
                                    </p>
                                    <details class="mt-2">
                                        <summary class="cursor-pointer">
                                            <span class="text-xs font-bold">API Endpoints</span>
                                        </summary>
                                        <ul class="list-disc pl-8 text-xs">
                                            <li>/api/v3/site</li>
                                            <li>/api/v3/modlog</li>
                                            <li>/api/v3/resolve_object</li>
                                            <li>/api/v3/community/* (except create_community)</li>
                                            <li>/api/v3/federated_instances</li>
                                            <li>/api/v3/post/* (except create_post)</li>
                                            <li>/api/v3/comment/* (except create_comment)</li>
                                            <li>/api/v3/private_message</li>
                                            <li>/api/v3/user (except export_/import_settings and register)</li>
                                            <li>/api/v3/admin/*</li>
                                            <li>/api/v3/custom_emoji/*</li>
                                            <li>/sitemap.xml</li>
                                        </ul>
                                        
                                    </details>
                                </div>
                                
                                <div class="mx-auto"/>
                                <div class="flex flex-row gap-2">
                                    <TextInput type="number" bind:value={formData.rate_limit_message} min={1} max={9999} class="w-full" label="Limit"/>
                                    <TextInput type="number" bind:value={formData.rate_limit_message_per_second} min={1} max={9999} class="w-full" label="Interval"/>
                                </div>
                            </div>

                            <!---Search--->
                            <div class="flex flex-col md:flex-row w-full gap-2 py-2">
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={MagnifyingGlass} mini width={16}/>
                                        Search
                                    </p>
                                    <p class="text-xs font-normal">The number of requests to allow to API endpoints covered by the "search" bucket per client IP, per interval.</p>
                                    <details class="mt-2">
                                        <summary class="cursor-pointer">
                                            <span class="text-xs font-bold">API Endpoints</span>
                                        </summary>
                                        <ul class="list-disc pl-8 text-xs">
                                            <li>/api/v3/search</li>
                                        </ul>
                                    </details>
                                </div>
                                
                                <div class="mx-auto"/>
                                <div class="flex flex-row gap-2">
                                    <TextInput type="number" bind:value={formData.rate_limit_search} min={1} max={9999} class="w-full" label="Limit"/>
                                    <TextInput type="number" bind:value={formData.rate_limit_search_per_second} min={1} max={9999} class="w-full" label="Interval"/>
                                </div>
                            </div>

                            <!---Register--->
                            <div class="flex flex-col md:flex-row w-full gap-2 py-2">
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={UserPlus} mini width={16}/>
                                        Register
                                    </p>
                                    <p class="text-xs font-normal">The number of requests to allow to API endpoints covered by the "register" bucket per client IP, per interval.</p>
                                    <details class="mt-2">
                                        <summary class="cursor-pointer">
                                            <span class="text-xs font-bold">API Endpoints</span>
                                        </summary>
                                        <ul class="list-disc pl-8 text-xs">
                                            <li>/api/v3/community/create_community</li>
                                            <li>/api/v3/user/register</li>
                                        </ul>
                                        
                                    </details>
                                </div>
                                
                                <div class="mx-auto"/>
                                <div class="flex flex-row gap-2">
                                    <TextInput type="number" bind:value={formData.rate_limit_register} min={1} max={9999} class="w-full" label="Limit"/>
                                    <TextInput type="number" bind:value={formData.rate_limit_register_per_second} min={1} max={9999} class="w-full" label="Interval"/>
                                </div>
                            </div>

                            <!---Import/Export--->
                            <!--- 
                                Add for 0.19.x
                                import_user_settings bucket
                                /api/v3/user/export_settings
                                /api/v3/user/import_settings
                            --->
                        </div>
                    </Setting>
                </div>


                <!---Taglines--->
                <div class:hidden={selected!='taglines'}>
                    <Setting>
                        <span class="flex flex-row gap-2" slot="title">
                            <Icon src={Megaphone} mini width={24} />
                            Taglines
                        </span>
                        
                        <span slot="description" class="text-xs font-normal">
                            Taglines are rotating text values that appear in your side card or at the top of the site in Lemmy-UI. You can define any number of taglines,
                            and a random one will be shown on each load in most UIs.  In Tesseract, they will rotate every 30 seconds.
                        </span>
                        
                        <div class="flex flex-col gap-4">                    
                            
                            <div class="w-full">
                                <form class="flex flex-col mt-auto gap-2 w-full"
                                    on:submit|preventDefault={() => {
                                        if (newTagline == '' || !data.site) return
                                        formData.taglines = [...formData.taglines, newTagline]
                                        newTagline = ''
                                    }}
                                >
                                    <MarkdownEditor
                                        bind:value={newTagline}
                                        placeholder="Add a tagline"
                                        images={true} previewButton
                                        rows={7}
                                    >

                                        <Button size="lg" color="primary" class="ml-auto" slot="actions" submit>
                                            <Icon src={Plus} size="16" mini slot="icon" />
                                            Add
                                        </Button>

                                    </MarkdownEditor>
                                </form>
                            </div>

                            <div class="w-full mt-4">
                                
                                {#if formData.taglines?.length > 0}
                                    <EditableList divider={true} let:action
                                        on:action={(e) => {
                                            formData.taglines.splice( formData.taglines.findIndex((i) => i == e.detail), 1)
                                            formData.taglines = formData.taglines
                                        }}
                                    >
                                        <!--Loop over each tagline and render it-->
                                        <div class="flex flex-col mt-2 gap-2 items-center max-h-[250px] w-full overflow-y-scroll px-4">
                                            {#each formData.taglines as tagline}
                                                <div class="flex px-4 py-2 w-full rounded-md bg-slate-200 dark:bg-zinc-700">
                                                    <Markdown source={tagline} />
                                                    
                                                    <div class="flex gap-2 ml-auto">
                                                        <Button on:click={() => action(tagline)} color="ghost" class="border-none">
                                                            <Icon src={Trash} mini size="16" />
                                                        </Button>
                                                    </div>

                                                </div>
                                            {/each}
                                        </div>
                                    </EditableList>
                                {:else}
                                    <Placeholder icon={ChatBubbleBottomCenterText} title="No taglines" description="A random tagline will appear when users visit your instance." />
                                {/if}
                            </div>
                        </div>
                        
                    </Setting>

                </div>

                <!---Site Sidebar--->
                <div class:hidden={selected!='sidebar'}>
                    <Setting>
                        <span class="flex flex-row gap-2" slot="title">
                            <Icon src={InformationCircle} mini width={24} />
                            Sidebar
                        </span>
                        <span slot="description" class="text-xs font-normal">
                            <p>
                                The information to be displayed in the site sidebar.  Welcome your visitors, define the site rules, or otherwise provide a general
                                description of your instance.
                            </p>
                        </span>
                        
                        <div class="flex flex-col gap-4 w-full">
                                                            
                            <MarkdownEditor
                                previewButton
                                bind:value={formData.sidebar}
                                rows={15}
                            />
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
                        <span slot="description" class="text-xs font-normal">
                            <p>
                                The contents provided here will be used to generate what is shown on the /legal page 
                                of your instance.
                            </p>

                            <p>
                                Provide any relevant information such as DMCA contact points, privacy, data retention,
                                and any other policy that is applicable to your instance.
                            </p>
                        </span>
                        
                        <div class="flex flex-col gap-4 w-full">
                                   
                            <MarkdownEditor
                                previewButton
                                bind:value={formData.legal_information}
                                rows={15}
                            />

                        </div>
                    </Setting>
                </div>

            </div>

        </div>
    {/if}
</form>
