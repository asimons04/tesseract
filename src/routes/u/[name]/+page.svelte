<script lang="ts">
    import { searchParam } from '$lib/util.js'
    import { isCommentView } from '$lib/lemmy/item.js'
    import { page } from '$app/stores'
    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte';
    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'

    import {
        Icon,
        BookOpen,
        ChatBubbleOvalLeftEllipsis,
        PencilSquare,
        Window,
    } from 'svelte-hero-icons'
    

    export let data
</script>

<svelte:head>
  <title>Profile | {data.person_view.person.name}</title>
</svelte:head>

<!---Only show on /u/{username} routes since the /profile/user route will use the navbar from its layout page--->
{#if $page.url.pathname.startsWith('/u/')}
<SubNavbar 
    home back compactSwitch toggleMargins refreshButton toggleCommunitySidebar scrollButtons
    sortMenu={true} sortOptions={['New', 'TopAll', 'Old']} sortOptionNames={['New', 'Top', 'Old']} bind:selectedSortOption={data.sort}
    listingType={true} listingTypeOptions={['all', 'posts', 'comments']} listingTypeOptionNames={['All', 'Posts', 'Comments']} bind:selectedListingType={data.type}
/>
{/if}

<div class="flex flex-col-reverse xl:flex-row gap-4 max-w-full w-full py-2">
    
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">



        {#if data.items.length == 0}
            <Placeholder
                icon={PencilSquare}
                title="No submissions"
                description="This user has no submissions that match this filter."
            />
        {:else}
           
            <div class="w-full flex flex-col gap-5 ml-auto mr-auto {$userSettings.uiState.feedMargins ? 'sm:w-full md:w-[85%] lg:w-[90%] xl:w-[75%]' : ''}">
                {#each data.items as item (item.counts.id)}
                    {#if isCommentView(item) && (data.type == 'all' || data.type == 'comments')}
                        <CommentItem comment={item} />
                    {:else if !isCommentView(item) && (data.type == 'all' || data.type == 'posts')}
                        <Post post={item} />
                    {/if}
                {/each}
            </div>
        {/if}
    
        <Pageination
            page={data.page}
            on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
        />
    </div>
    
    <!---User Card Sidebar--->
    <!---Don't show on /profile/user since it's i the layout there--->
    {#if $userSettings.uiState.expandCommunitySidebar && $page.url.pathname.startsWith('/u/')}
        <div>
            <UserCard person={data.person_view} moderates={data.moderates} />
        </div>
    {/if}
    
</div>
