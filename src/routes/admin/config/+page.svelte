<script lang="ts">
    import { profile } from '$lib/auth.js'
    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { getClient } from '$lib/lemmy.js'
    import type { EditSite, GetFederatedInstances } from 'lemmy-js-client'
    import type { PageData } from './$types.js'
    import SectionTitle from '$lib/components/ui/SectionTitle.svelte'

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
</script>

<svelte:head>
  <title>Administration</title>
</svelte:head>

<form class="flex flex-col gap-4" on:submit|preventDefault={save}>
    <h1 class="flex flex-row justify-between">
        <span class="font-bold text-2xl">Site Configuration</span>
        
        <Button color="primary" loading={saving} disabled={saving} submit>
            Save
        </Button>
    </h1>
    {#if formData}
        
        <div class="flexrow">
            <div class="flexcol flexcol-50 mt-2">
                <TextInput bind:value={formData.name} label="Name" />
                <span class="mb-2"></span>
                <TextInput bind:value={formData.description} label="Description" />
            </div>

            <div class="flexcol flexcol-50  mt-2">
                <p class="font-bold">Site Options</p>
                <hr class="mb-1 border-zinc-400"/>
                
                <div class="flexrow">
                    <div class="flexcol">
                        <Checkbox bind:checked={formData.enable_downvotes} defaultValue={true}>
                            Enable downvotes
                        </Checkbox>
                
                        <Checkbox bind:checked={formData.enable_nsfw} defaultValue={true}>
                            Enable NSFW
                        </Checkbox>
                
                        <Checkbox bind:checked={formData.community_creation_admin_only} defaultValue={true}>
                            Only admins can create communities
                        </Checkbox>

                        <Checkbox bind:checked={formData.hide_modlog_mod_names} defaultValue={true}>
                            Hide modlog mod names
                        </Checkbox>
                    </div>

                    <div class="flexcol">
                        <Checkbox bind:checked={formData.reports_email_admins} defaultValue={true}>
                            Email admins on receiving new reports
                        </Checkbox>
                
                        <Checkbox bind:checked={formData.private_instance} defaultValue={true}>
                            Private instance
                        </Checkbox>
                    
                        <Checkbox bind:checked={formData.federation_enabled} defaultValue={true}>
                            Federation enabled
                        </Checkbox>
                    </div>
                </div>
            </div>
        </div>
        
        <p class="mt-2 font-bold">Registration Options</p>
        <hr class="border-zinc-400"/>
        
        

        <div class="flexrow">
            <div class="flexcol flexcol-30 mt-2">

                <div class="flexrow">
                    <div class="flexcol mt-2">
                        <!--- Registration Mode--->
                        <SelectMenu
                            label="Registration Mode"
                            alignment="top-left"
                            options={['Closed', 'RequireApplication', 'Open']}
                            optionNames={['Closed', 'Require Application', 'Open Registration']}
                            selected={formData.registration_mode ?? 'Open'}
                            on:select={(e) => {
                                // @ts-ignore
                                formData.registration_mode = e.detail
                            }}
                        />
                    </div>

                    <div class="flexcol mt-2">
                        <!--- Captcha State and Difficulty--->
                        {#if formData.registration_mode != 'Closed'}
                            <SelectMenu
                                label="Captcha"
                                alignment="top-left"
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
                        {/if}
                    </div>
                </div>

                <div class="mt-2">
                    {#if formData.registration_mode != 'Closed'}
                        <p class="font-bold">Email</p>
                        <hr class="mb-1 border-zinc-400"/>
                        <Checkbox bind:checked={formData.require_email_verification} defaultValue={true}>
                            Require email verification
                        </Checkbox>
                    {/if}
                    
                    {#if formData.registration_mode == 'RequireApplication'}
                        <Checkbox bind:checked={formData.application_email_admins} defaultValue={true}>
                            Email admins on receiving new applications
                        </Checkbox>
                    {/if}
                </div>
            </div>
            
            <div class="flexcol flexcol-70 mt-2">
                {#if formData.registration_mode == 'RequireApplication'}
                    <MarkdownEditor
                        previewButton
                        label="Application Question"
                        bind:value={formData.application_question}
                    />
                {/if}
            </div>
        </div>




        <hr class="border-zinc-400"/>

        <TextInput
            bind:value={formData.slur_filter_regex}
            label="Slur Filter Regex"
            placeholder="(word1|word2)"
        />


        <!--- Sidebar and Legal Page Content--->
        <div class="flexrow">
            <div class="flexcol mt-2">
                <MarkdownEditor
                    previewButton
                    bind:value={formData.sidebar}
                    label="Sidebar Content"
                    rows={15}
                />
            </div>

            <div class="flexcol mt-2">
                <MarkdownEditor
                    previewButton
                    bind:value={formData.legal_information}
                    label="Legal Page Content"
                    rows={15}
                />
            </div>
        </div>
    
       
        


        
        
        
    {/if}

    
</form>
