<script lang="ts">
    import { searchParam } from '$lib/util.js'
    import { isCommentView } from '$lib/lemmy/item.js'
    import { page } from '$app/stores'
    import { userSettings } from '$lib/settings.js'

    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'

    import {
        PencilSquare,
    } from 'svelte-hero-icons'
    
    

    export let data
</script>

<svelte:head>
  <title>Profile | {data.person_view.person.name}</title>
</svelte:head>

<!---Only show on /u/{username} routes since the /profile/user route will use the navbar from its layout page--->
{#if $page.url.pathname.startsWith('/u/')}
<SubNavbar 
    back compactSwitch toggleMargins refreshButton toggleCommunitySidebar scrollButtons
    sortMenu={true} sortOptions={['New', 'TopAll', 'Old']} sortOptionNames={['New', 'Top', 'Old']} bind:selectedSortOption={data.sort}
    listingType={true} listingTypeOptions={['all', 'posts', 'comments']} listingTypeOptionNames={['All', 'Posts', 'Comments']} bind:selectedListingType={data.type}
>
    <SiteSearch placeholder="Search {data.person_view.person.name}" person_id={data.person_view.person.id} slot="center"/>
</SubNavbar>
{/if}

<MainContentArea>
    {#if data.items.length == 0}
        <Placeholder icon={PencilSquare} title="No submissions" description="This user has no submissions that match this filter."/>
    {:else}
        <FeedContainer>    
            {#each data.items as item (item.counts.id)}
                {#if isCommentView(item) && (data.type == 'all' || data.type == 'comments')}
                    <CommentItem comment={item} />
                {:else if !isCommentView(item) && (data.type == 'all' || data.type == 'posts')}
                    <Post post={item} />
                {/if}
            {/each}
        </FeedContainer>
    {/if}

    <Pageination page={data.page} on:change={(p) => searchParam($page.url, 'page', p.detail.toString())} />
    
    
    <!---User Info Panel: Only show on /u/ pages.  Profile (/profile/user) will use its own layout--->
    <UserCard person={data.person_view} moderates={data.moderates} display={$page.url.pathname.startsWith('/u/')} slot="right-panel"/>

</MainContentArea>
