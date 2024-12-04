<script lang="ts">
    
    import { deleteCommunity } from '$lib/components/lemmy/community/helpers'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { amMod, isAdmin, isTopMod } from '$lib/components/lemmy/moderation/moderation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import CommunityForm from '$lib/components/lemmy/community/CommunityForm.svelte'
    import SettingButton from '$lib/components/ui/settings/SettingButton.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte';

    import { CursorArrowRays, Eye, EyeSlash, Trash } from 'svelte-hero-icons'
    import { hrColors } from '$lib/ui/colors';

    export let data

    let removing = false
    let transferring = false
    let hiding = false

    async function takeOverCommunity() {
        if (!$profile?.user || !isAdmin($profile.user)) return

        transferring = true
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
        finally {
            transferring=false
        }
    }

    async function removeCommunity() {
        if (!$profile?.jwt) return
        
        removing = true
        
        const removed = data.community.community_view.community.removed
        
        try {
            await getClient().removeCommunity({
                community_id: data.community.community_view.community.id,
                removed: !removed,
            })
            data.community.community_view.community.removed = !removed
        } 
        catch (error) {
            toast({ 
                title: 'Error',
                content: error as any, 
                type: 'error' 
            })
        }
        removing = false
    }


    async function hideCommunity() {
        if (!$profile?.jwt) return
        hiding = true
        
        const hidden = data.community.community_view.community.hidden;
        try {
            await getClient().hideCommunity({
                community_id: data.community.community_view.community.id, 
                hidden: !hidden
            }) 
            
            data.community.community_view.community.hidden = !hidden

        } catch (error) {
            toast({
                content: `Error hiding community: ${error as any}`, 
                type: 'error',
                title: 'Error'

            })
        }
        hiding = false;
    }
</script>

<svelte:head>
    <title>Community Settings</title>
</svelte:head>

<div class="flex flex-col gap-4 w-full my-2">
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
    
    <hr class="{hrColors}" />

    <SettingToggleContainer>
        {#if isTopMod($profile?.user, data.community) || isAdmin($profile?.user)}
        
            <SettingButton 
                icon={Trash} 
                color={data.community.community_view.community.deleted ? 'success' : 'danger'}
                title="{data.community.community_view.community.deleted ? 'Restore' : 'Delete'}" 
                description="{data.community.community_view.community.deleted ? 'Restore' : 'Delete'} Community. 
                    {!isTopMod($profile?.user, data.community) ? `Note: Only the top mod can delete/undelete the community. Admins will need to takeover the community
                        before they can use this option.` : ''}
                "
                disabled={!isTopMod($profile?.user, data.community)}
                on:click={ async() => {
                    data.community.community_view.community.deleted = await deleteCommunity(data.community.community_view.community.id, !data.community.community_view.community.deleted)
                    goto($page.url, {invalidateAll: true})
                }}
            />
        {/if}

        <!---Community Actions for Admins--->
        {#if isAdmin($profile?.user)}
            
            <!---Takeover Community--->
            <SettingButton 
                icon={CursorArrowRays} 
                color="primary"
                title="Takeover" 
                description="Set your account as the top mod for this community. This will allow you to delete/restore it. To set a new top mod, use the 
                    'Team' panel."
                loading={transferring}
                disabled={isTopMod($profile?.user, data.community)}
                on:click={ async() => {
                    await takeOverCommunity()                        
                    goto($page.url, {invalidateAll: true})
                }}
            />

            <!---Hide Community--->
            <SettingButton 
                icon={data.community.community_view.community.hidden ? Eye : EyeSlash} 
                color="primary"
                title="{data.community.community_view.community.hidden ? 'Unhide' : 'Hide'}" 
                description="{data.community.community_view.community.hidden ? 'Unhide' : 'Hide'} this community from showing up to non-admin users."
                loading={hiding}
                on:click={ async() => {
                    await hideCommunity()                        
                    goto($page.url, {invalidateAll: true})
                }}
            />

            <!---Remove Community--->
            <SettingButton 
                icon={Trash} 
                color="{data.community.community_view.community.removed ? 'success' : 'danger'}"
                title="{data.community.community_view.community.removed ? 'Restore' : 'Remove'}" 
                description="{data.community.community_view.community.removed ? 'Restore' : 'Remove'} this community."
                loading={removing}
                on:click={ async() => {
                    await removeCommunity()                        
                    goto($page.url, {invalidateAll: true})
                }}
            />


        {/if}
    </SettingToggleContainer>
    
</div>
