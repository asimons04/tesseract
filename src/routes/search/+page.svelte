<script lang="ts">
    interface SearchFilter {
        person?: Person,
        community?: Community
        sort?: string
        type?: string    
        query?: string
        page?: number
    }

    import type {
        CommentView,
        Community,
        CommunityView,
        Person,
        PersonView,
        PostView,
    } from 'lemmy-js-client'

    import type { Snapshot } from './$types';
    import { PageSnapshot } from '$lib/storage'

    import { expoInOut, expoOut } from 'svelte/easing'
    import { fly, slide } from 'svelte/transition'
    import {
        isCommentView,
        isCommunityView,
        isPostView,
        isUser,
    } from '$lib/lemmy/item.js'
    
    
    import { goto } from '$app/navigation'
    import { load } from './+page'
    import { page } from '$app/stores'
    import { scrollTo } from '$lib/components/lemmy/post/helpers'
    import { site } from '$lib/lemmy'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import CommunityAutocomplete from '$lib/components/lemmy/CommunityAutocomplete.svelte'
    import CommunityItem from '$lib/components/lemmy/community/CommunityItem.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import PersonAutocomplete from '$lib/components/lemmy/PersonAutocomplete.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import UserItem from '$lib/components/lemmy/user/UserItem.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import SubnavbarMenu from '$lib/components/ui/subnavbar/SubnavbarMenu.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { searchParam } from '$lib/util.js'
    
    import { 
        Icon, 
        ArrowPathRoundedSquare,
        Bars3,
        Funnel,
        MagnifyingGlass,
        User,
        UserGroup,
        XCircle
    } from 'svelte-hero-icons'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    
    

    type Result = PostView | CommentView | PersonView | CommunityView

    export let data
    
    let pageState = {
        scrollY: 0
    }

    // Store and reload the page data between navigations (Override functions to use LocalStorage instead of Session Storage)
    export const snapshot: Snapshot<void> = {
        capture: () => {
            pageState.scrollY = window.scrollY
            PageSnapshot.capture(
                {
                    data: data, 
                    state: pageState,
                    filter: filter
                }
            )
        },
        restore: async () => {
            try { 
                let snapshot = PageSnapshot.restore() 
                if (snapshot.data)  data = snapshot.data
                if (snapshot.state) pageState = snapshot.state
                if (snapshot.filter) filter = snapshot.filter
            }
            catch { 
                PageSnapshot.clear() 
            }
            
            // Scroll to last stored position if found in snapshot data (delay by number of posts + 100 ms)
            if (pageState.scrollY) await scrollTo(pageState.scrollY)
            else window.scrollTo(0,0)
        }
    }
    
    async function search() {
        searching = true
        let searchURL = new URL($page.url);
        if (filter.person)      searchURL.searchParams.set('person', filter.person.id.toString())
        if (filter.community)   searchURL.searchParams.set('community_id', filter.community.id.toString())
        if (filter.sort)        searchURL.searchParams.set('sort', filter.sort)
        if (filter.type)        searchURL.searchParams.set('type', filter.type)
        if (filter.page)        searchURL.searchParams.set('page', filter.page.toString())
        if (filter.query)       searchURL.searchParams.set('q', filter.query)
        else {
            // Search for anything if person or community is selected but no term is given
            if (filter.person || filter.community) searchURL.searchParams.set('q', ' ')
        }
        
        //@ts-ignore
        const results = await load({url: searchURL})
        data = results
        searching = false
    }

    function resetSearch() {
        filter = default_filter
        filter.type = 'All'
        filter.query = ''
        data.results = []
        goto('/search')
    }

    
    let searching = false
    let default_filter: SearchFilter = {
        sort: data.sort,
        type: data.type,
        query: data.query,
        page: data.page
    }

    let filter = default_filter
</script>

<svelte:head>
    <title>Search</title>
</svelte:head>


<SubNavbar home scrollButtons   toggleMargins compactSwitch toggleCommunitySidebar
    pageSelection bind:currentPage={data.page}
    sortMenu sortPreventDefault bind:selectedSortOption={filter.sort} 
    on:navChangeSort={(e) => {
        if (e && e.detail) filter.sort = e.detail
    }}
