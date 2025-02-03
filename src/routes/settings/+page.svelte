<script lang="ts">
    
    import { defaultSettings, userSettings, ENABLE_MEDIA_PROXY, migrateSettings } from '$lib/settings'
    import { amModOfAny, isAdmin } from '$lib/components/lemmy/moderation/moderation'
    import { fixLemmyEncodings, postViewTypes, selectViewType } from '$lib/components/lemmy/post/helpers'
    import { getClient} from '$lib/lemmy.js'
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { saveProfile } from '$lib/favorites'
    import { site } from '$lib/lemmy.js'
    import { sortOptions, sortOptionNames } from '$lib/lemmy'
    import { StorageCache } from '$lib/storage-controller'
    import { theme } from '$lib/ui/colors'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Button                       from '$lib/components/input/Button.svelte'
    import EditHybridViewPostTypesModal from './EditHybridViewPostTypesModal.svelte'
    import Logo                         from '$lib/components/ui/Logo.svelte';
    import MainContentArea              from '$lib/components/ui/containers/MainContentArea.svelte';
    import MarkdownEditor               from '$lib/components/markdown/MarkdownEditor.svelte'
    import SettingButton                from '$lib/components/ui/settings/SettingButton.svelte'
    import SettingEditArray             from '$lib/components/ui/settings/SettingEditArray.svelte'
    import SettingMultiSelect           from '$lib/components/ui/settings/SettingMultiSelect.svelte'
    import SettingToggle                from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingsCollapseSection      from '$lib/components/ui/settings/SettingsCollapseSection.svelte'
    import SiteCard                     from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar                    from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    
    import {
        ArrowDown,
        ArrowDownTray,
        ArrowUpTray,
        ArrowPath,
        ArrowPathRoundedSquare,
        ArrowsPointingOut,
        ArrowsRightLeft,
        ArrowUturnDown,
        Icon,
        BarsArrowDown,
        Beaker,
        BugAnt,
        ArrowTopRightOnSquare,
        Cake,
        CalendarDays,
        ChartBar,
        ChatBubbleBottomCenterText,
        CheckBadge,
        ChevronDoubleDown,
        CloudArrowDown,
        CloudArrowUp,
        CodeBracketSquare,
        EnvelopeOpen,
        ExclamationTriangle,
        EyeSlash,
        FaceFrown,
        Film,
        Funnel,
        Gif,
        GlobeAlt,
        HandRaised,
        Hashtag,
        Identification,
        InformationCircle,
        Language,
        Link as LinkIcon,
        NoSymbol,
        Photo,
        Play,
        QueueList,
        Server,
        Sun,
        TableCells,
        Trash,
        Trophy,
        Tv,
        UserCircle,
        Window,
        Tag,
        Clock,
        UserGroup,
        ShieldCheck,
        Inbox,
        ClipboardDocumentList,
        FaceSmile,
        ArrowsUpDown,
        Cog8Tooth,
    } from 'svelte-hero-icons'
    
    
    

    let data = {
        loading: false,
        saving: false
    }

    interface UploadFiles {
        tesseract: FileList | undefined,
        lemmy: FileList | undefined
    }

    const uploadFiles:UploadFiles = {
        tesseract: undefined,
        lemmy: undefined
    }


    const exportSettings = function():void {
        if (!$profile?.groups) return

        let exportData = {
            groups:     [...$profile.groups],
            settings:   {...$userSettings}
        }
        
        let dataString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        let downloadAnchorNode = document.createElement('a');
        
        downloadAnchorNode.setAttribute("href",     dataString);
        downloadAnchorNode.setAttribute("download", "tesseract.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    const uploadSettings = function(): void {
        let uploadButton = document.getElementById('settingsFileUpload') ;
        uploadButton!.click();
    }

    const importSettings = function(upload:FileList): void {
        if (!$profile) return

        try {
            let file = upload[0];
            let reader = new FileReader();
            
            reader.readAsText(file);
            reader.onload = function() {
                if (!$profile) return
                try {
                    let uploadedSettings = JSON.parse(reader.result as string);
                    
                    if (uploadedSettings.settings || uploadedSettings.groups) {
                        if (uploadedSettings.settings) $userSettings = migrateSettings(uploadedSettings.settings);
                        if (uploadedSettings.groups) $profile.groups = [...uploadedSettings.groups];

                        if (uploadedSettings.groups) saveProfile($profile);

                        toast({
                            type: 'success',
                            content: "Successfully uploaded and applied settings.",
                            title: 'Success'
                        });
                    }
                    else {
                        toast({
                        type: 'error',
                        content: "No settings found in JSON upload.",
                        title: 'Error'
                    });
                    }
                } catch (err) {
                    toast({
                        type: 'error',
                        content: "Failed to parse uploaded settings.",
                        title: 'Error'
                    });
                }
            }
        }
        catch (err) {
            toast({
                type: 'error',
                content: "Catch: Failed to read uploaded file.",
                title: 'Error'
            });
        }
    }

    // Abuse the fuck out of the Lemmy API by storing our settings in the theme field
    const saveToLemmy = async function():Promise<void> {
        if (!$profile) return

        data.saving = true
        try {
            let oldSettings = {}

            // Fetch the current value of the settings object (theme for now) from the API
            const myProfile = await getClient().getSite()
            

            // In case old settings are still the default 'theme' values.
            if (!myProfile?.my_user?.local_user_view?.local_user?.theme) throw new Error("Unable to load profile from server")

            if (typeof myProfile.my_user.local_user_view.local_user.theme == 'string') oldSettings = {}
            else oldSettings = JSON.parse(myProfile.my_user.local_user_view.local_user.theme)
            

            // Export the current settings to an object under the Tesseract key.
            let settingsExport = {
                tesseract: {
                    groups:     [...$profile.groups || []],
                    settings:   {...$userSettings}
                }
            }
            
            // Keep the old settings (for any other UIs that abuse the 'theme' field) and only overwrite the ones for Tesseract
            let settings = { ...oldSettings, ...settingsExport};

            // Save the updated settings object back to the 'theme' field. (for some reason, the local user 'person' object is required)
            const res = await getClient().saveUserSettings({
                ...$profile.user?.local_user_view.person,
                theme: JSON.stringify(settings)
            })
            
            toast({
                type: 'success',
                content: "Successfully uploaded and saved settings to Lemmy.",
                title: 'Success'
            });
        }
        catch (err) {
            console.log(err);
            toast({
                type: 'error',
                content: "Failed to save settings to Lemmy profile.",
                title: 'Error'
            });
        }
        data.saving = false;
    }

    // Load the settings from the Lemmy profile's `theme` field
    const loadFromLemmy = async function():Promise<void> {
        
        if (!$profile) return
        data.saving = true
        try {
            const res = await getClient().getSite()
            let mySettings
            if (res?.my_user?.local_user_view?.local_user?.theme) mySettings = JSON.parse(res.my_user.local_user_view.local_user.theme)

            if (mySettings && mySettings.tesseract && (mySettings.tesseract.settings || mySettings.tesseract.groups)) {
                mySettings = mySettings.tesseract;

                // Import settings
                if (mySettings.settings) $userSettings = migrateSettings(mySettings.settings);
                
                // Fix the stupid sanitizaiton Lemmy does to ampersands and such
                if (mySettings.groups) {
                    for (let i:number=0; i< mySettings.groups.length; i++) {
                        mySettings.groups[i].name = fixLemmyEncodings(mySettings.groups[i].name);
                    }
                    $profile.groups = [...mySettings.groups];
                    saveProfile($profile);
                }

                toast({
                    type: 'success',
                    content: "Successfully loaded settings from Lemmy profile.",
                    title: 'Success'
                });
            }
            else {
                toast({
                    type: 'warning',
                    content: "Loaded data from profile but unable to parse it.  See console log.",
                    title: 'Warning'
                });
                console.log(res)
            }

        }
        catch (err) {
            toast({
                type: 'error',
                content: "Failed to load settings from Lemmy profile.",
                title: 'Error'
            });
            console.log(err)
        }


        data.saving = false;

    }

    // Reset the Lemmy profile's `theme` field to a valid value.
    const clearFromLemmy = async function():Promise<void> {
        data.saving = true;

        try {
            const res = await getClient().saveUserSettings({
                ...$profile?.user?.local_user_view?.person,
                theme: 'browser'
            })
            
            toast({
                type: 'success',
                title: "Success",
                content: "Successfully restored valid value to profile 'theme' key."
            });
        }
        catch (err) {
            toast({
                type: 'error',
                content: "Failed to restore theme key to a default value."
            });
        }
        data.saving = false;
    }



    // Watch for a file to be uploaded for Tesseract settings
    $: if (uploadFiles.tesseract && uploadFiles.tesseract.length > 0) {
        importSettings(uploadFiles.tesseract)
    }

    
    // If the custom invidious selection gets cleared, set it to the first in the list
    $:  if (!$userSettings.embeddedMedia.customInvidious) {
            $userSettings.embeddedMedia.customInvidious = $userSettings.embeddedMedia.userDefinedInvidious[0] ?? ''
        }
    
    $:  $userSettings.embeddedMedia.userDefinedInvidious, $userSettings.embeddedMedia.customInvidious = $userSettings.embeddedMedia.userDefinedInvidious[0] ?? ''
    

    let open = {
        profile: false,
        advanced: false,
        general: false,
        inbox: false,
        feed: false,
        posts: false,
        media: false,
        moderation: false,
        filters: false,
        import: false,
        hybridPostEditorModal: false
    } as { [key:string]: boolean }

    onMount(() => {
        const section= $page.url.searchParams.get('section')
        if (section && Object.keys(open).includes(section)) {
            open[section] = true
        }
    })
</script>

<svelte:head>
    <title>Settings</title>
</svelte:head>

<EditHybridViewPostTypesModal bind:open={open.hybridPostEditorModal} />

<SubNavbar home back toggleCommunitySidebar/>

<MainContentArea>

    <div class="flex flex-col gap-4 mx-auto">
        <Logo width={64} class="mx-auto"/>
        <span class="font-bold text-xl">Configure Tesseract</span>
    </div>

    <!---General Options--->
    <SettingsCollapseSection bind:expanded={open.general} icon={InformationCircle} title="General">

        <!---Theme--->
        <SettingMultiSelect icon={Sun} title="Theme" description="Select the theme for the application. Always light, always dark, or system-preferred."
            options={['system', 'light', 'dark']}
            optionNames={['System', 'Light', 'Dark']}
            bind:selected={$theme}
        />

        <!---Application Font--->
        <SettingMultiSelect icon={Language} title="Application Font" description="Select your preferred font to use in Tesseract"
            options={['font-sans', 'font-serif', 'font-system', 'font-inter', 'font-opendyslexic', 'font-reddit', 'font-roboto', 'font-ubuntu', 'font-urbanist']}
            optionNames={['Sans', 'Serif', 'System', 'Inter', 'OpenDyslexic', 'Reddit Mono', 'Roboto', 'Ubuntu', 'Urbanist']}
            bind:selected={$userSettings.font}
        />

        <!---Community Dropdown Menu Default --->
        <SettingMultiSelect icon={UserGroup} title="Default Community List" 
            description="Set the default list of communities to display in the community dropdown menu. Currently can be your favorites list or your full subscription list."
            options={['subscribed', 'favorites']}
            optionNames={['Subscribed', 'Favorites']}
            bind:selected={$userSettings.uiState.defaultCommunityDropdownPanel}
        />
        
        <!---Open in New Tab
        <SettingToggle icon={ArrowTopRightOnSquare} title="Open Links in New Tab" bind:value={$userSettings.openInNewTab.links}
            description="Open external links in a new tab."
        />
        --->

        <!---Use Display Names--->
        <SettingToggle icon={Identification} title="Use Display Names" bind:value={$userSettings.displayNames}
            description="Show user and community display names instead of their actor ID names."
        />

        <!---Use Link Previews--->
        <SettingToggle icon={LinkIcon} title="Preview Links in Modal" bind:value={$userSettings.uiState.linkPreviews}
            description="Preview external links in a modal"
        />

        <!---Show Instances--->
        <SettingToggle icon={Server} title="Show Instance Names" bind:value={$userSettings.uiState.showInstances}
            description="Show the instance/domain for users and communities in posts and comments."
        />

        <!---Show Instances in Sidebar--->
        <SettingToggle icon={Server} title="Show Instance Names in Sidebar" bind:value={$userSettings.uiState.showInstancesSidebarCommunityList}
            description="Show the instance for communities in the sidebar community list."
        />

        

        <!---Show Banners--->
        <SettingToggle icon={Photo} title="Show Banners" bind:value={$userSettings.uiState.showBannersInCards}
            description="Show the site/community/user banners in their respective cards."
        />


        <!---Stretch Banners--->
        <SettingToggle icon={ArrowsPointingOut} title="Stretch Banners" bind:value={$userSettings.uiState.stretchCardBanner}
            condition={$userSettings.uiState.showBannersInCards}
            description="Stretch banner images in the sidebar cards to fill the card without cropping.
            Disable to have them cover the card which may crop them."
        />

        <!---Linkify Hashtags--->
        <SettingToggle icon={Hashtag} title="Enable Hashtags" bind:value={$userSettings.linkifyHashtags}
            description="Detect hashtags and turn them into search links."
        />

        <!---Extract Flairs from Post Titles--->
        <SettingToggle icon={Tag} title="Enable Flairs" bind:value={$userSettings.extractFlairsFromTitle}
            description="Extract bracketed text in post titles and convert to flair badges. Any text in [brackets] will be converted
                into a flair tag.  Clicking a flair tag will search for other posts with the same tag present."
        />

        <!---Reverse Action Bar Direction--->
        <SettingToggle icon={ArrowsRightLeft} title="Reverse Action Bar Direction"  bind:value={$userSettings.uiState.reverseActionBar}
            description="Reverse the direction of the action bars on posts/comments. e.g. The vote buttons will be on the right instead of the left."
        />

        <!---Show Scores--->
        <SettingToggle icon={Trophy} title="Show Scores"  bind:value={$userSettings.uiState.showScores}
            description="Disable this option if you do not want to see upvote/downvote counts on posts and comments."
        />

        <!---Disable Downvotes--->
        {#if $site?.site_view?.local_site?.enable_downvotes}
        <SettingToggle icon={ArrowDown} title="Disable Downvotes"  bind:value={$userSettings.uiState.disableDownvotes}
            description="Disable downvotes and hide downvote counts on posts/comments."
        />
        {/if}

        

        

        

        

        
    </SettingsCollapseSection>


    <!---Inbox and Notifications Settings--->
    
    <SettingsCollapseSection bind:expanded={open.inbox} icon={Inbox} title="Inbox and Notifications" condition={$profile?.user ? true : false}>
        <SettingMultiSelect icon={Clock} title="Notification Poll Frequency" description="How often to poll for new notifications."
            bind:selected={$userSettings.notifications.pollRate}
            options={[30, 60, 90, 120, 150, 180, 300]}
            optionNames={['30 Sec', '1 Min', '1.5 Min', '2 Min', '2.5 Min', '3 Min', '5 Min']}
        />

        <!---Inbox Default to Unread--->
        <SettingToggle icon={EnvelopeOpen} title="Inbox Defaults to Unread"  condition={$profile?.user ? true : false} bind:value={$userSettings.uiState.inboxDefaultUnread}
            description="If enabled, the inbox will default to unread messages. Disable to default to all messages."
        />

        <!--Expand Inbox Items by Default--->
        <SettingToggle icon={BarsArrowDown} title="Expand Inbox Items by Default" bind:value={$userSettings.notifications.expandInboxItemsByDefault}
            description="Expand all inbox items by default."
        />

        <!---Inbox Items Per Page--->
        <SettingMultiSelect icon={Inbox} title="Inbox Items Per Page" bind:selected={$userSettings.notifications.inboxItemsPerPage}
            description="How many inbox items should be retrieved per page."
            options={[10, 20, 30, 40, 50]}
        />
    </SettingsCollapseSection>




    <!---Feed Options--->
    <SettingsCollapseSection bind:expanded={open.feed} icon={QueueList} title="Feed">
        <!--- Default Feed Selection--->
        <SettingMultiSelect title="Default Feed" icon={QueueList} 
            description="Show only posts you're suscribed to, show all from your local instance, or show all posts known to your instance"
            options={['Subscribed', 'Local', 'All']}
            bind:selected={$userSettings.defaultSort.feed}
        />

        <!---Feed Sort Direction--->
        <SettingMultiSelect title="Feed Sort Direction" icon={ChartBar}
            description="Choose how your posts are sorted by default"
            options={sortOptions} optionNames={sortOptionNames}
            bind:selected={$userSettings.defaultSort.sort}

        />

        <!---Posts Per Page--->
        <SettingMultiSelect title="Posts per Fetch" icon={TableCells}
            description="The number of posts to request each time a fetch is made"
            options={[10,20,30]}
            bind:selected={$userSettings.uiState.postsPerPage}
        />
        

        <!---Post Style--->
        <SettingMultiSelect title="Post Style" icon={QueueList} description="Style of posts to display in the feed by default."
            options={postViewTypes.options}
            optionNames={postViewTypes.optionNames}
            on:select={selectViewType}
            bind:selected={$userSettings.uiState.view}
        />

        <!---Hybrid View post type <editor--->
        <SettingButton title="Hybrid View Configuration" buttonText="Configure" icon={Window} on:click={() => open.hybridPostEditorModal = true}
            description="Edit the post types which should show as cards when using the Hybrid post view in the feed."
        />
       
        <!---Post Body Preview Length--->
        <SettingMultiSelect title="Post Body Preview Length" icon={Photo} description="Number of characters to show in the post body preview before
            hiding behind the expand slider. You can also optionally disable the post body preview in the feed."
            optionNames={['Disable', '0', '50', '120', '240', '500', '750', '1000', '2000', '10000']}
            options={[-1, 0, 50, 120, 240, 500, 750, 1000, 2000, 10000]}
            bind:selected={$userSettings.uiState.postBodyPreviewLength}
        />

        <!---Feed Snapshot Validity--->
        <SettingMultiSelect title="Feed Snapshot Validity" icon={Clock} description="How long the feed snapshot should be considered valid since
            its last refresh. Longer durations are useful if you're scrolling through/into a lot of posts and want to get back to the same spot if you
            scroll for longer than the default 15 minutes."
            optionNames={['5 Min', '10 Min', '15 Min', '20 Min', '25 Min', '30 Min', '45 Min', '1 Hour', '2 Hours', '3 Hours', '4 Hours']}
            options={    [5, 10, 15, 20, 25, 30, 45, 60, 120, 180, 240]}
            bind:selected={$userSettings.feedSnapshotValidity}
        />



        <!---Infinite Scroll--->
        <SettingToggle title="Infinite Scroll" icon={ChevronDoubleDown} bind:value={$userSettings.uiState.infiniteScroll}
            description="Use infinite scrolling instead of manual pagination."
            on:change={() => {
                const storage = new StorageCache({ type: 'local'})
                storage.flush()
            }}
        />

        
        
        <!---Scroll Post Bodies in Feed--->
        <SettingToggle icon={ArrowsUpDown} title="Scroll Post Body in Feed" bind:value={$userSettings.uiState.scrollPostBodyInFeed}
            description="When expanding a post's body text in the feed, restrict the height of the text container and, if needed, scroll 
                the long body text insde that. Disable to expand the body in full."
        />
        
        <!---Mark Posts Read on Scroll--->
        <SettingToggle title="Mark Posts Read on Scroll" icon={EnvelopeOpen} bind:value={$userSettings.markReadOnScroll}
            description="Automatically mark posts 'read' as you scroll through them in the feed."
        />

        <!---Fade Title of Read Posts--->
        <SettingToggle title="Fade Read Posts" icon={EnvelopeOpen} bind:value={$userSettings.markReadPosts}
            description="Fade the titles of read posts in the feed."
        />

        <!---Expand Crosspost List--->
        <SettingToggle title="Expand Crosspost List" icon={BarsArrowDown} bind:value={$userSettings.uiState.expandCrossPosts}
            description="Expand the crosspost list automatically. Disable to collapse it by default. Will be collapsed regardless of settings if there are more than 3."
        />

        <!---Match Crosspost on Title--->
        <SettingToggle title="Match Crossposts on Title" icon={BarsArrowDown} bind:value={$userSettings.uiState.matchCrossPostOnTitle}
            description="By default, crossposts are only detected based on having the same URL. Enable this option to also match the title (case-insensitive). This may
            cause undesirable rollups for communities that require post titles be fixed strings (e.g. me_irl, thelyicsgame, etc)."
        />
        
        <!---Blur NSFW Images--->
        <SettingToggle title="Blur NSFW Images" icon={EyeSlash} bind:value={$userSettings.nsfwBlur}
            description="Blur images in posts that are marked NSFW"
        />
        
        
        <!---Open Posts in New Tab--->
        <SettingToggle title="Open Posts in New Tab" icon={ArrowTopRightOnSquare} bind:value={$userSettings.openInNewTab.posts}
            description="Posts in the feed will open in a new tab. Mutually exclusive with 'Open Posts in Modal'"
            on:change={(e) => {
                if (e.detail)   $userSettings.openInNewTab.postsInModal = false
            }}
        />

        <!---Open Posts in Modal--->
        <SettingToggle icon={Window} title="Open Posts in Modal" bind:value={$userSettings.openInNewTab.postsInModal}
            description="Open posts in a modal without leaving the feed. Mutually exclusive with 'Open Posts in New Tab'"
            on:change={(e) => {
                if (e.detail)   $userSettings.openInNewTab.posts = false
            }}
        />
    </SettingsCollapseSection>

    <!---Posts and Comments Options--->
    <SettingsCollapseSection bind:expanded={open.posts} icon={Window} title="Posts and Comments">
        <!---Comment Sort Order--->
        <SettingMultiSelect title="Comment Sort Direction" icon={ChartBar} description="Choose the default sorting method for comments."
            options={['Hot', 'Top', 'New', 'Old', 'Controversial']}
            bind:selected={$userSettings.defaultSort.comments}
        />
               
        <!---Inline Images--->
        <SettingToggle title="Inline Images" icon={Photo} description="Enable inline images in posts and comments. If disabled, inline images will be shown as a link."
            bind:value={$userSettings.inlineImages}
        />

        <!---Large Emojis--->
        <SettingToggle title="Large Custom Emojis" icon={FaceSmile} description="By default, custom emojis are rendered 'emoji-sized'. Enable this to double their size."
            bind:value={$userSettings.uiState.largeEmojis}
        />

        <!---Code Syntax Highlighting--->
        <SettingToggle title="Code Highlighting" icon={CodeBracketSquare} bind:value={$userSettings.highlightCode}
            description="Enable syntax highlighting in code blocks."
        />
                

        <!---Show Alt Text--->
        <SettingToggle title="Show Alt Text" icon={ChatBubbleBottomCenterText} bind:value={$userSettings.uiState.showAltText}
            description="When available, show the provided alt text as a caption for images rendered in markdown."
        />
                

        <!--Show Full or Truncated URLs--->
        <SettingToggle title="Show Full URLs" icon={LinkIcon} bind:value={$userSettings.uiState.showFullURL}
            description="Show full URLs in posts. Disable to only show the domain of the link."
        />

        <!--Filter Annoying CC Licenses on Posts/Comments--->
        <SettingToggle title="Filter CC Licenses" icon={Funnel} bind:value={$userSettings.uiState.filterAnnoyingCCLicense}
            description="Filter out those obnoxious 'CC BY-NC-SA 4.0' licenses on posts/comments that people somehow think will prevent LLMs from training on their submissions."
        />

        <!---MBFC Badges--->
        <SettingToggle title="Media Bias Fact Check Badges" icon={CheckBadge} bind:value={$userSettings.uiState.MBFCBadges}
            description="Show badges on posts with URLs to check them against the Media Bias Fact Check dataset."
        />
    </SettingsCollapseSection>

    <!---Media Options--->
    <SettingsCollapseSection bind:expanded={open.media} icon={Gif} title="Media">
        <!--- Enable Autoplay--->
        <SettingToggle title="Autoplay" icon={Play} bind:value={$userSettings.embeddedMedia.autoplay}
            description="Autoplay supported content when opening posts."
        />

        <!--- Enable Loop--->
        <SettingToggle title="Loop Videos" icon={ArrowPathRoundedSquare} bind:value={$userSettings.embeddedMedia.loop}
            description="Loop supported videos"
        />

        <!--- YouTube Frontend--->
        <SettingMultiSelect title="YouTube Frontend" icon={Tv} 
            description="Choose whether to use YouTube, Invidious, or Piped for YouTube links. Feed embeds will be disabled for Invidious/Piped since
            those are often rate-limited. They will be forced to click-to-play."
            options={['YouTube', 'Custom']}
            bind:selected={$userSettings.embeddedMedia.YTFrontend}
        />

        <!--- Custom YT Frontend Instance--->
        <SettingMultiSelect title="Preferred Custom YouTube Instance" icon={Film} description="Select your prefererred custom YouTube frontend."
            options={ [...$userSettings.embeddedMedia.userDefinedInvidious].sort() }
            bind:selected={$userSettings.embeddedMedia.customInvidious}
            condition={$userSettings.embeddedMedia.userDefinedInvidious.length > 0}
        />
        
        <!---Custom Invidious Instance Editor--->
        <SettingEditArray bind:list={$userSettings.embeddedMedia.userDefinedInvidious}  icon={Server} showPlaceholder={false} reverseLayout
            textInputPlaceholder="inv.example.com"
            title="Define Custom YouTube Frontends"
            description="Specify here any custom Piped/Invidious intances you wish to use.  These will be used for both detection of Invidious links in posts
                as well as selectable preferred instances for YT-like posts. Enter only the domain."
            processInputFunc={(
                //@ts-ignore
                str) => {
                    if (!str) return undefined

                    const hostOnly = str.replace(/https?:\/\//i,'').split('/')[0]
                    if (hostOnly.split('.').length < 2) return undefined
                    return hostOnly
            }}
        />

        <!--- Image Proxying --->
        <SettingToggle title="Proxy Images" icon={GlobeAlt} bind:value={$userSettings.proxyMedia.enabled}
            condition={ENABLE_MEDIA_PROXY}
            description="When enabled, images will be proxied through the Tesseract UI rather than fetched directly."
        />


        <!--- Image Proxying Fallback --->
        <SettingToggle title="Fallback to Direct Fetch" icon={ArrowUturnDown} bind:value={$userSettings.proxyMedia.fallback}
            description="If the image proxy fails to fetch the image, try to fetch it directly instead."
            condition={ENABLE_MEDIA_PROXY && $userSettings.proxyMedia.enabled}
        />
    </SettingsCollapseSection>

    <!---Moderation Options--->
    <SettingsCollapseSection bind:expanded={open.moderation} icon={HandRaised} title="Moderation" condition={amModOfAny($profile?.user)}>
        
        <!---Show/Hide Dedicated Mod Button--->
        <SettingToggle icon={ShieldCheck} title="Show Mod Button" bind:value={$userSettings.uiState.dedicatedModButton}
            description="Show a dedicated 'Moderation' button on posts. If disabled, the Moderation tools will be available in the post actions menu."
        />

        
        <!---Expand Registration Applications by Default--->
        <SettingToggle icon={ClipboardDocumentList} bind:value={$userSettings.moderation.expandApplicationsByDefault} condition={isAdmin($profile?.user)}
            title="Expand Applications by Default" description="Expand all registration applications by default."
        />

        <!---Expand Reports by Default--->
        <SettingToggle icon={ClipboardDocumentList} title="Expand Reports by Default" bind:value={$userSettings.moderation.expandReportsByDefault}
            description="Expand all moderation reports by default."
        />

        <!---Report Items Per Page--->
        <SettingMultiSelect icon={Inbox} title="Report Items Per Page" bind:selected={$userSettings.moderation.reportsPerPage}
            description="How many reports should be retrieved per page"
            options={[10, 20, 30, 40, 50]}
        />


        
        <div class="flexrow font-normal pt-2 text-xs">
            <div class="flexcol flexcol-33">
                <span class="font-bold">Moderation Removal Reply Template</span>
                <p class="font-normal">The preset to use for "Reply reason" in a submission removal.</p>
                
                <ul class="leading-6 mt-4">
                    <li class="font-bold">Syntax:</li>
                    <li>
                        <code>{'{{reason}}'}</code>: The provided reason
                    </li>

                    <li>
                        <code>{'{{post}}'}</code>: The title of the post
                    </li>

                    <li>
                        <code>{'{{community}}'}</code>: The community the submission was removed in.
                    </li>

                    <li>
                        <code>{'{{username}}'}</code>: The username of the creator of the submission.
                    </li>
                </ul>
            </div>

            <div class="flexcol flexcol-66 pt-1">
                <MarkdownEditor bind:value={$userSettings.moderation.removalReasonPreset} images={false} previewButton />
            </div>
        </div>

        {#if isAdmin($profile?.user)}
            <div class="flexrow font-normal pt-2 text-xs">
                <div class="flexcol flexcol-33">
                    <span class="font-bold">Registration Application Deny Template</span>
                    <p class="font-normal">A template that can be one-click entered into the registration application deny field.</p>

                </div>

                <div class="flexcol flexcol-66 pt-1">
                    <MarkdownEditor bind:value={$userSettings.moderation.applicationRejectionPreset} images={false} previewButton />
                </div>
            </div>
        {/if}


    </SettingsCollapseSection>

    <!---Filtering Options--->
    <SettingsCollapseSection bind:expanded={open.filters} icon={Funnel} title="Filtering">
        <!--- Hide Low Credibility Posts --->
        <SettingToggle title="Hide Low Credibility Posts" icon={ExclamationTriangle} bind:value={$userSettings.hidePosts.MBFCLowCredibility}
            description="Hide posts that link to low credibility sources as reported by Media Bias Fact Check."
            condition={$userSettings.uiState.MBFCBadges}
        />

        <SettingMultiSelect title="New Account Age" icon={CalendarDays} 
            description="Set the number of days an account is considered 'new'. This also controls the behavior of the new account badge."
            options={[1, 2, 3, 5, 7, 10, 14, 30]}
            bind:selected={$userSettings.hidePosts.newAccountMinAge}
        />

        <!---Hide Posts From New Accounts--->
        <SettingToggle title="Hide Posts/Comments From New Accounts" icon={Cake} bind:value={$userSettings.hidePosts.newAccounts}
            description="Hide posts and comments from accounts that are considered new. You can set the minimum age for new accounts below.  Note that
                this will not be applied to communities you are moderating or to any local community if you are an instance admin."
        />

        <!---Collapse Comments from Bot Accounts by Default--->
        <SettingToggle title="Collapse Bot Comments" icon={FaceFrown} bind:value={$userSettings.hidePosts.minimizeBotComments}
            description="When enabled, comments from accounts marked as bots will start off collapsed in the comment tree."
        />

        <!---Hide Posts from Users of Blocked Instances--->
        <SettingToggle title="Hide Users From Blocked Instances" icon={EyeSlash} bind:value={$userSettings.hidePosts.hideUsersFromBlockedInstances}
            description="When enabled, posts and comments from users of an instance you have blocked will be hidden. Server-side, when you block an
                instance, only communities there are blocked. Users from there can still post to other communities, and you will
                still see them in the comments.  This will hide them from view, though they will still count toward
                comment counts."
        />

        
        
        
        <SettingToggle title="Hide Deleted Posts" icon={Trash} bind:value={$userSettings.hidePosts.deleted}
            description="Hide posts that have been deleted"
        />

        <SettingToggle title="Hide Removed Posts" icon={NoSymbol} bind:value={$userSettings.hidePosts.removed}
            description="Hide posts that have been removed by a moderator."
        />

        <SettingToggle title="Keyword Filtering" icon={FaceFrown} bind:value={$userSettings.hidePosts.keywords}
            description="Enable hiding posts based on keywords you've configured."
        >
            <SettingEditArray bind:list={$userSettings.hidePosts.keywordList} condition={$userSettings.hidePosts.keywords}
                title="Define Keywords" 
                textInputPlaceholder="Keyword(s) to filter"
                description="Enter a keyword you wish you filter. You can specify multiple keywords by separating them with a comma. Post titles,
                bodies, and embed descriptions will be evaluated for the keywords."
            >
                <details open={true}>
                    <summary class="font-bold cursor-pointer">Special Control Characters</summary>
                    <ul>
                        <li class="flex flex-row gap-4 pl-4">
                            <span class="font-bold text-sm">^</span>
                            <span class="text-xs font-normal">Content must start with this keyword.</span>
                        </li>
                        
                        <li class="flex flex-row gap-4 pl-4">
                            <span class="font-bold text-sm">!</span>
                            <span class="text-xs font-normal">Evaluate the keyword as case-sensitive.</span>
                        </li>

                        <li class="flex flex-row gap-4 pl-4">
                            <span class="font-bold text-sm">*</span>
                            <span class="text-xs font-normal">Disable whole-word matching for the keyword.</span>
                        </li>
                    </ul>
                </details>
            </SettingEditArray>
        </SettingToggle>
    </SettingsCollapseSection>

    <!---Import/Export Options--->
    <SettingsCollapseSection bind:expanded={open.import} icon={ArrowDownTray} title="Import/Export">
        <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                
            <!--- Export Tesseract Settings --->
            <div class="flex flex-row w-full gap-2 py-2">
                <div class="flex flex-col">
                    <p class="text-sm font-bold flex flex-row gap-2">
                        <Icon src={ArrowDownTray} mini width={16}/>
                        Export Tesseract Settings
                    </p>
                    <p class="text-xs font-normal">
                        Export your Tesseract application settings to a JSON file. This does not include any account information.
                    </p>
                    <details>
                        <summary class="text-xs font-bold cursor-pointer mt-2">What's included in the export?</summary>
                        <p class="text-xs font-normal">All setting and preferences (except dark mode) as well as your favorites and community groups.</p>
                    </details>
                </div>
                
                <div class="mx-auto"/>

                <Button class="font-normal h-8" size="md" icon={ArrowDownTray} color="primary" on:click={exportSettings}>
                        Export
                </Button>
            </div>

            <!--- Import Tesseract Settings --->
            <div class="flex flex-row w-full gap-2 py-2">
                <div class="flex flex-col">
                    <p class="text-sm font-bold flex flex-row gap-2">
                        <Icon src={ArrowUpTray} mini width={16}/>
                        Import Tesseract Settings
                    </p>
                    <p class="text-xs font-normal">
                        Upload and import your Tesseract application settings, favorites, and community groups from a JSON file. The favorites and groups will be imported 
                        into your currently selected profile. Note that favorites/groups must be restored to an account on the same instance from which they were 
                        generated since the community IDs need to match.
                    </p>
                </div>
                
                <div class="mx-auto"/>
                
                
                <Button class="font-normal h-8" size="md" icon={ArrowUpTray} color="primary" on:click={uploadSettings}>
                    Import
                    <input id='settingsFileUpload' bind:files={uploadFiles.tesseract} type='file' name='settingsFileUpload' accept=".json,application/json" class="hidden"/>
                </Button>
            </div>


            <!--- Save Tesseract Settings to Lemmy--->
            <div class="flex flex-row w-full gap-2 py-2">
                <div class="flex flex-col">
                    <p class="text-sm font-bold flex flex-row gap-2">
                        <Icon src={CloudArrowUp} mini width={16}/>
                        Save Tesseract Settings to Lemmy
                    </p>
                    <p class="text-xs font-normal">
                        Use the <code>theme</code> key in your user profile to hold your Tesseract settings and groups.
                    </p>
                    
                    <details>
                        <summary class="text-xs font-bold cursor-pointer mt-2">Warnings and Cautions</summary>
                        <p class="text-xs font-normal">
                            <strong>This <em>will</em> break the CSS in Lemmy-UI for this account</strong>:  This is a horrible abuse of the Lemmy API, but the <code>theme</code> field is the only available settings
                            key that's available in the API that's able to hold arbitrary text data. To fix the broken CSS in Lemmy-UI, use the "Reset" option below to restore the <code>theme</code>
                            key to a value that's valid for the Lemmy-UI CSS selector.
                        </p>
                    </details>
                </div>
                
                <div class="mx-auto"/>

                <Button class="font-normal h-8" size="md" icon={CloudArrowUp} color="primary" disabled={data.saving} on:click={saveToLemmy}>
                        Upload
                </Button>
            </div>


            <!--- Load Tesseract Settings from Lemmy--->
            <div class="flex flex-row w-full gap-2 py-2">
                <div class="flex flex-col">
                    <p class="text-sm font-bold flex flex-row gap-2">
                        <Icon src={CloudArrowDown} mini width={16}/>
                        Load Tesseract Settings From Lemmy
                    </p>
                    <p class="text-xs font-normal">
                        Load your Tesseract settings from the <code>theme</code> key in your Lemmy user profile.
                    </p>
                </div>
                
                <div class="mx-auto"/>

                <Button class="font-normal h-8" size="md" icon={CloudArrowDown} color="primary" disabled={data.saving} on:click={loadFromLemmy}>
                        Download
                </Button>
            </div>

            <!--- Restore Lemmy 'theme' field to a valid value--->
            <div class="flex flex-row w-full gap-2 py-2">
                <div class="flex flex-col">
                    <p class="text-sm font-bold flex flex-row gap-2">
                        <Icon src={ArrowUturnDown} mini width={16}/>
                        Remove Tesseract Settings From Lemmy
                    </p>
                    <p class="text-xs font-normal">
                        Clear your saved config from your Lemmy profile and restore the <code>theme</code> field to a valid value. Do this if you want to
                        fix the CSS in Lemmy-UI.
                    </p>
                </div>
                
                <div class="mx-auto"/>

                <Button class="font-normal h-8" size="md" icon={ArrowUturnDown} color="primary" disabled={data.saving} on:click={clearFromLemmy}>
                    Reset
                </Button>
            </div>
        </div>
    </SettingsCollapseSection>

    <SettingsCollapseSection bind:expanded={open.advanced} icon={Cog8Tooth} title="Advanced">
        <!---Enable Debug Buttons--->
        <SettingToggle icon={BugAnt} title="Debug Mode" bind:value={$userSettings.debugInfo}
            description="Show debug buttons in the UI to see post/comment and other raw data. Also enables debug messages in the browser console."
        />
        
        <!---Infinite Scroll Size--->
        <SettingMultiSelect title="Infinite Scroll Size" icon={TableCells}
            description="How many posts should be rendered before the oldest in the feed are removed (off-screen). Increasing this will increase memory consumption and may also reduce performance depending on your device."
            options={[50, 75, 100, 125, 150]}
            bind:selected={$userSettings.uiState.maxScrollPosts}
            condition={$userSettings.uiState.infiniteScroll}
        />
        
        <!---Enable Experimental Features--->
        <SettingToggle icon={Beaker} title="Experimental Features" bind:value={$userSettings.experimentalFeatures}
            description="Enable experimental features. Note that these may be buggy."
        />
        
        <!---Flush Local Storage--->
        <SettingButton title="Flush Local Storage" buttonText="Flush" icon={Trash} 
            description="Flush all items cached to local and session storage with the exception of settings and your profile(s)."
            on:click={() => {
                const localCache = new StorageCache({
                    type: 'local'
                })
                const sessionCache = new StorageCache({
                    type: 'session'
                })
                localCache.flush('all')
                sessionCache.flush('all')
            }}
        />

        <SettingButton title="Reset to Default Settings" buttonText="Reset" icon={ArrowPath} 
            description="Reset Tesseract settings to the defaults."
            on:click={()=> { 
                $userSettings = defaultSettings
                toast({
                    type: 'success',
                    title: 'Complete',    
                    content: 'App settings have been restored to default.',
                })
            }}
        />
    </SettingsCollapseSection>
    

    <div class="hidden lg:flex lg:h-full" slot="right-panel">
        {#if $site}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version} />
        {/if}
    </div>
    
</MainContentArea>
 