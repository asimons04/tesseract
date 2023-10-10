<script lang="ts">
    import type { Community, CommunityModeratorView, Person, PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from './helpers.js'
    
    import { getInstance } from '$lib/lemmy.js'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    
    import {
        Bookmark,
        Icon,
        InformationCircle,
        LockClosed,
        Megaphone,
        Trash,
    } from 'svelte-hero-icons'
    
    

    export let post: PostView | undefined       = undefined
    export let displayType: PostDisplayType     = 'feed';
    export let showTitle:boolean                = true;
    export let moderators: Array<CommunityModeratorView> = [];

    
    // Extract data from post object for easier reference
    // These values don't change, so assign them once
    let community: Community | undefined    = post.community ?? undefined
    let user: Person | undefined            = post.creator ?? undefined
    let id: number | undefined              = post.post.id ?? undefined
    let published: String                   = post.post.published

    // These values are mutable so define them and bind them reactively
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

    
    // Make these variables reactive
    $: {
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
    }
    
    let userIsModerator:boolean = (moderators.filter((index) => index.moderator.id == user.id).length > 0)

</script>


<div class="flex flex-col gap-1.5 grow">
    <div class="flex flex-col gap-1">
        <span class="flex flex-row gap-2 text-sm items-center">
            {#if community}
                <Avatar url={community.icon} width={24} alt={community.name} />
            {/if}

            <div class="flex flex-col text-xs">
                {#if community}
                    <CommunityLink {community} />
                {/if}
                <span class="text-slate-600 dark:text-zinc-400 flex flex-row gap-1 flex-wrap items-center">
                    {#if user}
                    <div class="mr-0.5 flex items-center" class:text-slate-900={!community} class:dark:text-zinc-100={!community}>
                        <UserLink avatarSize={20} {user} mod={userIsModerator} avatar={!community} />
                    </div>
                    {/if}

                    <RelativeDate date={published} />
                    {#if upvotes != undefined && downvotes != undefined}
                        <span>•</span>
                        <span>
                            {Math.floor((upvotes / (upvotes + downvotes || 1)) * 100)}%
                        </span>
                    {/if}
                </span>
            </div>
            
            <!--- Post Badges --->
            <div class="flex flex-row ml-auto gap-2 flex-wrap">
                {#if nsfw}
                    <Badge color="red">NSFW</Badge>
                {/if}

                {#if saved}
                    <Badge label="Saved" color="yellow">
                        <Icon src={Bookmark} mini size="12" />
                        Saved
                    </Badge>
                {/if}
                
                {#if locked}
                    <Badge label="Locked" color="yellow">
                        <Icon src={LockClosed} mini size="14" />
                        Locked
                    </Badge>
                {/if}
                
                {#if removed}
                    <Badge label="Removed" color="red">
                        <Icon src={Trash} mini size="14" />
                        Removed
                    </Badge>
                {/if}
                
                {#if deleted}
                    <Badge label="Deleted" color="red">
                        <Icon src={Trash} mini size="14" />
                        Deleted
                    </Badge>
                {/if}
                
                {#if featured}
                    <Badge label="Featured" color="green">
                        <Icon src={Megaphone} mini size="14" />
                        Featured
                    </Badge>
                {/if}
            </div>
        </span>
    </div>

    {#if showTitle}
    <a
        href="/post/{getInstance()}/{id}"
        class="font-medium max-w-full w-full break-words"
        style="word-break: break-word;"
        class:text-slate-500={read && $userSettings.markReadPosts}
        class:dark:text-zinc-400={read && $userSettings.markReadPosts}
        title="{title}"
    >
        <h1 class="text-lg" class:font-bold={displayType==='post'}>{title}</h1>    
    
    </a>
    {/if}


</div>
