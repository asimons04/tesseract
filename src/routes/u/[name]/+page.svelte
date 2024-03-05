<script lang="ts">
    import { searchParam } from '$lib/util.js'
    import { isCommentView } from '$lib/lemmy/item.js'
    import { page } from '$app/stores'
    import { userSettings } from '$lib/settings.js'

    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'

    import {
        Icon,
        PencilSquare,
    } from 'svelte-hero-icons'
    

    export let data
    export let userSideCard = true
</script>

<svelte:head>
  <title>{data.person_view.person.name}</title>
</svelte:head>


<SubNavbar 
    home back compactSwitch toggleMargins refreshButton toggleCommunitySidebar
    listingType={true} listingTypeOptions={['all', 'posts', 'comments']} listingTypeOptionNames={['All', 'Posts', 'Comments']} bind:selectedListingType={data.type}
    sortMenu={true} sortOptions={['New', 'TopAll', 'Old']} sortOptionNames={['New', 'Top', 'Old']} bind:selectedSortOption={data.sort}
    pageSelection={true} bind:currentPage={data.page}
/>


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
    
    {#if userSideCard}
        <div>
            <UserCard person={data.person_view} moderates={data.moderates} />
        </div>
    {/if}
</div>
