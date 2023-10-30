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

    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    
    import { 
        Icon, 
        Check,
    } from 'svelte-hero-icons'
    

  export let item: PostReportView | CommentReportView | PrivateMessageReportView

    $: resolved = isCommentReport(item)
        ? item.comment_report.resolved
        : isPostReport(item)
            ? item.post_report.resolved
            : false

    let resolving:boolean = false
    let replyToReporter:boolean = false;
    let replyText:string = '';
    
    let removalReason:string = '';
    let removePost:boolean = false;
    
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
            if (replyToReporter) {
                try {
                    await getClient().createPrivateMessage({
                        auth: $profile.jwt,
                        content: 
                            `**Re: Report for ${isCommentReport(item) ? 'comment' : 'post'} in ${item.community.title ?? item.community.name}**\n\n` 
                            + (replyText ?? 'Your report has been resolved'),
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

    <div class="flex flex-row gap-2 w-full items-center">
        <div class="flex flex-col gap-2">
            <Checkbox bind:checked={replyToReporter} defaultValue={false} >Reply to reporter?</Checkbox>
        
            <TextArea 
                class="{replyToReporter ? '' : 'hidden'}"
                bind:value={replyText}
                required={replyToReporter}
                rows={5}
                />
        </div>

        <Button
            on:click={resolve}
            class="w-8 h-8 !p-1 ml-auto {resolved ? '!text-green-500' : ''}"
            aria-label="Resolve"
            title="Resolve"
            loading={resolving}
            disabled={resolving}
        >
            <Icon src={Check} mini size="16" slot="icon" />
        </Button>
    </div>
</div>

<div class="flex flex-col gap-2">
    <span class="text-xs font-bold dark:text-zinc-400 text-slate-600">
        Reported Content
    </span>
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
</div>