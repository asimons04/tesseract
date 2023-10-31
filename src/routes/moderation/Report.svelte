<script lang="ts">
    import type {
        CommentReportView,
        PostReportView,
        PrivateMessageReportView,
    } from 'lemmy-js-client'
    
    import { amMod, isAdmin, remove, report } from '$lib/components/lemmy/moderation/moderation.js'
    import { fly } from 'svelte/transition'
    import { getClient } from '$lib/lemmy.js'
    import { getRemovalTemplates } from './templates'
    import { isCommentReport, isPostReport } from '$lib/lemmy/item.js'
    
    import { profile } from '$lib/auth.js'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    // Modlog Loader
    import {load as loadModlog} from '$routes/modlog/+page'


    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import DateInput from '$lib/components/input/DateInput.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import Switch from '$lib/components/input/Switch.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { 
        Icon, 
        ArrowUturnLeft,
        BugAnt,
        ChatBubbleLeftEllipsis,
        Check,
        Clipboard,
        ClipboardDocumentList,
        Clock,
        ExclamationTriangle,
        Folder,
        FolderOpen,
        LockClosed,
        Microphone,
        NoSymbol,
        Trash,
        UserGroup
    } from 'svelte-hero-icons'
    

    export let item: PostReportView | CommentReportView | PrivateMessageReportView

    $: resolved = isCommentReport(item)
        ? item.comment_report.resolved
        : isPostReport(item)
            ? item.post_report.resolved
            : false

    
    let resolving:boolean = false
    let open:boolean = false;
    let debug:boolean = false;
    
    let modlog = {
        url: new URL(window.location.href),
        show: false,
        person_id: undefined,
        community_id: undefined,
        moderator_id: undefined,
        type: "All",
        page: 1,
        loading: false,
        data: undefined
    }


    // Load Moderation presets from the template module
    let removalPresets = getRemovalTemplates(item);


    // Object containing the actions to perform
    let actions = {
        lock: false,
        
        remove: false,
        removeReason: '',
        removeReplyToAuthor: false,
        
        banCommunity: false,
        banCommunityReason: '',
        banCommunityDeleteData: false,
        banCommunityExpires: '',
        
        banInstance: false,
        banInstanceReason: '',
        banInstanceDeleteData: false,
        banInstanceExpires: '',

        replyReporter: true,
        replyReporterText: '',
        replyReporterBody: '',
        replyReporterIncludeActions: true,
    }

    // A copy of the actions object used to reset it after submission
    let actionsDefault = {...actions};

    // Live-update the reply to the reporter based on the selected moderation options.
    $: {
        actions.replyReporterBody = `**Re: Report for ${isCommentReport(item) ? 'comment' : 'post'} in ${item.community.title ?? item.community.name}**\n\n`
        actions.replyReporterBody += "Thank you for your submission.\n\n";
        
        if (actions.replyReporterIncludeActions) {
            if (actions.lock || actions.remove || actions.banCommunity || actions.banInstance) {
                actions.replyReporterBody += "Actions taken in response to this report:\n";

                if (actions.lock)           actions.replyReporterBody += "- Reported post has been locked\n";
                if (actions.remove)         actions.replyReporterBody += `- Reported ${isCommentReport(item) ? 'comment' : 'post'} has been removed\n`;
                if (actions.banCommunity)   actions.replyReporterBody += `- User was ${actions.banCommunityExpires ? 'temporarily' : 'permanently'} banned from this community\n`
                if (actions.banInstance)    actions.replyReporterBody += `- User was ${actions.banInstanceExpires ? 'temporarily' : 'permanently'} banned from this instance\n`
                
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

    function validateExpiryDate(dateStr:string):boolean {
        let date:number = Date.parse(dateStr);
        
        if (Number.isNaN(date)) {
            toast({
                content: 'Invalid date. It must be an absolute date.',
                type: 'error',
            });
            return false;
        }

        if (date < Date.now()) {
            toast({
                content: 'Invalid date. It is before the current time.',
                type: 'error',
            });
            return false;
        }

        return true;
    }


    async function resolve() {
        if (!$profile?.jwt || !$profile.user ||!item ) return
        
        // Validate the ban expiry dates and pop up a toast warning before returning early.
        if (actions.banCommunityExpires != '' && !validateExpiryDate(actions.banCommunityExpires)) return;
        if (actions.banInstanceExpires  != '' && !validateExpiryDate(actions.banInstanceExpires)) return;

        resolving = true

        try {
            
            // Lock post if "lock" option selected.
            if ( !resolved && actions.lock && isPostReport(item)) {
                try {
                    await getClient().lockPost({
                        auth: $profile.jwt,
                        locked: true,
                        post_id: item.post.id,
                    })

                    item.post.locked = true

                } catch (err) {
                    console.log(err)
                    toast({
                        content: "Failed to lock post",
                        type: 'error',
                    })
                }
            }

            // Remove post if "remove" option selected
            if (!resolved && actions.remove && isPostReport(item)) {
                try {
                    await getClient().removePost({
                        auth: $profile.jwt,
                        post_id: item.post.id,
                        removed: true,
                        reason: actions.removeReason || undefined,
                    })

                    item.post.removed = true
                }
                catch (err) {
                    console.log(err)
                    toast({
                        content: "Failed to remove post.",
                        type: 'error',
                    })
                }

            }

            // Remove comment if "remove" option selected
            if (!resolved && actions.remove && isCommentReport(item)) {
                try {
                    await getClient().removeComment({
                        auth: $profile.jwt,
                        comment_id: item.comment.id,
                        removed: true,
                        reason: actions.removeReason || undefined,
                    })
                    item.comment.removed = true
                }
                catch (err) {
                    console.log(err)
                    toast({
                        content: "Failed to remove comment.",
                        type: 'error',
                    })
                }

            }

            
            // Ban user from community if that is selected
            if (!resolved && actions.banCommunity) {
                try {
                    let date:number = Date.parse(actions.banCommunityExpires)

                    await getClient().banFromCommunity({
                        auth: $profile.jwt,
                        ban: true,
                        community_id: item.post.community_id,
                        person_id: isCommentReport(item) ? item.comment.creator_id : isPostReport(item) ? item.post.creator_id : undefined,
                        reason: actions.banCommunityReason || undefined,
                        remove_data: actions.banCommunityDeleteData,
                        expires: date ? Math.floor(date / 1000) : undefined,
                    })
                }
                catch (err) {
                    console.log(err)
                }

            }

            // Ban user from instance if selected
            if (!resolved && actions.banInstance) {
                try {
                    let date:number = Date.parse(actions.banInstanceExpires)
                    await getClient().banPerson({
                        auth: $profile.jwt,
                        ban: true,
                        person_id: isCommentReport(item) ? item.comment.creator_id : isPostReport(item) ? item.post.creator_id : undefined,
                        reason: actions.banInstanceReason || undefined,
                        remove_data: actions.banInstanceDeleteData,
                        expires: date ? Math.floor(date / 1000) : undefined,
                    })
                }
                catch (err) {
                    console.log(err)
                }
            }


            //// Follow-Up Messages:  If selected, sends follow-up DMs to the post/comment author and/or reporter
            
            // Post/Comment Removal DM to Author
            if (!resolved && actions.remove && actions.removeReplyToAuthor) {
                
                let template:string = '';
                
                template = `Your ${isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'} in 
                    !${item.community.name}@${new URL(item.community.actor_id).host} has been removed:\n\n`
                
                
                template += `- **Post**: [${item.post.name}](${item.post.ap_id})\n`
                
                if (isCommentReport(item)) {
                    template += `- **Comment**: [${item.comment.content}](${item.comment.ap_id})\n`    
                }
                if (actions.removeReason != '') {
                    template += `- **Reason**: ${actions.removeReason}\n`
                }

                template += '\n';

                try {
                    await getClient().createPrivateMessage({
                        auth: $profile.jwt,
                        content: template,
                        recipient_id: isCommentReport(item) ? item.comment.creator_id : isPostReport(item) ? item.post.creator_id : undefined,
                    })

                    toast({
                        content: "Sent reply to post/comment author.",
                        type: 'success'
                    });
                }
                catch (err) {
                    console.log(err);
                    toast({
                        content: 'Failed to message post/comment author.',
                        type: 'warning',
                    })
                }

            }

            // Send DM to reporter if selected
            if (!resolved && actions.replyReporter) {
                try {
                    await getClient().createPrivateMessage({
                        auth: $profile.jwt,
                        content: actions.replyReporterBody,
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

            
            // Resolve Comment Report
            if (isCommentReport(item)) {
                await getClient().resolveCommentReport({
                    auth: $profile.jwt,
                    report_id: item.comment_report.id,
                    resolved: !resolved,
                })

                resolved = !resolved
                item.comment_report.resolved = resolved
                
                toast({
                    content: `${resolved ? 'Resolved' : 'Unresolved'} that report.`,
                    type: 'success',
                })
            } 
            
            // Resolve Post Report
            if (isPostReport(item)) {
                await getClient().resolvePostReport({
                    auth: $profile.jwt,
                    report_id: item.post_report.id,
                    resolved: !resolved,
                })

                resolved = !resolved
                item.post_report.resolved = resolved;

                toast({
                    content: `${resolved ? 'Resolved' : 'Unresolved'} that report.`,
                    type: 'success',
                })
            }

            

            // Update reports object store
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
        resolving = false;
        actions = actionsDefault;
        open=false;
    }

    
</script>




<Card class="p-4 flex flex-col gap-1.5 w-full !bg-slate-100 dark:!bg-black lg:max-h-[75vh]" name="ModeratorReport" id="{isCommentReport(item) ? item.comment_report.id : item.post_report.id}">
    <!---Badge and Open/Close Button Row--->
    <span class="flex flex-col-reverse lg:flex-row w-full gap-4">
        <!--- Report Title--->
        <span class="text-base font-bold">
            {isCommentReport(item) ? 'Comment Report' : isPostReport(item) ? `Post Report: ${item.post.name.length > 45 ? item.post.name.slice(0,45) + '...' : item.post.name}` : 'Post Report'}
        </span>
        
        <span class="ml-auto"/>

        <span class="flex flex-row gap-4 items-center">
            <Badge color="{item.comment_report?.resolved || item.post_report?.resolved ? 'green' : 'yellow'}">
                <Icon src={item.comment_report?.resolved || item.post_report?.resolved ? Check : ExclamationTriangle} mini size="14" />
                <span class="hidden md:block">{item.comment_report?.resolved || item.post_report?.resolved ? 'Resolved' : 'Needs Action'}</span>
            </Badge>

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

            <!--- Resolve Button--->
            <Button
                on:click={resolve}
                color="primary"
                class="h-8"
                size="md"
                aria-label="{resolved ? "Unresolve" : "Resolve"}"
                title="{resolved ? "Unresolve" : "Resolve"}"
                loading={resolving}
                disabled={resolving || !open}
            >
                <Icon src={resolved ? ArrowUturnLeft : Check} mini size="16" slot="icon" />
                {resolved ? "Unresolve" : "Resolve"}
            </Button>

            <!--- Open Close Button (also populates sidebar) --->
            <Button color="primary" size="sm" class="!w-[75px] h-8" icon={open ? Folder : FolderOpen}
                on:click={ async ()=>{
                    let element = document.getElementById(isCommentReport(item) ? item.comment_report.id : item.post_report.id);
                    let reports = document.getElementsByName('ModeratorReport');
                    open=!open; 
                    

                    if (open) {                        
                        // Hide all closed reports if one is open.
                        reports.forEach((report) => {
                            if (report != element) {
                                report.style.display='none';
                            }
                        })

                        scrollToTop(element);

                        modlog.person_id = isCommentReport(item) ? item.comment.creator_id : item.post.creator_id
                        modlog.community_id = item.community.id
                        
                        if (modlog.person_id) {
                            modlog.url.searchParams.set('other_person_id', modlog.person_id.toString());
                            modlog.url.searchParams.set('type', modlog.type);
                            modlog.loading = true;
                            modlog.show=open
                            modlog.data = await loadModlog({url: modlog.url});
                            modlog.loading= false;
                        }
                    }
                    else {
                        // Hide all closed reports if one is open.
                        reports.forEach((report) => {
                            report.style.display='flex';
                        })
                        scrollToTop(element);
                        modlog.show = open;
                    }
                    
                }} 
                
            >
                <span class="hidden lg:block">{open ? 'Close' : 'Open'}</span>
            </Button>
        </span>


    </span>
    
    <!--Header Row with from, to, sent, badges, and open/close button-->
    <span class="flex flex-col lg:flex-row w-full gap-2 justify-between">
        
        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/4">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Report from 
            </span>
            <UserLink user={item.creator} />
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/4">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Report to
            </span>
            <CommunityLink community={item.community} />
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/4">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Sent
            </span>
            <RelativeDate date={isCommentReport(item) ? item.comment_report.published : item.post_report.published} />
        </span>

        
        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/4">
            {#if item.resolver?.id}        
                <span class="font-bold dark:text-zinc-400 text-slate-600">
                    Resolved by
                </span>
                <UserLink user={item.resolver} />
            {/if}
        </span>
    </span>

    <div class="flex flex-row gap-4 w-full overflow-hidden {open ? 'border-t' : ''}" class:hidden={!open}>
        
        
        <!--- Left side / Report Form--->
        <div class="flex flex-col gap-2 w-full p-2 overflow-y-scroll" >
            <!--- Reported Post Preview and Report Details Row--->                
            <div class="flex flex-col gap-4 xl:flex-row w-full">
                <!--- Preview of content being reported--->
                <details open class="flex flex-col gap-2 w-full xl:w-1/2">
                    <summary class="text-base font-bold dark:text-zinc-400 text-slate-600 mb-4 cursor-pointer">
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
                            disablePostLinks={false}
                            actions={false}
                            collapseBadges={true}
                        />
                    {/if}

                </details>
            
                <details open class="flex flex-col gap-2  w-full xl:w-1/2">
                    <summary class="text-base font-bold dark:text-zinc-400 text-slate-600 mb-4 cursor-pointer">
                        Report Details
                    </summary>
                    
                    <p class="text-sm font-normal">{isCommentReport(item) ? item.comment_report.reason : isPostReport(item) ? item.post_report.reason : 'No reason provided'}</p>
                </details>
            </div>

            <!--- Moderation Actions Form--->
            <div class="flex flex-col gap-2 w-full" class:hidden={resolved}>
                
                <span class="mt-4 text-base font-bold dark:text-zinc-400 text-slate-600">
                    Actions to Take
                </span>

                {#if $profile?.user && (amMod($profile.user, item.community) || isAdmin($profile.user))}
                    <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                        <!---Lock Post--->
                        <div class="flex flex-row w-full gap-2 py-2" class:hidden={!isPostReport(item) || (isPostReport(item) && item.post.locked)}>
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={LockClosed} mini width={16}/>
                                    Lock Post
                                </p>
                                <p class="text-xs font-normal">Lock the post to prevent any further comments.</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={actions.lock} />
                        </div>
                        
                        <!---Remove Post/Comment--->
                        <div class="flex flex-row w-full gap-2 py-2" class:hidden={ (isCommentReport(item) && item.comment?.removed) || (isPostReport(item) && item.post?.removed) }>
                            <div class="flex flex-col w-full">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Trash} mini width={16}/>
                                    Remove  {isCommentReport(item) ? 'Comment' : isPostReport(item) ? 'Post' : 'Content'}
                                </p>
                                <p class="text-xs font-normal">Removes the offending {isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'}</p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={actions.remove} />
                        </div>

                        <!--- Remove Post:  Reason for Post/Comment Removal --->
                        <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.remove} >
                            <div class="flex flex-col w-full">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Clipboard} mini width={16}/>
                                    Removal Reason
                                </p>
                                <p class="text-xs font-normal">The reason for removing this content. It will appear in the modlog.</p>
                                
                                <div class="mt-2"/>
                                
                                <div class="flex flex-row gap-1 items-start">
                                    <MultiSelect 
                                        options={removalPresets.options}
                                        optionNames={removalPresets.names}
                                        selected=""
                                        on:select={(e) => {
                                            switch (e.detail) {
                                                case "REPORTTEXT":
                                                    actions.removeReason = (isCommentReport(item) ? item.comment_report.reason : isPostReport(item) ? item.post_report.reason : 'No reason provided')
                                                    break;
                                                default:
                                                    actions.removeReason = e.detail
                                            }
                                        }}
                                        headless={true}
                                        class="!min-w-[185px]"
                                        items={0}
                                        label="Removal Reason Presets"
                                    />
                                    <TextArea class="w-full" bind:value={actions.removeReason} type="text" rows={3} placeholder="Removal reason"/>
                                </div>
                            </div>
                        </div>


                        <!--- Remove Post: Reply to Author --->
                        <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.remove} >
                            <div class="flex flex-col w-full">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={ChatBubbleLeftEllipsis} mini width={16}/>
                                    Reply to Author
                                </p>
                                <p class="text-xs font-normal">
                                    Send the {isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'} author a DM informing them that 
                                    their content has been removed. The reason given above will be included in that message.
                                </p>                        
                            </div>
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={actions.removeReplyToAuthor} />
                        </div>




                        <!---CommunityBan--->
                        <div class="flex flex-row w-full gap-2 py-2" class:hidden={item.creator_banned_from_community}>
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={UserGroup} mini width={16}/>
                                    Ban From Community
                                </p>
                                <p class="text-xs font-normal">
                                    Ban the author of the reported content from the community. Enter an expiration date for the ban or leave it empty to effect a permanent ban.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={actions.banCommunity} />
                        </div>

                        <!--- Community Ban: Delete Data in Community --->
                        <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.banCommunity} >
                            <div class="flex flex-col w-full">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Trash} mini width={16}/>
                                    Remove Posts/Comments
                                </p>
                                <p class="text-xs font-normal">Remove all post and comments in this community made by this user.</p>                        
                            </div>
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={actions.banCommunityDeleteData} />
                        </div>

                        <!---Community Ban: Reason for Community Ban --->
                        <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.banCommunity} >
                            <div class="flex flex-col w-full">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Clipboard} mini width={16}/>
                                    Reason for Community Ban
                                </p>
                                <p class="text-xs font-normal">The given reason meriting the ban from this community.</p>
                                
                                <div class="mt-2"/>
                                <TextInput bind:value={actions.banCommunityReason} type="text" placeholder="Ban reason"/>
                            </div>
                        </div>

                        <!--- Commuunity Ban: Duration of Community Ban --->
                        <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.banCommunity} >
                            <div class="flex flex-col w-full">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Clock} mini width={16}/>
                                    Community Ban Duration
                                </p>
                                <p class="text-xs font-normal">The expiration date of the ban. Leave blank to effect a permanent community ban.</p>                        
                            </div>

                            <div class="mx-auto"/>

                            <DateInput bind:value={actions.banCommunityExpires} class="w-[175px]"/>
                        </div>




                        <!--- Admin-Only Options--->
                        {#if $profile?.user && isAdmin($profile.user)}
                        
                            <!---Instance Ban --->
                            <div class="flex flex-row w-full gap-2 py-2" class:hidden={ (isPostReport(item) && item.post_creator.banned) || (isCommentReport(item) && item.comment_creator.banned)}>
                                <div class="flex flex-col">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={NoSymbol} mini width={16}/>
                                        Ban From Instance
                                    </p>
                                    <p class="text-xs font-normal">
                                        Ban the author of the reported content from this instance. Enter an expiration date for the ban or leave it empty to effect a permanent ban.
                                    </p>
                                </div>
                                
                                <div class="mx-auto"/>
                                
                                <Switch bind:enabled={actions.banInstance} />
                            </div>

                            <!--- Instance Ban: Delete Data Known to Instance --->
                            <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.banInstance} >
                                <div class="flex flex-col w-full">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={Trash} mini width={16}/>
                                        Remove Posts/Comments
                                    </p>
                                    <p class="text-xs font-normal">Remove all post and comments on this instance made by this user.</p>                        
                                </div>
                                <div class="mx-auto"/>
                                
                                <Switch bind:enabled={actions.banInstanceDeleteData} />
                            </div>

                            <!---Instance Ban: Reason for Instance Ban --->
                            <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.banInstance} >
                                <div class="flex flex-col w-full">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={Clipboard} mini width={16}/>
                                        Reason for Instance Ban
                                    </p>
                                    <p class="text-xs font-normal">The given reason meriting the ban from this instance.</p>
                                    
                                    <div class="mt-2"/>
                                    <TextInput bind:value={actions.banInstanceReason} type="text" placeholder="Ban reason"/>
                                </div>
                            </div>

                            <!--- Instance Ban: Duration of Instance Ban --->
                            <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.banInstance} >
                                <div class="flex flex-col w-full">
                                    <p class="text-sm font-bold flex flex-row gap-2">
                                        <Icon src={Clock} mini width={16}/>
                                        Instance Ban Duration
                                    </p>
                                    <p class="text-xs font-normal">The expiration date of the ban. Leave blank to effect a permanent instance ban.</p>                        
                                </div>

                                <div class="mx-auto"/>

                                <DateInput bind:value={actions.banInstanceExpires} class="w-[175px]"/>
                            </div>
                        {/if}



                        <!---Reporter Reply--->
                        <div class="flex flex-row w-full gap-2 py-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={ChatBubbleLeftEllipsis} mini width={16}/>
                                    Reply to Reporter
                                </p>
                                <p class="text-xs font-normal">
                                    Send the reporter a DM letting them know their report was seen and resolved.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={actions.replyReporter} />
                        </div>

                        <!--- Reporter Reply: Include mod actions taken in reply --->
                        <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.replyReporter} >
                            <div class="flex flex-col w-full">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={ClipboardDocumentList} mini width={16}/>
                                    Include Actions Taken
                                </p>
                                <p class="text-xs font-normal">Include a list of actions taken in the process of resolving their report.</p>                        
                            </div>
                            <div class="mx-auto"/>
                            
                            <Switch bind:enabled={actions.replyReporterIncludeActions} />
                        </div>

                        <!---Reporter Reply: Mod Comments --->
                        <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.replyReporter} >
                            <div class="flex flex-col w-full">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Clipboard} mini width={16}/>
                                    Additional Comments
                                </p>
                                <p class="text-xs font-normal">Include a "moderator comment" in the reply to the reporter.</p>
                                
                                <div class="mt-2"/>
                                <TextInput bind:value={actions.replyReporterText} type="text" placeholder="Additional comments to include in reply"/>
                            </div>
                        </div>

                        <!---Reporter Reply: Preview --->
                        <div class="flex flex-row w-full gap-2 py-2 !border-t-0" class:hidden={!actions.replyReporter} >
                            <div class="flex flex-col w-full">
                                <p class="text-sm font-bold flex flex-row gap-2">
                                    <Icon src={Clipboard} mini width={16}/>
                                    Reply Preview
                                </p>
                                <p class="text-xs font-normal">
                                    A preview of the generated reply that will be sent to the reporter. After you've made your mod action selections, 
                                    you can edit the response manually before sending, if needed.
                                </p>
                                
                                <MarkdownEditor value={actions.replyReporterBody} previewButton={true} previewing={true} rows={10} images={false}/>
                                
                            </div>
                        </div>
                        
                    </div>
                {/if}
                

            </div>

        </div>

        <!--- Right pane / Modlog --->
        <div class="hidden w-1/2 p-2 overflow-y-scroll" class:md:block={modlog.show}>
            {#if modlog.loading}
                <span class="flex flex-row items-center">    
                    <Spinner width={64}/>
                </span>
            {:else}
                <h1 class="text-lg font-bold">Modlog</h1>
                <pre>{JSON.stringify(modlog.data, null, 2)}</pre>
            {/if}
        </div>
    </div>
</Card>

