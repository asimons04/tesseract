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
        Bars3,
        ChartBar,
        ChevronDoubleDown,
        ChevronDoubleUp,
        DocumentDuplicate,
        Home,
        QueueList,
        Window,
    } from 'svelte-hero-icons'

    // Which standard buttons to show
    export let home:boolean = true
    export let back:boolean = false
    export let scrollButtons:boolean = false            
    export let compactSwitch:boolean = false
    export let iconSize:number = 24

    export let listingType:boolean = false;
    export let selectedListingType:string = ''

    export let sortMenu:boolean = false
    export let sortOptions:string[] =  defaultSortOptions
    export let sortOptionNames:string[] =  defaultSortOptionNames
    export let selectedSortOption:string

    export let pageSelection:boolean = false
    export let currentPage:number = 1


</script>

<header class="sticky top-16 ml-[-0.5rem] w-[calc(100%+1rem)] px-2 backdrop-blur-3xl z-20 mt-[-0.9rem] {$$props.class}">
    <span class="flex flex-row gap-2 items-center font-bold text-sm text-center mx-auto my-2 mr-2">
        
        <!--Home Button-->
        {#if home}
        <span class="mt-[-6px] mr-2 cursor-pointer" title="Home"
            on:click={() => {
                goto('/', {invalidateAll: true});
            }}
        >
            <Icon src={Home} width={iconSize} />
        </span>
        {/if}

        {#if back}
        <!--Return to Feed Button-->
        <span class="mt-[-6px] mr-2 cursor-pointer" title="Return to Feed"
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
                options={['Subscribed', 'Local', 'All']}
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
        <span class="mt-[-6px] mr-2 cursor-pointer" title="Scroll to Bottom"
            on:click={() => {
                window.scrollTo(0,document.body.scrollHeight);
            }}
        >
            <Icon src={ChevronDoubleDown} width={iconSize} />
        </span>
        

        <!--Jump to Top-->
        <span class="mt-[-6px] mr-2 cursor-pointer" title="Scroll to Top"
            on:click={() => {
                window.scrollTo(0,0);
            }}
        >
            <Icon src={ChevronDoubleUp} width={iconSize} />
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