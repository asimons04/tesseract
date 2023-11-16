<script lang="ts">
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'

    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'

    export let data
</script>

<svelte:head>
    <title>{data.site.site_view.site.name}</title>
</svelte:head>

<SubNavbar
    home compactSwitch toggleMargins refreshButton toggleCommunitySidebar
    listingType={true}      bind:selectedListingType={data.listingType}
    sortMenu={true}         bind:selectedSortOption={data.sort}
    pageSelection={true}    bind:currentPage={data.page}
/>

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full py-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        

        <section class="flex flex-col gap-3 sm:gap-4 h-full">
            <PostFeed posts={data.posts.posts} />
        </section>

        <div class="mt-auto px-2">
            <Pageination
                page={data.page}
                on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
            />
        </div>
    </div>

    <div class="mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins}/>
    </div>
</div>
