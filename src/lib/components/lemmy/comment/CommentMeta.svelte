<script lang="ts">
    import type { CommunityModeratorView, CommentView } from 'lemmy-js-client'
    import { page } from '$app/stores'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Icon,
        Bookmark,
        Cake,
        NoSymbol,
        Trash
    } from 'svelte-hero-icons'
    

    export let comment: CommentView                 
    export let moderators = [] as Array<CommunityModeratorView>;
    export let avatarSize = 48;
    export let hideBadges = false
    
    let inCommunity:boolean = false
    let inProfile:boolean = false

    $: inCommunity = ($page.url.pathname.startsWith("/c/"))
    $: inProfile = ($page.url.pathname.startsWith("/u/") || $page.url.pathname.startsWith('/profile/user'))
    
    function isNewAccount():boolean {
        return new Date().getTime()/1000/60 - (
        comment.creator.published.endsWith('Z')
            ? (Date.parse(comment.creator.published)/1000/60) 
            : (Date.parse(comment.creator.published + 'Z')/1000/60) 
        )
        < 1440 * 5
    }
</script>


<div class="flex flex-col gap-1.5 grow">

    <div class="flex flex-col gap-1">

        <span class="flex flex-row gap-2 text-sm items-center">
            <!---Show user's avatar if viewing posts in a community--->
            {#if comment.community && !inCommunity}
                <Avatar url={comment.community.icon} width={avatarSize} alt={comment.community.name} />
            
            {:else if inCommunity && comment.creator}
                <Avatar url={comment.creator.avatar} width={avatarSize} alt={comment.creator.name} />
            {/if}

            <div class="flex flex-col text-xs">
                {#if !inCommunity && comment.community}
                    <CommunityLink community={comment.community} {avatarSize} />
                {/if}
                
                <span class="text-slate-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:gap-1 flex-wrap">
                    {#if !inProfile && comment.creator}
                        <div class="flex flex-wrap items-center" class:text-slate-900={!comment.community} class:dark:text-zinc-100={!comment.community}>
                            <span class="hidden md:block'">Commented by&nbsp;</span>
                            <UserLink avatarSize={20} user={comment.creator} 
                                mod={(moderators.filter((index) => index.moderator.id == comment.creator.id).length > 0)} 
                                avatar={!comment.community} />
                        </div>
                    {/if}

                </span>
                
                <RelativeDate date={comment.comment.published} />
            </div>

            <!--- Badges --->
            {#if !hideBadges}
            <div class="flex flex-row ml-auto mb-auto gap-2 items-center">
                
                <!---Badge accounts less than 5 days old (1440 minutes = 24 hours * 5)-->
                {#if comment?.creator?.published && isNewAccount()}
                    <Badge label="New Account" color="gray">
                        <Icon src={Cake} mini size="14"/>
                        <RelativeDate date={comment.creator.published} />
                    </Badge>
                {/if}


                {#if comment.saved}
                    <Badge label="Saved" color="yellow">
                        <Icon src={Bookmark} mini size="14" />
                        <!--<span class="hidden {collapseBadges ? 'hidden' : 'md:block'}">Saved</span>-->
                    </Badge>
                {/if}
                
                
                {#if comment.comment.removed}
                    <Badge label="Removed" color="red">
                        <Icon src={NoSymbol} mini size="14" />
                        <!--<span class="hidden {collapseBadges ? 'hidden' : 'md:block'}">Removed</span>-->
                    </Badge>
                {/if}
                
                {#if comment.comment.deleted}
                    <Badge label="Deleted" color="red">
                        <Icon src={Trash} mini size="14" />
                        <!--<span class="hidden {collapseBadges ? 'hidden' : 'md:block'}">Deleted</span>-->
                    </Badge>
                {/if}
                
            </div>
            {/if}
</span>
    </div>
</div>
