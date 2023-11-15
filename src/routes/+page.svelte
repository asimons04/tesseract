<script lang="ts">
    import { getSessionStorage, setSessionStorage } from '$lib/session'
    import { afterNavigate, beforeNavigate, disableScrollHandling, goto } from '$app/navigation';
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    import { arrayRange, searchParam } from '$lib/util.js'
    import { sortOptions, sortOptionNames } from '$lib/lemmy'
    import { userSettings } from '$lib/settings.js'

    
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
   
    import {
        ArrowSmallRight,
        Bars3,
        ChartBar,
        DocumentDuplicate,
        Home,
        Icon,
        QueueList,
        Window
    } from 'svelte-hero-icons'

    export let data

    let margins = true;
</script>

<svelte:head>
    <title>{data.site.site_view.site.name}</title>
</svelte:head>

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        <SubNavbar 
            iconSize={28} 
            home={true} 
            listingType={true} bind:selectedListingType={data.listingType}
            sortMenu={true} bind:selectedSortOption={data.sort}
            pageSelection={true} bind:currentPage={data.page}
            compactSwitch={true} 
            toggleMargins={true} bind:marginVar={margins}
        />

        <section class="flex flex-col gap-3 sm:gap-4 h-full">
            <PostFeed bind:margins posts={data.posts.posts} />
        </section>

        <div class="mt-auto px-2">
            <Pageination
                page={data.page}
                on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
            />
        </div>
    </div>

    <div class="mt-[-8px] mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins}/>
    </div>
</div>
