<script lang="ts">
    import { goto } from '$app/navigation'
    import { site } from '$lib/lemmy'
    
    import CommunityCard    from '$lib/components/lemmy/community/CommunityCard.svelte';
    import PostForm         from '$lib/components/lemmy/post/PostForm.svelte'
    import SubNavbar        from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import MainContentArea  from '$lib/components/ui/containers/MainContentArea.svelte';
    
    export let data
</script>

<svelte:head>
    <title>Create post in {data?.community?.community_view.community.title ?? 'Community'}</title>
</svelte:head>



<SubNavbar home back toggleMargins toggleCommunitySidebar />

{#if data?.community}
    <MainContentArea>

        <h1 class="text-2xl font-bold mb-2">
            Create Post in {data.community.community_view.community.title ?? data.community.community_view.community.name}
        </h1>    

        {#key $site}
        <PostForm community={data.community.community_view.community} hideCommunityInput={true} on:submit={(e) => { 
                if (e?.detail?.post) goto(`/post/${e.detail.post.id}`)
            }}
        />
        {/key}

        <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel" />

    </MainContentArea>
{/if}