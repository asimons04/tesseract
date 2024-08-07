<script lang="ts">
    import type { 
        CommentReplyView, 
        CommunityModeratorView, 
        PersonMentionView, 
        PostView 
    } from 'lemmy-js-client'
    
    import { imageProxyURL } from '$lib/image-proxy'
    import { isPostView, postType } from './helpers'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { subscribe } from '../community/helpers.js'
    import { userSettings } from '$lib/settings.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte'
    import MBFC from '$lib/MBFC/MBFC.svelte'
    import PostTitle from '$lib/components/lemmy/post/PostTitle.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Bookmark,
        ExclamationCircle,
        Icon,
        LockClosed,
        Megaphone,
        MinusCircle,
        NoSymbol,
        Pencil,
        PlusCircle,
        Trash,
    } from 'svelte-hero-icons'
    
    

    export let post: PostView | CommentReplyView | PersonMentionView             
    export let showTitle:boolean                = true;
    export let moderators: Array<CommunityModeratorView> = [];
    export let collapseBadges:boolean           = false;
    export let hideBadges:boolean               = false;
    export let avatarSize:number                = 48;
    
    
    let inCommunity:boolean     = false
    let inProfile:boolean       = false
    let userIsModerator:boolean = false 
    let subscribing:boolean     = false
    let fediseerModal:boolean   = false;
    
    $: post
    $: inCommunity      = ($page.url.pathname.startsWith("/c/") && !$page.url.pathname.includes('create_post')) 
    $: inProfile        = ($page.url.pathname.startsWith("/u/") || $page.url.pathname.startsWith('/profile/user'))
    $: userIsModerator  = (moderators.filter((index) => index.moderator.id == post.creator.id).length > 0)
    $: subscribed       = post.subscribed == 'Subscribed' || post.subscribed == 'Pending'
</script>

{#if fediseerModal}
    <Fediseer bind:open={fediseerModal} instance={new URL(post.community.actor_id).hostname} />
{/if}




<div class="flex flex-col gap-1.5 grow">

    <div class="flex flex-col gap-1">

        <span class="flex flex-row gap-2 text-sm items-center">
            
            <!---Show Community Icon if Not in Community--->
            {#if post.community && !inCommunity}
                <span class="flex flex-col items-end gap-1">
                    <Avatar bind:url={post.community.icon} width={avatarSize} alt={post.community.name} community={true}/>
                    
                    <!---Only show subscribe button for logged-in users and not on post create pages--->
                    {#if $profile?.user && !$page.url.pathname.includes('create_post') && !$page.url.pathname.includes('create/post')}
                        <!---Overlay small subscribe/unsubscribe button on avatar--->
                        <button class="flex flex-row items-center -mt-[15px]" title={subscribed ? 'Unsubscribe' : 'Subscribe'}
                            on:click={async () => {
                                subscribing = true
                                let result = await subscribe(post.community, subscribed)
                                
                                if (result) post.subscribed = 'Subscribed'
                                else post.subscribed = 'NotSubscribed'

                                subscribing=false
                        }}>
                            
                            {#if subscribing}
                                <Spinner width={16} />
                            {:else}
                                <Icon src={subscribed ? MinusCircle : PlusCircle} mini size="16" />
                            {/if}
                        </button>
                    {/if}
                </span>
            
            <!---Show user's avatar if viewing posts in a community--->
            {:else if inCommunity && post.creator}
                <Avatar bind:url={post.creator.avatar} width={avatarSize} alt={post.creator.actor_id} />
            {/if}

            <div class="flex flex-col text-xs">
                {#if !inCommunity && post.community}
                    <CommunityLink bind:community={post.community} {avatarSize} />
                {/if}
                
                <span class="flex flex-col sm:flex-row sm:gap-1 flex-wrap">
                    {#if !inProfile && post.creator}
                        <div class="flex flex-wrap items-center" class:text-slate-900={!post.community} class:dark:text-zinc-100={!post.community}>
                            <span class="hidden {collapseBadges ? '' : 'md:block'} text-slate-600 dark:text-zinc-400">Posted by&nbsp;</span>
                            <UserLink avatarSize={20} bind:user={post.creator} mod={post.creator_is_moderator} admin={post.creator_is_admin} community_banned={post.creator_banned_from_community} avatar={!post.community} bind:blocked={post.creator_blocked}/>
                        </div>
                    {/if}
                </span>
                
                <div class="flex flex-row gap-4 items-center text-slate-600 dark:text-zinc-400">
                    <RelativeDate date={post.post.published} />
                    {#if post.post.updated}
                        <span class="flex flex-row items-center gap-1 ml-1">
                            <Icon src={Pencil} solid size="12" title="Edited" />
                            <RelativeDate date={post.post.updated}/>
                        </span>
                    {/if}
                </div>

            </div>

            <!--- Post Badges --->
            {#if !hideBadges}
            <div class="flex flex-row ml-auto mb-auto gap-2 items-center">
                <!--- Media Bias Fact Check
                {#if isPostView(post) && post && $userSettings.uiState.MBFCBadges && post.post.url && ['link','thumbLink'].includes(postType(post) ?? ' ') }
                    <MBFC post={post} {collapseBadges}/>
                {/if}
                --->
                
                {#if post.post.nsfw}
                    <Badge label="NSFW" color="red" icon={ExclamationCircle}>
                        <span class="hidden text-xs {collapseBadges ? 'hidden' : 'md:block'}">NSFW</span>
                    </Badge>
                {/if}

                {#if post.saved}
                    <Badge label="Saved" color="yellow" icon={Bookmark}>
                        <span class="hidden text-xs {collapseBadges ? 'hidden' : 'md:block'}">Saved</span>
                    </Badge>
                {/if}
                
                {#if post.post.locked}
                    <Badge label="Locked" color="yellow" icon={LockClosed}>
                        <span class="hidden text-xs {collapseBadges ? 'hidden' : 'md:block'}">Locked</span>
                    </Badge>
                {/if}
                
                {#if post.post.removed}
                    <Badge label="Removed" color="red" icon={NoSymbol}>
                        <span class="hidden text-xs {collapseBadges ? 'hidden' : 'md:block'}">Removed</span>
                    </Badge>
                {/if}
                
                {#if post.post.deleted}
                    <Badge label="Deleted" color="red" icon={Trash}>
                        <span class="hidden text-xs {collapseBadges ? 'hidden' : 'md:block'}">Deleted</span>
                    </Badge>
                {/if}
                
                {#if (post.post.featured_local || post.post.featured_community)}
                    <Badge label="Featured" color="green" icon={Megaphone}>
                        <span class="hidden text-xs {collapseBadges ? 'hidden' : 'md:block'}">Featured</span>
                    </Badge>
                {/if}
                
            </div>
            {/if}
            
            
        </span>
    </div>

    {#if showTitle}
        <PostTitle bind:post />
    {/if}


</div>
