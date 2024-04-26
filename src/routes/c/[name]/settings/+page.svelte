<script lang="ts">
    import CommunityForm from '$lib/components/lemmy/community/CommunityForm.svelte'

    export let data
</script>

<svelte:head>
    <title>Community Settings</title>
</svelte:head>

<div class="flex flex-col gap-4">
    <h1 class="font-bold text-2xl">Settings</h1>
  
    <CommunityForm
        edit={data.community.community_view.community.id}
        formData={{
            name: data.community.community_view.community.name,
            displayName: data.community.community_view.community.title,
            nsfw: data.community.community_view.community.nsfw,
            postsLockedToModerators:
            data.community.community_view.community.posting_restricted_to_mods,
            sidebar: data.community.community_view.community.description ?? '',
            icon: null,
            banner: null,
            submitting: false,
            currentIcon: data.community.community_view.community.icon,
            currentBanner: data.community.community_view.community.banner,
        }}
  >
    <svelte:fragment slot="formtitle">{''}</svelte:fragment>
  </CommunityForm>
</div>
