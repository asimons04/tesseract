<script lang="ts">
    
    //import { afterNavigate, disableScrollHandling, goto } from '$app/navigation';
    import { arrayRange, fullCommunityName, searchParam } from '$lib/util.js'
    import { getSessionStorage, setSessionStorage } from '$lib/session.js'
    import { onDestroy, onMount } from 'svelte'
    import { page } from '$app/stores'
    //import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    //import { sortOptions, sortOptionNames } from '$lib/lemmy'
    //import { userSettings } from '$lib/settings.js'
    
    
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'


    export let data
    
    
    onMount(() => {
        if (data?.community) {
            setSessionStorage('lastSeenCommunity', {
                id: data.community.community_view.community.id,
                name: fullCommunityName(
                    data.community.community_view.community.name,
                    data.community.community_view.community.actor_id
                ),
            })
        }
    })
</script>

<svelte:head>
    <title>{data?.community?.community_view.community.title ?? "Community Not Found"}</title>

    <meta
        name="og:title"
        content={data?.community?.community_view.community.title ?? "Community Not Found"}
    />
    {#if data?.community?.community_view.community.description}
        <meta
            name="og:description"
            content={data.community.community_view.community.description}
        />
    {/if}
</svelte:head>

<SubNavbar home back compactSwitch toggleMargins refreshButton toggleCommunitySidebar
    sortMenu={true} bind:selectedSortOption={data.sort}
    pageSelection={true} bind:currentPage={data.page}
/>
{#if data?.posts && data?.community}
<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full py-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        <PostFeed posts={data.posts.posts}/>
        
        <Pageination page={data.page} on:change={(p) => searchParam($page.url, 'page', p.detail.toString())} />
    </div>

    <div class="mt-[8px]">
        <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators}/>
    </div>
</div>
{/if}