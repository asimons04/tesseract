<script lang="ts">
    interface SearchFilter {
        person?: Person,
        community?: Community
        sort?: string
        type?: string    
        query?: string
        page?: number
    }
    type Result = PostView | CommentView | PersonView | CommunityView

    import type {
        CommentView,
        Community,
        CommunityView,
        Person,
        PersonView,
        PostView,
        SearchResponse,
    } from 'lemmy-js-client'
    
    import type { LoadEvent } from '@sveltejs/kit';
    import type { RouteParams, Snapshot } from './$types';
    import { PageSnapshot } from '$lib/storage'

    import { expoInOut, expoOut } from 'svelte/easing'
    import { fly, slide } from 'svelte/transition'
    import { onMount } from 'svelte';
    
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
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte';
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
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import SubnavbarMenu from '$lib/components/ui/subnavbar/SubnavbarMenu.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte';
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { 
        Icon, 
        ArrowPathRoundedSquare,
        Bars3,
        ChatBubbleOvalLeftEllipsis,
        Funnel,
        MagnifyingGlass,
        User,
        UserCircle,
        UserGroup,
        Window,
        XCircle
    } from 'svelte-hero-icons'
    
    
    

    export let data
    
   

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
            if (pageState.scrollY) await scrollTo(pageState.scrollY, 300)
            else window.scrollTo(0,0)
        }
    }
    
    async function search() {
        searching = true
        data.results = []
        data.counts = {posts:0, comments:0, users:0,communities:0,total:0}

        // Construct a new URL with just the origin/path to override any URL variables 
        const origin = new URL(window.location.href).origin
        const path = new URL(window.location.href).pathname

        const searchURL = new URL(origin)
        searchURL.pathname = path

        if (filter.person)      searchURL.searchParams.set('person_id', filter.person.id.toString())
        if (filter.community)   searchURL.searchParams.set('community_id', filter.community.id.toString())
        if (filter.sort)        searchURL.searchParams.set('sort', filter.sort)
        
        if (filter.type) {
            searchURL.searchParams.set('type', filter.type)
            pageState.panel = filter.type
        }
        if (filter.page)        searchURL.searchParams.set('page', filter.page.toString())
        if (filter.query)       searchURL.searchParams.set('q', filter.query)
        else {
            // Search for anything if person or community is selected but no term is given
            if (filter.person || filter.community) searchURL.searchParams.set('q', ' ')
        }
        
        const results = await load({url: searchURL} as LoadEvent<RouteParams, null, {}, "/search">)

        data = results
        searching = false
    }

    function resetSearch() {
        filter = default_filter
        filter.community = undefined
        filter.person = undefined
        filter.query = ''

        data.results = []
        data.filters = {}
        
        pageState.scrollY = 0
        pageState.panel = 'All'
        PageSnapshot.clear() 

        goto('/search', {invalidateAll: true})
    }
   
    
    let default_filter: SearchFilter = {
        sort: 'New',
        type: 'All',
        query: '',
        page: 1,
        community: undefined,
        person: undefined
    }

    let pageState = {
        scrollY: 0,
        panel: 'All'
    }

    let filter = default_filter
    let searching = false
    
    onMount(() => {
        // If the page data provides filters for community or person, set the local filter objects to those details
        if (data.filters?.community?.community_view) filter.community = data.filters.community.community_view.community
        if (data.filters?.person?.person_view) filter.person = data.filters.person.person_view.person
        if (data.query) filter.query = data.query
    })


</script>

<svelte:head>
    <title>Search</title>
</svelte:head>

<SubNavbar home scrollButtons  toggleMargins compactSwitch toggleCommunitySidebar
    sortMenu sortPreventDefault
    sortOptions={['New', 'Old']} 
    sortOptionNames={['New', 'Old']} 
    bind:selectedSortOption={filter.sort} 
    on:navChangeSort={(e) => {
        if (e && e.detail) {
            filter.sort = e.detail
        }
    }}
