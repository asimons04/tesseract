<script lang="ts">
    import type { PostView } from 'lemmy-js-client'

    import { amMod, ban, isAdmin, remove } from '$lib/components/lemmy/moderation/moderation'
    import { arrayRange, searchParam } from '$lib/util.js'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { 
        sortOptions as defaultSortOptions, 
        sortOptionNames as defaultSortOptionNames
    } from '$lib/lemmy'
    import { userSettings } from '$lib/settings'
    
    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
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
        Bars3,
        ChartBar,
        ChevronDoubleDown,
        ChevronDoubleRight,
        ChevronDoubleUp,
        DocumentDuplicate,
        Home,
        QueueList,
        Window,
    } from 'svelte-hero-icons'


    export let iconSize:number = 28

    // Which standard buttons to show
    export let home:boolean = true              // Return to home
    export let back:boolean = false             // Back (literally emulates browser back button)
    export let scrollButtons:boolean = false    // Scroll to top/bottom buttons

    export let compactSwitch:boolean = false    // Switch between compact and card posts
    export let toggleMargins:boolean = false    // Whether to toggle the margins on/off in the feed
    export let refreshButton:boolean = false    // Button to refresh the current page
    export let toggleCommunitySidebar:boolean = false   //Toggle the right-side community sidebar open/closed
    export let toggleSiteSidebar:boolean = false        // Toggle the right-side site sidebar open/closed

    // Post Listing Type (Local, Subscribed, All)
    export let listingType:boolean              = false;
    export let listingTypeOptions:string[]      = ['Subscribed', 'Local', 'All']
    export let listingTypeOptionNames:string[]  = listingTypeOptions
    export let listingTypeOnSelect:Function     = (e) => { searchParam($page.url, 'type', e.detail, 'page') }
    export let selectedListingType:string       = ''

    // Sort menu
    export let sortMenu:boolean                 = false
    export let sortOptions:string[]             =  defaultSortOptions
    export let sortOptionNames:string[]         =  defaultSortOptionNames
    export let selectedSortOption:string        = ''

    // Page Selection
    export let pageSelection:boolean            = false
    export let currentPage:number               = 1

    // Post/Community/Moderator Action Menus
    export let postActionsMenu:boolean          = false
    export let communityActionsMenu:boolean     = false
    export let moderationMenu:boolean           = false
    export let post:PostView | undefined        = undefined


    let addCommunityGroup:boolean               = false
    let editPostModal:boolean                   = false

   
</script>

