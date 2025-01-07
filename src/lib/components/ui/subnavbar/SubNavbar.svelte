<script lang="ts">
    import type { ListingType, PostView, SortType } from 'lemmy-js-client'

    import { arrayRange, searchParam } from '$lib/util.js'
    import { createEventDispatcher } from 'svelte'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { amModOfAny, quickSettingsModal } from '$lib/components/lemmy/moderation/moderation'
    import { setSessionStorage } from '$lib/session'
    import { userSettings } from '$lib/settings'
    
    import { 
        getPostTitleWithoutFlairs, 
        scrollToLastSeenPost,
        selectViewType
    } from '$lib/components/lemmy/post/helpers'
    
    import { 
        sortOptions as defaultSortOptions, 
        sortOptionNames as defaultSortOptionNames
    } from '$lib/lemmy'
    
    import Button from '$lib/components/input/Button.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    
    import {
        Icon,
        ArrowLeftCircle,
        ArrowPath,
        ArrowsPointingIn,
        ArrowsPointingOut,
        BarsArrowDown,
        Bars3,
        ChevronDoubleDown,
        ChevronDoubleRight,
        ChevronDoubleUp,
        ChevronDown,
        ChevronUp,
        DocumentDuplicate,
        Home,
        Window,
        Cog6Tooth,
    } from 'svelte-hero-icons'
    import { profile } from '$lib/auth';

    export let iconSize:number = 28

    // Which standard buttons to show
    export let home:boolean = false             // Return to home
    export let back:boolean = false             // Back (literally emulates browser back button)
    export let backPreventDefault:boolean = false   // Prevent the default behavior for "back" button.
    
    
    export let scrollButtons:boolean = false    // Scroll to top/bottom buttons
    export let scrollPreventDefault: boolean = false    // Send an event instead of taking an action
    
    export let pageUpDownButtons:boolean = false // Page up/down
    export let compactSwitch:boolean = false    // Switch between compact and card posts
    export let toggleMargins:boolean = false    // Whether to toggle the margins on/off in the feed
    
    export let refreshButton:boolean = false    // Button to refresh the current page
    export let refreshPreventDefault:boolean = false    // Prevent the default reload with invalidate 
    export let refreshButtonLoading: boolean = false
    
    export let toggleCommunitySidebar:boolean = false   //Toggle the right-side community sidebar open/closed
    export let quickSettings:boolean = false
    //export let qsShiftLeft:number = 0           // Number of button slots to shift the quick settings menu to the left of

    // Post Listing Type (Local, Subscribed, All)
    export let listingType:boolean              = false;
    export let listingTypeOptions:string[]      = ['Subscribed', 'Local', 'All'] as ListingType[]
    export let listingTypeOptionNames:string[]  = [...listingTypeOptions] as ListingType[]

    //export let listingTypeOnSelect              = (e:CustomEvent<string>) => { searchParam($page.url, 'type', e.detail, 'page') }
    export let selectedListingType:string       = 'All'
    export let listingTypeTitle:string          = 'Listing Type'

    // Sort menu
    export let sortMenu:boolean                 = false
    export let moderatorViewItem: boolean       = false
    export let sortOptions:SortType[]           =  defaultSortOptions
    export let sortOptionNames:string[]         =  defaultSortOptionNames
    export let selectedSortOption:SortType      = 'New'
    export let sortPreventDefault:boolean       = false

    // Page Selection
    export let pageSelection:boolean            = false
    export let currentPage:number               = 1
    export let pageSelectPreventDefault:boolean = false

    // Post/Community/Moderator Action Menus
    export let post:PostView | undefined        = undefined
    export let postTitle:boolean                = false     // Post title in center of bar
    
    // Conditionally add/remove "Moderator View" to the listing types if the user is a mod or admin
    $:  if (moderatorViewItem && $profile?.user && amModOfAny($profile.user)) {
            if (!listingTypeOptions.includes('ModeratorView'))      listingTypeOptions.push('ModeratorView')
            if (!listingTypeOptionNames.includes('Moderator View')) listingTypeOptionNames.push("Moderator View")
        }
        else {
            if (listingTypeOptions.includes('ModeratorView'))       listingTypeOptions.splice(listingTypeOptions.indexOf('ModeratorView'), 1)
            if (listingTypeOptionNames.includes('ModeratorView'))   listingTypeOptionNames.splice(listingTypeOptionNames.indexOf('Moderator View'), 1)
        }
    const dispatcher = createEventDispatcher
        <{ 
            navChangeSort?: SortType,
            navBack?: null,
            navRefresh?: null,
            navPageSelect?: number,
            navScrollBottom?: null,
            navScrollTop?: null,
            navChangeListingType?: ListingType
        }>()
</script>


