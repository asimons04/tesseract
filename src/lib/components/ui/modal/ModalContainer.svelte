<script lang="ts">
    import { modals } from '$lib/components/lemmy/moderation/moderation.js'
    
    import FederationStateModal from '$lib/components/lemmy/modal/FederationStateModal.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte';
    import PostCommentVoteShowModal from '$lib/components/lemmy/modal/PostCommentVoteShowModal.svelte'
    import UserProfileModal from '$lib/components/lemmy/modal/UserProfileModal.svelte'
    import ZoomImageModal from '$lib/components/lemmy/modal/ZoomImageModal.svelte';
  
</script>

<!--These weird await hacks are for lazy loading, better network performance-->

{#if $modals.reporting.open}
  {#await import('$lib/components/lemmy/moderation/ReportModal.svelte') then { default: ReportModal }}
    <ReportModal
      bind:open={$modals.reporting.open}
      item={$modals.reporting.item}
      reason={$modals.reporting.reason}
    />
  {/await}
{/if}

{#if $modals.removing.open}
  {#await import('$lib/components/lemmy/moderation/RemoveModal.svelte') then { default: RemoveModal }}
    <RemoveModal
      bind:open={$modals.removing.open}
      item={$modals.removing.item}
      purge={$modals.removing.purge}
      reason={$modals.removing.reason}
    />
  {/await}
{/if}

<!---Ban User Modal--->
{#if $modals.banning.open}
  {#await import('$lib/components/lemmy/moderation/BanModal.svelte') then { default: BanModal }}
    <BanModal
      bind:open={$modals.banning.open}
      banned={$modals.banning.banned}
      user={$modals.banning.user}
      community={$modals.banning.community}
    />
  {/await}
{/if}



{#if $modals.votes.open}
    <PostCommentVoteShowModal bind:open={$modals.votes.open} type={$modals.votes.type} submission_id={$modals.votes.submission_id} />
{/if}

<!---Fediseer Modal--->
{#if $modals.fediseer.open}
    <Fediseer bind:open={$modals.fediseer.open} instance={$modals.fediseer.instance} />
{/if}

<!---Federation State <Viewer--->
{#if $modals.federationState.open}
    <FederationStateModal bind:open={$modals.federationState.open} domain={$modals.federationState.domain} />
{/if}

<!--- User Profile Modal (should be after so it's "above" other modals that would pop up a user profile (e.g. vote view)--->
{#if $modals.user.open}
    <UserProfileModal  bind:open={$modals.user.open} user={$modals.user.user} mod={$modals.user.mod} />
{/if}

{#if $modals.zooming.open}
    <ZoomImageModal bind:open={$modals.zooming.open} bind:url={$modals.zooming.url} altText={$modals.zooming.altText} />
{/if}

