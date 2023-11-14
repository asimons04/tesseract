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
</script>

<svelte:head>
    <title>{data.site.site_view.site.name}</title>
</svelte:head>

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        <header class="sticky top-16 w-full backdrop-blur-3xl z-20 mt-[-0.5rem] px-2">
            <span class="flex flex-row gap-2 items-center font-bold text-sm text-center mx-auto my-2 mr-2">
                
                <!--Home Button-->
                <span class="mt-[-6px] mr-2 cursor-pointer" title="Frontpage"
                    on:click={() => {
                        goto('/', {invalidateAll: true});
                        window.scrollTo(0,0);
                    }}
                >
                    <Icon src={Home} width={24} />
                </span>

                <!---Listing Type--->
                <SelectMenu
                    alignment="bottom-left"
                    options={['Subscribed', 'Local', 'All']}
                    selected={data.listingType}
                    title="Listing Type"
                    icon={Bars3}
                    on:select={(e) => {
                        // @ts-ignore
                        searchParam($page.url, 'type', e.detail, 'page')
                    }}
                />
                
                <Icon src={ArrowSmallRight} mini width={24} />
                
                <!---Sort Menu--->
                <SelectMenu
                    alignment="bottom-left"
                    options={sortOptions}
                    optionNames={sortOptionNames}
                    selected={data.sort}
                    title="Sort Direction"
                    icon={ChartBar}
                    on:select={(e) => {
                        // @ts-ignore
                        searchParam($page.url, 'sort', e.detail, 'page')
                    }}
                />
                
                
                
                
                <Icon src={ArrowSmallRight} mini width={24} />
                
                <!---Page Selection--->
                <SelectMenu
                    alignment="bottom-left"
                    options={arrayRange(1, data.page +1)}
                    selected={data.page}
                    title="Page"
                    icon={DocumentDuplicate}
                    on:select={(e) => {
                        // @ts-ignore
                        searchParam($page.url, 'page', e.detail.toString())
                    }}
                />
                <span class="ml-auto"/>
                
                
                <!---Card/Compact Selection--->
                <span class="mr-2 cursor-pointer" title="Switch to {$userSettings.showCompactPosts ? 'card view' : 'compact view'}."
                    on:click={() => {
                        $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                    }}
                >
                    <Icon src={$userSettings.showCompactPosts ? Window : QueueList} width={24} />
                </span>
                


            </span>
        </header>

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

    <div class="mt-[-8px] mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins}/>
    </div>
</div>
