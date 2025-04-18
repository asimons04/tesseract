<script lang="ts">
   
    import { dispatchWindowEvent } from '$lib/ui/events' 
    import { dividerColors } from '$lib/ui/colors' 
    import { goto, replaceState } from '$app/navigation';
    import { page } from '$app/stores'
    import { postViewTypes, selectViewType } from '$lib/components/lemmy/post/helpers'
    import { site } from '$lib/lemmy';
    import { StorageCache } from '$lib/storage-controller'
    import { userSettings} from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte';
    import EditHybridViewPostTypesModal from '$routes/settings/EditHybridViewPostTypesModal.svelte'
    import Modal from "$lib/components/ui/modal/Modal.svelte"
    import SettingMultiSelect from '../../ui/settings/SettingMultiSelect.svelte';
    import SettingToggle from "../../ui/settings/SettingToggle.svelte"

    import { 
        ArrowDown,
        ArrowsRightLeft,
        ArrowTopRightOnSquare, 
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
        Language,
        BugAnt,
        ChevronDoubleDown,
        FaceSmile,
        ArrowsUpDown,
        Window,
    } from "svelte-hero-icons"

    export let open: boolean = false

    let hybridViewEditorOpen = false
</script>


<!-- svelte-ignore missing-declaration -->
<Modal bind:open icon={Cog6Tooth} card  width="max-w-4xl" title="Quick Settings" on:close={() => { history.back() }} >
    
    <EditHybridViewPostTypesModal bind:open={hybridViewEditorOpen} />

    <div class="flex flex-col divide-y {dividerColors} w-full p-2 gap-2 cursor-default max-h-[70vh] overflow-y-scroll">
        
        
        <div class="flex flex-col divide-y {dividerColors} gap-0 pr-2 items-start w-full">
            <!---Font--->
            <SettingMultiSelect icon={Language} 
                title="Application Font" 
                padding={true} small={true}
                options={['font-sans', 'font-serif', 'font-system', 'font-inter', 'font-opendyslexic', 'font-reddit', 'font-roboto', 'font-ubuntu', 'font-urbanist']}
                optionNames={['Sans', 'Serif', 'System', 'Inter', 'OpenDyslexic', 'Reddit Mono', 'Roboto', 'Ubuntu', 'Urbanist']}
                bind:selected={$userSettings.font}
            />

            <!---Post Style--->
            <SettingMultiSelect title="Post Style" icon={QueueList} small
                options={postViewTypes.options}
                optionNames={postViewTypes.optionNames}
                on:select={(e) => {
                    dispatchWindowEvent('changeView', {view: e.detail})
                    selectViewType(e)
                }}
                bind:selected={$userSettings.uiState.view}
            >
                {#if $userSettings.uiState.view == 'hybrid'}
                    <p class="font-normal text-xs">
                        <button class="text-sky-700 dark:text-sky-500 text-left hover:underline" on:click={() => hybridViewEditorOpen = true }>
                            Configure
                        </button>
                        hybrid view options.
                    </p>
                {/if}
            </SettingMultiSelect>
        </div>
        
        <!---User Settings--->
        <div class="flex flex-col divide-y lg:flex-row lg:divide-y-0 lg:gap-4 pr-2 {dividerColors} items-start w-full ">

            <div class="flex flex-col gap-2 items-center divide-y {dividerColors} w-full lg:w-1/2">
                <!---Infinite Scroll--->
                <SettingToggle title="Infinite Scroll" icon={ChevronDoubleDown} bind:value={$userSettings.uiState.infiniteScroll} small
                    on:change={(e) => {
                        $userSettings.uiState.infiniteScroll = e.detail
                        const storage = new StorageCache({ type: 'local'})
                        storage.flush()
                        dispatchWindowEvent('refreshFeed')
                    }}
                />
                
                <!---Open in New Tab--->
                <SettingToggle icon={ArrowTopRightOnSquare} title="Open Posts in New Tab" bind:value={$userSettings.openInNewTab.posts} small={true} on:change={(e) => {
                    if (e.detail)   $userSettings.openInNewTab.postsInModal = false
                    
                }}/>

                <!---Open Posts in Modal--->
                <SettingToggle icon={Window} title="Open Posts in Modals" bind:value={$userSettings.openInNewTab.postsInModal} small={true} on:change={(e) => {
                    if (e.detail)   $userSettings.openInNewTab.posts = false
                }}/>

                <!---Scroll Post Bodies in Feed--->
                <SettingToggle icon={ArrowsUpDown} title="Scroll Post Body in Feed" bind:value={$userSettings.uiState.scrollPostBodyInFeed} small={true} />


                
                <!---Use Link Preview Modals--->
                <SettingToggle icon={LinkIcon} title="Preview Links in Modal" bind:value={$userSettings.uiState.linkPreviews} small={true}/>

                <!---Use Display Names--->
                <SettingToggle icon={Identification} title="Use Display Names" bind:value={$userSettings.displayNames} small={true}/>

                <!---Show Instances--->
                <SettingToggle icon={Server} title="Show Instance Names" bind:value={$userSettings.uiState.showInstances} small={true}/>

                <!---Show Instances in Sidebar--->
                <SettingToggle icon={Server} title="Show Instance Names in Sidebar" bind:value={$userSettings.uiState.showInstancesSidebarCommunityList} small/>
                
                <!---Show full URLs--->
                <SettingToggle icon={LinkIcon} title="Show Full URLs" bind:value={$userSettings.uiState.showFullURL} small={true} />

                <!---Hide Posts from Users of Blocked Instances--->
                <SettingToggle title="Hide Users From Blocked Instances" icon={EyeSlash} bind:value={$userSettings.hidePosts.hideUsersFromBlockedInstances} small={true}/>
                
            </div>

            <div class="flex flex-col gap-2 items-center divide-y {dividerColors} w-full lg:w-1/2">
                
                
                <!---Reverse Action Bar--->
                <SettingToggle title="Reverse Action Bar" icon={ArrowsRightLeft} bind:value={$userSettings.uiState.reverseActionBar} small={true}/>
                
                <!---Show Scores--->
                <SettingToggle title="Show Scores" icon={Trophy} bind:value={$userSettings.uiState.showScores} small={true} />
                
                <!---Disable Downvotes--->
                {#if $site?.site_view?.local_site?.enable_downvotes}
                    <SettingToggle icon={ArrowDown} title="Disable Downvotes"  bind:value={$userSettings.uiState.disableDownvotes} small={true} />
                {/if}

                <!---Expand Crosspost List--->
                <SettingToggle title="Expand Crosspost List" icon={BarsArrowDown} bind:value={$userSettings.uiState.expandCrossPosts} small={true}/>

                <!---Match Crosspost on Title--->
                <SettingToggle title="Match Crossposts on Title" icon={BarsArrowDown} bind:value={$userSettings.uiState.matchCrossPostOnTitle} small={true}/>

                <!---Large Emojis--->
                <SettingToggle title="Large Custom Emojis" icon={FaceSmile}  bind:value={$userSettings.uiState.largeEmojis} small={true} />
        

                <!---Blur NSFW Images--->
                <SettingToggle title="Blur NSFW Images" icon={EyeSlash} bind:value={$userSettings.nsfwBlur} small={true} />

                <!---Enable Hashtags--->
                <SettingToggle title="Enable Hashtags" icon={Hashtag} bind:value={$userSettings.linkifyHashtags} small={true} />

                <!---Enable Flairs--->
                <SettingToggle title="Enable Flairs" icon={Tag} bind:value={$userSettings.extractFlairsFromTitle} small={true} />

                <!--Show Debug Button--->
                <SettingToggle title="Enable Debug Mode" icon={BugAnt} bind:value={$userSettings.debugInfo} small={true} />
                
            </div>
        </div>
    </div>

    <div class="flex flex-row w-full justify-between" slot="buttons">
        <Button color="danger" size="lg" icon={XCircle} iconSize={20} on:click={()=> history.back()}>
            <span class="hidden md:flex">Close</span>
        </Button>

        <Button title="Open Settings" size="lg" color="primary" icon={Cog6Tooth} iconSize={20} 
            on:click={()=> {
                replaceState('', {
                    modals: {
                        ...$page.state.modals,
                        QuickSettingsModal: false
                    }
                })
                goto('/settings')
                
            }}
        >
            <span class="hidden md:flex">All Settings</span>
        </Button>
    </div>

</Modal>