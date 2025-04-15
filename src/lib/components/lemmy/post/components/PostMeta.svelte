<script lang="ts">
    import type { 
        CommunityModeratorView, 
        PostView 
    } from 'lemmy-js-client'
    
    import { amMod, isAdmin, postModerationModal, report } from '$lib/components/lemmy/moderation/moderation'
    import { createEventDispatcher } from 'svelte'
    import { profile } from '$lib/auth.js'
    import { postType as getPostType, isImage, isVideo, type PostType } from '$lib/components/lemmy/post/helpers.js'
    import { hide, save } from '$lib/lemmy/contentview'
    import { userSettings } from '$lib/settings'

    import Avatar           from '$lib/components/ui/Avatar.svelte'
    import Badge            from '$lib/components/ui/Badge.svelte'
    import Button           from '$lib/components/input/Button.svelte'
    import CommunityLink    from '$lib/components/lemmy/community/CommunityLink.svelte'
    import InstanceMenu     from '$lib/components/lemmy/post/PostActions/InstanceMenu.svelte'
    import PostActionsMenu  from '$lib/components/lemmy/post/PostActions/PostActionsMenu.svelte'
    import PostTitle        from '$lib/components/lemmy/post/components/PostTitle.svelte'
    import RelativeDate     from '$lib/components/util/RelativeDate.svelte'
    import UserLink         from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        ArrowsPointingIn,
        ArrowsPointingOut,
        Bookmark,
        Eye,
        EyeSlash,
        Flag,
        Icon,
        LockClosed,
        Megaphone,
        NoSymbol,
        Pencil,
        ShieldCheck,
        Trash,
    } from 'svelte-hero-icons'
    import PostShareMenu from '../PostActions/PostShareMenu.svelte';
    import { minAPIVersion } from '$lib/lemmy';
    

    export let post: PostView
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
    let dispatcher              = createEventDispatcher()

    $: showExpandButton = postType != 'text' || (post.post.thumbnail_url || isImage(post.post.url) || isVideo(post.post.url) )
    $: post, userIsModerator  = (moderators.filter((index) => index.moderator.id == post.creator.id).length > 0)

    let savingPost = false
    let hidingPost = false

</script>

<div class="flex flex-col gap-1 w-full {noClick ? 'pointer-events-none' : ''}">

    <div class="flex flex-row gap-1 w-full">

        <!---Community Name, User Name, Avatar, etc--->
        <div class="flex flex-col gap-1 w-[calc(100%-150px)]">

            <span class="flex flex-row gap-2 text-sm items-start">
                
                <!---Show Community Icon if Not in Community--->
                {#if post.community && !inCommunity}
                    <span class="flex flex-col my-auto items-end gap-1">
                        <Avatar bind:url={post.community.icon} width={avatarSize} alt={post.community.name} community={true}/>
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

        <!--Post Action Buttons--->
        <div class="flex flex-col ml-auto gap-1 w-[150px]">

            <!---Post Action Buttons Top Row--->
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
                        <Button color="tertiary" size="square-md" title="Moderation" icon={ShieldCheck} iconSize={16} disabled={post.banned_from_community} on:click={() => postModerationModal(post) } />
                    {/if}
                    
                    <!---Instances--->
                    <InstanceMenu {post} {onHomeInstance} />
                    
                    <!---Post Actions--->
                    <PostActionsMenu {post} {onHomeInstance} />
                {/if}
            </div>

            <!---Post Action Buttons Bottom Row--->
            <div class="flex flex-row items-start gap-2 ml-auto">
                {#if actions}
                    <!---Report Post--->
                    <Button  
                        title="Report Post" 
                        color="tertiary" 
                        size="square-md"
                        icon={Flag} 
                        iconSize={16}
                        disabled={!onHomeInstance || post.post.removed || post.post.deleted || post.banned_from_community}
                        on:click={() => report(post)}
                    />

                    <!---Hide Post Button--->
                    <Button 
                        size="square-md"
                        disabled={!onHomeInstance || !$profile?.user || !minAPIVersion('0.19.4')}
                        title={post.hidden ? 'Uh-Hide Post' : 'Hide Post'}
                        icon={post.hidden ? Eye : EyeSlash}
                        iconSize={16}
                        color="tertiary"
                        class="{post.hidden ? '!text-red-500' : ''}"
                        loading={hidingPost}
                        on:click={async () => {
                            hidingPost = true
                            post.hidden = await hide(post)
                            hidingPost = false
                        }}

                        
                    />

                    <!---Save Post Button/Indicator--->
                    <Button 
                        size="square-md" 
                        disabled={!onHomeInstance || !$profile?.user || post.post.removed || post.post.deleted}
                        title="{post.saved ? 'Un-Save' : 'Save'}" 
                        icon={Bookmark} 
                        iconSize={16} 
                        color='tertiary'
                        class="{post.saved ? '!text-amber-500' : ''}"
                        loading={savingPost}
                        on:click={async () => {
                            savingPost = true
                            post.saved = await save(post, !post.saved)
                            savingPost = false
                        }}
                    />

                    
                    <!---Share Menu--->
                    <PostShareMenu {post} {onHomeInstance} />
                {/if}
            </div>


            
        </div>
    </div>


    {#if showTitle}
        <PostTitle {post} {postType} {inModal} {onHomeInstance}/>
    {/if}
</div>
