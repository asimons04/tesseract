<script lang="ts">
    
    import { deleteCommunity } from '$lib/components/lemmy/community/helpers'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { amMod, isAdmin, isTopMod } from '$lib/components/lemmy/moderation/moderation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { refreshProfile } from '$lib/lemmy/user.js';
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import CommunityForm from '$lib/components/lemmy/community/CommunityForm.svelte'
    import SettingButton from '$lib/components/ui/settings/SettingButton.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte';

    import { Trash } from 'svelte-hero-icons'

    export let data

    async function takeOverCommunity() {
        if (!$profile?.user || !isAdmin($profile.user)) return

        // Add yourself as a mod to the community (ignore error and let fall through to next try block
        try {
            await getClient().addModToCommunity({
                added: true,
                person_id: $profile.user.local_user_view.person.id,
                community_id: data.community.community_view.community.id,
            })
        }
        catch {}

        try {
            const res = await getClient().transferCommunity({
                community_id: data.community.community_view.community.id,
                person_id: $profile.user?.local_user_view.person.id
            })

            data.community.moderators = res.moderators
        }
        catch (err) {
            toast({
                type: 'error',
                title: 'Error',
                content: err as any
            })
        }
    }
</script>

<svelte:head>
    <title>Community Settings</title>
</svelte:head>

<div class="flex flex-col gap-4">
    <CommunityForm
        edit={data.community.community_view.community.id}
        formData={{
            name: data.community.community_view.community.name,
            displayName: data.community.community_view.community.title,
            nsfw: data.community.community_view.community.nsfw,
            postsLockedToModerators:
            data.community.community_view.community.posting_restricted_to_mods,
            sidebar: data.community.community_view.community.description ?? '',
            icon: data.community.community_view.community.icon,
            banner: data.community.community_view.community.banner,
            submitting: false,
        }}
    >
        <svelte:fragment slot="formtitle">Settings</svelte:fragment>
    </CommunityForm>
    
    <span class="flex w-full border-t" />
        <SettingToggleContainer>
            {#if isTopMod($profile?.user, data.community) || isAdmin($profile?.user)}
            
                <SettingButton icon={Trash} 
                    color={data.community.community_view.community.deleted ? 'success' : 'danger'}
                    title="{data.community.community_view.community.deleted ? 'Restore' : 'Delete'} Community" 
                    description="{data.community.community_view.community.deleted ? 'Restore' : 'Delete'} Community"
                    disabled={!isTopMod($profile?.user, data.community)}
                    on:click={ async() => {
                        data.community.community_view.community.deleted = await deleteCommunity(data.community.community_view.community.id, !data.community.community_view.community.deleted)
                        goto($page.url, {invalidateAll: true})
                    }}
                />
            {/if}

            {#if isAdmin($profile?.user)}
                <SettingButton icon={Trash} 
                    color="primary"
                    title="Takeover Community" 
                    description="Set your account as the top mod for this community. This will allow you to delete/restore it. To set a new top mod, use the 
                        'Team' panel."
                    disabled={isTopMod($profile?.user, data.community)}
                    on:click={ async() => {
                        await takeOverCommunity()                        
                        goto($page.url, {invalidateAll: true})
                    }}
                />
            {/if}
        </SettingToggleContainer>
    
</div>
