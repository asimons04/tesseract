<script lang="ts">
    import CommunityForm from '$lib/components/lemmy/community/CommunityForm.svelte'

    export let data
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
</div>
