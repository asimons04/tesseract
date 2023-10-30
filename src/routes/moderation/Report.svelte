<script lang="ts">
    import type {
        CommentReportView,
        PostReportView,
        PrivateMessageReportView,
    } from 'lemmy-js-client'
    
    import { amMod, isAdmin, remove, report } from '$lib/components/lemmy/moderation/moderation.js'
    import { getClient } from '$lib/lemmy.js'
    import { isCommentReport, isPostReport } from '$lib/lemmy/item.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import { 
        Icon, 
        ArrowUturnLeft,
        BugAnt,
        Check,
    } from 'svelte-hero-icons'
    

  export let item: PostReportView | CommentReportView | PrivateMessageReportView

    $: resolved = isCommentReport(item)
        ? item.comment_report.resolved
        : isPostReport(item)
            ? item.post_report.resolved
            : false

    let resolving:boolean = false
    
    let debug:boolean = false;

    let actions = {
        lock: false,
        remove: false,
        removeReason: '',
        
        banCommunity: false,
        banCommunityReason: '',
        
        banInstance: false,
        banInstanceReason: '',
        
        replyReporter: false,
        replyReporterText: '',
        replyReporterBody: '',
        replyReporterIncludeActions: false,
    }

    // Live-update the reply to the reporter based on the selected moderation options.
    $: {
        actions.replyReporterBody = `**Re: Report for ${isCommentReport(item) ? 'comment' : 'post'} in ${item.community.title ?? item.community.name}**\n\n`
        actions.replyReporterBody += "Thank you for your submission.\n\n";
        
        if (actions.replyReporterIncludeActions) {
            if (actions.lock || actions.remove || actions.banCommunity || actions.banInstance) {
                actions.replyReporterBody += "Actions taken in response to this report:\n";

                if (actions.lock)           actions.replyReporterBody += "- Post locked\n";
                if (actions.remove)         actions.replyReporterBody += `- ${isCommentReport(item) ? 'Comment' : 'Post'} removed\n`;
                if (actions.banCommunity)   actions.replyReporterBody += "- User was banned from community\n"
                if (actions.banInstance)    actions.replyReporterBody += "- User was banned from this instance\n"
                
                // Add an additional newline to finish list
                actions.replyReporterBody += '\n'
            }
            else {
                actions.replyReporterBody += `The reported ${isCommentReport(item) ? 'comment' : 'post'} was reviewed by our moderation team and does not violate any community or server rules.\n\n`
            }
        }

        if (actions.replyReporterText != '') actions.replyReporterBody += '**Moderator Comments**: ' + actions.replyReporterText + '\n\n';
        actions.replyReporterBody += 'Your report has been resolved.';
    }


    async function resolve() {
        if (!$profile?.jwt || !$profile.user) return
        resolving = true

        try {
            if (isCommentReport(item)) {
                await getClient().resolveCommentReport({
                    auth: $profile.jwt,
                    report_id: item.comment_report.id,
                    resolved: !resolved,
                })

                resolved = !resolved

                toast({
                    content: `${resolved ? 'Resolved' : 'Unresolved'} that report.`,
                    type: 'success',
                })
            } 
            else if (isPostReport(item)) {
                await getClient().resolvePostReport({
                    auth: $profile.jwt,
                    report_id: item.post_report.id,
                    resolved: !resolved,
                })

                resolved = !resolved
                toast({
                    content: `${resolved ? 'Resolved' : 'Unresolved'} that report.`,
                    type: 'success',
                })
            }

            // Send DM to reporter if selected
            if (actions.replyReporter) {
                try {
                    await getClient().createPrivateMessage({
                        auth: $profile.jwt,
                        content: actions.replyReporterHeader  + (actions.replyReporterText ?? 'Your report has been resolved'),
                        recipient_id: item.creator.id
                    })

                    toast({
                        content: "Sent reply to reporter.",
                        type: 'success'
                    });
                }
                catch (err) {
                    console.log(err);
                    toast({
                        content: 'Failed to message user.',
                        type: 'warning',
                    })
                }
            }

            const reports = await getClient().getReportCount({
                auth: $profile?.jwt,
            })

            $profile.user.reports =
                reports.comment_reports +
                reports.post_reports +
                (reports.private_message_reports ?? 0)
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
        resolving = false
    }
</script>




<div class="flex flex-col gap-2 w-full">
    <div>
        <span class="text-xs font-bold dark:text-zinc-400 text-slate-600">
            Report Details
        </span>
        <p>{isCommentReport(item) ? item.comment_report.reason : isPostReport(item) ? item.post_report.reason : 'No reason provided'}</p>
    </div>



    <!--- Moderation Actions Form--->
    <div class="flex flex-col gap-2 w-full" class:hidden={resolved}>
        
        <span class="text-xs font-bold dark:text-zinc-400 text-slate-600">
            Actions to Take
        </span>

        {#if $profile?.user && (amMod($profile.user, item.community) || isAdmin($profile.user))}
            <Checkbox bind:checked={actions.lock} defaultValue={false} >Lock Post</Checkbox>
        
            <!--- Remove Content--->
            <Checkbox bind:checked={actions.remove} defaultValue={false} >
                Remove  {isCommentReport(item) ? 'Comment' : isPostReport(item) ? 'Post' : 'Content'}
            </Checkbox>
            <span class="ml-[1.5rem] flex flex-col gap-2" class:hidden={!actions.remove}>
                <TextInput 
                    bind:value={actions.removeReason}
                    type="text"
                    label="Reason for {isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'} removal"
                />
            </span>
            
            <!---Community Ban--->
            <Checkbox bind:checked={actions.banCommunity}  defaultValue={false} >Ban From Community</Checkbox>
            <span class="ml-[1.5rem] flex flex-col gap-2" class:hidden={!actions.banCommunity}>
                <TextInput 
                    bind:value={actions.banCommunityReason}
                    type="text"
                    label="Reason for community ban"
                />
            </span>
            
            <!--- Instance Ban (admins only)--->
            {#if $profile?.user && isAdmin($profile.user)}
                <Checkbox bind:checked={actions.banInstance} defaultValue={false} >Ban From Instance</Checkbox>
                
                <span class="ml-[1.5rem] flex flex-col gap-2" class:hidden={!actions.banInstance}>
                    <TextInput 
                        bind:value={actions.banInstanceReason}
                        type="text"
                        label="Reason for instance ban"
                    />
                </span>
            {/if}

            <!---Reply to reporter form--->
            <div class="flex flex-col gap-2 w-full">
                <Checkbox bind:checked={actions.replyReporter} defaultValue={false} >Reply to reporter</Checkbox>
                
                <span class="ml-[1.5rem] flex flex-col gap-2" class:hidden={!actions.replyReporter}>
                    
                    <Checkbox bind:checked={actions.replyReporterIncludeActions} defaultValue={false} >Include Actions Taken</Checkbox>
                    <TextInput 
                        bind:value={actions.replyReporterText}
                        type="text"
                        label="Additional comments to send to reporter:"
                        placeholder="Your report has been resolved"
                    />
                    
                    <!---Preview the reply that gets sent to the reporter--->
                    <MarkdownEditor label="Reply preview:" value={actions.replyReporterBody} previewButton={true} previewing={true} rows={7} images={false}/>
                    
                </span>
            </div>
        {/if}

    </div>

    <div class="flex flex-row gap-2 items-center">
        <span class="ml-auto" />

        <!---Debug Button--->
        {#if $userSettings.debugInfo}
            {#if debug}
                {#await import('$lib/components/util/debug/DebugObject.svelte') then { default: DebugObject }}
                    <DebugObject object={item} bind:open={debug} />
                {/await}
            {/if}

            <Button on:click={() => (debug = true)} size="square-md" title="Debug Info" color="ghost">
                <Icon src={BugAnt} mini size="16" slot="icon" />
            </Button>
        {/if}

        <Button
            on:click={resolve}
            class="{resolved ? '!text-green-500' : ''}"
            size="md"
            aria-label="{resolved ? "Unresolve" : "Resolve"}"
            title="{resolved ? "Unresolve" : "Resolve"}"
            loading={resolving}
            disabled={resolving}
        >
            <Icon src={resolved ? ArrowUturnLeft : Check} mini size="16" slot="icon" />
            {resolved ? "Unresolve" : "Resolve"}
        </Button>
        
    </div>
</div>

<details class="flex flex-col gap-2">
    <summary class="text-xs font-bold dark:text-zinc-400 text-slate-600 mb-4 cursor-pointer">
        Reported {isCommentReport(item) ? 'Comment' : isPostReport(item) ? 'Post' : 'Content'}
    </summary>
    
    {#if isCommentReport(item)}
        <CommentItem
            comment={
                {
                    ...item,
                    subscribed: 'NotSubscribed',
                    creator_blocked: false,
                    saved: false,
                    creator: item.comment_creator,
                }
            }
            actions={false}
        />
    {:else if isPostReport(item)}
        <Post
            post={
                {
                    ...item,
                    saved: false,
                    subscribed: 'NotSubscribed',
                    unread_comments: 0,
                    read: false,
                    creator_blocked: false,
                    creator: item.post_creator,
                }
            }
            forceCompact={true}
            disablePostLinks={true}
            actions={false}
        />
    {/if}
</details>