>

    <!---Custom Sub-Navbar Buttons for Search--->
    <span class="flex flex-row gap-1 md:gap-2 items-center" slot="far-left" let:iconSize>
        <SelectMenu
            options={['All', 'Posts', 'Comments', 'Communities', 'Users']}
            selected={filter.type}
            icon={Bars3}
            title="Search Type"
            on:select={(e) => {
                if (e.detail) {
                    filter.type = e.detail
                    pageState.panel = e.detail
                }
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
            <MenuButton class="!gap-4" on:click={() => { resetSearch() }}
            >
                <Icon src={ArrowPathRoundedSquare} class="h-8" mini width={iconSize-2}/>
                Reset Search Filters
            </MenuButton>
        </SubnavbarMenu>

    </span>
    
    <!---Search Input in Subnavbar-->
    <span class="hidden xl:flex flex-row gap-0" let:iconSize slot="center">
        <form class="flex flex-row gap-0 items-center mx-auto"
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
            <TextInput type="search" placeholder="Search {filter.community ? filter.community.name : ''} {filter.person ? `by ${filter.person.name}` : ''}" bind:value={filter.query}/>
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
            <div class="flex h-full w-full">
                <div class="mx-auto my-auto">
                    <Placeholder icon={MagnifyingGlass} title="No results" />
                </div>
            </div>
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
        
        <!--- Result Type Buttons--->
        {#if filter.type == 'All'}
        <div class="sticky top-[6.8rem] xl:top-[7rem] flex flex-row gap-1 -ml-2 px-2 py-1 w-[calc(100%+1rem)] bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-10" data-sveltekit-preload-data="false">
            <div class="flex flex-row gap-1 mx-auto">
                
                <Button color="tertiary" alignment="left" title="All" class="hover:bg-slate-200" on:click={() => pageState.panel='All'}>
                    <span class="flex flex-col items-center {pageState.panel=="All" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={MagnifyingGlass} mini size="18" title="All" />
                        <span class="text-center text-xs">All ({data.counts.total})</span>
                    </span>            
                </Button>

                <Button color="tertiary" alignment="left" title="Posts" class="hover:bg-slate-200" on:click={() => pageState.panel='Posts'}>
                    <span class="flex flex-col items-center {pageState.panel=="Posts" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={Window} mini size="18" title="Posts" />
                        <span class="text-center text-xs">Posts ({data.counts.posts})</span>
                    </span>            
                </Button>

                <Button color="tertiary" alignment="left" title="Comments" class="hover:bg-slate-200" on:click={() => pageState.panel='Comments'}>
                    <span class="flex flex-col items-center {pageState.panel=="Comments" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={ChatBubbleOvalLeftEllipsis} mini size="18" title="Comments" />
                        <span class="text-center text-xs">Comments ({data.counts.comments})</span>
                    </span>            
                </Button>

                <Button color="tertiary" alignment="left" title="Communities" class="hover:bg-slate-200" on:click={() => pageState.panel='Communities'}>
                    <span class="flex flex-col items-center {pageState.panel=="Communities" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={UserGroup} mini size="18" title="Communities" />
                        <span class="text-center text-xs">Communities ({data.counts.communities})</span>
                    </span>            
                </Button>

                <Button color="tertiary" alignment="left" title="Users" class="hover:bg-slate-200" on:click={() => pageState.panel='Users'}>
                    <span class="flex flex-col items-center {pageState.panel=="Users" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={UserCircle} mini size="18" title="Users" />
                        <span class="text-center text-xs">Users ({data.counts.users})</span>
                    </span>            
                </Button>
            </div>
        </div>
        {/if}
        

        <div data-sveltekit-preload-data="false" class="w-full 
            {$userSettings.uiState.feedMargins ? 'sm:w-full md:w-[85%] lg:w-[90%] xl:w-[80%]' : ''}
            ml-auto mr-auto flex flex-col gap-5"
            
        >
            
            <!---{#if filter.type == 'All'}--->
                {#each data.results as result}
                    {#if isPostView(result)}
                        {#if (pageState.panel == 'Posts' || pageState.panel =='All' || filter.type == 'Posts')}
                            <Post bind:post={result} displayType='feed' />
                        {/if}
                    
                    {:else if isCommentView(result) }
                        {#if (pageState.panel == 'Comments' || pageState.panel =='All' || filter.type == 'Comments')}    
                            <CommentItem bind:comment={result} />
                        {/if}
                    
                    {:else if isCommunityView(result) }
                        {#if (pageState.panel == 'Communities' || pageState.panel =='All' || filter.type == 'Communities')}    
                            <CommunityItem bind:community={result} />
                        {/if}
                    
                    {:else if isUser(result) }
                        {#if (pageState.panel == 'Users' || pageState.panel =='All' || filter.type == 'Users')}
                            <UserItem bind:user={result} />
                        {/if}
                    {/if}
                {/each}
            <!---{/if}--->
        </div>
    {/if}

    <div class="mt-auto" />
    {#if data?.results && data.results.length >= data.limit || data.page > 1}
        <Pageination bind:page={data.page} on:change={(p) => {
            filter.page = p.detail
            window.scrollTo(0,0)
            search()
            //searchParam($page.url, 'page', p.detail.toString())
        }}/>
    {/if}


    <!--- Site/Community/User Sidebar--->
    <div class="hidden xl:flex h-full" slot="right-panel">
        <!--- Display Site Sidebar by Default if community and user not selected-->
        {#if $site && !data?.filters?.community?.community_view && !data?.filters?.person?.person_view}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version} />
        {/if}

        <!---Display community card if community is selected and user is not seelcted--->
        {#if data?.filters?.community?.community_view && !data?.filters?.person?.person_view}
            <CommunityCard community_view={data.filters.community.community_view} moderators={data.filters.community.moderators}/>
        {/if}

        <!---Display user card if a user is selected in the filter--->
        {#if data?.filters?.person?.person_view}
            <UserCard person={data.filters.person.person_view} moderates={data.filters.person.moderates} />
        {/if}


    </div>
</MainContentArea>




