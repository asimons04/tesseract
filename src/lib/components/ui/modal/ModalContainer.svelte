<script lang="ts">
    import { modals } from '$lib/components/lemmy/moderation/moderation.js'
    
    import AddCommunityGroup from '$lib/components/lemmy/modal/AddCommunityGroup.svelte'
    import BanModal from '$lib/components/lemmy/moderation/BanModal.svelte'
    import CommunityProfileModal from '$lib/components/lemmy/modal/CommunityProfileModal.svelte'
    import DebugObject from '$lib/components/util/debug/DebugObject.svelte'
    import EditCommunityGroup from '$lib/components/lemmy/modal/EditCommunityGroup.svelte'
    import FederationStateModal from '$lib/components/lemmy/modal/FederationStateModal.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte'
    import LinkPreviewModal from '$lib/components/lemmy/modal/LinkPreviewModal.svelte'
    import PostCommentVoteShowModal from '$lib/components/lemmy/modal/PostCommentVoteShowModal.svelte'
    import PostModerationModal from '$lib/components/lemmy/modal/PostModerationModal.svelte'
    import QuickSettingsModal from '$lib/components/lemmy/modal/QuickSettingsModal.svelte'
    import RemoveModal from '$lib/components/lemmy/moderation/RemoveModal.svelte'
    import ReportModal from '$lib/components/lemmy/moderation/ReportModal.svelte'
    import UserProfileModal from '$lib/components/lemmy/modal/UserProfileModal.svelte'
    import ZoomImageModal from '$lib/components/lemmy/modal/ZoomImageModal.svelte'
    
  
</script>

<!--These weird await hacks are for lazy loading, better network performance-->

{#if $modals.reporting.open}
    <ReportModal
      bind:open={$modals.reporting.open}
      item={$modals.reporting.item}
      reason={$modals.reporting.reason}
    />
{/if}

{#if $modals.removing.open}
  
    <RemoveModal
      bind:open={$modals.removing.open}
      item={$modals.removing.item}
      purge={$modals.removing.purge}
      reason={$modals.removing.reason}
    />
  
{/if}



<!--- Post/Comment Vote Viewer Modal--->
{#if $modals.votes.open}
    <PostCommentVoteShowModal bind:open={$modals.votes.open} type={$modals.votes.type} submission_id={$modals.votes.submission_id} />
{/if}

<!---Fediseer Modal--->
{#if $modals.fediseer.open}
    <Fediseer bind:open={$modals.fediseer.open} instance={$modals.fediseer.instance} />
{/if}

<!---Federation State Viewer--->
{#if $modals.federationState.open}
    <FederationStateModal bind:open={$modals.federationState.open} domain={$modals.federationState.domain} />
{/if}

<!---Quick Settings Modal--->
{#if $modals.quickSettings.open}
    <QuickSettingsModal bind:open={$modals.quickSettings.open} />
{/if}

<!---Post Moderation Modal--->
{#if $modals.postModeration.open && $modals.postModeration.item}
    <PostModerationModal bind:open={$modals.postModeration.open} bind:item={$modals.postModeration.item} bind:action={$modals.postModeration.panel}/>
{/if}


<!---Community Profile Modal--->
{#if $modals.community.open}
    <CommunityProfileModal bind:open={$modals.community.open} community={$modals.community.community} />
{/if}

<!--- User Profile Modal (should be after so it's "above" other modals that would pop up a user profile (e.g. vote view)--->
{#if $modals.user.open}
    <UserProfileModal  bind:open={$modals.user.open} user={$modals.user.user} mod={$modals.user.mod} />
{/if}

<!--- Add community to Group Modal--->
{#if $modals.addCommunityToGroup.open && $modals.addCommunityToGroup.community}
    <AddCommunityGroup bind:open={$modals.addCommunityToGroup.open} community={$modals.addCommunityToGroup.community} />
{/if}

<!---Edit Community Group--->
{#if $modals.editCommunityGroup.open && $modals.editCommunityGroup.group}
    <EditCommunityGroup bind:open={$modals.editCommunityGroup.open} group={$modals.editCommunityGroup.group} />
{/if}

<!---Ban User Modal--->
{#if $modals.banning.open}
    <BanModal
      bind:open={$modals.banning.open}
      banned={$modals.banning.banned}
      user={$modals.banning.user}
      community={$modals.banning.community}
    />
{/if}



{#if $modals.linkPreview.open}
    <LinkPreviewModal bind:open={$modals.linkPreview.open} url={$modals.linkPreview.url} iframe={$modals.linkPreview.iframe}/>
{/if}


{#if $modals.zooming.open}
    <ZoomImageModal bind:open={$modals.zooming.open} bind:url={$modals.zooming.url} altText={$modals.zooming.altText} />
{/if}


{#if $modals.debug.open}
    <DebugObject bind:open={$modals.debug.open} object={$modals.debug.object} />
{/if}

