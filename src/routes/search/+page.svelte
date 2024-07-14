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
    
    import type { LoadEvent } from '@sveltejs/kit';
    import type { RouteParams, Snapshot } from './$types';
    import { PageSnapshot } from '$lib/storage'

    import { expoOut } from 'svelte/easing'
    import { slide } from 'svelte/transition'
    import { onMount } from 'svelte';
    
    import {
        isCommentView,
        isCommunityView,
        isPostView,
        isUser,
    } from '$lib/lemmy/item.js'
    
    
    import { beforeNavigate, goto } from '$app/navigation'
    import { load } from './+page'
    import { scrollTo } from '$lib/components/lemmy/post/helpers'
    import { site } from '$lib/lemmy'
    import { toast } from '$lib/components/ui/toasts/toasts'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import CommunityAutocomplete from '$lib/components/lemmy/CommunityAutocomplete.svelte'
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte';
    import CommunityItem from '$lib/components/lemmy/community/CommunityItem.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import InfiniteScroll from '$lib/components/ui/InfiniteScroll.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import PersonAutocomplete from '$lib/components/lemmy/PersonAutocomplete.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import UserItem from '$lib/components/lemmy/user/UserItem.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import SubnavbarMenu from '$lib/components/ui/subnavbar/SubnavbarMenu.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte';
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { 
        Icon, 
        Bars3,
        BarsArrowDown,
        ChatBubbleOvalLeftEllipsis,
        Funnel,
        MagnifyingGlass,
        Share,
        User,
        UserCircle,
        UserGroup,
        Window,
        XCircle,
    } from 'svelte-hero-icons'

    export let data
    
    // Default values for search filter.
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
    }
    
    // Infinite scroll object to hold config parms
    let infiniteScroll = {
        loading: false,     
        exhausted: false,   
        maxPosts: $userSettings.uiState.maxScrollPosts,      
        truncated: false,   
        enabled: $userSettings.uiState.infiniteScroll,
    }

    // Current values for search filter
    let filter = 
    { 
        ...default_filter,
        query: data.query,
        community: data.filters.community?.community_view.community,
        person: data.filters.person?.person_view.person,
        sort: data.sort,
        page: data.page,
        type: data.type
    }

    let searching = false
    let searchURL: URL|undefined = undefined //new URL(window.location.href)


    // Needed to re-enable scroll fetching when switching between an exhausted sort option (top hour) to one with more post (top day)
    beforeNavigate(() => {
        infiniteScroll.exhausted = false
    })

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

                PageSnapshot.clear()
            }
            catch { 
                PageSnapshot.clear() 
            }
            
            // Scroll to last stored position if found in snapshot data (delay by number of posts + 100 ms)
            if (pageState.scrollY) await scrollTo(pageState.scrollY, 300)
            else window.scrollTo(0,0)
        }
    }
    
    async function search(clear=true) {
        searching = true
        
        // Whether to clear the results (default) or append to them for infinite scroll
        if (clear) {
            data.results = []
            data.counts = {posts:0, comments:0, users:0,communities:0,total:0}
            infiniteScroll.exhausted = false
        }

        // Construct a new URL with just the origin/path to override any URL variables 
        const origin = new URL(window.location.href).origin
        const path = new URL(window.location.href).pathname

        searchURL = new URL(origin)
        searchURL.pathname = path

        if (filter.person)      searchURL.searchParams.set('person_id', filter.person.id.toString())
        if (filter.community)   searchURL.searchParams.set('community_id', filter.community.id.toString())
        if (filter.sort)        searchURL.searchParams.set('sort', filter.sort)
        
        if (filter.type) searchURL.searchParams.set('type', filter.type)

        if (filter.page)        searchURL.searchParams.set('page', filter.page.toString())
        if (filter.query)       searchURL.searchParams.set('q', filter.query)
        else {
            // Search for anything if person or community is selected but no term is given
            if (filter.person || filter.community) searchURL.searchParams.set('q', ' ')
        }
        
        // Fetch the results from the page loader with our custom URL
        const results = await load({url: searchURL} as LoadEvent<RouteParams, null, {}, "/search">)
        
        // Set the pagedata to the new data from our call (if not infinite scrolling)
        if ( clear ) data = results
        
        // Otherwise, append the results and update the counts
        else {
            results.results?.forEach((result) => {
                data.results?.push(result)
            })
            if (results?.results && results.results.length < 1) infiniteScroll.exhausted = true
            
            if (data.counts && results.counts) {
                data.counts.total += results.counts.total
                data.counts.posts += results.counts.posts
                data.counts.comments += results.counts.comments
                data.counts.users += results.counts.users
                data.counts.communities += results.counts.communities
            }

            data = data
            infiniteScroll.loading = false
        }

        searching = false
        
    }

    function resetSearch() {
        filter.community = undefined
        filter.person = undefined
        filter.query = ''
        filter.page = 1
        filter.sort = 'New'
        filter.type = 'All'

        data.results = []
        data.filters = {}
        
        searchURL = undefined

        pageState.scrollY = 0
        PageSnapshot.clear() 

        goto('/search', {invalidateAll: true})
    }

    function submitSearch() {
        filter.page = 1
        search()
    }
    
    // If the page data provides filters for community or person, set the local filter objects to those details
    onMount(() => {
        
        if (data.filters?.community?.community_view) filter.community = data.filters.community.community_view.community
        if (data.filters?.person?.person_view) filter.person = data.filters.person.person_view.person
        if (data.query) filter.query = data.query
    })


