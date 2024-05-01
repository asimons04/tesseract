<script lang="ts">
    
    import type {
        ModlogContainer,
        PersonProfile,
    } from '../lib/types'

    import type { StandardReport } from './helpers'

    import { beforeNavigate } from '$app/navigation'
    import { amModOfAny, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { getClient } from '$lib/lemmy.js'
    import { getRemovalTemplates } from '../lib/templates'
    import { getItemPublished } from '$lib/lemmy/item.js'
    
    import { profile } from '$lib/auth.js'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    // Modlog Loader
    import {
        type ModLog,
        load as loadModlog
    } from '$routes/modlog/+page'

    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    
    
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
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
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
    

    //export let item: PostReportView | CommentReportView | PrivateMessageReportView
    export let report: StandardReport

    // Closes the current report before leaving the page.  Needed to be able to switch between "all" and "unread"
    beforeNavigate(() => {
        if (open) toggleOpenReport();

    });

   
    let resolving:boolean = false
    let open:boolean = false;
    let debug:boolean = false;
    let sidePanel: 'posts' | 'comments' | 'profile' | 'community' | 'modlog' | 'closed' = 'profile'
    let lookupThisCommunityOnly:boolean = false;

    let modlog = {
        url: new URL(window.location.href),
        loading: false,
        data: undefined,
    } as ModlogContainer

    let creatorProfile = {
        loading: false,
    } as PersonProfile

    // Load Moderation presets from the template module
    let removalPresets = getRemovalTemplates(report);

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

        deletePM: false,
        restorePM: false,

        replyReporter: false,
        replyReporterText: '',
        replyReporterBody: '',
        replyReporterIncludeActions: true,


    }

    // A copy of the actions object used to reset it after submission
    let actionsDefault = {...actions};
    
    
    // Live-update the reply to the reporter based on the selected moderation options.
    $: {
        actions.replyReporterBody = `**Re: Report for ${report.type_friendly}${['post', 'comment'].includes(report.type) ? ' in ' + report.community?.title ?? report.community?.name : ''}**\n\n`
        actions.replyReporterBody += "Thank you for your submission.\n\n";
        
        if (actions.replyReporterIncludeActions) {
            if (actions.lock || actions.remove || actions.banCommunity || actions.banInstance || actions.unlock || actions.restore || actions.unbanCommunity || actions.unbanInstance || actions.deletePM) {
                actions.replyReporterBody += "Actions taken in response to this report:\n";

                if (actions.lock)           actions.replyReporterBody += "- Reported post has been locked\n";
                if (actions.unlock)         actions.replyReporterBody += "- Reported post has been unlocked\n";

                if (actions.remove)         actions.replyReporterBody += `- Reported ${report.type} has been removed\n`;
                if (actions.restore)         actions.replyReporterBody += `- Reported ${report.type} has been restored\n`;
                
                if (actions.banCommunity)   actions.replyReporterBody += `- User was ${actions.banCommunityExpires ? 'temporarily' : 'permanently'} banned from this community\n`
                if (actions.unbanCommunity)   actions.replyReporterBody += `- The ${actions.banCommunityExpires ? 'temporary' : 'permanent'} community ban was lifted\n`
                
                if (actions.banInstance)    actions.replyReporterBody += `- User was ${actions.banInstanceExpires ? 'temporarily' : 'permanently'} banned from this instance\n`
                if (actions.unbanInstance)    actions.replyReporterBody += `- The ${actions.banInstanceExpires ? 'temporary' : 'permanent'} instance ban was lifted\n`

                if (actions.deletePM)       actions.replyReporterBody += `- The reported private message was removed\n`
                if (actions.restorePM)       actions.replyReporterBody += `- The reported private message was restored\n`

                // Add an additional newline to finish list
                actions.replyReporterBody += '\n'
            }
            else {
                actions.replyReporterBody += `The reported ${report.type_friendly} was reviewed by our moderation team and does not violate any community or server rules.\n\n`
            }
        }

        if (actions.replyReporterText != '') actions.replyReporterBody += '**Moderator Comments**: ' + actions.replyReporterText + '\n\n';
        actions.replyReporterBody += 'Your report has been resolved.';
    }
    
    
    
    // Validates a date string to ensure it converts to a proper date.
    function validateExpiryDate(dateStr:string): boolean{
        if (dateStr && Number.isNaN(Date.parse(dateStr))) {
            toast({
                content: 'Invalid date. It must be an absolute date.',
                type: 'error',
                title: 'Invalid Ban Expiry'
            });
            console.log("date failed")
            return false
        }
        return true
    }

    function parseExpiryDate(dateStr:string): number | undefined {
        return Math.floor(Date.parse(dateStr)/1000) || undefined
    }

    
    // Expands a report item, hides the rest. Send `false` as argument to close and un-hide.
    function toggleOpenReport():void {
        let element = document.getElementById(report.id.toString());
        let reports = document.getElementsByName('ModeratorReport'); 
        
        open=!open;

        if (open) {
            // Don't await
            getUserPostsComments(report.reportee.id);
            
            // Hide all closed reports if one is open.
            reports.forEach((reportItem) => {
                if (reportItem != element) {
                    reportItem.style.display='none';
                }
            })

            creatorProfile.loading = true;
            
            if (report.resolved) {
                getModlog();
                sidePanel= 'modlog';
            }
            else {
                sidePanel = 'profile';
            }
        }
        else {
            // Show all reports
            reports.forEach((reportItem) => {
                reportItem.style.display='flex';
            })

            // Hide the modlog and profile sidebar
            sidePanel = 'closed'
            
            // Empty modlog data and creator content
            modlog.data = undefined;
            
            creatorProfile.posts = undefined;
            creatorProfile.comments = undefined;
            //creatorProfile.person_view = undefined;
        }
        
        scrollToTop(element, false);

    }

    // Populates the ModLog panel for the user being reported on.
    async function getModlog(communityID:number|undefined=undefined):Promise<void> {
        if (communityID) {
            modlog.url.searchParams.set('community', communityID.toString());
        }
        else {
            modlog.url.searchParams.delete('community');
        }

        
        modlog.url.searchParams.set('other_person_id', report.reportee.id.toString() )
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

            const user = await getClient().getPersonDetails({
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
        }
        catch (err){
            console.log(err);
        }

    }

    async function resolve() {
        console.log("Resolving...")
        if (!$profile?.jwt || !$profile.user ||!report ) return
        
        // Validate the ban expiry dates and pop up a toast warning before returning early.
        if (actions.banCommunityExpires && !validateExpiryDate(actions.banCommunityExpires) ) return;
        if (actions.banInstanceExpires  && !validateExpiryDate(actions.banInstanceExpires) ) return;

        resolving = true

        const client = getClient()
        
        // Resolve an unresolved report
        if (!report.resolved) {
            
            // Private Message Actions
            if (report.type == 'private_message') {
                
                // Delete Private Message
                if (actions.deletePM) {
                    await client.deletePrivateMessage({
                        auth: $profile.jwt,
                        deleted: true,
                        private_message_id: report.private_message_view!.private_message.id
                    })
                    report.private_message_view!.private_message.deleted = true
                }
                // Restore Private Message
                if (actions.restorePM) {
                    await client.deletePrivateMessage({
                        auth: $profile.jwt,
                        deleted: false,
                        private_message_id: report.private_message_view!.private_message.id
                    })
                    report.private_message_view!.private_message.deleted = false
                }
            }

            // Post Actions
            if (report.type == 'post') {
                
                // Lock post
                if (actions.lock) {
                    await client.lockPost({
                        auth: $profile.jwt,
                        locked: true,
                        post_id: report.post_view!.post.id,
                    })
                    report.post_view!.post.locked = true
                }
                
                // Unlock post
                if (actions.unlock) {
                    await client.lockPost({
                        auth: $profile.jwt,
                        locked: false,
                        post_id: report.post_view!.post.id,
                    })
                    report.post_view!.post.locked = false
                }

                // Remove Post
                if (actions.remove) {
                    await client.removePost({
                        auth: $profile.jwt,
                        post_id: report.post_view!.post.id,
                        removed: true,
                        reason: actions.removeReason || undefined,
                    })
                    report.post_view!.post.removed = true
                }

                // Restore Post
                if (actions.restore) {
                    await client.removePost({
                        auth: $profile.jwt,
                        post_id: report.post_view!.post.id,
                        removed: false,
                        reason: actions.removeReason || undefined,
                    })
                    report.post_view!.post.removed = false
                }


            }

            // Comment Actions
            if (report.type == 'comment') {
                
                // Remove Comment
                if (actions.remove) {
                    await client.removeComment({
                        auth: $profile.jwt,
                        comment_id: report.comment_view!.comment.id,
                        removed: true,
                        reason: actions.removeReason || undefined,
                    })
                    report.comment_view!.comment.removed = true
                }

                // Restore Comment
                if (actions.remove) {
                    await client.removeComment({
                        auth: $profile.jwt,
                        comment_id: report.comment_view!.comment.id,
                        removed: false,
                        reason: actions.removeReason || undefined,
                    })
                    report.comment_view!.comment.removed = false
                }
            }

            // Actions for either a post or comment report
            if (['comment', 'post'].includes(report.type) && report.community) {
                
                // Ban from community
                if (actions.banCommunity) {
                    
                    await client.banFromCommunity({
                        auth: $profile.jwt,
                        ban: true,
                        community_id: report.community.id,
                        person_id: report.reportee.id,
                        reason: actions.banCommunityReason || undefined,
                        remove_data: actions.banCommunityDeleteData,
                        expires: parseExpiryDate(actions.banCommunityExpires),
                    })
                    report.creator_banned_from_community = true;
                }

                // Unban from community
                if (actions.unbanCommunity) {
                    
                    await client.banFromCommunity({
                        auth: $profile.jwt,
                        ban: false,
                        community_id: report.community.id,
                        person_id: report.reportee.id,
                        reason: actions.banCommunityReason || undefined,
                    })
                    report.creator_banned_from_community = false;
                }
            }

            // Ban Instance
            if (actions.banInstance) {
                await client.banPerson({
                    auth: $profile.jwt,
                    ban: true,
                    person_id: report.reportee.id,
                    reason: actions.banInstanceReason || undefined,
                    remove_data: actions.banInstanceDeleteData,
                    expires: parseExpiryDate(actions.banInstanceExpires)
                })
                report.reportee.banned = true
            }

            // Unban Instance
            if (actions.unbanInstance) {
                await client.banPerson({
                    auth: $profile.jwt,
                    ban: false,
                    person_id: report.reportee.id,
                    reason: actions.banInstanceReason || undefined,
                })
                report.reportee.banned = false
            }

            //// Follow-Up Messages:  If selected, sends follow-up DMs to the post/comment author and/or reporter
                
            // Community Ban/Unban Notify to author
            if ( report.community && ( (actions.banCommunity && actions.banCommunityNotify) || (actions.unbanCommunity && actions.unbanCommunityNotify)) ) {
                let template:string = '';
                let duration:string = '';

                if (actions.banCommunity) {
                    actions.banCommunityExpires
                        ? duration = `until ${actions.banCommunityExpires}`
                        : duration = 'permanently'

                    template += `You have been banned from ${report.community.name}@${new URL(report.community.actor_id).host} until ${duration}.\n\n`
                    template += `**Reason**: ${actions.banCommunityReason || '{None provided}'}\n`
                }

                if (actions.unbanCommunity) {
                    template = `Your ban from  ${report.community.name}@${new URL(report.community.actor_id).host} has been lifted.`
                }

                await client.createPrivateMessage({
                    auth: $profile.jwt,
                    content: template,
                    recipient_id: report.reportee.id,
                })
            }

            // Post Removal DM to Author
            if (report.type == 'post' && ( (actions.remove && actions.removeReplyToAuthor) || (actions.restore && actions.restoreReplyToAuthor))) {
                let template:string = '';
                let reason:string = '';

                if (actions.remove)     reason = actions.removeReason;
                if (actions.restore)    reason = actions.restoreReason;

                
                template = `Your post in 
                    !${report.community!.name}@${new URL(report.community!.actor_id).host} has been ${actions.restore ? 'restored' : 'removed'}:\n\n`
                
                template += `- **Post**: [${report.post_view!.post.name}](${report.post_view!.post.ap_id})\n\n`
                template += reason 
                    ? `- **Reason**: ${reason}\n\n`
                    : '\n\n'

                await client.createPrivateMessage({
                    auth: $profile.jwt,
                    content: template,
                    recipient_id: report.reportee.id,
                })
            }

            // Comment Removal DM to Author
            if (report.type == 'comment' && ( (actions.remove && actions.removeReplyToAuthor) || (actions.restore && actions.restoreReplyToAuthor))) {
                let template:string = '';
                let reason:string = '';

                if (actions.remove)     reason = actions.removeReason;
                if (actions.restore)    reason = actions.restoreReason;

                
                template = `Your comment in 
                    !${report.community!.name}@${new URL(report.community!.actor_id).host} has been ${actions.restore ? 'restored' : 'removed'}:\n\n`
                
                template += `- **Comment**: [${report.comment_view!.comment.content}](${report.comment_view!.comment.ap_id})\n\n`
                template += reason 
                    ? `- **Reason**: ${reason}\n\n`
                    : '\n\n'

                await client.createPrivateMessage({
                    auth: $profile.jwt,
                    content: template,
                    recipient_id: report.reportee.id,
                })
            }

            // Send follow-up DM to reporter if selected
            if (actions.replyReporter) {
                await client.createPrivateMessage({
                    auth: $profile.jwt,
                    content: actions.replyReporterBody,
                    recipient_id: report.reporter.id
                })
            }
        }

        //// Resolve or unresolve a report based on the report.resolved key
        
        // Resolve a Post Report
        if (report.type == 'post') {
            await client.resolvePostReport({
                auth: $profile.jwt,
                report_id: report.id,
                resolved: !report.resolved,
            })
        }

            
        // Resolve a Comment Report
        if (report.type == 'comment') {
            await client.resolveCommentReport({
                auth: $profile.jwt,
                report_id: report.id,
                resolved: !report.resolved,
            })
        }

        // Resolve a private message report
        if (report.type == 'private_message') {
            await client.resolvePrivateMessageReport({
                auth: $profile.jwt,
                report_id: report.id,
                resolved: !report.resolved,
            })
        }
            
            
        // Update reports object store
        const reports = await getClient().getReportCount({
            auth: $profile?.jwt,
        })
        $profile.user.reports = reports.comment_reports + reports.post_reports + (reports.private_message_reports ?? 0)

        // Stop the spinner and reset the actions
        resolving = false;
        actions = {...actionsDefault};
        
        // Mark the report object as resolved
        report.resolved = !report.resolved

        // If un-resolving the report, keep it open
        if (open && report.resolved) toggleOpenReport();

        // Toast the user
        toast({
            content: `${report.resolved ? 'Resolved' : 'Unresolved'} that report.`,
            type: 'success',
            title: 'Resolved'
        })


    }
    
</script>




<Card class="p-4 flex flex-col gap-1.5 w-full !bg-slate-100 dark:!bg-black lg:max-h-[87vh] {open ? '' : 'mt-2'}"  name="ModeratorReport"  id="{report.id}" >
    
    
    <!---Report Title, Badge and Open/Close Button Row--->
    <span class="flex flex-col lg:flex-row w-full gap-4">
        
        <!--- Report Title and Button Bar--->
        <button class="flex flex-row gap-2 items-center" on:click={toggleOpenReport}>
            <Icon src={report.icon} mini width={20} />
            
            
            <span class="text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis hover:underline">
                <span class="text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                    {report.type_friendly} Report
                </span>
                {report.title.length > 120 ? report.title.slice(0,120) + '...' : report.title}
            </span>
        </button>
        
        <span class="ml-auto"/>

        <span class="flex flex-row gap-4 items-center">
            <Badge color="{report.resolved ? 'green' : 'yellow'}">
                <Icon mini size="14"  src={report.resolved ? Check : ExclamationTriangle}/>
                <span class="hidden md:block">
                    {report.resolved ? 'Resolved' : 'Needs Action'}
                </span>
            </Badge>

            <!---Debug Button--->
            {#if $userSettings.debugInfo}
                {#if debug}
                    {#await import('$lib/components/util/debug/DebugObject.svelte') then { default: DebugObject }}
                        <DebugObject object={report} bind:open={debug} />
                    {/await}
                {/if}

                <Button on:click={() => (debug = true)} size="square-md" title="Debug Info" color="ghost">
                    <Icon src={BugAnt} mini size="16" slot="icon" />
                </Button>
            {/if}

            <!--- Resolve Button--->
            <Button on:click={resolve} color="primary" class="h-8" size="md" title="{report.resolved ? "Unresolve" : "Resolve"}" loading={resolving} disabled={resolving} >
                <Icon src={report.resolved ? ArrowUturnLeft : Check} mini size="16" slot="icon" />
                {report.resolved ? "Unresolve" : "Resolve"}
            </Button>
        </span>


    </span>
    
    <!--Header Row with from, to, sent, resolver-->
    <span class="flex flex-col lg:flex-row w-full mx-4 gap-2 justify-between">
        
        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Report from 
            </span>
            <UserLink user={report.reporter} />
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Report to
            </span>
            {#if report.community}
                <CommunityLink community={report.community} />
            {:else}
                ---
            {/if}
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Report against 
            </span>
            <UserLink user={report.reportee} />
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
                <span class="font-bold dark:text-zinc-400 text-slate-600">
                    Resolved by
                </span>
                {#if report.resolver}
                    <UserLink user={report.resolver} />
                {:else}
                    ---
                {/if}
        </span>

        <span class="flex flex-col gap-1 text-xs w-full lg:w-1/5">
            <span class="font-bold dark:text-zinc-400 text-slate-600">
                Sent
            </span>
            <RelativeDate date={report.published} />
        </span>
        
    </span>


    <!---Collapsible Portion--->
    
    <!--- Lookup Buttons to populate the sidebar--->
    <SidePanelControlBar bind:display={open}>
        
        <!---Profile--->
        <SidePanelControlButton bind:sidePanel={sidePanel} icon={User} name="User Profile" value='profile'
            action={() => {
                if (!creatorProfile.person_view) {
                    creatorProfile.loading = true;
                    getUserPostsComments(report.reportee.id);
                }
            }}
        />

        <!---Community--->
        {#if report.community}
            <SidePanelControlButton bind:sidePanel={sidePanel} icon={UserGroup} name="Community" value='community'/>
        {/if}

        <!---Posts--->
        <SidePanelControlButton bind:sidePanel={sidePanel} icon={Window} name="Posts" value='posts'
            action={() => {
                if (!creatorProfile.posts) {
                    creatorProfile.loading = true;
                    getUserPostsComments(report.reportee.id);
                }
            }}
        />
        
        <!---Comments--->
        <SidePanelControlButton bind:sidePanel={sidePanel} icon={ChatBubbleLeftEllipsis} name="Comments" value='comments'
            action={() => {
                if (!creatorProfile.comments) {
                    creatorProfile.loading = true; 
                    getUserPostsComments(report.reportee.id);
                }
            }}
        />
        <!---Modlog History--->
        <SidePanelControlButton bind:sidePanel={sidePanel} icon={Newspaper} name="Modlog History" value='modlog'
            action={() => {
                if (lookupThisCommunityOnly && report.community) getModlog(report.community.id)
                else getModlog()   
            }}
        />
       

        <!--- Toggle filter posts/comments/modlog for the reported community only--->
        {#if report.community}
            <span class="flex flex-row gap-4 ml-auto pr-4 items-center">
                <span class="text-xs font-bold flex flex-row gap-2 items-center">
                    <Icon src={Funnel} mini width={16}/>
                    This Community Only
                </span>

                <Switch bind:enabled={lookupThisCommunityOnly} 
                    on:change={()=> {
                        lookupThisCommunityOnly = !lookupThisCommunityOnly
                        
                        if (lookupThisCommunityOnly && report.community) {
                            getUserPostsComments(report.reportee.id, report.community.id)
                            getModlog(report.community.id)
                        }
                        else {
                            getUserPostsComments(report.reportee.id)
                            getModlog()
                        }
                    }}
                />
            </span>
        {/if}

    </SidePanelControlBar>

    <!--- Main Content Area--->
    <ContentPanel bind:sidePanel={sidePanel} bind:display={open}>

        <!---User Report Details and Preview of Post/Comment Being Reported--->
        <UserReportDetails bind:item={report}/>

        <!--- Moderation Actions Form--->
        <ConfigContainer title="Available Actions" display={ !report.resolved && $profile?.user && (amModOfAny($profile.user))}>

            <!--- Lock Posts--->
            {#if report.type == 'post' && report.post_view}
                <ConfigSwitch bind:enabled={actions.lock} icon={LockClosed} 
                    name="Lock Post" 
                    description="Lock the post to prevent any further comments or votes."
                    display={!report.post_view.post.locked}
                />

                <!--- Unlock Post--->
                <ConfigSwitch bind:enabled={actions.unlock} icon={LockOpen} 
                    name="Unlock Post" 
                    description="Unlock a post so that it may receive votes and comments."
                    display={report.post_view.post.locked}
                />
            {/if}


            <!---Remove Comment/Post--->
            <ConfigSwitch bind:enabled={actions.remove} icon={Trash}
                name="Remove {report.type_friendly}"
                description="Removes the offending {report.type_friendly}"
                display={(report.type == 'post' && !report.post_view?.post.removed) || (report.type=='comment' && !report.comment_view?.comment.removed)}
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
                                    actions.removeReason = (report.reason ?? 'No reason provided')
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
                    description="Send the {report.type_friendly} author a DM informing them that their content has been removed. The reason given above will be included in that message."
                    display={actions.remove}
                    nested={true}
                />
            </ConfigSwitch>


                
            <!---Restore Post/Comment--->
            <ConfigSwitch bind:enabled={actions.restore} icon={Trash}
                name="Restore  {report.type_friendly}"
                description="Restores the {report.type_friendly} to the community."
                display={(report.type=='post' && report.post_view?.post.removed) || (report.type=='comment' && report.comment_view?.comment.removed)}
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
                    description="Send the {report.type_friendly} author a DM informing them that their content has been restored. The reason given above will be included in that message."
                    display={actions.restore}
                    nested={true}
                />
            </ConfigSwitch>

            <!---Delete Private Message:  Disabled - doesn't work in 0.18.5.  Need to test against 0.19
            <ConfigSwitch bind:enabled={actions.deletePM} icon={Trash} name="Delete {report.type_friendly}" description="Delete the reported private message."
                display={report.type=='private_message' && !report.private_message_view?.private_message.deleted}
            />
            --->

            <!---Restore Private Message: Disabled - doesn't work in 0.18.5.  Need to test against 0.19
            <ConfigSwitch bind:enabled={actions.restorePM} icon={Trash} name="Restore {report.type_friendly}" description="Restore the reported private message."
                display={report.type=='private_message' && report.private_message_view?.private_message.deleted}
            />
            --->




            <!---Community Ban--->
            {#if ['post', 'comment'].includes(report.type)}
                <ConfigSwitch bind:enabled={actions.banCommunity} icon={UserGroup}
                    name="Ban From Community"
                    description="Ban the author of the reported content from the community. Enter an expiration date for the ban or leave it empty to effect a permanent ban."
                    display={!report.creator_banned_from_community}
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
                    display={report.creator_banned_from_community}
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
            {/if}


            <!--- Instance Ban (Admin Only) --->
            <ConfigSwitch bind:enabled={actions.banInstance} icon={NoSymbol}
                name="Ban From Instance"
                description="Ban the author of the reported content from this instance. Enter an expiration date for the ban or leave it empty to effect a permanent ban."
                display={ $profile?.user && isAdmin($profile.user)  && !report.reportee.banned }
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
                display={ $profile?.user && isAdmin($profile.user)  && report.reportee.banned }
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
            <MiniModlog bind:item={report} bind:modlog={modlog} display={sidePanel=='modlog'} />

            <!---Right Pane / User Posts --->
            <MiniPostFeed bind:item={report} bind:creatorProfile={creatorProfile} display={sidePanel=='posts'}/>

            <!--- Right Pane / User Comments --->
            <MiniCommentFeed bind:item={report} bind:creatorProfile={creatorProfile} display={sidePanel=='comments'}/>

            <!--- Right Pane / User Profile View--->
            <MiniProfileView bind:creatorProfile={creatorProfile} display={sidePanel=='profile'}/>

            <!--- Right Pane / Community Profile --->
            <MiniCommunityProfile bind:item={report} display={sidePanel=='community'} />
        </SidePanel>
    </ContentPanel>
        
    
</Card>

