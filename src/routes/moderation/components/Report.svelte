<script lang="ts">
    import type {
        CommentReportView,
        PostReportView,
        PrivateMessageReportView,
    } from 'lemmy-js-client'
    
    import type {
        ModlogContainer,
        PersonProfile,
        ModActionList,
    } from '../lib/types'


    import { afterNavigate, beforeNavigate } from '$app/navigation'
    import { amModOfAny, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { fade, fly } from 'svelte/transition'
    import { getClient } from '$lib/lemmy.js'
    import { getRemovalTemplates } from '../lib/templates'
    import { 
        getItemPublished, 
        isCommentReport, 
        isPrivateMessageReport,
        isPostReport, 
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
    import CommunityCardBasic from './CommunityCardBasic.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    
    import ConfigContainer from './ConfigContainer.svelte'
    import ConfigDateInput from './ConfigDateInput.svelte'
    import ConfigMarkdownEditor from './ConfigMarkdownEditor.svelte'
    import ConfigSwitch from './ConfigSwitch.svelte'
    import ConfigTextArea from './ConfigTextArea.svelte'
    
    import MiniModlog from './MiniModlog.svelte'
    import MiniCommentFeed from './MiniCommentFeed.svelte'
    import MiniCommunityProfile from './MiniCommunityProfile.svelte'
    import MiniPostFeed from './MiniPostFeed.svelte'
    import MiniProfileView from './MiniProfileView.svelte'

    import ContentPanel from './layout/ContentPanel.svelte'
    import SidePanel from './layout/SidePanel.svelte'
    import SidePanelControlBar from './layout/SidePanelControlBar.svelte'
    import SidePanelControlButton from './layout/SidePanelControlButton.svelte'

    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import Switch from '$lib/components/input/Switch.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    import UserReportDetails from './UserReportDetails.svelte'
    
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
        Fire,
        Folder,
        FolderOpen,
        Funnel,
        LockClosed,
        LockOpen,
        Megaphone,
        Microphone,
        Newspaper,
        NoSymbol,
        PencilSquare,
        Photo,
        Trash,
        User,
        UserGroup,
        Window
    } from 'svelte-hero-icons'
    

    export let item: PostReportView | CommentReportView | PrivateMessageReportView
    
    // Closes the current report before leaving the page.  Needed to be able to switch between "all" and "unread"
    beforeNavigate(() => {
        if (open) toggleOpenReport();

    });

    $: resolved = isCommentReport(item)
        ? item.comment_report.resolved
        : isPostReport(item)
            ? item.post_report.resolved
            : false

    $: reporteeID = isCommentReport(item) ? item.comment.creator_id : item.post.creator_id;
   
    let resolving:boolean = false
    let open:boolean = false;
    let debug:boolean = false;
    let sidePanel: 'posts' | 'comments' | 'profile' | 'community' | 'modlog' | 'closed' = 'profile'
    let lookupThisCommunityOnly:boolean = false;

    

    let modlog:ModlogContainer = {
        url: new URL(window.location.href),
        loading: false,
        data: undefined,
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
        restoreReplyToAuthor: false,

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
        
        //scrollToTop(element);

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
    async function getUserPostsComments(personID:number, communityID:number|undefined = undefined):Promise<void> {
        if (!personID || !$profile?.jwt) return;

        try {
            creatorProfile.loading = true;

            const user = await getClient(undefined, fetch).getPersonDetails({
                limit: 50,
                page: 1,
                person_id: personID,
                sort: 'New',
                auth: $profile?.jwt,
                community_id: communityID
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


    
    function applyActionPreset(preset:string) {
        if (!preset) return
        
        if (preset == 'spam-ban') {
            actions.remove = true;
            actions.removeReason = "Spam";
            actions.banCommunity = true;
            actions.banCommunityDeleteData = true;
            actions.banCommunityReason = 'Spam';

            if (isAdmin($profile.user)) {
                actions.banInstance = true;
                actions.banInstanceReason = 'Spam';
            }
            if (isPostReport(item)) actions.lock = true;
        }

        // Locks an item (if post) and removes it with a generic notification
        if (preset == 'lock-remove') {
            if (isPostReport(item)) actions.lock = true;
            actions.remove = true;
            actions.removeReason = 'Your submission has been removed because it violates the community or server rules.';
            actions.removeReplyToAuthor = true;

        }

    }
    
</script>




<Card class="p-4 flex flex-col gap-1.5 w-full !bg-slate-100 dark:!bg-black lg:max-h-[87vh] {open ? '' : 'mt-2'}" 
    name="ModeratorReport" 
    id="{isCommentReport(item) ? item.comment_report.id : item.post_report.id}"
>
    
    
    <!---Report Title, Badge and Open/Close Button Row--->
    <span class="flex flex-col lg:flex-row w-full gap-4">
        
        <!--- Report Title and Button Bar--->
        <span class="flex flex-row gap-2 items-center text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">
            <Icon src={isCommentReport(item) ? ChatBubbleLeftEllipsis : Photo} mini width={20} />
            {isCommentReport(item) ? "Comment Report: " : "Post Report: "}
            
            <span class="text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                {
                    isCommentReport(item) 
                        ? `"${item.comment.content.length > 120 ? item.comment.content.slice(0,120) + '...' : item.comment.content}"` 
                        : isPostReport(item) 
                            ? `"${item.post.name.length > 120 ? item.post.name.slice(0,120) + '...' : item.post.name}"` 
                            : ''
                }
            </span>
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

            <!---Quick Actions Menu--->
            {#if !resolved && open}
            <SelectMenu
                alignment="bottom-right"
                options={['manual', 'spam-ban', 'lock-remove-nonotify', 'lock-remove']}
                optionNames={['Quick Actions', 'Spam, Ban, Thank You Man', 'Lock and Remove (No Notify)', 'Lock and Remove']}
                selected={'manual'}
                title="Quick Actions"
                icon={Fire}
                on:select={(e) => {
                    // @ts-ignore
                    applyActionPreset(e.detail)
                }}
            />
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
                <span class="font-bold dark:text-zinc-400 text-slate-600">
                    Resolved by
                </span>
                {#if (isCommentReport(item) && item.comment_report.resolved) || (isPostReport(item) && item.post_report.resolved)}        
                    <UserLink user={item.resolver} />
                {:else}
                    ---
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
    <SidePanelControlBar bind:display={open}>
        
        <!---Profile--->
        <SidePanelControlButton bind:sidePanel={sidePanel} icon={User} name="User Profile" value='profile'
            action={() => {
                if (!creatorProfile.person_view) {
                    creatorProfile.loading = true;
                    getUserPostsComments(reporteeID);
                }
            }}
        />

        <!---Community--->
        <SidePanelControlButton bind:sidePanel={sidePanel} icon={UserGroup} name="Community" value='community'/>

        <!---Posts--->
        <SidePanelControlButton bind:sidePanel={sidePanel} icon={Window} name="Posts" value='posts'
            action={() => {
                if (!creatorProfile.posts) {
                    creatorProfile.loading = true;
                    getUserPostsComments(reporteeID);
                }
            }}
        />
        
        <!---Comments--->
        <SidePanelControlButton bind:sidePanel={sidePanel} icon={ChatBubbleLeftEllipsis} name="Comments" value='comments'
            action={() => {
                if (!creatorProfile.comments) {
                    creatorProfile.loading = true; 
                    getUserPostsComments(reporteeID);
                }
            }}
        />
        <!---Modlog History--->
        <SidePanelControlButton bind:sidePanel={sidePanel} icon={Newspaper} name="Modlog History" value='modlog'
            action={() => {
                if (lookupThisCommunityOnly) getModlog(item.community.id)
                else getModlog()   
            }}
        />
       

        <!--- Toggle filter posts/comments/modlog for the reported community only--->
        <span class="flex flex-row gap-4 ml-auto pr-4 items-center">
            <span class="text-xs font-bold flex flex-row gap-2 items-center">
                <Icon src={Funnel} mini width={16}/>
                This Community Only
            </span>

            <Switch bind:enabled={lookupThisCommunityOnly} 
                on:change={()=> {
                    lookupThisCommunityOnly = !lookupThisCommunityOnly
                    
                    if (lookupThisCommunityOnly) {
                        getUserPostsComments(reporteeID, item.community.id)
                        getModlog(item.community.id)
                    }
                    else {
                        getUserPostsComments(reporteeID)
                        getModlog()
                    }
                }}
            />
        </span>

    </SidePanelControlBar>

    <!--- Main Content Area--->
    <ContentPanel bind:sidePanel={sidePanel} bind:display={open}>

        <!---User Report Details and Preview of Post/Comment Being Reported--->
        <UserReportDetails bind:item={item}/>

        <!--- Moderation Actions Form--->
        <ConfigContainer title="Available Actions" display={ !resolved && $profile?.user && (amModOfAny($profile.user))}>

            <!--- Lock Posts--->
            <ConfigSwitch bind:enabled={actions.lock} icon={LockClosed} 
                name="Lock Post" 
                description="Lock the post to prevent any further comments or votes."
                display={isPostReport(item) && !item.post.locked}
            />

            <!--- Unlock Post--->
            <ConfigSwitch bind:enabled={actions.unlock} icon={LockOpen} 
                name="Unlock Post" 
                description="Unlock a post so that it may receive votes and comments."
                display={isPostReport(item) && item.post.locked}
            />


            <!---Remove Comment/Post--->
            <ConfigSwitch bind:enabled={actions.remove} icon={Trash}
                name="Remove {isCommentReport(item) ? 'Comment' : isPostReport(item) ? 'Post' : 'Content'}"
                description="Removes the offending {isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'}"
                display={(isCommentReport(item) && !item.comment.removed) || (isPostReport(item) && !item.post.removed)}
            >

                <!---Remove Comment/Post Reason with Preset Selector--->
                <ConfigTextArea bind:value={actions.removeReason} icon={Clipboard}
                    name="Removal Reason"
                    description="The reason for removing this content. It will appear in the modlog."
                    placeholder="Removal reason"
                    display={actions.remove}
                    nested={true}
                    rows={6}
                >
                    <MultiSelect slot="left"
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
                    />
                </ConfigTextArea>

                <!--- Remove Post: Reply to Author --->
                <ConfigSwitch bind:enabled={actions.removeReplyToAuthor} icon={ChatBubbleLeftEllipsis}
                    name="Reply to Author"
                    description="Send the {isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'} author a DM informing them that their content has been removed. The reason given above will be included in that message."
                    display={actions.remove}
                    nested={true}
                />
            </ConfigSwitch>


                
            <!---Restore Post/Comment--->
            <ConfigSwitch bind:enabled={actions.restore} icon={Trash}
                name="Restore  {isCommentReport(item) ? 'Comment' : isPostReport(item) ? 'Post' : 'Content'}"
                description="Restores the {isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'} to the community."
                display={(isCommentReport(item) && item.comment.removed) || (isPostReport(item) && item.post.removed)}
            >
                <ConfigTextArea bind:value={actions.restoreReason} icon={Clipboard}
                    name="Restore Reason"
                    description="The reason for restoring this content. It will appear in the modlog."
                    display={actions.restore}
                    nested={true}
                    rows={4}
                    placeholder="Restore reason"
                />

                <ConfigSwitch bind:enabled={actions.restoreReplyToAuthor} icon={ChatBubbleLeftEllipsis}
                    name="Reply to Author"
                    description="Send the {isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'content'} author a DM informing them that their content has been restored. The reason given above will be included in that message."
                    display={actions.restore}
                    nested={true}
                />
            </ConfigSwitch>



            <!---Community Ban--->
            <ConfigSwitch bind:enabled={actions.banCommunity} icon={UserGroup}
                name="Ban From Community"
                description="Ban the author of the reported content from the community. Enter an expiration date for the ban or leave it empty to effect a permanent ban."
                display={!item.creator_banned_from_community}
            >
                <ConfigSwitch bind:enabled={actions.banCommunityDeleteData} icon={Trash}
                    name="Remove Posts/Comments"
                    description="Remove all post and comments in this community made by this user."
                    display={actions.banCommunity}
                    nested={true}
                />

                <ConfigTextArea bind:value={actions.banCommunityReason} icon={Clipboard}
                    name="Reason for Community Ban"
                    description="The given reason meriting the ban from this community. This will appear in the modlog."
                    display={actions.banCommunity}
                    nested={true}
                    rows={3}
                    placeholder="Ban reason"
                />

                <ConfigSwitch bind:enabled={actions.banCommunityNotify} icon={Megaphone}
                    name="Send Ban Notification"
                    description="Send a message to the user letting them know they have been banned, why, and for how long. The ban reason will be included in that message."
                    display={actions.banCommunity}
                    nested={true}
                />

                <ConfigDateInput bind:value={actions.banCommunityExpires} icon={Clock}
                    name="Community Ban Duration"
                    description="The expiration date of the ban. Leave blank to effect a permanent community ban."
                    display={actions.banCommunity}
                    nested={true}
                />

            </ConfigSwitch>

            <!---Community Unban--->
            <ConfigSwitch bind:enabled={actions.unbanCommunity} icon={UserGroup}
                name="Unban From Community"
                description="Lift the community ban applied to the author of the reported content."
                display={item.creator_banned_from_community}
            >
                <ConfigTextArea bind:value={actions.unbanCommunityReason} icon={Clipboard}
                    name="Reason for Community Unban"
                    description="The given reason meriting the lifting of the community ban."
                    nested={true}
                    rows={3}
                    placeholder="Unban reason"
                    display={actions.unbanCommunity}
                />

                <ConfigSwitch bind:enabled={actions.unbanCommunityNotify} icon={Megaphone}
                    name="Send Unban Notification"
                    description="Send a message to the user letting them know their ban has been lifted. The ban reason will be included in that message."
                    nested={true}
                    display={actions.unbanCommunity}
                />
            </ConfigSwitch>


            <!--- Instance Ban (Admin Only) --->
            <ConfigSwitch bind:enabled={actions.banInstance} icon={NoSymbol}
                name="Ban From Instance"
                description="Ban the author of the reported content from this instance. Enter an expiration date for the ban or leave it empty to effect a permanent ban."
                display={
                    ( $profile?.user && isAdmin($profile.user) ) &&
                    ( (isPostReport(item) && !item.post_creator.banned) || (isCommentReport(item) && !item.comment_creator.banned) )
                }
            >
                <ConfigSwitch bind:enabled={actions.banInstanceDeleteData} icon={Trash}
                    name="Remove Posts/Comments"
                    description="Remove all posts and comments on this instance made by this user."
                    nested={true}
                    display={actions.banInstance}
                />

                <ConfigTextArea bind:value={actions.banInstanceReason} icon={Clipboard}
                    name="Reason for Instance Ban"
                    description="The given reason meriting the ban from this instance."
                    rows={3}
                    nested={true}
                    placeholder="Instance ban reason"
                    display={actions.banInstance}
                />

                <ConfigDateInput bind:value={actions.banInstanceExpires} icon={Clock}
                    name="Instance Ban Duration"
                    description="The expiration date of the ban. Leave blank to effect a permanent instance ban."
                    display={actions.banInstance}
                    nested={true}
                />
            </ConfigSwitch>


            <!-- Instance Unban (Admin Only)-->
            <ConfigSwitch bind:enabled={actions.unbanInstance} icon={Check}
                name="Unban From Instance"
                description="Lift the instance ban for the author of the reported content."
                display={
                    ( $profile?.user && isAdmin($profile.user) ) &&
                    ( (isPostReport(item) && item.post_creator.banned) || (isCommentReport(item) && item.comment_creator.banned) )
                }
            >
                <ConfigTextArea bind:value={actions.unbanInstanceReason} icon={Clipboard}
                    name="Reason for Instance Unban"
                    description="The given reason you're lifting the instance ban."
                    display={actions.unbanInstance}
                    rows={3}
                    nested={true}
                    placeholder="Instance unban reason"
                />
            </ConfigSwitch>

            <!--- Reply To Reporter-->
            <ConfigSwitch bind:enabled={actions.replyReporter} icon={ChatBubbleLeftEllipsis}
                name="Reply to Reporter"
                description="Send the reporter a DM letting them know their report was seen and resolved."
            >
                <ConfigSwitch bind:enabled={actions.replyReporterIncludeActions} icon={ClipboardDocumentList}
                    name="Include Actions Taken"
                    description="Include a list of actions taken in the process of resolving their report."
                    nested={true}
                    display={actions.replyReporter}
                />

                <ConfigTextArea bind:value={actions.replyReporterText} icon={Clipboard}
                    name="Additional Comments"
                    description="Include a 'moderator comment' in the reply to the reporter."
                    rows={3}
                    nested={true}
                    placeholder="Additional comments to include in reply."
                    display={actions.replyReporter}
                />

                <ConfigMarkdownEditor bind:value={actions.replyReporterBody} icon={Clipboard}
                    name="Reply Preview"
                    description="A preview of the generated reply that will be sent to the reporter. After you've made your mod action selections, you can edit the response manually before sending, if needed."
                    rows={10}
                    nested={true}
                    previewing={true}
                    images={false}
                    display={actions.replyReporter}
                />
            </ConfigSwitch>
        </ConfigContainer>
        
        <!--- Right 1/3 Width Side Panel--->
        <SidePanel slot="sidePanel" width="w-1/3" display={sidePanel != 'closed'}>
            <!--- Right pane / Modlog --->
            <MiniModlog bind:item={item} bind:modlog={modlog} display={sidePanel=='modlog'} />

            <!---Right Pane / User Posts --->
            <MiniPostFeed bind:item={item} bind:creatorProfile={creatorProfile} display={sidePanel=='posts'}/>

            <!--- Right Pane / User Comments --->
            <MiniCommentFeed bind:item={item} bind:creatorProfile={creatorProfile} display={sidePanel=='comments'}/>

            <!--- Right Pane / User Profile View--->
            <MiniProfileView bind:item={item} bind:creatorProfile={creatorProfile} display={sidePanel=='profile'}/>

            <!--- Right Pane / Community Profile --->
            <MiniCommunityProfile bind:item={item} display={sidePanel=='community'} />
        </SidePanel>
    </ContentPanel>
        
    
</Card>

