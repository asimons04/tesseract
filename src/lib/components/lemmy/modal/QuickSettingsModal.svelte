<script lang="ts">
   
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers';
    import { searchParam } from '$lib/util';
    import { site } from '$lib/lemmy';
    import { userSettings} from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte';
    import Card from '../../ui/Card.svelte';
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import SettingMultiSelect from '../../ui/settings/SettingMultiSelect.svelte';
    import SettingToggle from "../../ui/settings/SettingToggle.svelte"

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
        XCircle,
        EyeSlash,
    } from "svelte-hero-icons"

    export let options: any
    export let open: boolean = false
    
    let listingTypeOnSelect = (e:CustomEvent<string>) => { searchParam($page.url, 'type', e.detail, 'page') }
</script>

<!-- svelte-ignore missing-declaration -->
<Modal bind:open icon={Cog6Tooth} card  width="max-w-4xl" title="Quick Settings" >
    
    
    <div class="flex flex-col w-full p-2 gap-2 cursor-default">
        <!---Listing Type and Sort Menus--->
        {#if false && (options.listingType || options.sortMenu)}
            <Card class="p-2">    
                                   
                <!---Listing Type--->
                <SettingMultiSelect
                    condition={options.listingType}
                    options={options.listingTypeOptions}
                    optionNames={options.listingTypeOptionNames}
                    selected={options.selectedListingType}
                    title={options.listingTypeTitle}
                    icon={Bars3}
                    padding={false} small={true}
                    on:select={listingTypeOnSelect}
                />

                <!---Sort Method--->
                <SettingMultiSelect
                    condition={options.sortMenu}
                    options={options.sortOptions}
                    optionNames={options.sortOptionNames}
                    selected={options.selectedSortOption}
                    title="Sort Direction"
                    icon={BarsArrowDown}
                    padding={false} small={true}
                    on:select={(e) => {
                        if (!options.sortPreventDefault) searchParam($page.url, 'sort', e.detail, 'page')
                    }}
                />
            </Card>
        {/if}

        <!---User Settings--->
        <div class="flex flex-col divide-y lg:flex-row lg:divide-y-0 lg:gap-4 pr-2 max-h-[70vh] items-start w-full overflow-y-scroll">
        
        
            <div class="flex flex-col gap-2 items-center divide-y w-full lg:w-1/2">
                
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
               
            </div>

            <div class="flex flex-col gap-2 items-center divide-y w-full lg:w-1/2">

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

                <!---Hide Posts from Users of Blocked Instances--->
                <SettingToggle title="Hide Users From Blocked Instances" icon={EyeSlash} bind:value={$userSettings.hidePosts.hideUsersFromBlockedInstances} small={true}/>
            </div>
        </div>
    </div>

    <div class="flex flex-row w-full justify-between" slot="buttons">
        <Button color="danger" size="lg" icon={XCircle} iconSize={20} on:click={()=> open = false}>
            <span class="hidden md:flex">Close</span>
        </Button>

        <Button title="Open Settings" size="lg" color="primary" icon={Cog6Tooth} iconSize={20} 
            on:click={()=> {
                goto('/settings')
                open = false
            }}
        >
            <span class="hidden md:flex">Settings</span>
        </Button>
    </div>

</Modal>