<script lang="ts">
    import type { Community, CommunityModeratorView, Person, PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from './helpers.js'
    
    import { getInstance } from '$lib/lemmy.js'
    import { fediseerLookup } from '$lib/fediseer/client.js'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { imageProxyURL } from '$lib/image-proxy'
    import { page } from '$app/stores'
    import { postType } from './helpers'
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
        Cake,
        ExclamationCircle,
        Icon,
        LockClosed,
        Megaphone,
        MinusCircle,
        NoSymbol,
        Trash,
    } from 'svelte-hero-icons'
    
    

    export let post: PostView                 
    export let displayType: PostDisplayType     = 'feed';
    export let showTitle:boolean                = true;
    export let moderators: Array<CommunityModeratorView> = [];
    export let showFediseer:boolean             = true;
    export let collapseBadges:boolean           = false;
    //export let hideBadges:boolean               = false;


    // Extract data from post object for easier reference
    // These values are mutable so define them and bind them reactively
    let id: number |undefined
    let community: Community | undefined
    let user: Person | undefined
    let published:string
    let title: string | undefined
    let upvotes: number | undefined
    let downvotes: number | undefined
    let nsfw: boolean
    let saved: boolean
    let featured: boolean
    let deleted: boolean
    let removed: boolean
    let locked: boolean
    let read: boolean
    let userIsModerator:boolean
    let url: string | undefined
    
    // Make these variables reactive
    $: {
        community                           = post.community ?? undefined
        user                                = post.creator ?? undefined
        id                                  = post.post.id ?? undefined
        published                           = post.post.published
        title                               = fixLemmyEncodings(post.post.name) ?? undefined
        upvotes                             = post.counts.upvotes ?? undefined
        downvotes                           = post.counts.downvotes ?? undefined
        nsfw                                = post.post.nsfw ?? false
        saved                               = post.saved ?? false
        featured                            = (post.post.featured_local || post.post.featured_community) ?? false
        deleted                             = post.post.deleted ?? false
        removed                             = post.post.removed ?? false
        locked                              = post.post.locked ?? false
        read                                = post.read ?? false
        userIsModerator                     = (moderators.filter((index) => index.moderator.id == user?.id).length > 0)
        url                                 = post.post.url ?? undefined
    }
    
    let inCommunity:boolean = false
    $: inCommunity = ($page.url.pathname.startsWith("/c/"))
    
    let fediseerModal:boolean = false;
    
    function linkFromCommunity(community: Community) {
        const domain = new URL(community.actor_id).hostname
        return `/c/${community.name}@${domain}`
    }
</script>

{#if fediseerModal}
    <Fediseer bind:open={fediseerModal} instance={new URL(post.community.actor_id).hostname} />
{/if}




<div class="flex flex-col gap-1.5 grow">

    <div class="flex flex-col gap-1">

        <span class="flex flex-row gap-2 text-sm items-center">
            <!---Show user's avatar if viewing posts in a community--->
            {#if community && !inCommunity}
                <Avatar url={community.icon} width={48} alt={community.name} />
            {:else if inCommunity && user}
                <Avatar url={user.avatar} width={48} alt={user.name} />
            {/if}

            <div class="flex flex-col text-xs">
                {#if community}
                    <CommunityLink {community} />
                {/if}
                
                <span class="text-slate-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:gap-1 flex-wrap">
                    {#if user}
                        <div class="flex flex-wrap items-center" class:text-slate-900={!community} class:dark:text-zinc-100={!community}>
                            <span class="hidden {collapseBadges ? '' : 'md:block'}">Posted by&nbsp;</span>
                            <UserLink avatarSize={20} {user} mod={userIsModerator} avatar={!community} />
                        </div>
                    {/if}

                    <span class="flex flex-row gap-1">
                        
                    </span>
                </span>
                
                <!--<span class="pl-1 hidden sm:block">•</span>-->
                <RelativeDate date={published} />

            </div>

            <!--- Post Badges --->
            <div class="flex flex-row ml-auto mb-auto gap-2 items-center">
                <!--- Media Bias Fact Check--->
                {#if post && $userSettings.uiState.MBFCBadges && url && ['link','thumbLink'].includes(postType(post) ?? ' ') }
                    <MBFC post={post} {collapseBadges}/>
                {/if}

                <!---Badge accounts less than 5 days old (1440 minutes = 24 hours * 5)-->
                {#if post?.creator?.published && 
                    (
                        new Date().getTime()/1000/60 - (
                            post.creator.published.endsWith('Z')
                                ? (Date.parse(post.creator.published)/1000/60) 
                                : (Date.parse(post.creator.published + 'Z')/1000/60) 
                            )
                            < 1440 * 5
                    )
                }
                    <Badge label="New Account: {
                        post.creator.published.endsWith('Z')
                            ? new Date(post.creator.published).toString()
                            : new Date(post.creator.published + 'Z').toString()
                        }" 
                        color="gray"
                    >
                        <Icon src={Cake} mini size="16"/>
                        <RelativeDate date={post.creator.published} />
                    </Badge>
                {/if}

                {#if nsfw}
                    <Badge label="NSFW" color="red">
                        <Icon src={ExclamationCircle} mini size="16"/>
                        <!--<span class="hidden {collapseBadges ? 'hidden' : 'md:block'}">NSFW</span>-->
                    </Badge>
                {/if}

                {#if saved}
                    <Badge label="Saved" color="yellow">
                        <Icon src={Bookmark} mini size="16" />
                        <!--<span class="hidden {collapseBadges ? 'hidden' : 'md:block'}">Saved</span>-->
                    </Badge>
                {/if}
                
                {#if locked}
                    <Badge label="Locked" color="yellow">
                        <Icon src={LockClosed} mini size="16" />
                        <!--<span class="hidden {collapseBadges ? 'hidden' : 'md:block'}">Locked</span>-->
                    </Badge>
                {/if}
                
                {#if removed}
                    <Badge label="Removed" color="red">
                        <Icon src={NoSymbol} mini size="16" />
                        <!--<span class="hidden {collapseBadges ? 'hidden' : 'md:block'}">Removed</span>-->
                    </Badge>
                {/if}
                
                {#if deleted}
                    <Badge label="Deleted" color="red">
                        <Icon src={Trash} mini size="16" />
                        <!--<span class="hidden {collapseBadges ? 'hidden' : 'md:block'}">Deleted</span>-->
                    </Badge>
                {/if}
                
                {#if featured}
                    <Badge label="Featured" color="green">
                        <Icon src={Megaphone} mini size="16" />
                        <!--<span class="hidden {collapseBadges ? 'hidden' : 'md:block'}">Featured</span>-->
                    </Badge>
                {/if}

                <!--- Fediseer Endorsement Badge--->
                {#if community && showFediseer && $userSettings.uiState.fediseerBadges}
                    <button class="flex flex-row gap-2 items-center mr-2" on:click={(e) => fediseerModal = true}>
                        <img src={imageProxyURL(`https://fediseer.com/api/v1/badges/endorsements/${new URL(community.actor_id).hostname}.svg?style=ICON`)} 
                            class="cursor-pointer"
                            loading="lazy"
                            alt="{`Fediseer endorsement badge for ${new URL(community.actor_id).hostname}`}"
                            title="{`Fediseer endorsements for ${new URL(community.actor_id).hostname}`}"
                        />
                    </button>
                {/if}
            </div>
            
            
        </span>
    </div>

    {#if showTitle}
        <PostTitle bind:post />
    {/if}


</div>
