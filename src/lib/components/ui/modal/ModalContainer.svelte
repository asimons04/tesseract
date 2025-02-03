<script lang="ts">
    import { fediseerModal, modals } from '$lib/components/lemmy/moderation/moderation.js'
    import { page } from '$app/stores'
    import { userSettings } from '$lib/settings'

    import AddCommunityGroup        from '$lib/components/lemmy/modal/AddCommunityGroup.svelte'
    import BanModal                 from '$lib/components/lemmy/moderation/BanModal.svelte'
    import CommunityProfileModal    from '$lib/components/lemmy/modal/CommunityProfileModal.svelte'
    import DebugObject              from '$lib/components/util/debug/DebugObject.svelte'
    import EditCommunityGroup       from '$lib/components/lemmy/modal/EditCommunityGroup.svelte'
    import FederationStateModal     from '$lib/components/lemmy/modal/FederationStateModal.svelte'
    import Fediseer                 from '$lib/fediseer/Fediseer.svelte'
    import LinkPreviewModal         from '$lib/components/lemmy/modal/LinkPreviewModal.svelte'
    import PostModerationModal      from '$lib/components/lemmy/modal/PostModerationModal.svelte'
    import PostViewModal            from '$lib/components/lemmy/modal/PostViewModal.svelte'
    import QuickSettingsModal       from '$lib/components/lemmy/modal/QuickSettingsModal.svelte'
    import RemoveModal              from '$lib/components/lemmy/moderation/RemoveModal.svelte'
    import ReportModal              from '$lib/components/lemmy/moderation/ReportModal.svelte'
    import UserProfileModal         from '$lib/components/lemmy/modal/UserProfileModal.svelte'
    import ZoomImageModal           from '$lib/components/lemmy/modal/ZoomImageModal.svelte'
    
    
    $:  open = {
            AddCommunityGroupModal: $page.state.modals?.AddCommunityGroupModal  ?? false,
            BanModal:               $page.state.modals?.BanModal                ?? false,
            CommunityProfileModal:  $page.state.modals?.CommunityProfileModal   ?? false,
            DebugModal:             $page.state.modals?.DebugModal              ?? false,
            EditCommunityGroupModal:$page.state.modals?.EditCommunityGroupModal ?? false,
            FederationStateModal:   $page.state.modals?.FederationStateModal    ?? false,
            FediseerModal:          $page.state.modals?.FediseerModal           ?? false,
            LinkPreviewModal:       $page.state.modals?.LinkPreviewModal        ?? false,
            PostModerationModal:    $page.state.modals?.PostModerationModal     ?? false,
            PostViewModal:          $page.state.modals?.PostViewModal           ?? false,
            QuickSettingsModal:     $page.state.modals?.QuickSettingsModal      ?? false,
            ReportModal:            $page.state.modals?.ReportModal             ?? false,
            RemoveModal:            $page.state.modals?.RemoveModal             ?? false,
            UserProfileModal:       $page.state.modals?.UserProfileModal        ?? false,
            ZoomImageModal:         $page.state.modals?.ZoomImageModal          ?? false,
        }
    $:  if ($userSettings.debugInfo) console.log("ModalContainer.svelte: ", open)
</script>


<!---Post Viewer Modal--->
{#if open.PostViewModal}
    <PostViewModal 
        open={open.PostViewModal} 
        bind:comment_id={$modals.postViewer.comment_id} 
        bind:post_id={$modals.postViewer.post_id} 
        bind:instance={$modals.postViewer.instance}
    />
{/if}

<!---Report Item--->
{#if open.ReportModal && $modals.reporting.item}
    <ReportModal 
        open={open.ReportModal} 
        item={$modals.reporting.item} 
        reason={$modals.reporting.reason} 
    />
{/if}


<!---Remove Item--->
{#if open.RemoveModal && $modals.removing.item}
    <RemoveModal 
        open={open.RemoveModal} 
        item={$modals.removing.item} 
        purge={$modals.removing.purge} 
        reason={$modals.removing.reason} 
    />
  
{/if}


<!---Fediseer Modal--->
{#if open.FediseerModal}
    <Fediseer 
        open={open.FediseerModal} 
        instance={$modals.fediseer.instance} 
    />
{/if}

<!---Federation State Viewer--->
{#if open.FederationStateModal}
    <FederationStateModal 
        open={open.FederationStateModal} 
        domain={$modals.federationState.domain}
    />
{/if}

<!---Quick Settings Modal--->
{#if open.QuickSettingsModal}
    <QuickSettingsModal open={open.QuickSettingsModal} />
{/if}


<!---Post Moderation Modal--->
{#if open.PostModerationModal && $modals.postModeration.item}
    <PostModerationModal 
        open={open.PostModerationModal} 
        bind:item={$modals.postModeration.item} 
        bind:action={$modals.postModeration.panel}
    />
{/if}


<!---Community Profile Modal--->
{#if open.CommunityProfileModal}
    <CommunityProfileModal open={open.CommunityProfileModal} community={$modals.community.community} />
{/if}

<!--- User Profile Modal (should be after so it's "above" other modals that would pop up a user profile (e.g. vote view)--->
{#if open.UserProfileModal}
    <UserProfileModal  open={open.UserProfileModal} user={$modals.user.user} mod={$modals.user.mod} />
{/if}

<!--- Add community to Group Modal--->
{#if open.AddCommunityGroupModal && $modals.addCommunityToGroup.community}
    <AddCommunityGroup open={open.AddCommunityGroupModal} community={$modals.addCommunityToGroup.community} />
{/if}

<!---Edit Community Group--->
{#if open.EditCommunityGroupModal && $modals.editCommunityGroup.group}
    <EditCommunityGroup open={open.EditCommunityGroupModal} group={$modals.editCommunityGroup.group} />
{/if}

<!---Ban User Modal (Deprecated)--->
{#if open.BanModal && $modals.banning.user}
    <BanModal open={open.BanModal} banned={$modals.banning.banned} user={$modals.banning.user} community={$modals.banning.community} />
{/if}


<!---Link Preview Modal--->
{#if open.LinkPreviewModal}
    <LinkPreviewModal open={open.LinkPreviewModal} url={$modals.linkPreview.url} iframe={$modals.linkPreview.iframe}/>
{/if}


{#if open.ZoomImageModal}
    <ZoomImageModal open={open.ZoomImageModal} bind:url={$modals.zooming.url} altText={$modals.zooming.altText} />
{/if}


{#if open.DebugModal}
    <DebugObject open={open.DebugModal} object={$modals.debug.object} />
{/if}

