<script lang="ts">
   
    import { page } from '$app/stores';
    import { scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers';
    import { searchParam } from '$lib/util';
    import { site } from '$lib/lemmy';
    import { userSettings} from '$lib/settings'
    
    import Card from '../Card.svelte';
    import MenuButton from '../menu/MenuButton.svelte';
    import SettingMultiSelect from '../settings/SettingMultiSelect.svelte';
    import SettingToggle from "../settings/SettingToggle.svelte"
    import SubnavbarMenu from "./SubnavbarMenu.svelte"

    import { 
        Icon, 
        ArrowDown,
        ArrowsRightLeft,
        ArrowTopRightOnSquare, 
        Bars3,
        BarsArrowDown, 
        Cog6Tooth,
        Film,
        Hashtag,
        Identification, 
        Link as LinkIcon,
        Server, 
        Photo,
        QueueList,
        Tag,
        Trophy,
    } from "svelte-hero-icons"

    
    // Bind Listing Type Options from Subnavbar
    export let listingType:boolean
    export let listingTypeOptions:string[]      
    export let listingTypeOptionNames:string[]  
    export let listingTypeOnSelect:(e: CustomEvent<string>) => void
    export let selectedListingType:string       
    export let listingTypeTitle:string

    // Bind Sort Type options from Subnavbar
    export let sortMenu:boolean
    export let sortOptions:string[]
    export let sortOptionNames:string[]
    export let selectedSortOption:string
    export let sortPreventDefault:boolean
    export let shiftLeft:number = 0
    
</script>


<!-- svelte-ignore missing-declaration -->
<SubnavbarMenu alignment="bottom-left" {shiftLeft} icon={Cog6Tooth} containerClass="max-h-[79svh]">
    
    
    <div class="flex flex-col w-full p-2 gap-2 cursor-default">
        <!---Listing Type and Sort Menus--->
        {#if listingType || sortMenu}
            <Card class="p-2">    
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div on:click|preventDefault|stopPropagation>
                    
                    <!---Listing Type--->
                    <SettingMultiSelect
                        condition={listingType}
                        options={listingTypeOptions}
                        optionNames={listingTypeOptionNames}
                        selected={selectedListingType}
                        title={listingTypeTitle}
                        icon={Bars3}
                        padding={false} small={true}
                        on:select={listingTypeOnSelect}
                    />

                    <!---Sort Method--->
                    <SettingMultiSelect
                        condition={sortMenu}
                        options={sortOptions}
                        optionNames={sortOptionNames}
                        selected={selectedSortOption}
                        title="Sort Direction"
                        icon={BarsArrowDown}
                        padding={false} small={true}
                        on:select={(e) => {
                            if (!sortPreventDefault) searchParam($page.url, 'sort', e.detail, 'page')
                        }}
                    />
                </div>
            </Card>
        {/if}

        <!---User Settings--->
        <Card class="p-2 max-h-[30vh] overflow-y-scroll">
            
            <!---Post Style--->
            <SettingToggle title="Show Compact Posts" icon={$userSettings.showCompactPosts ? QueueList : Photo}  small={true}
                bind:value={$userSettings.showCompactPosts} 
                on:change={async (e) => {
                    $userSettings.uiState.feedMargins = !e.detail
                    await scrollToLastSeenPost()
                }}
            />
            
            <!---Open in New Tab--->
            <SettingToggle icon={ArrowTopRightOnSquare} title="Open Links in New Tab" bind:value={$userSettings.openInNewTab.links} small={true} />

            <!---Open Posts in New Tab--->
            <SettingToggle title="Open Posts in New Tab" icon={ArrowTopRightOnSquare} bind:value={$userSettings.openInNewTab.posts} small={true} />

            <!---Use Link Preview Modals--->
            <SettingToggle icon={LinkIcon} title="Preview Links in Modal" bind:value={$userSettings.uiState.linkPreviews} small={true}/>


            <!---Use Display Names--->
            <SettingToggle icon={Identification} title="Use Display Names" bind:value={$userSettings.displayNames} small={true}/>

            <!---Show Instances--->
            <SettingToggle icon={Server} title="Show Instance Names" bind:value={$userSettings.uiState.showInstances} small={true}/>
            
            <!---Show Scores--->
            <SettingToggle title="Show Scores" icon={Trophy} bind:value={$userSettings.uiState.showScores} small={true} />
            
            <!---Disable Downvotes--->
            {#if $site?.site_view?.local_site?.enable_downvotes}
                <SettingToggle icon={ArrowDown} title="Disable Downvotes"  bind:value={$userSettings.uiState.disableDownvotes} small={true} />
            {/if}
            <!---Reverse Action Bar--->
            <SettingToggle title="Reverse Action Bar" icon={ArrowsRightLeft} bind:value={$userSettings.uiState.reverseActionBar} small={true}/>

            <!---Expand Crosspost List--->
            <SettingToggle title="Expand Crosspost List" icon={BarsArrowDown} bind:value={$userSettings.uiState.expandCrossPosts} small={true}/>

            <!---Match Crosspost on Title--->
            <SettingToggle title="Match Crossposts on Title" icon={BarsArrowDown} bind:value={$userSettings.uiState.matchCrossPostOnTitle} small={true}/>
            
            <!---Enable Embeds in Feed--->
            <SettingToggle title="Enable Embeds in Feed" icon={Film} bind:value={$userSettings.embeddedMedia.feed} small={true}/>

            <!---Enable Hashtags--->
            <SettingToggle title="Enable Hashtags" icon={Hashtag} bind:value={$userSettings.linkifyHashtags} small={true} />

            <!---Enable Flairs--->
            <SettingToggle title="Enable Flairs" icon={Tag} bind:value={$userSettings.extractFlairsFromTitle} small={true} />


        </Card>
      
        <Card class="p-2">
            <MenuButton link href="/settings" class="!p-2">
                <Icon src={Cog6Tooth} mini width={16} slot="icon" />
                <span class="flex flex-row w-full items-center font-bold text-xs justify-between">
                    Open Settings
                    <Icon src={ArrowTopRightOnSquare} mini width={16} />
                </span>
            </MenuButton>
        </Card>

    </div>

</SubnavbarMenu>