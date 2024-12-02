<script lang="ts">
    import type { StandardReport } from "$routes/moderation-old/components/helpers"
    
    import { createEventDispatcher } from "svelte"
    import { fade } from "svelte/transition"
    import { hrColors } from "$lib/ui/colors"
    import { getClient } from '$lib/lemmy'
    import { postModerationModal, userProfileModal } from "$lib/components/lemmy/moderation/moderation"
    import { profile } from '$lib/auth'

    import Button from "$lib/components/input/Button.svelte"
    import Card from '$lib/components/ui/Card.svelte'
    import CollapseButton from "$lib/components/ui/CollapseButton.svelte"
    import CommentItem from "$lib/components/lemmy/comment/CommentItem.svelte"
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Markdown from "$lib/components/markdown/Markdown.svelte";
    import Post from "$lib/components/lemmy/post/Post.svelte"
    import PrivateMessageItem from '$lib/components/lemmy/private_message/PrivateMessageItem.svelte'
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"
    import UserLink from "$lib/components/lemmy/user/UserLink.svelte"

    import { 
        Check, 
        Icon, 
        Newspaper,
        NoSymbol,
        ShieldExclamation,
        Trash,
        Window as WindowIcon,
        Envelope,
        User,
    } from "svelte-hero-icons"

    export let report: StandardReport
    const dispatcher = createEventDispatcher()
       
    async function resolve() {
        if (!$profile?.user) return
        
        const client = getClient()
        // Resolve a Post Report
        if (report.type == 'post') {
            await client.resolvePostReport({
                report_id: report.id,
                resolved: !report.resolved,
            })
            report.resolved = !report.resolved
        }

            
        // Resolve a Comment Report
        if (report.type == 'comment') {
            await client.resolveCommentReport({
                report_id: report.id,
                resolved: !report.resolved,
            })
            report.resolved = !report.resolved
        }

        // Resolve a private message report
        if (report.type == 'private_message') {
            await client.resolvePrivateMessageReport({
                report_id: report.id,
                resolved: !report.resolved,
            })
            report.resolved = !report.resolved
        }
            
            
        // Update reports object store
        const reports = await getClient().getReportCount({})
        $profile.user.reports = reports.comment_reports + reports.post_reports + (reports.private_message_reports ?? 0)

        dispatcher('resolveReport', { resolved: report.resolved})
    }
</script>