<!---Hacks to launch the editor modals and keep them over the outer layout since they're inside a fixed element--->
<!-- Note: Plan to add the modals to the layout pass data to them like the moderation modals--->
{#if addCommunityGroup && post?.community}
    <AddCommunityGroup bind:open={addCommunityGroup} community={post.community} />
{/if}

{#if editPostModal && post}
    <PostEditorModal bind:open={editPostModal} bind:post on:openPostEditor1={(e) => { console.log(e) }}/>
{/if}


<header class="sticky top-16 ml-[-0.5rem] w-[calc(100%+1rem)] px-2 py-1 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-20 mt-[-0.9rem] {$$props.class}">
    
    <span class="flex flex-row gap-2 md:gap-2 items-center text-sm text-center mx-auto my-2 md:mr-2">
        
        <!--Home Button-->
        {#if home}
            <a href="/" class="mr-2 cursor-pointer" title="Home" data-sveltekit-preload-data="hover">
                <Icon src={Home} width={iconSize} />
            </a>
        {/if}

        {#if back}
            <!--Return to Feed Button-->
            <span class="mr-2 cursor-pointer" title="Back" data-sveltekit-preload-data="hover"
                class:hidden={history.length<2}
                on:click={() => {
                    history.back();
                }}
            >
                <Icon src={ArrowLeftCircle} width={iconSize} />
            </span>
        {/if}

        <!--- Post Community Actions Menu--->
        {#if communityActionsMenu}
            <CommunityActionMenu bind:post alignment="bottom-left" menuIconSize={iconSize} suppressModal on:addGroup={()=>{ addCommunityGroup = true }}
            />
        {/if}
        
        <!-- Post Action Button (only used in posts)--->
        {#if postActionsMenu && post}
            <PostActionsMenu bind:post alignment="bottom-left" menuIconSize={iconSize} icon={Window} suppressModal on:openPostEditor={()=> {editPostModal = true}}
            />
        {/if}

        <!--- Moderation Menu--->
        {#if moderationMenu && $profile?.user && post && (amMod($profile.user, post.community) || isAdmin($profile.user))}
            <ModerationMenu bind:item={post} community={post.community} color="ghost" menuIconSize={iconSize-4} alignment="bottom-left"/>
        {/if}

        
        <!--- Post Listing Type--->
        {#if listingType && selectedListingType}
            <!---Listing Type--->
            <SelectMenu
                alignment="bottom-left"
                options={listingTypeOptions}
                optionNames={listingTypeOptionNames}
                selected={selectedListingType}
                title="Listing Type"
                icon={Bars3}
                on:select={listingTypeOnSelect}
            />
        {/if}

        <!---Sort Menu--->
        {#if sortMenu && sortOptions && sortOptionNames && selectedSortOption}
            {#if listingType} 
                <Icon src={ArrowSmallRight} mini width={24} class="hidden md:flex"/> 
            {/if}
            
            <SelectMenu
                alignment="bottom-left"
                options={sortOptions}
                optionNames={sortOptionNames}
                selected={selectedSortOption}
                title="Sort Direction"
                icon={ChartBar}
                on:select={(e) => {
                    // @ts-ignore
                    searchParam($page.url, 'sort', e.detail, 'page')
                }}
            />
        {/if}
        
        <!---Page Selector--->
        {#if pageSelection && currentPage}
            {#if sortMenu}
                <Icon src={ArrowSmallRight} mini width={24} class="hidden md:flex"/>
            {/if}
            
            <SelectMenu
                class="{$page.url.pathname.includes('/feeds') ? 'hidden sm:flex' : ''}"    
                alignment="bottom-left"
                options={arrayRange(1, currentPage +1)}
                selected={currentPage}
                title="Page"
                icon={DocumentDuplicate}
                on:select={(e) => {
                    // @ts-ignore
                    searchParam($page.url, 'page', e.detail.toString())
                }}`
            />
        {/if}


        <!--- Custom Items to the left of the spacer--->
        <slot {iconSize} name="left"/>
        
        <!---Left/Right Spacer--->
        <div class="mx-auto" />
        
        <!--- Custom Items to the right of the spacer--->
        <slot {iconSize} name="right"/>

        {#if refreshButton}
            <span class="mr-2 cursor-pointer" title="Refresh"
                on:click={() => {
                    goto(window.location.href, {invalidateAll: true});
                }}
                >
                <Icon src={ArrowPath} width={iconSize}/>
            </span>
        {/if}

        <!--Jump to Top/Bottom-->
        {#if scrollButtons}
            <span class="mr-2 cursor-pointer" title="Scroll to Bottom"
                on:click={() => {
                    window.scrollTo(0,document.body.scrollHeight);
                }}
            >
                <Icon src={ChevronDoubleDown} width={iconSize} />
            </span>
            

            <!--Jump to Top-->
            <span class="mr-2 cursor-pointer" title="Scroll to Top"
                on:click={() => {
                    window.scrollTo(0,0);
                }}
            >
                <Icon src={ChevronDoubleUp} width={iconSize} />
            </span>
        {/if}

        <!--- Toggle Margins on/off (hide until medium width since the margins disappear at the 'sm' breakpoint anyway) --->
        {#if toggleMargins}
            <span class="hidden md:flex mr-2 cursor-pointer" title="{$userSettings.uiState.feedMargins ? 'Disable margins' : 'Enable margins'}."
                on:click={() => {
                    $userSettings.uiState.feedMargins = !$userSettings.uiState.feedMargins
                }}
                >
                <Icon src={$userSettings.uiState.feedMargins ? ArrowsPointingOut : ArrowsPointingIn} width={iconSize} />
            </span>
        {/if}

        <!---Card/Compact Selection--->
        {#if compactSwitch}
            <span class="mr-2 cursor-pointer" title="Switch to {$userSettings.showCompactPosts ? 'card view' : 'compact view'}."
                on:click={() => {
                    $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                    if ($userSettings.showCompactPosts) $userSettings.uiState.feedMargins = false
                    else $userSettings.uiState.feedMargins = true
                }}
                >
                <Icon src={$userSettings.showCompactPosts ? Window : QueueList} width={iconSize} />
            </span>
        {/if}

        <!---Community Sidebar Toggle (hide when screen width less than 'xl' breakpoint when the sidebar hides anyway)--->
        {#if toggleCommunitySidebar}
            <span class="hidden xl:flex mr-2 cursor-pointer" title="{$userSettings.uiState.expandCommunitySidebar ? 'Collapse': 'Expand'} Community Sidebar"
                on:click={() => {
                    $userSettings.uiState.expandCommunitySidebar = !$userSettings.uiState.expandCommunitySidebar
                }}
            >
                <Icon src={ChevronDoubleRight} width={iconSize} class="transition-transform {$userSettings.uiState.expandCommunitySidebar ? '' : 'rotate-180'}" />
            </span>
        {/if}

        

        

        
    </span>
</header>