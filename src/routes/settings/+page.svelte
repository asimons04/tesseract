<script lang="ts">
    import Switch from '$lib/components/input/Switch.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    
    import { defaultSettings, userSettings, YTFrontends } from '$lib/settings'
    import Setting from './Setting.svelte'
    import Sort from '$lib/components/lemmy/Sort.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import { removalTemplate } from '$lib/components/lemmy/moderation/moderation.js'
    
    import {
        ArrowPath,
        Icon,
        Bars3,
        ChartBar
    } from 'svelte-hero-icons'

    let data = {
        loading: false,
    }
</script>

<svelte:head>
    <title>Settings</title>
</svelte:head>

<div class="flex flex-col p-2">
    <h1 class="text-3xl font-bold flex justify-between">
        Settings 
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
                Reset to default
        </Button>
    </h1>
  
    <h1 class="font-bold mt-2">Configure Tesseract</h1>
    <p class="text-sm text-slate-700 dark:text-zinc-300 mb-2">
        Use the settings here to control your Tesseract experience.  Changes will be saved automatically to LocalStorage.  If you want to restore the default
        settings (as set by the server admin), use the "Reset to default" button in the upper right corner.
    </p>

    <Setting>
        <span slot="title">Default Sorting Options</span>
        <span slot="description">
            Select which feed is your default, what order it is sorted in, and in which directions comments should be sorted.
        </span>

        <div class="flexrow">
            <div class="flexcol flexcol-33 mt-2">
                <MultiSelect
                    options={['Subscribed', 'Local', 'All']}
                    bind:selected={$userSettings.defaultSort.feed}
                >
                    <Icon src={Bars3} mini width={16} slot="icon"/>
                    <span slot="label">Default Feed</span>
                </MultiSelect>
            </div>

            <div class="flexcol flexcol-33 mt-2">
                <Sort bind:selected={$userSettings.defaultSort.sort} navigate={false}>
                    <Icon src={ChartBar} mini width={16} slot="icon"/>
                    <span slot="label">Feed Sort Direction</span>
                </Sort>
            </div>

            <div class="flexcol flexcol-33 mt-2">
                <MultiSelect
                    options={['Hot', 'Top', 'New']}
                    bind:selected={$userSettings.defaultSort.comments}
                >
                    <Icon src={ChartBar} mini width={16} slot="icon"/>
                    <span slot="label">Comment Sort Direction</span>
                </MultiSelect>
            </div>
        </div>
    </Setting>
            
            
            
            
    <Setting>
        <span slot="title">Post and User Display</span>
        <span slot="description">Toggle various options for how posts, comments, and usernames are displayed.</span>
        
        <div class="flexrow">
            
            <div class="flexcol flexcol-33 mt-4">
                
                <h1 class="font-bold mb-4">Post Display Options</h1>

                <Checkbox bind:checked={$userSettings.hidePosts.deleted}>   Hide Deleted Posts</Checkbox>
                <Checkbox bind:checked={$userSettings.hidePosts.removed}>   Hide Removed Posts</Checkbox>
                <Checkbox bind:checked={$userSettings.markReadPosts}>       Fade Title of Read Posts</Checkbox>
                <Checkbox bind:checked={$userSettings.nsfwBlur}>            Blur NSFW Images in Feed</Checkbox>
                <Checkbox bind:checked={$userSettings.tagNSFWCommunities}>  Show NSFW badges on Communities</Checkbox>
                <Checkbox bind:checked={$userSettings.highlightCode}>       Use syntax highlighting in code blocks.</Checkbox>
                <Checkbox bind:checked={$userSettings.highlightInlineCode}> Use syntax highlighting in inline code.</Checkbox>
                <Checkbox bind:checked={$userSettings.inlineImages}>        Enable inline images in posts/comments</Checkbox>
                <Checkbox bind:checked={$userSettings.openInNewTab.postLinks}>Open links in a new tab.</Checkbox>
                <Checkbox bind:checked={$userSettings.uiState.showPWAButtons}>Enable navigation buttons in posts.</Checkbox>

                    
                <div class="flex justify-between mt-4">
                    <div>
                        <SelectMenu
                            label="Post Style"
                            alignment="top-left"
                            options={[false, true]}
                            optionNames={['Cards', 'Compact']}
                            selected={$userSettings.showCompactPosts
                                ? 'Compact'
                                : 'Cards'
                            }
                            on:select={(e) => {
                                $userSettings.showCompactPosts = e.detail;
                            }}
                        />
                    </div>

                    <div>
                        <SelectMenu
                            label="Feed Image Size"
                            alignment="top-left"
                            optionNames={['Small', 'Medium', 'Large', 'Extra Large', 'Full Width']}
                            options={['max-w-sm', 'max-w-md', 'max-w-3xl', 'max-w-4xl', 'w-full']}
                            selected={$userSettings.imageSize.feed}
                            on:select={(e) => {
                                // @ts-ignore
                                $userSettings.imageSize.feed = e.detail
                            }}
                        />
                    </div>

                    <div>
                        <SelectMenu
                            label="Post Image Size"
                            alignment="top-left"
                            optionNames={['Small', 'Medium', 'Large', 'Extra Large', 'Full Width']}
                            options={['max-w-sm', 'max-w-md', 'max-w-3xl', 'max-w-4xl', 'w-full']}
                            selected={$userSettings.imageSize.post}
                            on:select={(e) => {
                                // @ts-ignore
                                $userSettings.imageSize.post = e.detail
                            }}
                        />
                    </div>
                </div>
            </div>
            
            
            <div class="flexcol flexcol-33 mt-4">
                <h1 class="font-bold mb-4">User/Community Display</h1>
                    
                <Checkbox bind:checked={$userSettings.displayNames}>Show a user's display name instead of their account username.</Checkbox>
                <Checkbox bind:checked={$userSettings.showInstances.user}>Show user's instances</Checkbox>
                <Checkbox bind:checked={$userSettings.showInstances.comments}>Show user's instances in the comments.</Checkbox>
                <Checkbox bind:checked={$userSettings.showInstances.community}>Show the instance communities belong to.</Checkbox>


                <h1 class="font-bold mt-4 mb-4">Misc Settings</h1>
                <Checkbox bind:checked={$userSettings.modlogCardView}>Use Card view in modlog.</Checkbox>
                <Checkbox bind:checked={$userSettings.systemUI}>Use app's font (uncheck to use browser default)</Checkbox>
                <Checkbox bind:checked={$userSettings.debugInfo}>           Show Debug Info on Posts</Checkbox>
                <Checkbox bind:checked={$userSettings.experimentalFeatures}>Enable experimental features</Checkbox>
            </div>

            <div class="flexcol flexcol-33 mt-4">
                <h1 class="font-bold mb-4">Embedded Content</h1>
                    
                <Checkbox bind:checked={$userSettings.embeddedMedia.feed}>Enable embedded content in feed</Checkbox>
                <Checkbox bind:checked={$userSettings.embeddedMedia.post}>Enable embedded content in posts</Checkbox>
                <Checkbox bind:checked={$userSettings.embeddedMedia.autoplay}>Autoplay supported content when opening posts</Checkbox>
                
                <h1 class="font-bold mt-4 mb-4">YouTube Frontend</h1>
                
                <div class="flex flex-row flex-wrap">
                    <MultiSelect
                        options={['YouTube', 'Invidious']}
                        bind:selected={$userSettings.embeddedMedia.YTFrontend}
                    />

                    <span class:hidden={!($userSettings.embeddedMedia.YTFrontend == 'Invidious')} >
                        <MultiSelect
                            options={YTFrontends.invidious}
                            items=0
                            bind:selected={$userSettings.embeddedMedia.customInvidious}
                        />
                    </span>
                </div>
            </div>
        </div>

    </Setting>

    
    <Setting>
        <span slot="title">Moderation Removal Reply Template</span>
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
