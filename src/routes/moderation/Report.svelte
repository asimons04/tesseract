<script lang="ts">
    import type {
        CommentReportView,
        CommentView,
        GetPersonDetailsResponse,
        PersonView,
        PostReportView,
        PostView,
        PrivateMessageReportView,
    } from 'lemmy-js-client'
    
    import { afterNavigate, beforeNavigate } from '$app/navigation'
    import { amMod, isAdmin, remove, report } from '$lib/components/lemmy/moderation/moderation.js'
    import { fade, fly, slide } from 'svelte/transition'
    import { getClient } from '$lib/lemmy.js'
    import { getRemovalTemplates } from './templates'
    import { 
        getItemPublished, 
        isCommentReport, 
        isPrivateMessageReport,
        isPostReport, 
        isCommentView 
    } from '$lib/lemmy/item.js'
    
    import { profile } from '$lib/auth.js'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    // Modlog Loader
    import {
        type Modlog,
        load as loadModlog
    
    } from '$routes/modlog/+page'
    import ModlogItemList from '$routes/modlog/item/ModlogItemList.svelte'

    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import CommunityCardBasic from './components/CommunityCardBasic.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import DateInput from '$lib/components/input/DateInput.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import Switch from '$lib/components/input/Switch.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import UserCardBasic from './components/UserCardBasic.svelte'
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
        Funnel,
        LockClosed,
        LockOpen,
        Microphone,
        Newspaper,
        NoSymbol,
        PencilSquare,
        Trash,
        User,
        UserGroup,
        Window
    } from 'svelte-hero-icons'
    

    export let item: PostReportView | CommentReportView | PrivateMessageReportView
    
    beforeNavigate(() => {
        if (open) toggleOpenReport();

    });

    $: resolved = isCommentReport(item)
        ? item.comment_report.resolved
        : isPostReport(item)
            ? item.post_report.resolved
            : false

    $: reporteeID = isCommentReport(item) ? item.comment.creator_id : item.post.creator_id;
    $: itemType =
        isCommentReport(item)
            ? 'comment'
            : isPostReport(item)
                ? 'post'
                : isPrivateMessageReport(item)
                    ? 'private_message'
                    : undefined
    

    let resolving:boolean = false
    let open:boolean = false;
    let debug:boolean = false;
    let sidePanel: 'posts' | 'comments' | 'profile' | 'community' | 'modlog' | 'closed' = 'profile'
    
    interface ModlogContainer {
        url: URL,
        loading:boolean,
        data?:Modlog,
        communityOnly:boolean
    }

    let modlog:ModlogContainer = {
        url: new URL(window.location.href),
        loading: false,
        data: undefined,
        communityOnly: false,
    }

    interface PersonProfile {
        posts?: PostView[],
        comments?: CommentView[],
        loading:boolean,
        person_view?: PersonView,
    }

    let creatorProfile:PersonProfile = {
        loading: false,
    };

    // Load Moderation presets from the template module
    let removalPresets = getRemovalTemplates(item);




    // Object containing the actions to perform
    let actions = {
        // Positive Actions
        unlock: false,
        
        restore: false,
        restoreReason: '',
        restoreReplyToAuthor: '',

        unbanCommunity: false,
        unbanCommunityReason: '',
        unbanCommunityNotify: false,
        unbanInstance: false,
        unbanInstanceReason: '',

        // Negative Actions
        lock: false,

        remove: false,
        removeReason: '',
        removeReplyToAuthor: false,
        
        banCommunity: false,
        banCommunityReason: '',
        banCommunityDeleteData: false,
        banCommunityExpires: '',
        banCommunityNotify: false,
        
        banInstance: false,
        banInstanceReason: '',
        banInstanceDeleteData: false,
        banInstanceExpires: '',

        replyReporter: false,
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
            if (actions.lock || actions.remove || actions.banCommunity || actions.banInstance || actions.unlock || actions.restore || actions.unbanCommunity || actions.unbanInstance) {
                actions.replyReporterBody += "Actions taken in response to this report:\n";

                if (actions.lock)           actions.replyReporterBody += "- Reported post has been locked\n";
                if (actions.unlock)         actions.replyReporterBody += "- Reported post has been unlocked\n";

                if (actions.remove)         actions.replyReporterBody += `- Reported ${isCommentReport(item) ? 'comment' : 'post'} has been removed\n`;
                if (actions.restore)         actions.replyReporterBody += `- Reported ${isCommentReport(item) ? 'comment' : 'post'} has been restored\n`;
                
                if (actions.banCommunity)   actions.replyReporterBody += `- User was ${actions.banCommunityExpires ? 'temporarily' : 'permanently'} banned from this community\n`
                if (actions.unbanCommunity)   actions.replyReporterBody += `- The ${actions.banCommunityExpires ? 'temporary' : 'permanent'} community ban was lifted\n`
                
                if (actions.banInstance)    actions.replyReporterBody += `- User was ${actions.banInstanceExpires ? 'temporarily' : 'permanently'} banned from this instance\n`
                if (actions.unbanInstance)    actions.replyReporterBody += `- The ${actions.banInstanceExpires ? 'temporary' : 'permanent'} instance ban was lifted\n`

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

    // Validates a date string to ensure it converts to a proper date in the future.
    function validateExpiryDate(dateStr:string):boolean {
        let date:number = Date.parse(dateStr);
        
        if (Number.isNaN(date)) {
            toast({
                content: 'Invalid date. It must be an absolute date.',
                type: 'error',
            });
            return false;
        }
        
        // Removing past date check since I took out the timezone shims for 0.19 and this breaks for short duration bans. Will re-enable when released for 0.19 with proper date strings.
        // For what it's worth, the API doesn't care if the date is in the past.  It just won't be effective.
        /*
        if (date < Date.now()) {
            toast({
                content: 'Invalid date. It is before the current time.',
                type: 'error',
            });
            return false;
        }
        */

        return true;
    }

    // Expands a report item, hides the rest. Send `false` as argument to close and un-hide.
    function toggleOpenReport():void {
        let element = document.getElementById(isCommentReport(item) ? item.comment_report.id : item.post_report.id);
        let reports = document.getElementsByName('ModeratorReport'); 
        
        open=!open;

        if (open) {
            // Don't await
            getUserPostsComments(reporteeID);
            
            // Hide all closed reports if one is open.
            reports.forEach((report) => {
                if (report != element) {
                    report.style.display='none';
                }
            })

            creatorProfile.loading = true;
            
            if (resolved) {
                getModlog();
                sidePanel= 'modlog';
            }
            else {
                sidePanel = 'profile';
            }
        }
        else {
            // Show all reports
            reports.forEach((report) => {
                report.style.display='flex';
            })

            // Empty modlog data and creator content
            modlog.data = undefined;
            
            creatorProfile.posts = undefined;
            creatorProfile.comments = undefined;
            creatorProfile.person_view = undefined;
            
            // Hide the modlog and profile sidebar
            sidePanel = 'closed'
        }
        
        scrollToTop(element);

    }

    // Populates the ModLog panel for the user being reported on.
    async function getModlog(communityID:number|undefined=undefined):Promise<void> {
        if (communityID) {
            modlog.url.searchParams.set('community', communityID.toString());
        }
        else {
            modlog.url.searchParams.delete('community');
        }

        
        modlog.url.searchParams.set('other_person_id', isCommentReport(item) ? item.comment.creator_id.toString() : item.post.creator_id.toString() )
        modlog.url.searchParams.set('type', 'All');

        modlog.loading = true;
        modlog.data = await loadModlog({url: modlog.url});
        modlog.loading= false;
        
    }

    // Fetch the user details by person ID
    async function getUserPostsComments(personID:number):Promise<void> {
        if (!personID || !$profile?.jwt) return;

        try {
            creatorProfile.loading = true;

            const user = await getClient(undefined, fetch).getPersonDetails({
                limit: 50,
                page: 1,
                person_id: personID,
                sort: 'New',
                auth: $profile?.jwt,
            })
            const posts = [...user.posts]
            const comments = [...user.comments]
            
            posts.sort((a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)))
            comments.sort((a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)))
            
            creatorProfile.posts = posts;
            creatorProfile.comments = comments;
            creatorProfile.person_view = user.person_view;
            
            creatorProfile.loading = false;
            creatorProfile.show = true;
        }
        catch (err){
            console.log(err);
        }

    }

    async function resolve() {
        if (!$profile?.jwt || !$profile.user ||!item ) return
        
        // Validate the ban expiry dates and pop up a toast warning before returning early.
        if (actions.banCommunityExpires != '' && !validateExpiryDate(actions.banCommunityExpires)) return;
        if (actions.banInstanceExpires  != '' && !validateExpiryDate(actions.banInstanceExpires)) return;

        resolving = true

        try {
            
            if (!resolved) {
                // Lock post if "lock" option selected.
                if ( actions.lock && isPostReport(item)) {
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

                // Unlock post if "unlock" option selected.
                if ( actions.unlock && isPostReport(item)) {
                    try {
                        await getClient().lockPost({
                            auth: $profile.jwt,
                            locked: false,
                            post_id: item.post.id,
                        })

                        item.post.locked = false

                    } catch (err) {
                        console.log(err)
                        toast({
                            content: "Failed to unlock post",
                            type: 'error',
                        })
                    }
                }

                // Remove post if "remove" option selected
                if (actions.remove && isPostReport(item)) {
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

                // Restore post if "restore" option selected
                if (actions.restore && isPostReport(item)) {
                    try {
                        await getClient().removePost({
                            auth: $profile.jwt,
                            post_id: item.post.id,
                            removed: false,
                            reason: actions.restoreReason || undefined,
                        })

                        item.post.removed = false
                    }
                    catch (err) {
                        console.log(err)
                        toast({
                            content: "Failed to restore post.",
                            type: 'error',
                        })
                    }

                }


                // Remove comment if "remove" option selected
                if (actions.remove && isCommentReport(item)) {
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

                // Restore comment if "restore" option selected
                if (actions.restore && isCommentReport(item)) {
                    try {
                        await getClient().removeComment({
                            auth: $profile.jwt,
                            comment_id: item.comment.id,
                            removed: false,
                            reason: actions.restoreReason || undefined,
                        })
                        item.comment.removed = false
                    }
                    catch (err) {
                        console.log(err)
                        toast({
                            content: "Failed to restore comment.",
                            type: 'error',
                        })
                    }

                }


            
                // Ban user from community if that is selected
                if (actions.banCommunity) {
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
                        item.creator_banned_from_community = true;
                    }
                    catch (err) {
                        console.log(err)
                    }

                }

                // Unban user from community if that is selected
                if (actions.unbanCommunity) {
                    try {

                        await getClient().banFromCommunity({
                            auth: $profile.jwt,
                            ban: false,
                            reason: actions.unbanCommunityReason || undefined,
                            community_id: item.post.community_id,
                            person_id: isCommentReport(item) ? item.comment.creator_id : isPostReport(item) ? item.post.creator_id : undefined,
                        })

                        item.creator_banned_from_community = false;
                    }
                    catch (err) {
                        console.log(err)
                    }

                }

                // Ban user from instance if selected
                if (actions.banInstance) {
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

                        isCommentReport(item)
                            ? item.comment_creator.banned = true
                            : item.post_creator.banned = true
                    }
                    catch (err) {
                        console.log(err)
                    }
                }

                // Unban user from instance if selected
                if (actions.unbanInstance) {
                    try {
                        await getClient().banPerson({
                            auth: $profile.jwt,
                            ban: false,
                            person_id: isCommentReport(item) ? item.comment.creator_id : isPostReport(item) ? item.post.creator_id : undefined,
                            reason: actions.unbanInstanceReason || undefined,
                        })
                        
                        isCommentReport(item)
                            ? item.comment_creator.banned = false
                            : item.post_creator.banned = false
                    }
                    catch (err) {
                        console.log(err)
                    }
                }


                //// Follow-Up Messages:  If selected, sends follow-up DMs to the post/comment author and/or reporter
                
                // Community Ban/Unban Notify to author
                if ( (actions.banCommunity && actions.banCommunityNotify) || (actions.unbanCommunity && actions.unbanCommunityNotify) ) {
                    let template:string = '';
                    let duration:string = '';

                    if (actions.banCommunity) {
                        actions.banCommunityExpires
                            ? duration = `until ${actions.banCommunityExpires}`
                            : duration = 'permanently'

                        template += `You have been banned from ${item.community.name}@${new URL(item.community.actor_id).host} ${duration}.\n\n`
                        template += `**Reason**: ${actions.banCommunityReason || '{None provided}'}\n`
                    }

                    if (actions.unbanCommunity) {
                        template = `Your ban from  ${item.community.name}@${new URL(item.community.actor_id).host} has been lifted.`
                    }

                    try {
                        await getClient().createPrivateMessage({
                            auth: $profile.jwt,
                            content: template,
                            recipient_id: isCommentReport(item) ? item.comment.creator_id : isPostReport(item) ? item.post.creator_id : undefined,
                        })
                    }
                    catch (err) {
                        console.log(err);
                        toast({
                            content: 'Failed to message post/comment author.',
                            type: 'warning',
                        })
                    }
                }



                // Post/Comment Removal DM to Author
                if ( (actions.remove && actions.removeReplyToAuthor) || (actions.restore && actions.restoreReplyToAuthor) ) {
                    
                    let template:string = '';
                    let reason:string = '';

                    if (actions.remove)     reason = actions.removeReason;
                    if (actions.restore)    reason = actions.restoreReason;

                    
                    template = `Your ${isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'} in 
                        !${item.community.name}@${new URL(item.community.actor_id).host} has been ${actions.restore ? 'restored' : 'removed'}:\n\n`
                    
                    
                    template += `- **Post**: [${item.post.name}](${item.post.ap_id})\n`
                    
                    if (isCommentReport(item)) {
                        template += `- **Comment**: [${item.comment.content}](${item.comment.ap_id})\n`    
                    }
                    if (reason != '') {
                        template += `- **Reason**: ${reason}\n`
                    }

                    template += '\n';

                    try {
                        await getClient().createPrivateMessage({
                            auth: $profile.jwt,
                            content: template,
                            recipient_id: isCommentReport(item) ? item.comment.creator_id : isPostReport(item) ? item.post.creator_id : undefined,
                        })
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
                if (actions.replyReporter) {
                    try {
                        await getClient().createPrivateMessage({
                            auth: $profile.jwt,
                            content: actions.replyReporterBody,
                            recipient_id: item.creator.id
                        })
                    }
                    catch (err) {
                        console.log(err);
                        toast({
                            content: 'Failed to message user.',
                            type: 'warning',
                        })
                    }
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
        actions = {...actionsDefault};
        
        // If un-resolving the report, keep it open
        if (resolved) toggleOpenReport();
    }

    
</script>




<Card class="p-4 flex flex-col gap-1.5 w-full !bg-slate-100 dark:!bg-black lg:max-h-[87vh]" name="ModeratorReport" id="{isCommentReport(item) ? item.comment_report.id : item.post_report.id}">
    
    
    <!---Report Title, Badge and Open/Close Button Row--->
    <span class="flex flex-col lg:flex-row w-full gap-4">
        
        
        <!--- Report Title and Button Bar--->
        <span class="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">
            {isCommentReport(item) ? 'Comment Report' : isPostReport(item) ? `Post Report: ${item.post.name.length > 120 ? item.post.name.slice(0,120) + '...' : item.post.name}` : 'Post Report'}
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
                hidden={!open}
            >
                <Icon src={resolved ? ArrowUturnLeft : Check} mini size="16" slot="icon" />
                {resolved ? "Unresolve" : "Resolve"}
            </Button>

            <!--- Open Close Button (also populates sidebar) --->
            <Button color="primary" size="sm" class="!w-[75px] h-8" icon={open ? Folder : FolderOpen}
                on:click={toggleOpenReport} 
            >
                <span class="hidden lg:block">{open ? 'Close' : 'Open'}</span>
            </Button>
        </span>


    </span>
    
    <!--Header Row with from, to, sent, resolver-->
    <span class="flex flex-col lg:flex-row w-full mx-4 gap-2 justify-between">
        
        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Report from 
            </span>
            <UserLink user={item.creator} />
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Report to
            </span>
            <CommunityLink community={item.community} />
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Report against 
            </span>
            <UserLink user={isCommentReport(item) ? item.comment_creator : item.post_creator} />
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
            {#if item.resolver?.id}        
                <span class="font-bold dark:text-zinc-400 text-slate-600">
                    Resolved by
                </span>
                <UserLink user={item.resolver} />
            {/if}
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Sent
            </span>
            <RelativeDate date={isCommentReport(item) ? item.comment_report.published : item.post_report.published} />
        </span>
        
    </span>

    <!---Collapsible Portion--->
    {#if open}
        
        <!-- Side panel Menu Bar--->
        <div class="hidden lg:flex flex-col gap-1">
            <div class="flex flex-row w-full gap-2 py-1 bg-slate-200 dark:bg-zinc-800 rounded-md">
                <span class="ml-4 flex text-xs font-bold items-center">
                    Lookup Tools:
                </span>

                <Button color="tertiary" size="sm" title="User's Profile" class="{sidePanel=='profile' ? 'font-bold' : ''}"
                    on:click={async() => {
                        sidePanel == 'profile'
                            ? sidePanel='closed'
                            : sidePanel = 'profile'

                        if (!creatorProfile.person_view) {
                            creatorProfile.loading = true;
                            await getUserPostsComments(reporteeID);
                        }
                    }}
                >
                    <Icon src={User} mini width={16}/>
                    User Profile
                </Button>

                <Button color="tertiary" size="sm" title="Community" class="{sidePanel=='community' ? 'font-bold' : ''}"
                    on:click={async() => {
                        sidePanel == 'community'
                            ? sidePanel='closed'
                            : sidePanel='community'
                    }}
                >
                    <Icon src={UserGroup} mini width={16}/>
                    Community
                </Button>

                <Button color="tertiary" size="sm" title="Posts" class="{sidePanel=='posts' ? 'font-bold' : ''}"
                    on:click={async() => {
                        sidePanel == 'posts'
                            ? sidePanel='closed'
                            : sidePanel='posts'

                        if (!creatorProfile.posts) {
                            creatorProfile.loading = true;
                            await getUserPostsComments(reporteeID);
                        }
                    }}
                >
                    <Icon src={Window} mini width={16}/>
                    Posts
                </Button>

                <Button color="tertiary" size="sm" title="Comments" class="{sidePanel=='comments' ? 'font-bold' : ''}"
                    on:click={async() => {
                        sidePanel == 'comments'
                            ? sidePanel = 'closed'
                            : sidePanel='comments'
                        
                        if (!creatorProfile.comments) {
                            creatorProfile.loading = true; 
                            await getUserPostsComments(reporteeID);
                        }
                    }}
                >
                    <Icon src={ChatBubbleLeftEllipsis} mini width={16}/>
                    Comments
                </Button>

                <Button color="tertiary" size="sm" title="Modlog" class="{sidePanel=='modlog' ? 'font-bold' : ''}"
                    on:click={async() => {
                        sidePanel == 'modlog'
                            ? sidePanel = 'closed'
                            : sidePanel = 'modlog'

                        if (sidePanel == 'modlog') await getModlog();
                        
                    }}
                >
                    <Icon src={Newspaper} mini width={16}/>
                    Modlog History
                </Button>
            </div>
        </div>

        <!--- Main Content Area--->
        <div class="flex flex-row gap-4 w-full overflow-hidden" transition:fly={{ duration: 300, y: -60, opacity: 0 }}>
            
            <!--- Left side / Report Form--->
            <div class="flex flex-col gap-2 w-full {sidePanel != 'closed' ? 'lg:w-2/3' : ''} p-2 overflow-y-scroll" >

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
                                collapseBadges={true}
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
                <div class="flex flex-col gap-2 pr-2 w-full" class:hidden={resolved}>
                    
                    <span class="mt-4 text-base font-bold dark:text-zinc-400 text-slate-600">
                        Available Actions
                    </span>

                    {#if $profile?.user && (amMod($profile.user, item.community) || isAdmin($profile.user))}
                        <div class="flex flex-col divide-y border-slate-400/75 dark:border-zinc-400/75 gap-4 w-full">
                            
                            <!---Lock Post--->
                            {#if isPostReport(item) && !item.post.locked}
                                <div class="flex flex-row w-full gap-2 py-2">
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
                            {/if}

                            <!---Unlock Post--->
                            {#if isPostReport(item) && item.post.locked}
                                <div class="flex flex-row w-full gap-2 py-2">
                                    <div class="flex flex-col">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={LockOpen} mini width={16}/>
                                            Unlock Post
                                        </p>
                                        <p class="text-xs font-normal">Unlock a post so that it may receive votes and comments.</p>
                                    </div>
                                    
                                    <div class="mx-auto"/>
                                    
                                    <Switch bind:enabled={actions.unlock} />
                                </div>
                            {/if}
                            
                            <!---Remove Post/Comment--->
                            {#if (isCommentReport(item) && !item.comment.removed) || (isPostReport(item) && !item.post.removed)}
                                <div class="flex flex-row w-full gap-2 py-2" >
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
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.remove} >
                                    <div class="flex flex-col w-full">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={Clipboard} mini width={16}/>
                                            Removal Reason
                                        </p>
                                        <p class="text-xs font-normal">The reason for removing this content. It will appear in the modlog.</p>
                                        
                                        <div class="mt-2"/>
                                        
                                        <div class="flex flex-col md:flex-row gap-1 items-start">
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
                                            <TextArea class="w-full" bind:value={actions.removeReason} type="text" rows={4} placeholder="Removal reason"/>
                                        </div>
                                    </div>
                                </div>


                                <!--- Remove Post: Reply to Author --->
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.remove} >
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
                            {/if}

                            
                            <!---Restore Post/Comment--->
                            {#if (isCommentReport(item) && item.comment.removed) || (isPostReport(item) && item.post.removed)}
                                <div class="flex flex-row w-full gap-2 py-2" >
                                    <div class="flex flex-col w-full">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={Trash} mini width={16}/>
                                            Restore  {isCommentReport(item) ? 'Comment' : isPostReport(item) ? 'Post' : 'Content'}
                                        </p>
                                        <p class="text-xs font-normal">Restores the {isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'} to the community.</p>
                                    </div>
                                    
                                    <div class="mx-auto"/>
                                    
                                    <Switch bind:enabled={actions.restore} />
                                </div>

                                <!--- Restore Post:  Reason for Post/Comment Restoration --->
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.restore} >
                                    <div class="flex flex-col w-full">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={Clipboard} mini width={16}/>
                                            Restore Reason
                                        </p>
                                        <p class="text-xs font-normal">The reason for restoring this content. It will appear in the modlog.</p>
                                        
                                        <div class="mt-2"/>
                                        
                                        <TextArea class="w-full" bind:value={actions.restoreReason} type="text" rows={4} placeholder="Restore reason"/>
                                        
                                    </div>
                                </div>


                                <!--- Restore Post: Reply to Author --->
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.restore} >
                                    <div class="flex flex-col w-full">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={ChatBubbleLeftEllipsis} mini width={16}/>
                                            Reply to Author
                                        </p>
                                        <p class="text-xs font-normal">
                                            Send the {isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'} author a DM informing them that 
                                            their content has been restored. The reason given above will be included in that message.
                                        </p>                        
                                    </div>
                                    <div class="mx-auto"/>
                                    
                                    <Switch bind:enabled={actions.restoreReplyToAuthor} />
                                </div>
                            {/if}




                            <!---Community Ban--->
                            {#if !item.creator_banned_from_community}
                                <div class="flex flex-row w-full gap-2 py-2">
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
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.banCommunity} >
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
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.banCommunity} >
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
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.banCommunity} >
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

                                <!--- Community Ban: Notify User --->
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.banCommunity} >
                                    <div class="flex flex-col w-full">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={Trash} mini width={16}/>
                                            Send Ban Notification
                                        </p>
                                        <p class="text-xs font-normal">
                                            Send a message to the user letting them know they have been banned, why, and for how long. The ban reason will be included in that message.
                                        </p>                        
                                    </div>
                                    <div class="mx-auto"/>
                                    
                                    <Switch bind:enabled={actions.banCommunityNotify} />
                                </div>
                            {/if}


                            <!---Community Unban--->
                            {#if item.creator_banned_from_community}
                                <div class="flex flex-row w-full gap-2 py-2">
                                    <div class="flex flex-col">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={UserGroup} mini width={16}/>
                                            Unban From Community
                                        </p>
                                        <p class="text-xs font-normal">
                                            Lift the community ban applied to the author of the reported content.
                                        </p>
                                    </div>
                                    
                                    <div class="mx-auto"/>
                                    
                                    <Switch bind:enabled={actions.unbanCommunity} />
                                </div>

                                <!---Community Unban: Reason for Community Ban --->
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.unbanCommunity} >
                                    <div class="flex flex-col w-full">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={Clipboard} mini width={16}/>
                                            Reason for Community Unban
                                        </p>
                                        <p class="text-xs font-normal">The given reason meriting the lifting of the community ban.</p>
                                        
                                        <div class="mt-2"/>
                                        <TextInput bind:value={actions.unbanCommunityReason} type="text" placeholder="Unban reason"/>
                                    </div>
                                </div>

                                <!--- Community Unban: Notify User --->
                                <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.unbanCommunity} >
                                    <div class="flex flex-col w-full">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={Trash} mini width={16}/>
                                            Send Unban Notification
                                        </p>
                                        <p class="text-xs font-normal">Send a message to the user letting them know their ban has been lifted. The ban reason will be included in that message.</p>
                                    </div>
                                    <div class="mx-auto"/>
                                    
                                    <Switch bind:enabled={actions.unbanCommunityNotify} />
                                </div>
                            {/if}




                            <!--- Admin-Only Options--->
                            {#if $profile?.user && isAdmin($profile.user)}
                            
                                <!---Instance Ban --->
                                {#if (isPostReport(item) && !item.post_creator.banned) || (isCommentReport(item) && !item.comment_creator.banned) }
                                    <div class="flex flex-row w-full gap-2 py-2" >
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
                                    <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.banInstance} >
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
                                    <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.banInstance} >
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
                                    <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.banInstance} >
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

                                
                                <!---Instance Unban --->
                                {#if (isPostReport(item) && item.post_creator.banned) || (isCommentReport(item) && item.comment_creator.banned) }
                                    <div class="flex flex-row w-full gap-2 py-2" >
                                        <div class="flex flex-col">
                                            <p class="text-sm font-bold flex flex-row gap-2">
                                                <Icon src={Check} mini width={16}/>
                                                Unban From Instance
                                            </p>
                                            <p class="text-xs font-normal">
                                                Lift the instance ban for the author of the reported content.
                                            </p>
                                        </div>
                                        
                                        <div class="mx-auto"/>
                                        
                                        <Switch bind:enabled={actions.unbanInstance} />
                                    </div>


                                    <!---Instance Unban: Reason for Instance Unban --->
                                    <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.unbanInstance} >
                                        <div class="flex flex-col w-full">
                                            <p class="text-sm font-bold flex flex-row gap-2">
                                                <Icon src={Clipboard} mini width={16}/>
                                                Reason for Instance Unban
                                            </p>
                                            <p class="text-xs font-normal">The given reason you're lifting the instance ban.</p>
                                            
                                            <div class="mt-2"/>
                                            <TextInput bind:value={actions.unbanInstanceReason} type="text" placeholder="Unban reason"/>
                                        </div>
                                    </div>
                                {/if}

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
                            <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.replyReporter} >
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
                            <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.replyReporter} >
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
                            <div class="flex flex-row w-full gap-2 ml-4 pr-4 !border-t-0" class:hidden={!actions.replyReporter} >
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
            
            
            <!--- Right 1/3 Width Side Panel--->
            {#if sidePanel != 'closed'}
                <div class="hidden lg:flex flex-col gap-2 w-1/3" transition:fly={{duration:300, x: '33%'}}>
                    
                    <!--- Right pane / Modlog --->
                    {#if sidePanel == 'modlog'}
                        <div class="w-full p-2 gap-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}}>
                            {#if modlog.loading}
                                <span class="flex flex-row w-full items-center">    
                                    <span class="ml-auto"/>
                                    <Spinner width={64}/>
                                    <span class="mr-auto"/>
                                </span>
                            {:else}
                                <h1 class="text-lg font-bold">Modlog History</h1>
                                <p class="text-sm font-normal">
                                    Abridged modlog filtered for <UserLink user={isCommentReport(item) ? item.comment_creator : item.post_creator} />. 
                                </p>
                                
                                <div class="flex flex-row w-full ml-4 pr-4 gap-2 py-2">
                                    <div class="flex flex-col">
                                        <p class="text-sm font-bold flex flex-row gap-2">
                                            <Icon src={Funnel} mini width={16}/>
                                            This Community Only
                                        </p>
                                        <p class="text-xs font-normal">Filter the modlog to only actions in the reported community.</p>
                                    </div>
                                    
                                    <div class="mx-auto"/>
                                    
                                    <Switch bind:enabled={modlog.communityOnly} 
                                        on:change={()=> {
                                            modlog.communityOnly = !modlog.communityOnly
                                            modlog.communityOnly
                                                ? getModlog(item.community.id)
                                                : getModlog()
                                            }}
                                    />
                                </div>



                                {#if modlog.data?.modlog?.length > 0}
                                    <div class="flex flex-col gap-4 mt-2">
                                        {#each modlog.data.modlog as modlogItem}
                                            {#if [
                                                    'postRemoval', 'postRestore', 'postLock', 'postUnlock', 'commentRemoval', 'commentRestore', 
                                                    'ban', 'unban' ,'banCommunity', 'unbanCommunity'
                                                ].includes(modlogItem.actionName)
                                            }
                                                <div class="bg-slate-200 border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 p-2 text-sm rounded-md leading-[22px]">    
                                                    <ModlogItemList item={modlogItem} />
                                                </div>
                                            {/if}

                                        {/each}
                                    </div>

                                {/if}

                            {/if}
                        </div>
                    {/if}

                    <!---Right Pane / User Profile --->
                    {#if sidePanel =='profile' }
                        <div class="flex flex-col w-full h-full p-2 gap-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}}>
                            {#if creatorProfile.loading}
                                <span class="flex flex-row w-full items-center">        
                                    <span class="ml-auto"/>
                                    <Spinner width={64}/>
                                    <span class="mr-auto"/>
                                </span>
                            {:else}
                                {#if creatorProfile?.person_view }
                                    <UserCardBasic person={creatorProfile.person_view} community={item.community} bind:banned={item.creator_banned_from_community} />
                                {/if}
                            {/if}
                        </div>
                    {/if}

                    <!---Right Pane / User Posts --->
                    {#if sidePanel =='posts'}
                        <div class="w-full p-2 gap-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}} >
                            {#if creatorProfile.loading}
                                <span class="flex flex-row w-full items-center">        
                                    <span class="ml-auto"/>
                                    <Spinner width={64}/>
                                    <span class="mr-auto"/>
                                </span>
                            {:else}
                                <h1 class="text-lg font-bold">Posts</h1>
                                <p class="text-sm font-normal">
                                    Latest 50 posts made by <UserLink user={isCommentReport(item) ? item.comment_creator : item.post_creator} />.
                                </p>

                                {#if creatorProfile?.posts && creatorProfile?.posts?.length > 0 }
                                    <div class="mt-2 w-full flex flex-col gap-5 mx-auto">
                                        {#each creatorProfile.posts as item (item.counts.id)}
                                            <Post post={item} collapseBadges={true} forceCompact={true}/>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class="mt-2 w-full flex flex-col gap-5 mx-auto">
                                        <Placeholder icon={PencilSquare} title="No submissions" description="This user has not created any posts." />
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    {/if}

                    <!---Right Pane / User Comments --->
                    {#if sidePanel=='comments'}
                        <div class="w-full gap-2 p-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}}>
                            {#if creatorProfile.loading}
                                <span class="flex flex-row w-full items-center">        
                                    <span class="ml-auto"/>
                                    <Spinner width={64}/>
                                    <span class="mr-auto"/>
                                </span>
                            {:else}
                                <h1 class="text-lg font-bold">Comments</h1>
                                <p class="text-sm font-normal">
                                    Latest 50 comments made by <UserLink user={isCommentReport(item) ? item.comment_creator : item.post_creator} />.
                                </p>

                                {#if creatorProfile?.comments && creatorProfile?.comments?.length > 0 }
                                    <div class="mt-2 w-full flex flex-col gap-5 mx-auto">
                                        {#each creatorProfile.comments as item (item.counts.id)}
                                            <CommentItem comment={item} collapseBadges={true} />
                                        {/each}
                                    </div>
                                {:else}
                                    <Placeholder icon={PencilSquare} title="No submissions" description="This user has no comments." />
                                {/if}
                            {/if}
                        </div>
                    {/if}
                    
                    <!---Right Pane / Community Profile --->
                    {#if sidePanel=='community' }
                        <div class="flex flex-col w-full p-2 gap-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}}>
                            {#if item?.community }
                                <CommunityCardBasic community={item.community} />
                            {/if}
                        </div>
                    {/if}
                    
                </div>
            {/if}
        </div>
    {/if}
</Card>