<header class="sticky top-16 ml-[-0.5rem] w-[calc(100%+1rem)] h-[3rem] px-2 py-1 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-30 mt-[-0.9rem] {$$props.class}">
    
    <slot name="above" />
    
    <span class="flex flex-row gap-0 sm:gap-1 md:gap-2 items-center text-sm text-center mx-auto md:mr-2">
        
        <!--Home Button-->
        {#if home }
            <Button link href="/" title="Home" data-sveltekit-preload-data="hover" size="sm" color="tertiary" >
                <Icon src={Home} width={iconSize} />
            </Button>
        {/if}

        {#if back}
            <!--Back Button-->
            <Button title="Back" data-sveltekit-preload-data="hover"
                color="tertiary"
                size="sm"
                on:click={() => {
                    dispatcher('navBack')
                    if (!backPreventDefault) history.back();
                }}
            >
                <Icon src={ArrowLeftCircle} width={iconSize} />
            </Button>
        {/if}

        
        
        <!--- Custom Items to the left of the spacer--->
        <slot {iconSize} name="far-left"/>

        

        <span class="flex flex-row gap-1 md:gap-2 items-center">
            <!--- Post Listing Type--->
            {#if listingType && selectedListingType }
                <!---Listing Type--->
                <SelectMenu
                    alignment="bottom-left"
                    options={listingTypeOptions}
                    optionNames={listingTypeOptionNames}
                    selected={selectedListingType}
                    title={listingTypeTitle}
                    icon={Bars3}
                    iconSize={18}
                    on:select={(e) => {
                        // @ts-ignore
                        dispatcher('navChangeListingType', e.detail)
                    }}
                />
            {/if}

            <!---Sort Menu--->
            {#if sortMenu && sortOptions && sortOptionNames && selectedSortOption }
                <SelectMenu
                    alignment="bottom-left"
                    options={sortOptions}
                    optionNames={sortOptionNames}
                    bind:selected={selectedSortOption}
                    title="Sort Direction"
                    icon={BarsArrowDown}
                    iconSize={18}
                    on:select={(e) => {
                        if (!sortPreventDefault) searchParam($page.url, 'sort', e.detail, 'page')
                        // @ts-ignore
                        dispatcher('navChangeSort', e.detail)
                    }}
                />
            {/if}

            <!---Post View Mode (eventually need to change the legacy `compactSwitch` variable)--->
            {#if compactSwitch}
                <SelectMenu
                    alignment="bottom-center"
                    options={['card', 'hybrid', 'compact', 'compacter', 'wide-compact', 'more-compact', 'ultra-compact', 'reader']}
                    optionNames={['Card', 'Hybrid', 'Compact', "Compacter", 'Wide Compact', 'More Compact', 'Ultra Compact', 'Reader']}
                    selected={$userSettings.uiState.view}
                    title="Post View Type"
                    icon={Window}
                    iconSize={18}
                    showSelectedLabel={false}
                    on:select={selectViewType}
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
                    <Markdown source={getPostTitleWithoutFlairs(post.post.name)} noUserCommunityLink noHashtags noLink/>
                </span>
            {/if}

            <slot {iconSize} name="center" />
        </div>
        
        <!--- Custom Items to the right of the spacer--->
        <slot {iconSize} name="right"/>
        
        
        
        <!--- Refresh Button--->
        {#if refreshButton}
            <Button title="Refresh" size="sm" color="tertiary" icon={ArrowPath} {iconSize} 
                bind:loading={refreshButtonLoading} bind:disabled={refreshButtonLoading}
                on:click={async () => {
                    dispatcher('navRefresh')
                    if (!refreshPreventDefault) {
                        setSessionStorage('lastClickedPost', undefined)
                        await goto(window.location.href, {invalidateAll: true});
                    }
                }}
            />
        {/if}

        <!---Quick Settings--->
        {#if quickSettings}
            <Button title="Quick Settings" size="sm" color="tertiary"
                on:click={() => quickSettingsModal({
                        listingType: listingType,
                        listingTypeOptions: listingTypeOptions,
                        listingTypeOptionNames: listingTypeOptionNames,
                        selectedListingType: selectedListingType,
                        listingTypeTitle: listingTypeTitle,
                        sortMenu: sortMenu,
                        sortOptions: sortOptions,
                        sortOptionNames: sortOptionNames,
                        selectedSortOption: selectedSortOption,
                        sortPreventDefault: sortPreventDefault,
                        iconSize: iconSize
                    })
                }
                >
                <Icon src={Cog6Tooth} width={iconSize}/>
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
                    if (scrollPreventDefault) {
                        dispatcher('navScrollBottom')
                    }
                    else {
                        window.scrollTo(0,document.body.scrollHeight);
                    }
                }}
            >
                <Icon src={ChevronDoubleDown} width={iconSize} />
            </Button>
            

            <!--Jump to Top-->
            <Button title="Scroll to Top" size="sm" color="tertiary"
                on:click={() => {
                    if (scrollPreventDefault) {
                        dispatcher('navScrollTop')
                    }
                    else {
                        window.scrollTo(0,0);
                    }
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

        

        <!---Community Sidebar Toggle (hide when screen width less than 'xl' breakpoint when the sidebar hides anyway)--->
        {#if toggleCommunitySidebar}
            <span class="hidden 2xl:flex">
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