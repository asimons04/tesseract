<script lang="ts">
    import { site } from '$lib/lemmy'

    import CommunityForm from '$lib/components/lemmy/community/CommunityForm.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    

</script>

<svelte:head>
    <title>Create Community</title>
</svelte:head>

<SubNavbar home back toggleMargins toggleCommunitySidebar />

<MainContentArea>
    <FeedContainer>
        <CommunityForm />
    </FeedContainer>

    
    <div class="h-full" slot="right-panel">
        {#if $site}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version}/>
        {/if}
    </div>
    
</MainContentArea>

