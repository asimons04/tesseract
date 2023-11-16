<script lang="ts">
    import { getGroup, groupExists, sortGroups } from '$lib/favorites'
    import { goto } from '$app/navigation';
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util.js'

    import EditCommunityGroup from '$lib/components/util/EditCommunityGroup.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    import { 
        Icon, 
        ArchiveBox,
        PencilSquare,
    } from 'svelte-hero-icons'


    export let data
    
    let editCommunityGroup:boolean = false;     // Controls the appearance of the community group editor modal
    $: feed = data.feed || 'Choose a Group'     // Can't bind a conditional value to the listing type in the subnavbar, so hack it.

</script>

<svelte:head>
    <title>Feeds: {data.feedName}</title>
</svelte:head>

{#if editCommunityGroup && groupExists(data.feedName)}
    <EditCommunityGroup bind:open={editCommunityGroup} group={getGroup(data.feedName)} />
{/if}

<SubNavbar 
    home back compactSwitch toggleMargins refreshButton toggleCommunitySidebar
    listingType={true} 
    listingTypeOptions = {[...$profile.groups?.map((cg) => cg.name.toLowerCase())?.sort(sortGroups) ?? [] ]} 
    listingTypeOptionNames = {[...$profile.groups?.map((cg) => cg.name)?.sort(sortGroups) ?? [] ]} 
    listingTypeOnSelect={(e) => {
        goto(`/feeds/${e.detail}?${new URL(window.location.href).searchParams.toString()}`)
    }}
    bind:selectedListingType={feed}

    sortMenu={true} bind:selectedSortOption={data.sort}
    pageSelection={true} bind:currentPage={data.page}
>
    <!--Edit Group Button-->
    <span let:iconSize slot="right" class="flex flex-row gap-1 mr-2 cursor-pointer text-sm font-bold {!groupExists(data.feedName) ? 'hidden' : ''}" 
        title="Edit Group"
        on:click={() => {
            editCommunityGroup = true;
        }}
    >
        <Icon src={PencilSquare} width={iconSize} />
    </span>
</SubNavbar>

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full py-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        {#if data}
            {#if data.posts.length > 0}
                <PostFeed posts={data.posts} />
            {:else}
                <Placeholder
                    icon={ArchiveBox}
                    title="No posts"
                    description={`There's nothing here.  ${data.feed ? "You haven't added any communities to this group" : `The specified group does not seem to exist yet.`}`}
                />
            {/if}
            
            <div class="mt-auto px-2">
                <Pageination
                    page={data.page}
                    on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
                />
            </div>
        {/if}
    </div>

    <div class="mt-[-8px] mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins}/>
    </div>
</div>