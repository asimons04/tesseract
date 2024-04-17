<script lang="ts">
    import type { PostView, SortType } from 'lemmy-js-client'

    import { amMod, ban, isAdmin, remove } from '$lib/components/lemmy/moderation/moderation'
    import { arrayRange, searchParam } from '$lib/util.js'
    import { createEventDispatcher } from 'svelte'
    import { getSessionStorage, setSessionStorage } from '$lib/session'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { fixLemmyEncodings, scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers'
    import { 
        sortOptions as defaultSortOptions, 
        sortOptionNames as defaultSortOptionNames
    } from '$lib/lemmy'
    import { userSettings } from '$lib/settings'
    
    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CommunityActionMenu from '$lib/components/lemmy/post/PostActions/CommunityActionMenu.svelte'
    import ModerationMenu       from '$lib/components/lemmy/moderation/ModerationMenu.svelte'
    import PostActionsMenu from '$lib/components/lemmy/post/PostActions/PostActionsMenu.svelte'
    import PostEditorModal from '$lib/components/lemmy/post/PostActions/PostEditorModal.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    
    import {
        Icon,
        ArrowLeftCircle,
        ArrowPath,
        ArrowsPointingIn,
        ArrowsPointingOut,
        ArrowSmallRight,
        BarsArrowDown,
        Bars3,
        ChartBar,
        ChevronDoubleDown,
        ChevronDoubleRight,
        ChevronDoubleUp,
        ChevronDown,
        ChevronUp,
        DocumentDuplicate,
        Home,
        QueueList,
        Window,
    } from 'svelte-hero-icons'


    export let iconSize:number = 28

    // Which standard buttons to show
    export let home:boolean = false             // Return to home
    export let back:boolean = false             // Back (literally emulates browser back button)
    export let scrollButtons:boolean = false    // Scroll to top/bottom buttons
    export let pageUpDownButtons:boolean = false // Page up/down
    export let compactSwitch:boolean = false    // Switch between compact and card posts
    export let toggleMargins:boolean = false    // Whether to toggle the margins on/off in the feed
    export let refreshButton:boolean = false    // Button to refresh the current page
    export let refreshPreventDefault:boolean = false    // Prevent the default reload with invalidate 
    export let toggleCommunitySidebar:boolean = false   //Toggle the right-side community sidebar open/closed

    // Post Listing Type (Local, Subscribed, All)
    export let listingType:boolean              = false;
    export let listingTypeOptions:string[]      = ['Subscribed', 'Local', 'All']
    export let listingTypeOptionNames:string[]  = listingTypeOptions
    export let listingTypeOnSelect              = (e:CustomEvent<string>) => { searchParam($page.url, 'type', e.detail, 'page') }
    export let selectedListingType:string       = ''
    export let listingTypeTitle:string          = 'Listing Type'

    // Sort menu
    export let sortMenu:boolean                 = false
    export let sortOptions:string[]             =  defaultSortOptions
    export let sortOptionNames:string[]         =  defaultSortOptionNames
    export let selectedSortOption:string        = ''
    export let sortPreventDefault:boolean       = false

    // Page Selection
    export let pageSelection:boolean            = false
    export let currentPage:number               = 1
    export let pageSelectPreventDefault:boolean = false

    // Post/Community/Moderator Action Menus
    export let postActionsMenu:boolean          = false
    export let communityActionsMenu:boolean     = false
    export let moderationMenu:boolean           = false
    export let post:PostView | undefined        = undefined
    export let postTitle:boolean                = false     // Post title in center of bar

    let addCommunityGroup:boolean               = false
    let editPostModal:boolean                   = false

    //const dispatcher = createEventDispatcher();
    const dispatcher = createEventDispatcher< 
        { 
            navChangeSort?: string,
            navBack?: null,
            navRefresh?: null,
            navPageSelect?: number
        }
    >()
    
    
   
</script>

<!---Hacks to launch the editor modals and keep them over the outer layout since they're inside a fixed element--->
<!-- Note: Plan to add the modals to the layout pass data to them like the moderation modals--->
{#if addCommunityGroup && post?.community}
    <AddCommunityGroup bind:open={addCommunityGroup} community={post.community} />
{/if}

{#if editPostModal && post}
    <PostEditorModal bind:open={editPostModal} bind:post on:edit={(e) => { console.log(e) }}/>
{/if}


<header class="sticky top-16 ml-[-0.5rem] w-[calc(100%+1rem)] h-[3rem] px-2 py-1 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-20 mt-[-0.9rem] {$$props.class}">
    
    <slot name="above" />
    
    <span class="flex flex-row gap-1 md:gap-2 items-center text-sm text-center mx-auto md:mr-2">
        
        <!--Home Button-->
        {#if home }
            <Button link href="/" title="Home" data-sveltekit-preload-data="hover" size="sm" color="tertiary">
                <Icon src={Home} width={iconSize} />
            </Button>
        {/if}

        {#if back && history.length > 1}
            <!--Return to Feed Button-->
            <Button title="Back" data-sveltekit-preload-data="hover"
                color="tertiary"
                size="sm"
                hidden={history.length<2}
                on:click={() => {
                    dispatcher('navBack')
                    history.back();
                }}
            >
                <Icon src={ArrowLeftCircle} width={iconSize} />
            </Button>
        {/if}
        
        <!--- Custom Items to the left of the spacer--->
        <slot {iconSize} name="far-left"/>

        <!--- Post Community Actions Menu--->
        {#if communityActionsMenu && post}
            <CommunityActionMenu bind:post alignment="bottom-left" menuIconSize={iconSize} suppressModal on:addGroup={()=>{ addCommunityGroup = true }}
            />
        {/if}
        
        <!-- Post Action Button (only used in posts)--->
        {#if postActionsMenu && post}
            <PostActionsMenu bind:post alignment="bottom-left" menuIconSize={iconSize} icon={Window} suppressModal on:edit={()=> {editPostModal = true}}
            />
        {/if}

        <!--- Moderation Menu--->
        {#if moderationMenu && $profile?.user && post && (amMod($profile.user, post.community) || isAdmin($profile.user))}
            <ModerationMenu bind:item={post} community={post.community} color="ghost" menuIconSize={iconSize-4} alignment="bottom-left"/>
        {/if}

        <span class="flex flex-row gap-1 md:gap-2 items-center">
            <!--- Post Listing Type--->
            {#if listingType && selectedListingType}
                <!---Listing Type--->
                <SelectMenu
                    alignment="bottom-left"
                    options={listingTypeOptions}
                    optionNames={listingTypeOptionNames}
                    selected={selectedListingType}
                    title={listingTypeTitle}
                    icon={Bars3}
                    iconSize={18}
                    on:select={listingTypeOnSelect}
                />
            {/if}

            <!---Sort Menu--->
            {#if sortMenu && sortOptions && sortOptionNames && selectedSortOption}
                <SelectMenu
                    alignment="bottom-left"
                    options={sortOptions}
                    optionNames={sortOptionNames}
                    selected={selectedSortOption}
                    title="Sort Direction"
                    icon={BarsArrowDown}
                    iconSize={18}
                    on:select={(e) => {
                        // @ts-ignore
                        if (!sortPreventDefault) searchParam($page.url, 'sort', e.detail, 'page')
                        dispatcher('navChangeSort', e.detail)
                    }}
                />
            {/if}
            
            <!---Page Selector (Deprecated)--->
            {#if pageSelection && currentPage}
               
                <SelectMenu
                    class="{$page.url.pathname.includes('/feeds') ? 'hidden sm:flex' : ''}"    
                    alignment="bottom-left"
                    options={arrayRange(1, currentPage +1)}
                    selected={currentPage}
                    title="Page"
                    icon={DocumentDuplicate}
                    on:select={(e) => {
                        // @ts-ignore
                        if (!pageSelectPreventDefault) searchParam($page.url, 'page', e.detail.toString())
                        dispatcher('navPageSelect', e.detail)
                    }}
                />
            {/if}
        </span>


        <!--- Custom Items to the left of the spacer--->
        <slot {iconSize} name="left"/>
        
        

        <!---Center Slot--->
        <div class="mx-auto w-1/2 xl:w-3/4">
            
            <!--- Post Title In Center (Cannot be used if using center slot for something)--->
            {#if post && postTitle}
                <span class="hidden md:block text-lg font-bold text-slate-600 dark:text-zinc-400 whitespace-nowrap text-ellipsis overflow-hidden">
                    {fixLemmyEncodings(post.post.name)}
                </span>
            {/if}

            <slot {iconSize} name="center" />
        </div>
        
        <!--- Custom Items to the right of the spacer--->
        <slot {iconSize} name="right"/>

        <!--- Refresh Button--->
        {#if refreshButton}
            <Button title="Refresh" size="sm" color="tertiary"
                on:click={async () => {
                    dispatcher('navRefresh')
                    if (!refreshPreventDefault) {
                        setSessionStorage('lastClickedPost', undefined)
                        await goto(window.location.href, {invalidateAll: true});
                    }
                }}
                >
                <Icon src={ArrowPath} width={iconSize}/>
            </Button>
        {/if}

        <!---Page Up/Down Buttons--->

        {#if pageUpDownButtons}
            <!--Page Down-->
            <button class="mr-2 cursor-pointer" title="Page Down"
                on:click={() => {
                    
                    window.scrollBy(0, (window.visualViewport?.height ?? 628) - 128)
                }}
            >
                <Icon src={ChevronDown} width={iconSize} />
            </button>
            

            <!--Page Up-->
            <button class="mr-2 cursor-pointer" title="Page Up"
                on:click={() => {
                    window.scrollBy(0, -(window.visualViewport?.height ?? 628 - 128))
                }}
            >
                <Icon src={ChevronUp} width={iconSize} />
            </button>

        {/if}
        
        
        <!--Jump to Top/Bottom-->
        {#if scrollButtons}
            <Button title="Scroll to Bottom" size="sm" color="tertiary"
                on:click={() => {
                    window.scrollTo(0,document.body.scrollHeight);
                }}
            >
                <Icon src={ChevronDoubleDown} width={iconSize} />
            </Button>
            

            <!--Jump to Top-->
            <Button title="Scroll to Top" size="sm" color="tertiary"
                on:click={() => {
                    window.scrollTo(0,0);
                }}
            >
                <Icon src={ChevronDoubleUp} width={iconSize} />
            </Button>
        {/if}

        <!--- Toggle Margins on/off (hide until medium width since the margins disappear at the 'sm' breakpoint anyway) --->
        {#if toggleMargins}
            <span class="hidden md:flex">
                <Button title="{$userSettings.uiState.feedMargins ? 'Disable margins' : 'Enable margins'}."
                    size="sm" color="tertiary" 
                    on:click={async () => {
                        $userSettings.uiState.feedMargins = !$userSettings.uiState.feedMargins
                        await scrollToLastSeenPost()
                    }}
                    >
                    <Icon src={$userSettings.uiState.feedMargins ? ArrowsPointingOut : ArrowsPointingIn} width={iconSize} />
                </Button>
            </span>
        {/if}

        <!---Card/Compact Selection--->
        {#if compactSwitch}
            <Button title="Switch to {$userSettings.showCompactPosts ? 'card view' : 'compact view'}."
                size="sm" color="tertiary"
                on:click={async () => {
                    $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                    if ($userSettings.showCompactPosts) $userSettings.uiState.feedMargins = false
                    else $userSettings.uiState.feedMargins = true
                    await scrollToLastSeenPost()
                }}
                >
                <Icon src={$userSettings.showCompactPosts ? Window : QueueList} width={iconSize} />
            </Button>
        {/if}

        <!---Community Sidebar Toggle (hide when screen width less than 'xl' breakpoint when the sidebar hides anyway)--->
        {#if toggleCommunitySidebar}
            <span class="hidden xl:flex">
                <Button title="{$userSettings.uiState.expandCommunitySidebar ? 'Collapse': 'Expand'} Community Sidebar"
                    size="sm" color="tertiary" 
                    on:click={() => {
                        $userSettings.uiState.expandCommunitySidebar = !$userSettings.uiState.expandCommunitySidebar
                    }}
                >
                    <Icon src={ChevronDoubleRight} width={iconSize} class="transition-transform {$userSettings.uiState.expandCommunitySidebar ? '' : 'rotate-180'}" />
                </Button>
            </span>
        {/if}

        

        

        
    </span>
</header>