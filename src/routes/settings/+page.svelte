<script lang="ts">
    import { defaultSettings, userSettings, YTFrontends, ENABLE_MEDIA_PROXY, migrateSettings } from '$lib/settings'
    import { amModOfAny } from '$lib/components/lemmy/moderation/moderation'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { getClient} from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { removalTemplate } from '$lib/components/lemmy/moderation/moderation.js'
    import { saveProfile } from '$lib/favorites'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Button from '$lib/components/input/Button.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Setting from './Setting.svelte'
    import Sort from '$lib/components/lemmy/Sort.svelte'
    import Switch from '$lib/components/input/Switch.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import {
        ArchiveBoxXMark,
        ArrowDownTray,
        ArrowUpTray,
        ArrowPath,
        ArrowPathRoundedSquare,
        ArrowsPointingOut,
        ArrowUturnDown,
        Icon,
        Bars3,
        BarsArrowDown,
        Beaker,
        BugAnt,
        ArrowTopRightOnSquare,
        ChartBar,
        CheckBadge,
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
        Tv,
        Window,
        XCircle
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
            const myProfile = await getClient().getSite({auth: $profile?.jwt})
            

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
                auth: $profile.jwt ?? ' ',
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
            const res = await getClient().getSite({auth: $profile?.jwt})
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
                auth: $profile?.jwt ?? ' ',
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


    let selected: 'general' | 'feed' | 'posts' | 'media' | 'moderation' | 'filters' | 'impexp' = 'general';

    // Watch for a file to be uploaded for Tesseract settings
    $: if (uploadFiles.tesseract && uploadFiles.tesseract.length > 0) {
        importSettings(uploadFiles.tesseract)
    }
          

</script>

<svelte:head>
    <title>Settings</title>
</svelte:head>

<h1 class="text-xl font-bold flex justify-between">
    <span class="flex flex-row items-center gap-2">
        <Icon src={Cog6Tooth} mini width={36}/>
        Settings 
    </span>
</h1>

<h2 class="font-bold mt-2">
    Configure Tesseract
</h2>
<p class="text-sm text-slate-700 dark:text-zinc-300 mb-2">
    Use the settings here to control your Tesseract experience.  Changes will be saved automatically.
</p>


