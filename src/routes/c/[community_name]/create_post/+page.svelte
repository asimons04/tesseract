<script lang="ts">
    import { goto } from '$app/navigation';
    import { shortenCommunityName } from  '$lib/components/lemmy/community/helpers'
    
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte';
    import PostForm from '$lib/components/lemmy/post/PostForm.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    
    export let data
</script>

<svelte:head>
    <title>Create post in {data.community.community_view.community.title}</title>
</svelte:head>

<SubNavbar home back toggleMargins toggleCommunitySidebar />

<MainContentArea>
    
    <h1 class="text-2xl font-bold">
        Create Post in {data.community.community_view.community.title ?? data.community.community_view.community.name}
    </h1>    
    <PostForm bind:community={data.community.community_view.community} hideCommunityInput={true}
        on:submit={(e) => goto(`/post/${e.detail.post.id}`)}
    >
    </PostForm>
    

    <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel" />
</MainContentArea>