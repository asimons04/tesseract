<script lang="ts">
    import { goto } from '$app/navigation';
    
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

<SubNavbar home back toggleMargins toggleCommunitySidebar compactSwitch/>

<MainContentArea>
    <FeedContainer>
            <PostForm bind:community={data.community.community_view.community} hideCommunityInput={true}
                on:submit={(e) => goto(`/post/${e.detail.post.id}`)}
            >
            </PostForm>
    </FeedContainer>

    <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel" />
</MainContentArea>