<div class="flex flex-col md:flex-row gap-2">
    <!---Settings Section Menu--->
    <div class="flex flex-row w-full md:flex-col md:max-w-[15%] md:justify-start gap-2">
        <Button
            color="tertiary"
            title="General"
            alignment="left"
            on:click={()=> { selected = 'general' }}
        >
            <Icon src={InformationCircle} mini width={16} slot="icon"/>
            <span class="hidden sm:block">General</span>
        </Button>
        
        <Button
            color="tertiary"
            title="Feed"
            alignment="left"
            on:click={()=> { selected = 'feed' }}
        >
            <Icon src={QueueList} mini width={16} slot="icon"/>
            <span class="hidden sm:block">Feed</span>
        </Button>

        <Button
            color="tertiary"
            title="Posts"
            alignment="left"
            on:click={()=> { selected = 'posts' }}
        >
            <Icon src={Window} mini width={16} slot="icon"/>
            <span class="hidden sm:block">Posts</span>
        </Button>

        <Button
            color="tertiary"
            title="Media"
            alignment="left"
            on:click={()=> { selected = 'media' }}
        >
            <Icon src={Gif} mini width={16} slot="icon"/>
            <span class="hidden sm:block">Media</span>
        </Button>

        {#if amModOfAny($profile?.user)}
            <Button
                color="tertiary"
                title="Moderation"
                alignment="left"
                on:click={()=> { selected = 'moderation' }}
            >
                <Icon src={HandRaised} mini width={16} slot="icon"/>
                <span class="hidden sm:block">Moderation</span>
            </Button>
        {/if}

        <Button
            color="tertiary"
            title="Filters"
            alignment="left"
            on:click={()=> { selected = 'filters' }}
        >
            <Icon src={Funnel} mini width={16} slot="icon"/>
            <span class="hidden sm:block">Filters</span> 
        </Button>

        <Button
            color="tertiary"
            title="Export settings"
            alignment="left"
            on:click={() => selected = 'impexp'}
        >
            <Icon src={ArrowDownTray} mini width={16} slot="icon"/>
            <span class="hidden sm:block">Import/Export</span> 
        </Button>
    </div>

    <div class="flex flex-col w-full md:w-[85%]">
        <!---General Options--->
        <div class:hidden={selected!='general'}>
            <Setting>
                <span class="flex flex-row gap-2" slot="title">
                    <Icon src={InformationCircle} mini width={24} slot="icon"/>General Options
                </span>
                <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                    
                    <!---Community NSFW Badges--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={ExclamationTriangle} mini width={16}/>
                                Community NSFW Badges
                            </p>
                            <p class="text-xs font-normal">Show NSFW badges on communities that are marked NSFW.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.tagNSFWCommunities} />
                    </div>

                    <!---Open in New Tab--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={ArrowTopRightOnSquare} mini width={16}/>
                                Open in New Tab
                            </p>
                            <p class="text-xs font-normal">Open external links in a new tab.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.openInNewTab.links} />
                    </div>

                    <!---Use Display Names--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.highlightCode}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Identification} mini width={16}/>
                                Use Display Names
                            </p>
                            <p class="text-xs font-normal">Show user and community display names instead of their actor ID names.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.displayNames} />
                    </div>

                    <!---Show Instances--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.highlightCode}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Server} mini width={16}/>
                                Show Instance Names
                            </p>
                            <p class="text-xs font-normal">Show the instance/domain for users and communities.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.uiState.showInstances} />
                    </div>

                    <!---Show Banners--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.highlightCode}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Photo} mini width={16}/>
                                Show Banners
                            </p>
                            <p class="text-xs font-normal">Show the site/community/user banners in their respective cards.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.uiState.showBannersInCards} />
                    </div>

                    <!---Stretch Banners--->
                    {#if $userSettings.uiState.showBannersInCards}
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={ArrowsPointingOut} mini width={16}/>
                                Stretch Banners
                            </p>
                            <p class="text-xs font-normal">
                                Stretch banner images in the sidebar cards to fill the card without cropping.
                                Disable to have them cover the card which may crop them.
                            </p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.uiState.stretchCardBanner} />
                    </div>
                    {/if}

                    <!---Enable Debug Buttons--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.highlightCode}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={BugAnt} mini width={16}/>
                                Debug Buttons
                            </p>
                            <p class="text-xs font-normal">Show debug buttons in the UI</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.debugInfo} />
                    </div>

                    <!---Enable Experimental Features--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.highlightCode}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Beaker} mini width={16}/>
                                Experimental Features
                            </p>
                            <p class="text-xs font-normal">Enable experimental features. Note that these may be buggy.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.experimentalFeatures} />
                    </div>

                    <!---Use Browser Font Instead of Theme Font--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.highlightCode}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Language} mini width={16}/>
                                Use Browser Font
                            </p>
                            <p class="text-xs font-normal">Use the system/browser's font instead of the theme font.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.systemUI} />
                    </div>

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



                </div>
            </Setting>


        </div>

        <!---Feed Options--->
        <div class:hidden={selected!='feed'}>
            <Setting>
                <span class="flex flex-row gap-2" slot="title">
                    <Icon src={QueueList} mini width={24} slot="icon"/>
                    Feed Options
                </span>
                
                <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                    
                    <!--- Default Feed Selection--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={QueueList} mini width={16}/>Default Feed
                            </p>
                            <p class="text-xs font-normal">Show only posts you're suscribed to, show all from your local instance, or show all posts known to your instance</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <MultiSelect
                            options={['Subscribed', 'Local', 'All']}
                            bind:selected={$userSettings.defaultSort.feed}
                            headless={true}
                            items={0}
                        />
                    </div>

                    <!---Feed Sort Direction--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={ChartBar} mini width={16}/>
                                Feed Sort Direction
                            </p>
                            <p class="text-xs font-normal">Choose how your posts are sorted by default.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Sort bind:selected={$userSettings.defaultSort.sort} navigate={false} items={0} headless={true} />
                    </div>
                    
                    

                    <!---Posts Per Page--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={TableCells} mini width={16}/>
                                Posts per Fetch
                            </p>
                            <p class="text-xs font-normal">The number of posts to request at a time.</p>
                        </div>
                        <div class="mx-auto"/>
                        <MultiSelect
                            options={[10, 20, 30]}
                            bind:selected={$userSettings.uiState.postsPerPage}
                            items={0}
                            headless={true}
                        />
                    </div>


                    <!---Post Style--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={QueueList} mini width={16}/>
                                Post Style
                            </p>
                            <p class="text-xs font-normal">What style of posts to display in the feed by default.</p>
                        </div>
                        <div class="mx-auto"/>
                        
                        <MultiSelect
                            options={[false, true]}
                            optionNames={['Cards', 'Compact']}
                            bind:selected={$userSettings.showCompactPosts}
                            headless={true}
                            items={0}
                        />
                    </div>

                    <!---Feed Image Size--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Photo} mini width={16}/>
                                Image Size
                            </p>
                            <p class="text-xs font-normal">Set the size for post images in the feed.</p>
                        </div>
                        <div class="mx-auto"/>
                        
                        <MultiSelect
                            optionNames={['Small', 'Medium', 'Large', 'Extra Large', 'Full Width']}
                            options={['max-w-sm', 'max-w-md', 'max-w-3xl', 'max-w-4xl', 'w-full']}
                            selected={$userSettings.imageSize.feed}
                            items={0}
                            headless={true}
                            on:select={(e) => {
                                // @ts-ignore
                                $userSettings.imageSize.feed = e.detail
                            }}
                        />
                    </div>
                

                    <!---Fade Title of Read Posts--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={EnvelopeOpen} mini width={16}/>
                                Fade Read Posts
                            </p>
                            <p class="text-xs font-normal">Fade the titles of read posts in the feed.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.markReadPosts} />
                    </div>

                    <!---Expand Crosspost List--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={BarsArrowDown} mini width={16}/>
                                Expand Crosspost List
                            </p>
                            <p class="text-xs font-normal">Expand the crosspost list automatically. Disable to collapse it by default. Will be collapsed regardless of settings if there are more than 3.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.uiState.expandCrossPosts} />
                    </div>

                    <!---Match Crosspost on Title--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={BarsArrowDown} mini width={16}/>
                                Match Crossposts on Title
                            </p>
                            <p class="text-xs font-normal">
                                By default, crossposts are only detected based on having the same URL. Enable this option to also match the title (case-insensitive). This may
                                cause undesirable rollups for communities that require post titles be fixed strings (e.g. me_irl, thelyicsgame, etc).
                            </p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.uiState.matchCrossPostOnTitle} />
                    </div>

                    <!---Blur NSFW Images--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={EyeSlash} mini width={16}/>
                                Blur NSFW Images
                            </p>
                            <p class="text-xs font-normal">Blur images in posts that are marked NSFW.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.nsfwBlur} />
                    </div>
                    
                    <!---Open Posts in New Tab--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={ArrowTopRightOnSquare} mini width={16}/>
                                Open Posts in New Tab
                            </p>
                            <p class="text-xs font-normal">Posts in the feed will open in a new tab. If you have Tesseract installed as a PWA, you will likely want to make sure this is disabled.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.openInNewTab.posts} />
                    </div>
                </div>
                

            </Setting>
               
        </div>

        <!---Post Options--->
        <div class:hidden={selected!='posts'}>
            <Setting>
                <span class="flex flex-row gap-2" slot="title">
                    <Icon src={Window} mini width={24} slot="icon"/>
                    Post Options
                </span>
                <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                    
                    <!---Comment Sort Order--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={ChartBar} mini width={16}/>
                                Comment Sort Direction
                            </p>
                            <p class="text-xs font-normal">Choose the default sorting method for comments.</p>
                        </div>
                        <div class="mx-auto"/>
                        <MultiSelect
                            options={['Hot', 'Top', 'New']}
                            bind:selected={$userSettings.defaultSort.comments}
                            headless={true}
                            items={0}
                        />
                    </div>

                    <!---Post Image Size--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Photo} mini width={16}/>
                                Image Size
                            </p>
                            <p class="text-xs font-normal">Set the size of the images when viewing posts.</p>
                        </div>
                        <div class="mx-auto"/>
                        
                        <MultiSelect
                            optionNames={['Small', 'Medium', 'Large', 'Extra Large', 'Full Width']}
                            options={['max-w-sm', 'max-w-md', 'max-w-3xl', 'max-w-4xl', 'w-full']}
                            selected={$userSettings.imageSize.post}
                            headless={true}
                            items={0}
                            on:select={(e) => {
                                // @ts-ignore
                                $userSettings.imageSize.post = e.detail
                            }}
                        />
                    </div>

                    <!---Inline Images--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Photo} mini width={16}/>
                                Inline Images
                            </p>
                            <p class="text-xs font-normal">Enable inline images in posts and comments. If disabled, inline images will be shown as a link.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.inlineImages} />
                    </div>

                    <!---Code Syntax Highlighting--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={CodeBracketSquare} mini width={16}/>
                                Code Highlighting
                            </p>
                            <p class="text-xs font-normal">Enable syntax highlighting in code blocks.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.highlightCode} />
                    </div>

                    <!---Inline Code Syntax Highlighting--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.highlightCode}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={CodeBracket} mini width={16}/>
                                Inline Code Highlighting
                            </p>
                            <p class="text-xs font-normal">Enable syntax highlighting for inline code.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.highlightInlineCode} />
                    </div>

                    <!--Show Full or Truncated URLs--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={LinkIcon} mini width={16}/>
                                Show Full URLs
                            </p>
                            <p class="text-xs font-normal">Show full URLs in posts. Disable to only show the domain of the link.</p>
                        </div>
                        <div class="mx-auto"/>
                        <Switch bind:enabled={$userSettings.uiState.showFullURL} />
                    </div>

                    

                    <!---Fediseer Badges--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Eye} mini width={16}/>
                                Fediseer Badges
                            </p>
                            <p class="text-xs font-normal">Show Fediseer badges on post cards.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.uiState.fediseerBadges} />
                    </div>

                    <!---MBFC Badges--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={CheckBadge} mini width={16}/>
                                Media Bias Fact Check Badges
                            </p>
                            <p class="text-xs font-normal">Show badges on posts with URLs to check them against the Media Bias Fact Check dataset.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.uiState.MBFCBadges} />
                    </div>

                
                
                </div>
            </Setting>
        </div>

        <!--Media Opinions--->
        <div class:hidden={selected!='media'}>
            <Setting>
                <span class="flex flex-row gap-2" slot="title">
                    <Icon src={Gif} mini width={24} slot="icon"/>
                    Media Options
                </span>
                
                <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                    
                    <!--- Enable Embedded Content In Feed--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Film} mini width={16}/>Enable Embeds in Feed
                            </p>
                            <p class="text-xs font-normal">Enable embedded content in the feed. When disabled, a thumbnail will be shown instead.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.embeddedMedia.feed} />
                    </div>

                    <!--- Enable Embedded Content In Posts--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Film} mini width={16}/>Enable Embeds in Posts
                            </p>
                            <p class="text-xs font-normal">Enable embedded content in the posts. When disabled, a thumbnail will be shown instead.</p>
                        </div>
                        
                        <div class="mx-auto"/>
                        
                        <Switch bind:enabled={$userSettings.embeddedMedia.post} />
                    </div>

                    <!--- Enable Autoplay--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.embeddedMedia.post}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Play} mini width={16}/>Autoplay
                            </p>
                            <p class="text-xs font-normal">Autoplay supported content when opening posts.</p>
                        </div>
                        
                        <div class="mx-auto"/>

                        <Switch bind:enabled={$userSettings.embeddedMedia.autoplay} />
                    </div>

                    <!--- Enable Loop--->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={ArrowPathRoundedSquare} mini width={16}/>Loop Videos
                            </p>
                            <p class="text-xs font-normal">Loop supported videos.</p>
                        </div>
                        
                        <div class="mx-auto"/>

                        <Switch bind:enabled={$userSettings.embeddedMedia.loop} />
                    </div>

                    <!--- YouTube Frontend--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!$userSettings.embeddedMedia.post && !$userSettings.embeddedMedia.feed}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Tv} mini width={16}/>YouTube Frontend
                            </p>
                            <p class="text-xs font-normal">Choose whether to use YouTube or Invidious for YouTube links.</p>
                        </div>
                        
                        <div class="mx-auto"/>

                        <MultiSelect
                            options={['YouTube', 'Invidious']}
                            bind:selected={$userSettings.embeddedMedia.YTFrontend}
                            items={0}
                            headless={true}
                        />
                    </div>

                    <!--- Invidious Instance--->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!($userSettings.embeddedMedia.YTFrontend == 'Invidious')}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Film} mini width={16}/>Invidious Instance
                            </p>
                            <p class="text-xs font-normal">Select the Invidious instance you wish to use as your YouTube frontend.</p>
                        </div>
                        
                        <div class="mx-auto"/>

                        <MultiSelect
                            options={YTFrontends.invidious}
                            items={0}
                            headless={true}
                            bind:selected={$userSettings.embeddedMedia.customInvidious}
                        />
                    </div>

                    <!--- Image Proxying --->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!ENABLE_MEDIA_PROXY}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={GlobeAlt} mini width={16}/>Proxy Images
                            </p>
                            <p class="text-xs font-normal">When enabled, images will be proxied through the Tesseract UI rather than fetched directly.</p>
                        </div>
                        
                        <div class="mx-auto"/>

                        <Switch bind:enabled={$userSettings.proxyMedia.enabled} />
                    </div>

                    <!--- Image Proxying Fallback --->
                    <div class="flex flex-row w-full gap-2 py-2" class:hidden={!ENABLE_MEDIA_PROXY || !$userSettings.proxyMedia.enabled}>
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={ArrowUturnDown} mini width={16}/>Fallback to Direct Fetch
                            </p>
                            <p class="text-xs font-normal">If the image proxy fails to fetch the image, try to fetch it directly instead.</p>
                        </div>
                        
                        <div class="mx-auto"/>

                        <Switch bind:enabled={$userSettings.proxyMedia.fallback} />
                    </div>

                </div>


            </Setting>
        </div>

        <!---Moderation Options--->
        <div class:hidden={selected!='moderation' || !amModOfAny($profile?.user)}>
            <Setting>
                <span class="flex flex-row gap-2" slot="title">
                    <Icon src={HandRaised} mini width={24} slot="icon"/>
                    Moderation Removal Reply Template
                </span>
                <span slot="description">
                    <p>The preset to use for "Reply reason" in a submission removal.</p>
                    
                    <div class="flexrow">
                        <div class="flexcol flexcol-33">
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
                            <MarkdownEditor
                                bind:value={$userSettings.moderation.removalReasonPreset}
                                images={false}
                                previewButton
                                beforePreview={(input) =>
                                    removalTemplate(input, {
                                        postTitle: '<Example post>',
                                        communityLink: '[!community@example.com]()',
                                        reason: '<Being a meanie>',
                                        username: '@Bob',
                                    })
                                }
                            />
                        </div>
                    </div>
                </span>
            </Setting>
        </div>

        <!---Filtering--->
        <div class:hidden={selected!='filters'}>
            <Setting>
                <span class="flex flex-row gap-2" slot="title">
                    <Icon src={Funnel} mini width={24} slot="icon"/>
                    Post Filtering
                </span>
                <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">

                    <!--- Hide Low Credibility Posts --->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={ExclamationTriangle} mini width={16}/>
                                Hide Low Credibility Posts
                            </p>
                            <p class="text-xs font-normal">Hide posts that link to low credibility sources as reported by Media Bias Fact Check.</p>
                            <p class="text-xs font-normal" class:hidden={$userSettings.uiState.MBFCBadges}>
                                You must 
                                <button class="text-blue-500 hover:underline max-w-full cursor-pointer" title="Enable MBFC badges on posts" 
                                    on:click={()=> {$userSettings.uiState.MBFCBadges = true}}
                                >
                                    enable MBFC badges
                                </button>
                                to use this feature.
                            </p>
                        </div>
                        
                        <div class="mx-auto"/>
                        {#if $userSettings.uiState.MBFCBadges}
                            <Switch bind:enabled={$userSettings.hidePosts.MBFCLowCredibility} />
                        {/if}
                    </div>

                    <!--- Hide Deleted Posts --->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={Trash} mini width={16}/>
                                Hide Deleted Posts
                            </p>
                            <p class="text-xs font-normal">Hide posts that have been deleted.</p>
                        </div>
                        
                        <div class="mx-auto"/>

                        <Switch bind:enabled={$userSettings.hidePosts.deleted} />
                    </div>

                    <!--- Hide Removed Posts --->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={NoSymbol} mini width={16}/>
                                Hide Removed Posts
                            </p>
                            <p class="text-xs font-normal">Hide posts that have been removed by a moderator.</p>
                        </div>
                        
                        <div class="mx-auto"/>

                        <Switch bind:enabled={$userSettings.hidePosts.removed} />
                    </div>

                    <!--- Enable Keyword Filters --->
                    <div class="flex flex-row w-full gap-2 py-2">
                        <div class="flex flex-col w-full">
                            <p class="text-sm font-bold flex flex-row gap-2">
                                <Icon src={FaceFrown} mini width={16}/>
                                Keyword Filtering
                            </p>
                            <p class="text-xs font-normal">Enable hiding posts based on keywords you've configured.</p>
                            
                            <!---Keyword Filter Editor --->
                            <div class="flex flex-row flex-wrap lg:flex-nowrap gap-2 w-full mt-4" class:hidden={!$userSettings.hidePosts.keywords}>
                                
                                <div class="flex flex-col w-full gap-2 lg:w-1/3">
                                    <div class="flex flex-row gap-2 mt-2 w-full">
                                        <TextInput 
                                            bind:value={keywordInput} 
                                            type="text" class="w-full" placeholder="Keyword(s) to filter"
                                            
                                            on:keydown={(e) => {
                                                if (e.detail?.key == "Enter") {
                                                    e.preventDefault();
                                                    addKeyword(keywordInput);
                                                }
                                            }}
                                            />
                                        
                                        <Button color="primary"
                                            class="h-8"
                                            on:click={() => {
                                            addKeyword(keywordInput);
                                            }}
                                        >
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
                                                
                                                <Button
                                                    color="ghost"
                                                    class="mr-4 border-none"
                                                    on:click={() => {
                                                        delKeyword(keyword);

                                                    }}
                                                >
                                                    
                                                    <Icon src={XCircle} mini width={22}/>
                                                </Button>
                                            </div>
                                            
                                        {/each}
                                    {:else}
                                        <Placeholder
                                            icon={ArchiveBoxXMark}
                                            title="No keywords"
                                            description="You have not set any keywords to filter."
                                        />
                                    {/if}
                                </div>
                            </div>
                            
                            

                        </div>
                    
                        <div class="mx-auto"/>

                        <Switch bind:enabled={$userSettings.hidePosts.keywords} />
                    </div>
                </div>
            </Setting>
        </div>

        <!---Import/Export Options--->
        <div class:hidden={selected!='impexp'}>
            <Setting>
                <span class="flex flex-row gap-2" slot="title">
                    <Icon src={ArrowDownTray} mini width={24} slot="icon"/>
                    Import and Export Settings
                </span>
                
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
            </Setting>
        </div>

    </div>

</div>

 