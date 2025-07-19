<script lang="ts">
    import type { CommentSortType, UploadImageResponse } from 'lemmy-js-client'

    import { buildCommentsTreeAsync } from '$lib/components/lemmy/comment/comments.js'
    import { getClient } from '$lib/lemmy.js'
    import { amMod, isAdmin, ModQueue } from '../moderation/moderation'
    import { dividerColors, hrColors } from '$lib/ui/colors'
    import { instance } from '$lib/instance'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts'

    import Button           from '$lib/components/input/Button.svelte'
    import Card             from '$lib/components/ui/Card.svelte'
    import Comments         from '$lib/components/lemmy/comment/Comments.svelte'
    import CommentForm      from '$lib/components/lemmy/comment/CommentForm.svelte'
    import FormattedNumber  from '$lib/components/util/FormattedNumber.svelte'
    import MultiCommentRemoveModal from '../modal/MultiCommentRemoveModal.svelte'
    import Placeholder      from '$lib/components/ui/Placeholder.svelte';
    import SelectMenu       from '$lib/components/input/SelectMenu.svelte'
    import Spinner          from '$lib/components/ui/loader/Spinner.svelte'

    import { 
        ArrowDown,
        BarsArrowDown,
        ChatBubbleLeft,
        ChatBubbleLeftRight,
        ChevronDoubleUp,
        Cog6Tooth,
        ExclamationTriangle,
        EyeSlash,
        FaceSmile,
        Funnel,
        Newspaper,
        Photo,
        ShieldCheck,
    } from 'svelte-hero-icons'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte';
    import { userSettings } from '$lib/settings';
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte';
    
    
    
    
    export let data:any
    export let showCommentForm:boolean  = true;
    export let imageUploads             = [] as UploadImageResponse[]
    export let onHomeInstance: boolean  = true
    export let jumpTo:number            = -1 

    let commentSort: CommentSortType    = data.commentSort;
    let commentSectionContainer: HTMLDivElement
    let bulkActionModal: boolean = false
    
    // Determine what instance to fetch the comments from (local home or that of the post's home instance)
    let postInstance = onHomeInstance
        ? $instance
        : new URL(data.post.post_view.post.ap_id).hostname

    async function reloadComments() {
        data.singleThread = false
        jumpTo = -1
        commentSectionContainer.scrollTop = 0
        data.streamed.comments = getClient(postInstance).getComments({
            type_: 'All',
            post_id: data.post.post_view.post.id,
            sort: commentSort,
            max_depth: 3,
        })
    }

    let modQueue = new ModQueue()
</script>

