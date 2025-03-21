<script lang="ts">
    import type { 
        CommunityModeratorView, 
        PostView 
    } from 'lemmy-js-client'
    
    import { amMod, isAdmin, postModerationModal } from '$lib/components/lemmy/moderation/moderation'
    import { createEventDispatcher } from 'svelte'
    import { instance } from '$lib/instance.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { postType as getPostType, isImage, isVideo, type PostType } from '$lib/components/lemmy/post/helpers.js'
    import { subscribe } from '$lib/components/lemmy/community/helpers.js'
    import { userSettings } from '$lib/settings'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte';
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import InstanceMenu from '$lib/components/lemmy/post/PostActions/InstanceMenu.svelte'
    import PostActionsMenu from '$lib/components/lemmy/post/PostActions/PostActionsMenu.svelte'
    import PostTitle from '$lib/components/lemmy/post/components/PostTitle.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        ArrowsPointingIn,
        ArrowsPointingOut,
        Bookmark,
        BugAnt,
        ExclamationCircle,
        EyeSlash,
        Icon,
        LockClosed,
        Megaphone,
        MinusCircle,
        NoSymbol,
        Pencil,
        PlusCircle,
        ShieldCheck,
        Trash,
    } from 'svelte-hero-icons'

    export let post: PostView  //| CommentReplyView | PersonMentionView             
    export let showTitle:boolean                = true;
    export let moderators: Array<CommunityModeratorView> = [];
    export let hideBadges:boolean               = false;
    export let avatarSize:number                = 42;
    export let noClick:boolean                  = false;
    export let actions: boolean                 = true
    export let inCommunity:boolean              = false
    export let inProfile:boolean                = false
    export let compact:boolean                  = true
    export let postType: PostType
    export let inModal: boolean                 = false
    export let onHomeInstance: boolean          = false


    let userIsModerator:boolean = false 
    let subscribing:boolean     = false
    let subscribed              = false
    let dispatcher              = createEventDispatcher()

    $: showExpandButton = postType != 'text' || (post.post.thumbnail_url || isImage(post.post.url) || isVideo(post.post.url) )
    $: post
    $: post, userIsModerator  = (moderators.filter((index) => index.moderator.id == post.creator.id).length > 0)
    $: post, subscribed       = post.subscribed == 'Subscribed' || post.subscribed == 'Pending'
    
</script>

<div class="flex flex-col gap-1 w-full {noClick ? 'pointer-events-none' : ''}">

    <div class="flex flex-row gap-1 w-full">

        <!---Community Name, User Name, Avatar, etc--->
        <div class="flex flex-col gap-1 {showExpandButton ? 'w-[calc(100%-150px)]' : 'w-[calc(100%-120px)]'}">

            <span class="flex flex-row gap-2 text-sm items-start">
                
                <!---Show Community Icon if Not in Community--->
                {#if post.community && !inCommunity}
                    <span class="flex flex-col my-auto items-end gap-1">
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
                    <span class="flex flex-col my-auto items-end gap-1">
                        <Avatar bind:url={post.creator.avatar} width={avatarSize} alt={post.creator.actor_id} />
                    </span>
                {/if}

                <div class="flex flex-col w-full text-xs overflow-hidden">
                    {#if !inCommunity && post.community}
                        <CommunityLink bind:community={post.community} {avatarSize} noClick={!actions} />
                    {/if}
                    
                    <span class="flex flex-col sm:flex-row sm:gap-1">
                        {#if !inProfile && post.creator}
                            <div class="flex flex-wrap items-center w-full" class:text-slate-900={!post.community} class:dark:text-zinc-100={!post.community}>

                                <UserLink noEmojis uPrefix 
                                    avatarSize={20} 
                                    bind:user={post.creator} 
                                    mod={post.creator_is_moderator} 
                                    admin={post.creator_is_admin} 
                                    community_banned={post.creator_banned_from_community} 
                                    avatar={!post.community} 
                                    bind:blocked={post.creator_blocked} 
                                    noClick={!actions}
                                />
                            </div>
                        {/if}
                    </span>
                    
                    <div class="flex flex-row gap-4 items-center opacity-70">
                        <RelativeDate date={post.post.published} />
                        
                        {#if post.post.updated}
                            <span class="flex flex-row items-center gap-1 ml-1">
                                <Icon src={Pencil} solid size="12" title="Edited" />
                                <RelativeDate date={post.post.updated}/>
                            </span>
                        {/if}
                    </div>

                </div>

                
            </span>
        </div>

        <!--Badges and Action Buttons Row--->
        <div class="flex flex-col ml-auto gap-1 {showExpandButton ? 'w-[150px]' : 'w-[120px]'}">
                    
            <!--- Post Badges --->
            {#if !hideBadges}
                <div class="flex flex-row ml-auto gap-2 items-end">
                    {#if post.saved}
                        <Badge label="Saved" color="yellow" icon={Bookmark} click={false}/>
                    {/if}
                    
                    {#if post.post.locked}
                        <Badge label="Locked" color="yellow" icon={LockClosed} click={false} />
                    {/if}
                    
                    {#if post.post.removed}
                        <Badge label="Removed" color="red" icon={NoSymbol} click={false} />
                    {/if}
                    
                    {#if post.post.deleted}
                        <Badge label="Deleted" color="red" icon={Trash} click={false} />
                    {/if}
                    
                    {#if post.hidden}
                        <Badge label="Hidden" color="red" icon={EyeSlash} click={false} />
                    {/if}

                    {#if (post.post.featured_local || post.post.featured_community)}
                        <Badge label="Featured" color="green" icon={Megaphone} click={false} />
                    {/if}
                    
                </div>
            {/if}


            <!---Post Action Buttons--->
            <div class="flex flex-row items-start gap-2 ml-auto">
                <!--Expand/Collapse Post--->
                {#if showExpandButton}
                    <Button  color="tertiary" size="square-md" title="{compact ? 'Expand' : 'Collapse'}" 
                        icon={compact ? ArrowsPointingOut : ArrowsPointingIn}
                        iconSize={16}
                        on:click={() => dispatcher('toggleCompact')}
                    />
                {/if}

                {#if actions}
                    <!---Moderation--->
                    {#if actions && $userSettings.uiState.dedicatedModButton && onHomeInstance && $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user))}
                        <Button color="tertiary" size="square-md" title="Moderation" icon={ShieldCheck} iconSize={16} on:click={() => postModerationModal(post) } />
                    {/if}
                    
                    <!---Instances--->
                    <InstanceMenu {post} />
                    
                    <!---Post Actions--->
                    <PostActionsMenu {post} {onHomeInstance} />
                {/if}
            </div>
            
        </div>
    </div>


    {#if showTitle}
        <PostTitle {post} {postType} {inModal} {onHomeInstance}/>
    {/if}
</div>