</script>

<svelte:head>
    <title>Search</title>
</svelte:head>

<SubNavbar home back scrollButtons  toggleMargins compactSwitch toggleCommunitySidebar >

    <!--- Search Filter Menu --->
    <SubnavbarMenu alignment="bottom-left" icon={Funnel} shiftLeft={2} slot="far-left" let:iconSize >
        <div class="flex flex-col w-full p-2 gap-2 min-w-[40vw] md:min-w-[25vw] cursor-default">
            
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="flex flex-col w-full gap-2 cursor-default" on:click|preventDefault|stopPropagation>
                
                <!--Search Type and Sorting--->
                <Card class="flex flex-col gap-0 p-2">
                    <!---Search Type--->
                    <SettingMultiSelect
                        padding={false} small={true} justify={true}    
                        options={['All', 'Posts', 'Comments', 'Communities', 'Users']}
                        selected={filter.type}
                        icon={Bars3}
                        title="Search Type"
                        on:select={(e) => {
                            if (e.detail) {
                                filter.type = e.detail
                            }
                        }}
                    />

                    <!---Sort Direction--->
                    <SettingMultiSelect
                        padding={false} small={true} justify={true}    
                        options={['New', 'Old']} 
                        selected={filter.sort}
                        icon={BarsArrowDown}
                        title="Sort Direction"
                        on:select={(e) => {
                            if (e.detail) {
                                filter.sort = e.detail
                            }
                        }}
                    />
                </Card>
            

                <!--Community and User Filters--->
                <Card class="flex flex-col gap-4 p-2">
                    
                    <!--- Lookup a Community to Filter--->
                    <div class="flex flex-row gap-4 w-full items-center">
                        <Icon mini src={UserGroup} width={16} />
                        
                        {#if filter.community?.id}
                            <div class="flex flex-row w-full justify-between">
                                <CommunityLink avatar={true} avatarSize={16} community={filter.community} />
                                
                                <button class="cursor-pointer ml-2" on:click={() => filter.community = undefined }>
                                    <Icon src={XCircle} mini width={24}/>
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
                    </div>

                    <!---Filter for a Person--->
                    <div class="flex flex-row gap-4 w-full items-center">
                        <Icon mini src={User} width={16} />

                        {#if filter.person}
                            <div class="flex flex-row w-full justify-between">
                                <UserLink avatar={true} avatarSize={16} user={filter.person} badges={false} useDisplayNames={false} shortenDisplayName={true}/>
                            
                                <button class="cursor-pointer ml-2" on:click={() => filter.person = undefined}>
                                    <Icon src={XCircle} mini width={24}/>
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
                    </div>

                    <!---Search Term--->
                    <form class="flex flex-col gap-4 w-full items-center">
                        <span class="flex flex-row gap-4 w-full items-center">
                            <Icon src={MagnifyingGlass} mini width={16} />

                            <TextInput type="text" placeholder="Keywords" class="w-full" bind:value={filter.query}
                                on:keydown={(e) => {
                                    if (e.detail.key == 'Enter') submitSearch()
                                }}
                            />
                        </span>
                        
                        <span class="flex flex-row gap-4 w-full items-center">
                            <!---Reset Search Button--->
                            <Button color="danger" size="sm" class="w-full" title="Clear Search" on:click={() => resetSearch() } >
                                <Icon src={XCircle} mini width={24}/>
                                Clear
                            </Button>

                            <Button color="primary" class="w-full" on:click={() => submitSearch() }>
                                <Icon src={MagnifyingGlass} mini width={16} />
                                Search
                            </Button>
                        </span>
                       
                    </form>
                </Card>
            </div>
        </div>
    </SubnavbarMenu>

    
    
    <!---Search Input in Subnavbar-->
    <span class="hidden xl:flex flex-row gap-0" let:iconSize slot="center">
        <form class="flex flex-row gap-0 items-center mx-auto"
            on:submit|preventDefault={() => {
                filter.page = 1
                search()
            }}
        >
            <TextInput type="search" placeholder="Search" bind:value={filter.query}/>

            <Button submit color="tertiary">
                <Icon src={MagnifyingGlass} mini width={iconSize} />
                Search
            </Button>

            <!---Reset Search Button--->
            <Button color="tertiary" size="sm" title="Clear Search" on:click={() => resetSearch() } >
                <Icon src={XCircle} mini width={iconSize-2}/>
                Reset
            </Button>

            <!---Share Permalink to this Search--->
            <Button color="tertiary" size="sm" title="Copy Share Link" on:click={() => {
                if (searchURL) {
                    navigator.share?.( {url: searchURL.toString()} ) ?? navigator.clipboard.writeText(searchURL.toString())
                }
                else {
                    navigator.share?.({url: window.location.href}) ?? navigator.clipboard.writeText(window.location.href)
                }
                toast({
                    type: 'success',
                    content: `Copied search permalink to clipboard!`,
                    title: 'Copied!'
                })
                
            }}>
                <Icon src={Share} min width={24}/>
            </Button>
        </form>
    </span>
</SubNavbar>

<MainContentArea>
    
    <!---Search Input Outside of Subnavbar for Views Smaller than XL--->
    <div class="flex xl:hidden w-full mx-auto">
        <form class="flex flex-row gap-1 items-center ml-auto mr-auto"
            on:submit|preventDefault={() => {
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

            <!---Share Permalink to this Search--->
            <Button color="tertiary" size="sm" title="Copy Share Link" on:click={() => {
                if (searchURL) {
                    navigator.share?.( {url: searchURL.toString()} ) ?? navigator.clipboard.writeText(searchURL.toString())
                }
                else {
                    navigator.share?.({url: window.location.href}) ?? navigator.clipboard.writeText(window.location.href)
                }
                toast({
                    type: 'success',
                    content: `Copied search permalink to clipboard!`,
                    title: 'Copied!'
                })
                
            }}>
                <Icon src={Share} min width={24}/>
            </Button>
        </form>
    </div>
    
    <!---Show federated resolve if any--->
    
    {#if data?.streamed?.object}
    <FeedContainer>
        {#await data.streamed.object}
            <div class="flex flex-col gap-2 items-center mx-auto mt-4" out:slide={{ axis: 'y', easing: expoOut }} >
                <Spinner width={48} />
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
    </FeedContainer>
    {/if}
    


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
       
        <!--- Result Type Buttons--->
        <div class="sticky top-[6.8rem] xl:top-[7rem] flex flex-row gap-1 -ml-2 px-2 py-1 w-[calc(100%+1rem)] bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-10" data-sveltekit-preload-data="false">
            <div class="flex flex-row gap-1 mx-auto">
                
                <Button color="tertiary" alignment="left" title="All" class="hover:bg-slate-200" on:click={() => filter.type='All'}>
                    <span class="flex flex-col items-center {filter.type=="All" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={MagnifyingGlass} mini size="18" title="All" />
                        <span class="text-center text-xs">All ({data.counts.total})</span>
                    </span>            
                </Button>

                <Button color="tertiary" alignment="left" title="Posts" class="hover:bg-slate-200" on:click={() => filter.type='Posts'}>
                    <span class="flex flex-col items-center {filter.type=="Posts" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={Window} mini size="18" title="Posts" />
                        <span class="text-center text-xs">Posts ({data.counts.posts})</span>
                    </span>            
                </Button>

                <Button color="tertiary" alignment="left" title="Comments" class="hover:bg-slate-200" on:click={() => filter.type='Comments'}>
                    <span class="flex flex-col items-center {filter.type=="Comments" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={ChatBubbleOvalLeftEllipsis} mini size="18" title="Comments" />
                        <span class="text-center text-xs">Comments ({data.counts.comments})</span>
                    </span>            
                </Button>

                <Button color="tertiary" alignment="left" title="Communities" class="hover:bg-slate-200" on:click={() => filter.type='Communities'}>
                    <span class="flex flex-col items-center {filter.type=="Communities" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={UserGroup} mini size="18" title="Communities" />
                        <span class="text-center text-xs">Communities ({data.counts.communities})</span>
                    </span>            
                </Button>

                <Button color="tertiary" alignment="left" title="Users" class="hover:bg-slate-200" on:click={() => filter.type='Users'}>
                    <span class="flex flex-col items-center {filter.type=="Users" ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={UserCircle} mini size="18" title="Users" />
                        <span class="text-center text-xs">Users ({data.counts.users})</span>
                    </span>            
                </Button>
            </div>
        </div>
        
        <FeedContainer>    
            {#each data.results as result}
                {#if isPostView(result)}
                    {#if (filter.type == 'Posts' || filter.type=='All')}
                        <Post bind:post={result} displayType='feed' />
                    {/if}
                
                {:else if isCommentView(result) }
                    {#if (filter.type == 'Comments' || filter.type=='All')}    
                        <CommentItem bind:comment={result} />
                    {/if}
                
                {:else if isCommunityView(result) }
                    {#if (filter.type == 'Communities' || filter.type=='All')}    
                        <CommunityItem bind:community={result} />
                    {/if}
                
                {:else if isUser(result) }
                    {#if (filter.type == 'Users' || filter.type=='All')}
                        <UserItem bind:user={result} />
                    {/if}
                {/if}
            {/each}
        </FeedContainer>
    {/if}

    {#if 
        (filter.type == 'Posts' && data.counts && data.counts.posts > 1) ||
        (filter.type == 'Comments' && data.counts && data.counts.comments > 1) ||
        (filter.type == 'Communities' && data.counts && data.counts.communities > 1) ||
        (filter.type == 'Users' && data.counts && data.counts.users > 1) ||
        (filter.type == 'All' && data.counts && data.counts.total > 1)
    }
        <InfiniteScroll bind:loading={infiniteScroll.loading} bind:exhausted={infiniteScroll.exhausted} threshold={75} bind:enabled={infiniteScroll.enabled}
            disableBack={filter.page < 2}
            on:loadMore={ () => {
                if (!infiniteScroll.exhausted && !infiniteScroll.loading) {
                    infiniteScroll.loading = true
                    if (filter.page) filter.page = filter.page + 1
                    search(false)
                }
            }}

            on:next={ () => {
                if (filter.page) filter.page++
                search(true)
            }}

            on:prev={ () => {
                if (filter.page && filter.page > 1) filter.page--
                search(true)
            }}
        />
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