{#if bulkActionModal}
    <MultiCommentRemoveModal bind:open={bulkActionModal} bind:modQueue />
{/if}

<div bind:this={commentSectionContainer} id="comments" class="mt-4 flex flex-col gap-2 w-full h-full min-h-[300px]">

    <div class="flex flex-row justify-between items-center px-2">
        
        <div class="flex flex-col font-bold text-lg">
            Comments 
            <span class="text-base font-bold ml-4 opacity-80">
                <FormattedNumber number={data.post.post_view.counts.comments} />
            </span>
        </div>

       

        <!---Multi-Comment Mod Button--->
        {#if isAdmin($profile?.user) || amMod($profile?.user, data.post.post_view.community)}
        <span class="flex flex-col gap-1">
            <span class="font-bold text-sm opacity-80">Bulk Actions</span>
            
            <span class="flex flex-row items-center gap-1">
                <Button size="lg" color="tertiary-border" class="mx-auto" title="Bulk Comment Actions" icon={ShieldCheck} iconSize={16}
                    on:click={() => {
                        if (modQueue.queue.comments.length < 1) toast({
                            type: 'warning',
                            title: 'No Comments Selected',
                            content: 'You must select at least one comment.'
                        })
                        else bulkActionModal = true
                    }}
                />
            </span>
        </span>
        {/if}

        
        <span class="flex flex-col gap-1">
            <span class="font-bold text-sm opacity-80">Sort Direction</span>
            <SelectMenu
                title="Sort Direction"
                alwaysShowSelectedLabel
                icon={BarsArrowDown}
                alignment="bottom-right"
                options={['Hot', 'Top', 'New', 'Old', 'Controversial']} 
                bind:selected={commentSort} 
                on:select={reloadComments} items={5} headless={true} 
            />
        </span>
        
    </div>

    <CollapseButton icon={Cog6Tooth} bottomBorder={false} middleLine title="Comment Settings">
        <div class="Flex flex-col divide-y {dividerColors} gap-1 justify-between items-center px-2">
            <SettingToggle small icon={Funnel} title="Enable Filters" bind:value={$userSettings.hidePosts.enabled}/>
            
            <!---Only Visible if Filtering Enabled--->
            <SettingToggle small icon={EyeSlash} title="Allow Revealing Comments" condition={$userSettings.hidePosts.enabled} bind:value={$userSettings.hidePosts.allowRevealComments} />
            <SettingToggle small icon={EyeSlash} title="Hide Users from Blocked Instances" condition={$userSettings.hidePosts.enabled} bind:value={$userSettings.hidePosts.hideUsersFromBlockedInstances} />

            <SettingToggle small icon={Photo} title="Enable Inline Images" bind:value={$userSettings.inlineImages} />
            <SettingToggle small icon={FaceSmile} title="Large Custom Emojis" bind:value={$userSettings.uiState.largeEmojis} />
            <SettingToggle small icon={ArrowDown} title="Color Coded Conversation Lines" bind:value={$userSettings.uiState.coloredCommentThreadLines} />
            <SettingToggle small icon={BarsArrowDown} title="Limit Comment Height" bind:value={$userSettings.uiState.limitCommentHeight} />
            <SettingToggle small icon={Newspaper} title="Show Inline Removal Reasons" bind:value={$userSettings.autoLookupRemovedCommentReasons} />
            <SettingToggle small icon={ChatBubbleLeft} title="Show Alt Text" bind:value={$userSettings.uiState.showAltText} />
        </div>
    </CollapseButton>

    {#if data.singleThread}
        <Card class="py-2 px-4 text-sm flex flex-row items-center flex-wrap justify-between">
            <p>You're viewing a single thread.</p>
            <Button on:click={() => reloadComments() }>View full thread</Button>
        </Card>
    {/if}

    {#await data.streamed.comments}
        <div class="h-16 mx-auto grid place-items-center">
            <Spinner width={24} />
        </div>
        {:then comments}
        
        {#if $profile?.user && showCommentForm}
            <CommentForm postId={data.post.post_view.post.id} bind:imageUploads
                locked={data.post.post_view.post.locked || !onHomeInstance}
                on:comment={ (comment) =>
                    {
                        comments.comments = [comment.detail.comment_view, ...comments.comments,];
                        showCommentForm = !showCommentForm;
                    }
                }
            />
        {/if}
    
        {#await buildCommentsTreeAsync(comments.comments)}
            <div class="h-16 mx-auto grid place-items-center">
                <Spinner width={36} />
            </div>
            {:then comments}
                {#if comments.length > 0}
                    <Comments post={data.post.post_view.post} bind:modQueue moderators={data.post.moderators} nodes={comments} isParent={true} {onHomeInstance} {jumpTo}/>
                    
                    <!---Comment Section Footer--->
                    <hr class="my-4 {hrColors}" />
                    <div class="flex flex-row w-full">
                        
                        <div class="flex font-bold text-lg items-center w-1/3">
                            Comments 
                            <span class="flex text-sm font-normal ml-2 opacity-80">
                                <FormattedNumber number={data.post.post_view.counts.comments} />
                            </span>
                        </div>

                        <!---Multi-Comment Mod Button--->
                        <div class="flex w-1/3">
                            {#if isAdmin($profile?.user) || amMod($profile?.user, data.post.post_view.community)}
                        
                            <Button size="sm" color="tertiary-border" class="mx-auto" title="Bulk Comment Actions" icon={ShieldCheck} iconSize={16}
                                on:click={() => {
                                    if (modQueue.queue.comments.length < 1) toast({
                                        type: 'warning',
                                        title: 'No Comments Selected',
                                        content: 'You must select at least one comment.'
                                    })
                                    else bulkActionModal = true
                                }}
                            >
                                Bulk Mod
                            </Button>
                            {/if}
                        </div>

                        
                        <div class="flex w-1/3">
                            <Button size="sm" color="tertiary-border" class="ml-auto" icon={ChevronDoubleUp} iconSize={16} on:click={() => commentSectionContainer.scrollIntoView({behavior: 'smooth', block: 'start'}) }>
                                Scroll to Top
                            </Button>
                        </div>
                    </div>
                {:else}
                    <!---Hide placeholder if you have the comment form open--->
                    {#if !showCommentForm}
                        <Placeholder icon={ChatBubbleLeftRight} class="mt-4 mb-4" title="No Comments" description="No one has commented here yet" />
                    {/if}
                {/if}
        {/await}

        {:catch}
            <Placeholder icon={ExclamationTriangle} class="mt-4 mb-4" title="An Error Has Occurred" description="Unable to fetch comments for this post." />
    {/await}
</div>