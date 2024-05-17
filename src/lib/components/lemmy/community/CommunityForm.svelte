<script lang="ts">
    import { addSubscription } from '$lib/lemmy/user.js'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Button from '$lib/components/input/Button.svelte'
    import FileInput from '$lib/components/input/FileInput.svelte'

    import TextInput from '$lib/components/input/TextInput.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'
  
    import {
        ExclamationTriangle, 
        HandRaised

    } from 'svelte-hero-icons'
  
  

    /** The community ID to edit. */
    export let edit: number | undefined = undefined

    export let formData: {
        name: string
        displayName: string
        icon: FileList | null
        banner: FileList | null
        sidebar: string
        nsfw: boolean
        postsLockedToModerators: boolean
        submitting: boolean
        currentIcon: string | null
        currentBanner:string | null
    } = {
        name: '',
        displayName: '',
        icon: null,
        banner: null,
        sidebar: '',
        nsfw: false,
        postsLockedToModerators: false,
        submitting: false,
        currentIcon: null,
        currentBanner: null
    }

    async function submit() {
        if (!$profile?.jwt) return
        if ((!edit && formData.name == '') || formData.displayName == '') return

        formData.submitting = true
        
        let client = getClient()
        
        try {
            let icon = formData.icon 
                ? (await client.uploadImage({image:formData.icon[0]}))?.url
                : undefined

            let banner = formData.banner
                ? (await client.uploadImage({image:formData.banner[0]}))?.url
                : undefined

            const res = edit
                ?   await client.editCommunity({
                        title: formData.displayName,
                        description: formData.sidebar,
                        nsfw: formData.nsfw,
                        posting_restricted_to_mods: formData.postsLockedToModerators,
                        icon: icon,
                        banner: banner,
                        community_id: edit,
                    })
                :   await client.createCommunity({
                        name: formData.name,
                        title: formData.displayName,
                        description: formData.sidebar,
                        nsfw: formData.nsfw,
                        posting_restricted_to_mods: formData.postsLockedToModerators,
                        icon: icon,
                        banner: banner,
                    })

            toast({
                content: `Your community was ${edit ? 'saved' : 'created'}.`,
                type: 'success',
                title: "Success"
            })

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
</script>



<form on:submit|preventDefault={submit} class="flex flex-col gap-4 h-full">
    <slot name="formtitle">
        <h1 class="text-2xl font-bold">Create Community</h1>
    </slot>
    
    <!---Name is not mutable after creation--->
    {#if !edit}
    <TextInput required label="Name" bind:value={formData.name} disabled={edit} maxlength={20}
        on:input={() => {
            formData.name = formData.name.toLowerCase().replaceAll(' ', '_')
        }}
    
    />
    {/if}

    <TextInput required label="Display name" bind:value={formData.displayName} />
    
    <span class="flex flex-col lg:flex-row gap-4 items-start">
        <div class="w-full lg:w-1/3">
            <FileInput label="Icon" bind:files={formData.icon} image preview previewURL={formData.currentIcon} class="w-full"/>
        </div>

        <div class="w-full lg:w-2/3">
            <FileInput label="Banner" bind:files={formData.banner} image preview previewURL={formData.currentBanner} class="w-full"/>
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

    <Button submit color="primary" size="lg" class="mt-auto" loading={formData.submitting} disabled={formData.submitting} >
        {edit ? 'Save' : 'Create'}
    </Button>
</form>
