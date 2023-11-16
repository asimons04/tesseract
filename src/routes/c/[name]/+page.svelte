<script lang="ts">
    
    import { afterNavigate, disableScrollHandling, goto } from '$app/navigation';
    import { arrayRange, fullCommunityName, searchParam } from '$lib/util.js'
    import { getSessionStorage, setSessionStorage } from '$lib/session.js'
    import { onDestroy, onMount } from 'svelte'
    import { page } from '$app/stores'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    import { sortOptions, sortOptionNames } from '$lib/lemmy'
    import { userSettings } from '$lib/settings.js'
    
    
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import Sort from '$lib/components/lemmy/Sort.svelte'

    import {
        ArrowSmallRight,
        Bars3,
        ChartBar,
        DocumentDuplicate,
        Home,
        Icon,
        QueueList,
        UserGroup,
        Window
    } from 'svelte-hero-icons'

    export let data
    
    
    onMount(() => {
        setSessionStorage('lastSeenCommunity', {
            id: data.community.community_view.community.id,
            name: fullCommunityName(
                data.community.community_view.community.name,
                data.community.community_view.community.actor_id
            ),
        })
    })
</script>

<svelte:head>
    <title>{data.community.community_view.community.title}</title>

    <meta
        name="og:title"
        content={data.community.community_view.community.title}
    />
    {#if data.community.community_view.community.description}
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

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        <PostFeed posts={data.posts.posts}/>
        
        <Pageination page={data.page} on:change={(p) => searchParam($page.url, 'page', p.detail.toString())} />
    </div>

    <div class="mt-[8px]">
        <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators}/>
    </div>
</div>