<div class="flex flex-row w-full" transition:fade>
        
    <span class="mt-3 mb-auto w-[50px]">
        <Button color="tertiary-border" size="sm" title="{report.resolved ? 'Un-resolve' : 'Resolve'}" on:click={() => resolve()}>
            <Icon src={Check} width={22} mini class={report.resolved ? 'opacity-70 text-green-500' : ''}/>
        </Button>
    </span>
    
    <CollapseButton icon={report.icon} bold={!report.resolved} truncate={true} class="w-[calc(100%-50px)]" innerClass="!pl-0 ml-[-50px] lg:ml-0" >
        
        <!---Title Component of Collapse Button--->
        <div class="flex flex-row gap-2 items-start" slot="title" title="{report.title}">
            <span class="opacity-70">
                <RelativeDate date={report.published} />
            </span>
            {report.title}
        </div>

        <!---Reporter, Reportee, Community, and Resolver--->
        <div class="flex flex-col w-full gap-2 lg:flex-row lg:justify-between lg:items-center">
            
            <span class="flex flex-col w-full gap-2">
                <span class="flex flex-row gap-1 text-xs w-full lg:w-1/2">
                    <span class="font-bold">Report from: </span>
                    <UserLink user={report.reporter} avatar avatarSize={16}/>
                </span>

                <span class="flex flex-row gap-1 text-xs w-full lg:w-1/2">
                    <span class="font-bold">Report against: </span>
                    <UserLink user={report.reportee} avatar avatarSize={16}/>
                </span>
            </span>
            

            <span class="flex flex-col w-full gap-2">
                
                {#if report.community}
                <span class="flex flex-row gap-1 text-xs w-full lg:w-1/2">
                    <span class="font-bold">Community: </span>
                    <CommunityLink community={report.community} avatar avatarSize={16}/>
                </span>
                {/if}

                <span class="flex flex-row gap-1 text-xs w-full lg:w-1/2">
                    <span class="font-bold">Resolved by: </span>
                    {#if report.resolver}
                        <UserLink user={report.resolver} avatar avatarSize={16}/>
                    {:else}
                        ---
                    {/if}
                </span>
            </span>
        </div>

        <hr class="{hrColors}" />
        
        <!---Report Reason--->
        <span class="text-sm font-bold">Reason:</span>
        <Markdown source={report.reason} class="text-sm max-h-[150px] overflow-y-scroll overflow-x-hidden"/>


        <!---Item View and Actions--->
        <div class="flex flex-col lg:flex-row w-full gap-2">
            
            <!---Item View--->
            <div class="w-full lg:w-2/3">
                {#if report.type == 'post' && report.post_view}
                    <Post post={report.post_view} actions={false} expandCompact={false} />
                {/if}

                {#if report.type == 'comment' && report.comment_view}
                    <CommentItem comment={report.comment_view} actions={false} />
                {/if}

                {#if report.type == 'private_message' && report.private_message_view}
                    <Card class="p-2">    
                        <PrivateMessageItem item={report.private_message_view} /> 
                    </Card>
                {/if}
            </div>

            <!---Action Buttons--->
            <div class="p-2 w-full lg:w-1/3" elevation={0}>
                <span class="text-sm font-bold">Actions:</span>
                
                <div class="flex flex-col gap-2 w-full">
                    
                    <!---Currently, the only thing you can do with a private message is ban the user--->
                    {#if report.type == 'private_message'}
                    <Button color="tertiary-border" icon={User} alignment="left" class="w-full" on:click={() => {
                        userProfileModal(report.reportee)
                    }}
                    >
                        User Actions...
                    </Button>
                    {/if}


                    <!---Moderation Menu--->
                    {#if (report.type == 'post' && report.post_view) || (report.type == 'comment' && report.comment_view)}
                        <Button color="tertiary-border" icon={ShieldExclamation} alignment="left" class="w-full" on:click={() => {
                            if (report.type == 'post' && report.post_view)          postModerationModal(report.post_view)
                            if (report.type == 'comment' && report.comment_view)    postModerationModal(report.comment_view)
                        }}
                        >
                            All Mod Actions...
                        </Button>
                    {/if}

                    <!---Actions Relevant to Posts and Comments--->
                    {#if (report.type == 'post' && report.post_view) || (report.type == 'comment' && report.comment_view)}
                        
                        <!---Remove/Restore Post/Comment--->
                        <Button color="tertiary-border" icon={Trash} alignment="left" class="w-full" on:click={() => {
                            if (report.type == 'post' && report.post_view)          postModerationModal(report.post_view, 'removing')
                            if (report.type == 'comment' && report.comment_view)    postModerationModal(report.comment_view, 'removing')
                        }}
                        >
                            {
                                (
                                    (report.type == 'post' && report.post_view?.post.removed) ||
                                    (report.type == 'comment' && report.comment_view?.comment.removed)
                                )
                                    ? 'Restore' : 'Remove'
                            }  {report.type_friendly}...
                        </Button>
                    
                        <!---Creator's Modlog History--->
                        <Button color="tertiary-border" icon={Newspaper} alignment="left" class="w-full" on:click={() => {
                                if (report.type == 'post' && report.post_view)          postModerationModal(report.post_view, 'modlog')
                                if (report.type == 'comment' && report.comment_view)    postModerationModal(report.comment_view, 'modlog')
                            }}
                        >
                            Creator's Modlog History...
                        </Button>

                        <!---Creator's Community History--->
                        <Button color="tertiary-border" icon={WindowIcon} alignment="left" class="w-full" on:click={() => {
                            if (report.type == 'post' && report.post_view)          postModerationModal(report.post_view, 'userSubmissions')
                            if (report.type == 'comment' && report.comment_view)    postModerationModal(report.comment_view, 'userSubmissions')
                            }}
                        >
                            Creator's Community History...
                        </Button>

                        <!---Send Message to Creator--->
                        <Button color="tertiary-border" icon={Envelope} alignment="left" class="w-full" on:click={() => {
                            if (report.type == 'post' && report.post_view)          postModerationModal(report.post_view, 'messaging')
                            if (report.type == 'comment' && report.comment_view)    postModerationModal(report.comment_view, 'messaging')
                            }}
                        >
                            Send Message to Creator...
                        </Button>

                        <!---Ban/Unban User From Community--->
                        <Button color="tertiary-border" icon={NoSymbol} alignment="left" class="w-full" on:click={() => {
                            if (report.type == 'post' && report.post_view)          postModerationModal(report.post_view, 'banning')
                            if (report.type == 'comment' && report.comment_view)    postModerationModal(report.comment_view, 'banning')
                            }}
                        >
                            {report.creator_banned_from_community ? 'Unban' : 'Ban'} From Community...
                        </Button>

                        
                    {/if}
                </div>
            </div>

        </div>

    </CollapseButton>
</div>
