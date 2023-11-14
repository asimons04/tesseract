<script lang="ts">
    
    
    import { afterNavigate, beforeNavigate, disableScrollHandling, goto } from '$app/navigation';
    import { page } from '$app/stores'
    import { arrayRange, searchParam } from '$lib/util.js'
    import { getSessionStorage, setSessionStorage } from '$lib/session'
    import { type CommunityGroup, profile } from '$lib/auth'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    import { getGroup, groupExists, sortGroups } from '$lib/favorites'
    import { sortOptions, sortOptionNames } from '$lib/lemmy'
    import { userSettings } from '$lib/settings'

    import EditCommunityGroup from '$lib/components/util/EditCommunityGroup.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    
    import { 
        Icon, 
        ArchiveBox,
        ArrowSmallRight,
        Bars3,
        ChartBar,
        DocumentDuplicate,
        Home,
        PencilSquare,
        QueueList,
        Window
    } from 'svelte-hero-icons'


    export let data
    let editCommunityGroup:boolean = false;
</script>

<svelte:head>
    <title>Feeds: {data.feedName}</title>
</svelte:head>

{#if editCommunityGroup && groupExists(data.feedName)}
    <EditCommunityGroup bind:open={editCommunityGroup} group={getGroup(data.feedName)} />
{/if}

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

                
                <SelectMenu
                    alignment="bottom-left"
                    options={[...$profile.groups?.map((cg) => cg.name.toLowerCase())?.sort(sortGroups) ?? [] ]}
                    optionNames={[...$profile.groups?.map((cg) => cg.name)?.sort(sortGroups) ?? [] ]}
                    selected={data.feed || 'Choose a Group'}
                    title="Listing Type"
                    icon={Bars3}
                    on:select={(e) => {
                        // @ts-ignore
                        let params
                        goto(`/feeds/${e.detail}?${new URL(window.location.href).searchParams.toString()}`)
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

                <!--Edit Group Button-->
                <span class="flex flex-row gap-1 mr-2 cursor-pointer text-sm font-bold {!groupExists(data.feedName) ? 'hidden' : ''}" title="Edit Group"
                    on:click={() => {
                        editCommunityGroup = true;
                    }}
                >
                    <Icon src={PencilSquare} width={24} />
                </span>

              


                <!---Card/Compact Selection--->
                <span class="mr-2 cursor-pointer" title="Switch to {$userSettings.showCompactPosts ? 'card view' : 'compact view'}."
                    on:click={() => {
                        $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                        window.scrollTo(0,0);
                    }}
                >
                    <Icon src={$userSettings.showCompactPosts ? Window : QueueList} width={24} />
                </span>


            </span>
        </header>
        
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