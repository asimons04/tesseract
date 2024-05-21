<script lang="ts">
    import type { UploadImageResponse } from 'lemmy-js-client';
    
    import { addSubscription } from '$lib/lemmy/user.js'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { imageProxyURL } from '$lib/image-proxy';
    import { instance } from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar from '$lib/components/ui/Avatar.svelte';
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte';
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte';
    import ImageUploadDeleteButton from '$lib/components/uploads/ImageUploadDeleteButton.svelte';
    import ImageUploadModal from '../modal/ImageUploadModal.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte';
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'
  
    import {
        Calendar,
        ChatBubbleOvalLeftEllipsis,
        ExclamationTriangle, 
        HandRaised,
        Icon,
        PencilSquare,
        UserGroup
    } from 'svelte-hero-icons'
    
    /** The community ID to edit. */
    export let edit: number | undefined = undefined

    export let formData: {
        name: string
        displayName: string
        icon: string | undefined
        banner: string | undefined
        sidebar: string
        nsfw: boolean
        postsLockedToModerators: boolean
        submitting: boolean
    } = {
        name: '',
        displayName: '',
        icon: undefined,
        banner: undefined,
        sidebar: '',
        nsfw: false,
        postsLockedToModerators: false,
        submitting: false,
    }

    async function submit() {
        if (!$profile?.jwt) return
        if ((!edit && formData.name == '') || formData.displayName == '') return

        formData.submitting = true
        
        let client = getClient()
        
        try {
            const res = edit
                ?   await client.editCommunity({
                        title: formData.displayName,
                        description: formData.sidebar,
                        nsfw: formData.nsfw,
                        posting_restricted_to_mods: formData.postsLockedToModerators,
                        icon: formData.icon,
                        banner: formData.banner,
                        community_id: edit,
                    })
                :   await client.createCommunity({
                        name: formData.name,
                        title: formData.displayName,
                        description: formData.sidebar,
                        nsfw: formData.nsfw,
                        posting_restricted_to_mods: formData.postsLockedToModerators,
                        icon: formData.icon,
                        banner: formData.banner,
                    })

            toast({
                content: `Your community was ${edit ? 'saved' : 'created'}.`,
                type: 'success',
                title: "Success"
            })

            goto($page.url, {invalidateAll: true})

            if (!edit) {
                if ($profile.user) {
                    $profile.user = {
                        ...$profile.user,
                        moderates: [
                            ...$profile.user.moderates,
                            {
                                community: res.community_view.community,
                                moderator: $profile.user.local_user_view.person,
                            },
                        ],
                    }

                    addSubscription(res.community_view.community, true)
                    goto(`/c/${res.community_view.community.name}@${new URL(res.community_view.community.actor_id).hostname}`)
                }
            }

        } 
        catch (err) {
            toast({
                content: err as any,
                type: 'error',
                title: 'Error'
            })
        }

        formData.submitting = false
    }

    let currentIcon = formData.icon
    let currentBanner = formData.banner
    
    let iconUpload: UploadImageResponse | undefined = undefined
    let deleteIconUpload: () => Promise<void>

    let bannerUpload: UploadImageResponse | undefined = undefined
    let deleteBannerUpload: () => Promise<void>
    
    let uploading = {
        icon: false,
        banner: false
    }
</script>

