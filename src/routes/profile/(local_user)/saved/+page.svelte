<script lang="ts">
    import type { CommentView, PostView } from 'lemmy-js-client'

    import { fly } from 'svelte/transition'
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'
    import { profile } from '$lib/auth.js';
    

    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import ProfileMenuBar from '$routes/profile/ProfileMenuBar.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'

    import {
        PencilSquare,
    } from 'svelte-hero-icons'

    export let data

    const isComment = (item: CommentView | PostView): item is CommentView => 'comment' in item
</script>

<svelte:head>
    <title>Profile | Saved Items</title>
</svelte:head>

<SubNavbar back quickSettings 
    toggleMargins refreshButton toggleCommunitySidebar scrollButtons
    listingType={true} listingTypeOptions={['all', 'posts', 'comments']} listingTypeOptionNames={['All', 'Posts', 'Comments']} bind:selectedListingType={data.type}
    on:navChangeListingType={(e) => {
        if (e?.detail) searchParam($page.url, 'type', e.detail, 'page')
    }}
    sortMenu sortPreventDefault sortOptions={['New', 'Old']} sortOptionNames={['New', 'Old']} bind:selectedSortOption={data.sort}
    on:navChangeSort={(e) => {
        if (e?.detail) searchParam($page.url, 'sort', e.detail, 'page')
    }}
/>

<MainContentArea>
    <ProfileMenuBar />

    <FeedContainer>
        {#if data?.data && data.data.length > 0}
                {#each data.data as item, index}
                    <div in:fly={{ opacity: 0, y: -4, delay: index * 50 }}>
                        {#if isComment(item)}
                            <CommentItem bind:comment={item} />
                        {:else}
                            <Post post={item} />
                        {/if}
                    </div>
                {/each}
        {:else}
            <Placeholder icon={PencilSquare} title="Nothing here." description="You haven't saved any posts."/>
        {/if}

        {#if data.page}
        <Pageination page={data.page}
            on:change={(p) => {
                data.data = [];
                searchParam($page.url, 'page', p.detail.toString())
            }}
        />
        {/if}
    </FeedContainer>

    <div class="h-full" slot="right-panel">
        {#if $profile?.user}
            <UserCard  moderates={$profile.user.moderates} person={
                    {
                        person: $profile.user.local_user_view.person,
                        is_admin: $profile.user.local_user_view.local_user.admin,
                        counts: $profile.user.local_user_view.counts
                    }
                }
            />
        {/if}
    </div>

</MainContentArea>