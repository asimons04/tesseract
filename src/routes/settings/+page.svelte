<script lang="ts">
    import Switch from '$lib/components/input/Switch.svelte'
    import { defaultSettings, userSettings } from '$lib/settings'
    import Setting from './Setting.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Sort from '$lib/components/lemmy/Sort.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import Button from '$lib/components/input/Button.svelte'
    import { getInboxNotifications } from '$lib/auth.js'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import { ArrowLeftCircle, ArrowPath, Icon } from 'svelte-hero-icons'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import { removalTemplate } from '$lib/components/lemmy/moderation/moderation.js'
    import Application from '../admin/applications/Application.svelte';

    let data = {
        loading: false,
    }
</script>

<svelte:head>
    <title>Settings</title>
</svelte:head>

<div class="flex flex-col">
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
  

    <Setting>
        <span slot="title">Configure Tesseract</span>
        <span slot="description">
            Use the settings here to control your Tesseract experience.  Changes will be saved automatically to LocalStorage.  If you want to restore the default
            settings (as set by the server admin), use the "Reset to default" button in the upper right corner.
        </span>

        <div class="flex flex-wrap flex-col gap-4 w-full">
            <Setting>
                <span slot="title">Default Sorting Options</span>
                <span slot="description">
                    Select which feed is your default, what order it is sorted in, and in which directions comments should be sorted.
                </span>
        
                <div class="flex flex-wrap flex-row gap-4 w-full">
                
                    <div class="max-w-full">
                        <span class="block my-1 font-bold">Default Feed</span>
                        <MultiSelect
                            options={['Subscribed', 'Local', 'All']}
                            bind:selected={$userSettings.defaultSort.feed}
                        />
                    </div>

                    <div class="max-w-full">
                        <span class="block my-1 font-bold">Feed Sort</span>
                        <Sort bind:selected={$userSettings.defaultSort.sort} navigate={false} />
                    </div>

                    <div class="max-w-full">
                        <span class="block my-1 font-bold">Comment Sort</span>
                        <MultiSelect
                            options={['Hot', 'Top', 'New']}
                            bind:selected={$userSettings.defaultSort.comments}
                        />
                    </div>

                    <div class="max-w-full"> 
                        <span class="block my-1 font-bold">Post style</span>
                        <MultiSelect
                            options={[false, true]}
                            optionNames={['Cards', 'Compact']}
                            bind:selected={$userSettings.showCompactPosts}
                        />
                    </div>
                </div>
            </Setting>
            
            
            
            <Setting>
                <span slot="title">Post and User Display Options</span>
                <span slot="description">Toggle various options for how posts, comments, and usernames are displayed.</span>
                
                <div class="flex flex-wrap flex-row gap-2 w-full">
                    
                    <div class="w-1/3">
                        <Setting>
                            <span slot="title">Post Display Options</span>
                            <span slot="description">
                                Controls various elements of the post feed.
                            </span>
                            
                            
                            <Checkbox bind:checked={$userSettings.hidePosts.deleted}>   Hide Deleted Posts</Checkbox>
                            <Checkbox bind:checked={$userSettings.hidePosts.removed}>   Hide Removed Posts</Checkbox>
                            <Checkbox bind:checked={$userSettings.markReadPosts}>       Fade Title of Read Posts</Checkbox>
                            <Checkbox bind:checked={$userSettings.revertColors}>        Invert Vote Colors (orange upvote, blue downvote)</Checkbox>
                            <Checkbox bind:checked={$userSettings.nsfwBlur}>            Blur NSFW Images</Checkbox>
                            <Checkbox bind:checked={$userSettings.newVote}>             Use New Vote Design</Checkbox>

                            <hr class="mt-4"/>
                            <p>
                                Looking to hide read posts? That was moved to your
                                <Link href="/profile/settings" highlight>profile settings</Link>.
                            </p>
                            
                        </Setting>
                    </div>
                    
                    
                    <div class="w-1/3">
                        <Setting>
                            <span slot="title">User/Community Display Options</span>
                            <span slot="description">
                                Configure how users and community names are shown.
                            </span>
                            
                            <Checkbox bind:checked={$userSettings.displayNames}>Show a user's display name instead of their account username.</Checkbox>
                            <Checkbox bind:checked={$userSettings.showInstances.user}>Show user's instances</Checkbox>
                            <Checkbox bind:checked={$userSettings.showInstances.comments}>Show user's instances in the comments.</Checkbox>
                            <Checkbox bind:checked={$userSettings.showInstances.community}>Show the instance communities belong to.</Checkbox>
                            
                        </Setting>
                    </div>

                    <div class="w-1/3">
                        <Setting>
                            <span slot="title">Embedded Content</span>
                            <span slot="description">
                                Enable or disable inline media content such as YouTube and Spotify. You can also choose which YouTube frontend
                                is used if that kind of thing is important to you.    
                            </span>
                            
                            <Checkbox bind:checked={$userSettings.showEmbeds}>Enable embedded content</Checkbox>
                            
                            <span class="block my-1 font-bold">Youtube Frontend</span>
                            <MultiSelect
                                options={['YouTube', 'Piped', 'Invidious']}
                                bind:selected={$userSettings.youtubeFrontend}
                            />
                        </Setting>
                    </div>

                        
                    

                </div>
            </Setting>
            
        
        </div>
    
    
    
    </Setting>

    
    <SectionTitle class="mt-4">Moderation</SectionTitle>
    <Setting>
        <span slot="title">Removal reply preset</span>
        <span slot="description">
            <p>The preset to use for "Reply reason" in a submission removal.</p>
            <ul class="leading-6">
                <li>Syntax:</li>
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
        </span>
        
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
    </Setting>

  <SectionTitle class="mt-4">Other</SectionTitle>
  <Setting>
    <span slot="title">Font</span>
    <span slot="description">What font Photon should use.</span>
    <MultiSelect
      options={[true, false]}
      optionNames={['System UI', 'Browser Font']}
      bind:selected={$userSettings.systemUI}
    />
  </Setting>
  <Setting>
    <Checkbox bind:checked={$userSettings.debugInfo} slot="title">
      Debug Info
    </Checkbox>
    <span slot="description">
      Show an option to show debug information. (in posts and such)
    </span>
  </Setting>
</div>