{#if uploading.icon}
    <ImageUploadModal bind:open={uploading.icon} purpose="Community Icon" useAltText={false} on:upload={(e) => {
        if(e.detail?.url) {
            iconUpload = e.detail
            formData.icon = e.detail.url
            uploading.icon = false
        }
    }}/>
{/if}

{#if uploading.banner}
    <ImageUploadModal bind:open={uploading.banner} purpose="Community Banner" useAltText={false} on:upload={(e) => {
        if(e.detail?.url) {
            bannerUpload = e.detail
            formData.banner = e.detail.url
            uploading.banner = false
        }
    }}/>
{/if}


<form on:submit|preventDefault={submit} class="flex flex-col gap-4 h-full">
    <span class="flex flex-row w-full justify-between">
        <h1 class="text-2xl font-bold">
            <slot name="formtitle">
                Create Community
            </slot>
        </h1>

        <Button submit color="primary" size="lg" class="mt-auto" loading={formData.submitting} disabled={formData.submitting} >
            {edit ? 'Save' : 'Create'}
        </Button>
    </span>
    
    
    <!---Name is not mutable after creation--->
    {#if !edit}
    <TextInput required label="Name" bind:value={formData.name} disabled={edit} maxlength={20}
        on:input={() => {
            formData.name = formData.name.toLowerCase().replaceAll(' ', '_')
        }}
    
    />
    {/if}

    <TextInput required label="Display name" bind:value={formData.displayName} maxlength={30}/>
    
    <span class="flex flex-col lg:flex-row gap-4 items-start">
        
        <!---Community Card Live Preview--->
        <div class="w-full lg:w-2/3">
            
            <Card backgroundImage={imageProxyURL(formData.banner, undefined, 'webp')}>
                <div class="flex flex-col gap-2 h-full">
                    
                    <!--- Commuinity Avatar, display name, and federation name--->
                    <div class="flex flex-row gap-3 items-start p-3">
                        <div class="flex-shrink-0">
                            <Avatar width={64} bind:url={formData.icon} alt="Icon for {formData.name}" community={true}/>
                        </div>

                        <div class="flex flex-col gap-0 w-full">
                            <div class="flex flex-row">
                                <h1 class="font-bold text-xl">
                                        {formData.displayName.replace('&amp;', '&') ?? formData.name}
                                </h1>
                            </div>
                                
                            <span class="dark:text-zinc-400 text-slate-600 text-xs">
                                !{formData.name}@{
                                    $page.params.name && $page.params.name.includes('@')
                                        ? $page.params.name.split('@')[1]
                                        : $instance
                                }
                            </span>
                        </div>
                    </div>
                    
                    <div class="mt-auto"/>

                    <!-- Community subscribers, counts. Random numbers are used since the real ones aren't available --->
                    <div class="flex flex-row p-3 mx-auto">
                        <div class="text-sm flex flex-row flex-wrap gap-8 mx-auto">
                            <span class="flex flex-row items-center gap-2" title="Created">
                                <Icon src={Calendar} width={16} height={16} mini />
                                <RelativeDate date={new Date().toISOString()} />
                            </span>

                            <span class="flex flex-row items-center gap-2" title="Subscribers">
                                <Icon src={UserGroup} width={16} height={16} mini />
                                <FormattedNumber number={Math.round(Math.random() * 10000)} />
                            </span>

                            <span class="flex flex-row items-center gap-2" title="Posts">
                                <Icon src={PencilSquare} width={16} height={16} mini />
                                <FormattedNumber number={Math.round(Math.random() * 10000)} />
                            </span>

                            <span class="flex flex-row items-center gap-2" title="Comments">
                                <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                                <FormattedNumber number={Math.round(Math.random() * 10000)} />
                            </span>
                        </div>
                    </div>
                </div>

            </Card>

            <!--<FileInput label="Banner" bind:files={formData.banner} image preview previewURL={formData.currentBanner} class="w-full"/>-->
        </div>

        <div class="flex flex-col gap-2 w-full lg:w-1/3">
            <div class="flex flex-row gap-2 w-full items-center">
                <Button color="primary" size="lg" class="w-full" disabled={iconUpload} on:click={() => uploading.icon = true }>
                    {formData.icon ? 'Change' : 'Upload'} Icon
                </Button>

                <!---Icon Upload Delete Button--->
                <ImageUploadDeleteButton bind:uploadResponse={iconUpload} bind:deleteImage={deleteIconUpload} iconSize={18} on:delete={(e) => {
                        if (e.detail) formData.icon = currentIcon
                    }}
                />
            </div>
            
            <div class="flex flex-row gap-2 w-full items-center">
                <Button color="primary" size="lg" class="w-full" disabled={bannerUpload} on:click={() => uploading.banner = true }>
                    {formData.banner ? 'Change' : 'Upload'} Banner
                </Button>

                <!---Icon Upload Delete Button--->
                <ImageUploadDeleteButton bind:uploadResponse={bannerUpload} bind:deleteImage={deleteBannerUpload} iconSize={18} on:delete={(e) => {
                        if (e.detail) formData.banner = currentBanner
                    }}
                />
            </div>
        </div>
    </span>

    <MarkdownEditor previewButton label="Sidebar" bind:value={formData.sidebar} rows={10}/>

    <SettingToggleContainer>
        <SettingToggle icon={ExclamationTriangle} title="NSFW" bind:value={formData.nsfw}
            description="Enable this option if the community contains content that is generally not safe for work."
        />
        
        <SettingToggle icon={HandRaised} title="Only Moderators Can Post" bind:value={formData.postsLockedToModerators}
            description="When enabled, this option restricts posting in the community to moderators only."
        />
        
    </SettingToggleContainer>


</form>