>

    <!---Custom Sub-Navbar Buttons for Search--->
    <span class="flex flex-row gap-0 md:gap-1 items-center" slot="far-left" let:iconSize>
        <SelectMenu
            options={['All', 'Posts', 'Comments', 'Communities', 'Users']}
            selected={filter.type}
            icon={Bars3}
            title="Search Type"
            on:select={(e) => {
                filter.type = e.detail
            }}
        />

        <!--- Search Filter Menu --->
        <SubnavbarMenu alignment="bottom-center" title="Search Filters" icon={Funnel} containerClass="!w-96 !overflow-visible !-left-[170%] md:!-left-[50%]">
            
            <!--- Lookup a Community to Filter--->
            <MenuButton>
                <button class="flex flex-row gap-4 w-full" on:click|stopPropagation>
                    <Icon mini src={UserGroup} width={iconSize-2} />
                    
                    {#if filter.community?.id}
                        <div class="flex flex-row w-full justify-between">
                            <CommunityLink avatar={true} avatarSize={iconSize} community={filter.community} />
                            
                            <button class="cursor-pointer" on:click={() => filter.community = undefined }>
                                <Icon src={XCircle} mini width={iconSize-2}/>
                            </button>
                        </div>
                    {:else}
                        <span class="flex flex-row gap-2 w-full">
                            <CommunityAutocomplete
                                containerClass="!w-full"
                                placeholder="Community"
                                listing_type="All"
                                on:select={(e) => {
                                    filter.community = e.detail
                                    //searchParam($page.url, 'community', e.detail?.id.toString(), 'page')
                                }}
                            />
                        </span>
                    {/if}
                </button>
            </MenuButton>
            

            <!---Filter for a Person--->
            <MenuButton>
                <button class="flex flex-row gap-4 w-full" on:click|stopPropagation>
                    <Icon mini src={User} width={iconSize-2} />

                    {#if filter.person}
                        <div class="flex flex-row w-full justify-between">
                            <UserLink avatar={true} avatarSize={iconSize} user={filter.person} />
                        
                            <button class="cursor-pointer" on:click={() => filter.person = undefined}>
                                <Icon src={XCircle} mini width={iconSize-2}/>
                            </button>
                        </div>
                    {:else}
                        <span class="flex flex-row gap-2 w-full">
                            <PersonAutocomplete
                                containerClass="!w-full"
                                placeholder="Creator"
                                on:select={(e) => {
                                    filter.person = e.detail
                                }}
                            />
                        </span>
                    {/if}
                </button>
            </MenuButton>
            
            <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
            <!--- Reset Search Filters--->
            <MenuButton class="!gap-4" on:click={() => {
                filter = default_filter
                filter.type = 'All'
                data.results = []
            }}
            >
                <Icon src={ArrowPathRoundedSquare} class="h-8" mini width={iconSize-2}/>
                Reset Search Filters
            </MenuButton>
        </SubnavbarMenu>

    </span>
    
    <!---Search Input in Subnavbar-->
    <span class="hidden xl:flex flex-row gap-0" let:iconSize slot="center">
        <form class="flex flex-row gap-0 items-center mr-auto"
            on:submit={(e) => {
                e.preventDefault();
                search()
            }}
        >
            <TextInput type="search" placeholder="Search" bind:value={filter.query}/>

            <Button submit color="tertiary">
                <Icon src={MagnifyingGlass} mini width={iconSize} />
            </Button>

            <!---Reset Search Button--->
            <Button color="tertiary" size="sm" title="Clear Search" on:click={() => resetSearch() } >
                <Icon src={XCircle} mini width={iconSize-2}/>
            </Button>
        </form>

        
    </span>
</SubNavbar>

<MainContentArea>
    <!---Search Input Outside of Subnavbar for Views Smaller than XL--->
    <div class="flex xl:hidden w-full mx-auto">
        <form class="flex flex-row gap-1 items-center ml-auto mr-auto"
            on:submit={(e) => {
                e.preventDefault();
                search()
            }}
        >
            <TextInput type="search" placeholder="Search" bind:value={filter.query}/>
            <Button submit color="tertiary">
                <Icon src={MagnifyingGlass} mini width={24} />
            </Button>
            
            <!---Reset Search Button--->
            <Button color="tertiary" size="sm" title="Clear Search" on:click={() => resetSearch() }>
                <Icon src={XCircle} mini width={24}/>
            </Button>
        </form>
    </div>
    
    <!--- Display Results or No Results or Searching Spinner--->
    {#if !data.results || (data?.results && data.results.length < 1)}
        {#if searching}
            <div class="flex gap-2 items-center mx-auto mt-4" out:slide={{ axis: 'y', easing: expoOut }} >
                <Spinner width={48} />
                <span>Searching...</span>
            </div>
        {:else}
            <Placeholder icon={MagnifyingGlass} title="No results" />
        {/if}
        
    {:else}
        {#await data.streamed.object}
            <div class="flex flex-col gap-2 items-center mx-auto mt-4" out:slide={{ axis: 'y', easing: expoOut }} >
                <Spinner width={24} />
                <span>Federating...</span>
            </div>
        {:then object}

            {#if object}
                <div transition:slide={{ axis: 'y', easing: expoOut }}>
                    {#if object.community}
                        <CommunityItem community={object.community} />
                    {/if}
                    
                    {#if object.post}
                        <Post post={object.post} />
                    {/if}
                    
                    {#if object.comment}
                        <CommentItem comment={object.comment} />
                    {/if}
                    
                    {#if object.person}
                        <UserItem user={object.person} />
                    {/if}
                </div>
            {/if}
        {/await}

        <div data-sveltekit-preload-data="hover" class="w-full 
            {$userSettings.uiState.feedMargins ? 'sm:w-full md:w-[85%] lg:w-[90%] xl:w-[80%]' : ''}
            ml-auto mr-auto flex flex-col gap-5"
        >
            {#each data.results as result}
                {#if isPostView(result)}
                    <Post post={result} />
                {:else if isCommentView(result)}
                    <CommentItem comment={result} />
                {:else if isCommunityView(result)}
                    <CommunityItem community={result} />
                {:else if isUser(result)}
                    <UserItem user={result} />
                {/if}
            {/each}
        </div>
    {/if}

    <div class="mt-4" />
    {#if data?.results && data.results.length > 0 || data.page > 1}
        <Pageination bind:page={data.page} on:change={(p) => {
            filter.page = p.detail
            window.scrollTo(0,0)
            search()
            //searchParam($page.url, 'page', p.detail.toString())
        }}/>
    {/if}


    <!--- Site Sidebar--->
    <div class="flex h-full" slot="right-panel">
        {#if $site}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version} />
        {/if}
    </div>
</MainContentArea>




