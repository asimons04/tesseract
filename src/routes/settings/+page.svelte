<script lang="ts">
    import { defaultSettings, userSettings, YTFrontends, ENABLE_MEDIA_PROXY, migrateSettings } from '$lib/settings'
    import { amModOfAny } from '$lib/components/lemmy/moderation/moderation'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { getClient} from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { removalTemplate } from '$lib/components/lemmy/moderation/moderation.js'
    import { saveProfile } from '$lib/favorites'
    import { site } from '$lib/lemmy.js'
    import { sortOptions, sortOptionNames } from '$lib/lemmy'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Button from '$lib/components/input/Button.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import Logo from '$lib/components/ui/Logo.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SettingGroup from '$lib/components/ui/settings/SettingGroup.svelte'
    import SettingMultiSelect from '$lib/components/ui/settings/SettingMultiSelect.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingsCollapseSection from '$lib/components/ui/settings/SettingsCollapseSection.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import {
        ArchiveBoxXMark,
        ArrowDownTray,
        ArrowUpTray,
        ArrowPath,
        ArrowPathRoundedSquare,
        ArrowsPointingOut,
        ArrowsRightLeft,
        ArrowUturnDown,
        Icon,
        Bars3,
        BarsArrowDown,
        Beaker,
        BugAnt,
        ArrowTopRightOnSquare,
        ChartBar,
        ChatBubbleBottomCenterText,
        CheckBadge,
        ChevronUp,
        CloudArrowDown,
        CloudArrowUp,
        CodeBracketSquare,
        CodeBracket,
        Cog6Tooth,
        CursorArrowRays,
        EnvelopeOpen,
        ExclamationTriangle,
        Eye,
        EyeSlash,
        FaceFrown,
        Film,
        Funnel,
        Gif,
        GlobeAlt,
        HandRaised,
        Identification,
        InformationCircle,
        Language,
        Link as LinkIcon,
        NoSymbol,
        Photo,
        Play,
        PlusCircle,
        QueueList,
        Server,
        TableCells,
        Trash,
        Trophy,
        Tv,
        Window,
        XCircle,

        Cake,

        CalendarDays


    } from 'svelte-hero-icons'
    
    
    
    //import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte';
    
    

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

    // Keyword filtering helpers
    let keywordInput:string
    const addKeyword = function(input:string):void {
        // Initialize an empty keyword list if it doesn't exist
        if (!$userSettings.hidePosts.keywordList) {
            $userSettings.hidePosts.keywordList = [];
        }
        
        if (input.trim() == '') return;

        let words = input.split(',');
        let ignored:boolean = false;

        words.forEach((item) => {
            let word = item.trim();
            if ($userSettings.hidePosts.keywordList.includes(word)) {
                ignored = true;
            }
            else {
                $userSettings.hidePosts.keywordList.push(word);
            }
        })
        
        $userSettings.hidePosts.keywordList.sort();
        $userSettings.hidePosts.keywordList = $userSettings.hidePosts.keywordList
        keywordInput = '';

        if (ignored) {
            toast( {
                content: "Some words were ignored because they are already in the filter list.",
                type: "warning"

            })
        }
        else {
            toast( {
                content: "Keywords added to personal filter.",
                type: "success"

            })
        }
    }

    const delKeyword = function(input:string):void {
        if ($userSettings.hidePosts.keywordList.includes(input)) {
            let index = $userSettings.hidePosts.keywordList.indexOf(input);
            
            $userSettings.hidePosts.keywordList.splice(index,1);
            $userSettings.hidePosts.keywordList = $userSettings.hidePosts.keywordList;
        }


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
        data.saving = true;
        if (!$profile) return

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
        data.saving = true;
        if (!$profile) return
        
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

    let open = {
        general: false,
        feed: false,
        posts: false,
        media: false,
        moderation: false,
        filters: false,
        import: false
    }

</script>

<svelte:head>
    <title>Settings</title>
</svelte:head>

<SubNavbar home back toggleCommunitySidebar/>

<MainContentArea>

    <div class="flex flex-col gap-4 mx-auto">
        <Logo width={64} class="mx-auto"/>
        <span class="font-bold text-xl">Configure Tesseract</span>
    </div>

    <!---General Options--->
    <SettingsCollapseSection bind:expanded={open.general} icon={InformationCircle} title="General">
        <SettingGroup>
            <!---Open in New Tab--->
            <SettingToggle icon={ArrowTopRightOnSquare} title="Open Links in New Tab" bind:value={$userSettings.openInNewTab.links}
                description="Open external links in a new tab."
            />

            <!---Use Display Names--->
            <SettingToggle icon={Identification} title="Use Display Names" bind:value={$userSettings.displayNames}
                description="Show user and community display names instead of their actor ID names."
            />

            <!---Show Instances--->
            <SettingToggle icon={Server} title="Show Instance Names" bind:value={$userSettings.uiState.showInstances}
                description="Show the instance/domain for users and communities."
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


            <!---Reverse Action Bar Direction--->
            <SettingToggle icon={ArrowsRightLeft} title="Reverse Action Bar Direction"  bind:value={$userSettings.uiState.reverseActionBar}
                description="Reverse the direction of the action bars on posts/comments. e.g. The vote buttons will be on the right instead of the left."
            />

            <!---Show Scores--->
            <SettingToggle icon={Trophy} title="Show Scores"  bind:value={$userSettings.uiState.showScores}
                description="Disable this option if you do not want to see upvote/downvote counts on posts and comments."
            />

            <!---Enable Debug Buttons--->
            <SettingToggle icon={BugAnt} title="Debug Buttons" bind:value={$userSettings.debugInfo}
                description="Show debug buttons in the UI"
            />

            <!---Enable Experimental Features--->
            <SettingToggle icon={Beaker} title="Experimental Features" bind:value={$userSettings.experimentalFeatures}
                description="Enable experimental features. Note that these may be buggy."
            />

            <SettingMultiSelect icon={Language} title="Application Font" description="Select your preferred font to use in Tesseract"
                options={['font-sans', 'font-serif', 'font-system', 'font-inter', 'font-reddit', 'font-roboto', 'font-ubuntu', 'font-urbanist']}
                optionNames={['Sans', 'Serif', 'System', 'Inter', 'Reddit Mono', 'Roboto', 'Ubuntu', 'Urbanist']}
                bind:selected={$userSettings.font}
            />

            <!---Reset to Default Settings--->
            <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.highlightCode}>
                <div class="flex flex-col">
                    <p class="text-sm font-bold flex flex-row gap-2">
                        <Icon src={ArrowPath} mini width={16}/>
                        Reset to Default
                    </p>
                    <p class="text-xs font-normal">Reset all of your settings to the default values.</p>
                </div>
                <div class="mx-auto"/>

                <Button
                    on:click={() => {
                        toast({
                            content: 'Are you sure you want to reset your settings to the default?',
                            action: () => ($userSettings = defaultSettings),
                        })
                    }}
                    class="font-normal"
                >
                    <Icon src={ArrowPath} mini size="16" slot="icon" />
                        Reset
                </Button>
            </div>
        </SettingGroup>

    </SettingsCollapseSection>

    <!---Feed Options--->
    <SettingsCollapseSection bind:expanded={open.feed} icon={QueueList} title="Feed">
        <SettingGroup>
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

            <!---Infinite Scroll Size--->
            <SettingMultiSelect title="Infinite Scroll Size" icon={TableCells}
                description="How many posts should be rendered before the oldest in the feed are removed (off-screen). Increasing this will increase memory consumption and may also reduce performance depending on your device."
                options={[50, 75, 100, 125, 150]}
                bind:selected={$userSettings.uiState.maxScrollPosts}
            />

            <!---Post Style--->
            <SettingMultiSelect title="Post Style" icon={QueueList} description="Style of posts to display in the feed by default"
                options={[false, true]} optionNames={['Cards', 'Compact']}
                bind:selected={$userSettings.showCompactPosts}
            />


            <!---Feed Image Size--->
            <SettingMultiSelect title="Image Size" icon={Photo} description="Set the size for post images in the feed"
                optionNames={['Small', 'Medium', 'Large', 'Extra Large', 'Full Width']}
                options={['max-w-sm', 'max-w-md', 'max-w-3xl', 'max-w-4xl', 'w-full']}
                bind:selected={$userSettings.imageSize.feed}
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
                description="Posts in the feed will open in a new tab. If you have Tesseract installed as a PWA, you will likely want to make sure this is disabled."
            />
        </SettingGroup>
        
    </SettingsCollapseSection>

    <!---Posts Options--->
    <SettingsCollapseSection bind:expanded={open.posts} icon={Window} title="Posts">
        <SettingGroup>
            <!---Comment Sort Order--->
            <SettingMultiSelect title="Comment Sort Direction" icon={ChartBar} description="Choose the default sorting method for comments."
                options={['Hot', 'Top', 'New']}
                bind:selected={$userSettings.defaultSort.comments}
            />
                    
            <!---Post Image Size--->
            <SettingMultiSelect title="Image Size" icon={Photo} description="Set the size of the images when viewing posts."
                optionNames={['Small', 'Medium', 'Large', 'Extra Large', 'Full Width']}
                options={['max-w-sm', 'max-w-md', 'max-w-3xl', 'max-w-4xl', 'w-full']}
                bind:selected={$userSettings.imageSize.post}
            />
                    
            <!---Inline Images--->
            <SettingToggle title="Inline Images" icon={Photo} description="Enable inline images in posts and comments. If disabled, inline images will be shown as a link."
                bind:value={$userSettings.inlineImages}
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

            

            <!---Fediseer Badges--->
            <SettingToggle title="Fediseer Badges" icon={Eye} bind:value={$userSettings.uiState.fediseerBadges}
                description="Show Fediseer badges on post cards"
            />
                    

            <!---MBFC Badges--->
            <SettingToggle title="Media Bias Fact Check Badges" icon={CheckBadge} bind:value={$userSettings.uiState.MBFCBadges}
                description="Show badges on posts with URLs to check them against the Media Bias Fact Check dataset."
            />
        </SettingGroup>


    </SettingsCollapseSection>

    <!---Media Options--->
    <SettingsCollapseSection bind:expanded={open.media} icon={Gif} title="Media">
        <SettingGroup>
            <!--- Enable Embedded Content In Feed--->
            <SettingToggle title="Enable Embeds in Feed" icon={Film} bind:value={$userSettings.embeddedMedia.feed}
                description="Enable embedded content in the feed. When disabled, a thumbnail will be shown instead."
            />

            <!--- Enable Embedded Content In Posts--->
            <SettingToggle title="Enable Embeds in Posts" icon={Film} bind:value={$userSettings.embeddedMedia.post}
                description="Enable embedded content in the posts. When disabled, a thumbnail will be shown instead."
            />

            <!--- Enable Autoplay--->
            <SettingToggle title="Autoplay" icon={Play} bind:value={$userSettings.embeddedMedia.autoplay}
                description="Autoplay supported content when opening posts."
            />

            <!--- Enable Loop--->
            <SettingToggle title="Loop Videos" icon={ArrowPathRoundedSquare} bind:value={$userSettings.embeddedMedia.loop}
                description="Loop supported videos"
            />

            <!--- YouTube Frontend--->
            <SettingMultiSelect title="YouTube Frontend" icon={Tv} description="Choose whether to use YouTube or Invidious for YouTube links."
                options={['YouTube', 'Invidious']}
                bind:selected={$userSettings.embeddedMedia.YTFrontend}
            />

            <!--- Invidious Instance--->
            <SettingMultiSelect title="Preferred Invidious Instance" icon={Film} description="Select the Invidious instance you wish to use as your YouTube frontend."
                options={YTFrontends.invidious}
                bind:selected={$userSettings.embeddedMedia.customInvidious}
            />

            <!--- Invidious Instance--->
            <SettingMultiSelect title="Preferred Piped Instance" icon={Film} description="Select the Piped instance you wish to use as your YouTube frontend."
                options={YTFrontends.piped}
                bind:selected={$userSettings.embeddedMedia.customPiped}
            />

            <!--- Image Proxying --->
            <SettingToggle title="Proxy Image" icon={GlobeAlt} bind:value={$userSettings.proxyMedia.enabled}
                condition={ENABLE_MEDIA_PROXY}
                description="When enabled, images will be proxied through the Tesseract UI rather than fetched directly."
            />


            <!--- Image Proxying Fallback --->
            <SettingToggle title="Fallback to Direct Fetch" icon={ArrowUturnDown} bind:value={$userSettings.proxyMedia.fallback}
                description="If the image proxy fails to fetch the image, try to fetch it directly instead."
                condition={ENABLE_MEDIA_PROXY && $userSettings.proxyMedia.enabled}
            />
        </SettingGroup>
    </SettingsCollapseSection>

    <!---Moderation Options--->
    <SettingsCollapseSection bind:expanded={open.moderation} icon={HandRaised} title="Moderation" condition={amModOfAny($profile?.user)}>
        <SettingGroup>
            <div class="flexrow font-normal text-xs">
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

                <div class="flexcol flexcol-66">
                    <MarkdownEditor bind:value={$userSettings.moderation.removalReasonPreset} images={false} previewButton />
                </div>
            </div>
        </SettingGroup>
    </SettingsCollapseSection>

    <!---Filtering Options--->
    <SettingsCollapseSection bind:expanded={open.filters} icon={Funnel} title="Filtering">
        <SettingGroup>
            <!--- Hide Low Credibility Posts --->
            <SettingToggle title="Hide Low Credibility Posts" icon={ExclamationTriangle} bind:value={$userSettings.hidePosts.MBFCLowCredibility}
                description="Hide posts that link to low credibility sources as reported by Media Bias Fact Check."
                condition={$userSettings.uiState.MBFCBadges}
            />

            <!---Hide Posts From New Accounts--->
            <SettingToggle title="Hide Posts/Comments From New Accounts" icon={Cake} bind:value={$userSettings.hidePosts.newAccounts}
                description="Hide posts and comments from accounts that are considered new. You can set the minimum age for new accounts below.  Note that
                    this will not be applied to communities you are moderating or to any local community if you are an instance admin."
            />

            <SettingMultiSelect title="New Account Age" icon={CalendarDays} 
                description="Set the number of days an account is considered 'new'. This also controls the behavior of the new account badge."
                options={[1, 2, 3, 5, 7, 10, 14, 30]}
                bind:selected={$userSettings.hidePosts.newAccountMinAge}
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
                <!---Keyword Filter Editor --->
                <div class="flex flex-row flex-wrap lg:flex-nowrap gap-2 w-full mt-4" class:hidden={!$userSettings.hidePosts.keywords}>
                                
                    <div class="flex flex-col w-full gap-2 lg:w-1/3">
                        <div class="flex flex-row gap-2 mt-2 w-full">
                            <TextInput  bind:value={keywordInput}  type="text" class="w-full" placeholder="Keyword(s) to filter"
                                on:keydown={(e) => {
                                    if (e.detail?.key == "Enter") {
                                        e.preventDefault();
                                        addKeyword(keywordInput);
                                    }
                                }}
                            />
                            
                            <Button color="primary" class="h-8" on:click={() => { addKeyword(keywordInput); }}>
                                <Icon src={PlusCircle} mini width={18}/>
                                Add
                            </Button>
                        </div>
                        
                        <div class="flex flex-col gap-2">
                            <p class="text-xs font-normal">Enter a keyword you wish you filter. You can specify multiple keywords by separating them with a comma. Post titles,
                                bodies, and embed descriptions will be evaluated for the keywords.
                            </p>
                            
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

                        </div>
                    </div>
                
                    <div class="flex flex-col mt-2 gap-2 items-center max-h-[250px] w-full lg:w-2/3 overflow-y-scroll px-4">
                        {#if $userSettings?.hidePosts?.keywordList.length > 0}
                            {#each $userSettings.hidePosts.keywordList as keyword}
                                
                                <div class="w-full rounded-md bg-slate-200 dark:bg-zinc-700 flex flex-row gap-2 items-center">
                                    <p class="pl-4 py-2 text-sm font-bold">{keyword}</p>

                                    <div class="mx-auto"/>
                                    
                                    <Button color="ghost" class="mr-4 border-none" on:click={() => { delKeyword(keyword); }} >
                                        <Icon src={XCircle} mini width={22}/>
                                    </Button>
                                </div>
                                
                            {/each}
                        {:else}
                            <Placeholder icon={ArchiveBoxXMark} title="No keywords" description="You have not set any keywords to filter." />
                        {/if}
                    </div>
                </div>

            </SettingToggle>
                
        </SettingGroup>
    </SettingsCollapseSection>

    <!---Import/Export Options--->
    <SettingsCollapseSection bind:expanded={open.import} icon={ArrowDownTray} title="Import/Export">
        <SettingGroup>
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
        </SettingGroup>
    </SettingsCollapseSection>
    

    <div class="hidden lg:flex lg:h-full" slot="right-panel">
        {#if $site}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version} />
        {/if}
    </div>
    
</MainContentArea>
 