<script lang="ts">
    
    import { arrayRange, searchParam } from '$lib/util.js'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { 
        sortOptions as defaultSortOptions, 
        sortOptionNames as defaultSortOptionNames
    } from '$lib/lemmy'
    import { userSettings } from '$lib/settings'
    
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    
    import {
        Icon,
        ArrowLeftCircle,
        ArrowSmallRight,
        ArrowsPointingIn,
        ArrowsPointingOut,
        Bars3,
        ChartBar,
        ChevronDoubleDown,
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
    
    // Post Listing Type (Local, Subscribed, All)
    export let listingType:boolean              = false;
    export let listingTypeOptions:string[]      = ['Subscribed', 'Local', 'All']
    export let listingTypeOptionNames:string[]  = listingTypeOptions
    export let selectedListingType:string       = ''

    // Sort menu
    export let sortMenu:boolean                 = false
    export let sortOptions:string[]             =  defaultSortOptions
    export let sortOptionNames:string[]         =  defaultSortOptionNames
    export let selectedSortOption:string        = ''

    // Page Selection
    export let pageSelection:boolean            = false
    export let currentPage:number               = 1


</script>

<header class="sticky top-16 ml-[-0.5rem] w-[calc(100%+1rem)] px-2 backdrop-blur-3xl z-20 mt-[-0.9rem] {$$props.class}">
    
    <span class="flex flex-row gap-2 items-center font-bold text-sm text-center mx-auto my-2 mr-2">
        
        <!--Home Button-->
        {#if home}
            <span class="mr-2 cursor-pointer" title="Home"
                on:click={() => {
                    goto('/', {invalidateAll: true});
                }}
            >
                <Icon src={Home} width={iconSize} />
            </span>
        {/if}

        {#if back}
            <!--Return to Feed Button-->
            <span class="mr-2 cursor-pointer" title="Back"
                class:hidden={history.length<2}
                on:click={() => {
                    history.back();
                }}
            >
                <Icon src={ArrowLeftCircle} width={iconSize} />
            </span>
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
                on:select={(e) => {
                    // @ts-ignore
                    searchParam($page.url, 'type', e.detail, 'page')
                }}
            />
        {/if}

        <!---Sort Menu--->
        {#if sortMenu && sortOptions && sortOptionNames && selectedSortOption}
            {#if listingType} 
                <Icon src={ArrowSmallRight} mini width={24} /> 
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
                <Icon src={ArrowSmallRight} mini width={24} />
            {/if}
            
            <SelectMenu
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
        <slot name="left"/>
        

        <div class="mx-auto" />
        
        <!--- Custom Items to the right of the spacer--->
        <slot name="right"/>

        <!--Jump to Bottom-->
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
        <span class="hidden md:flex mr-2 cursor-pointer" title="{$userSettings.uiState.feedMargins ? 'Enable margins' : 'Disable margins'}."
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
            }}
            >
            <Icon src={$userSettings.showCompactPosts ? Window : QueueList} width={iconSize} />
        </span>
        {/if}

        
    </span>
</header>