<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'
    import { isNewAccount } from '../post/helpers.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { subscribe } from '../community/helpers.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Icon,
        Bookmark,
        Cake,
        MinusCircle,
        NoSymbol,
        Pencil,
        PlusCircle,
        Trash
    } from 'svelte-hero-icons'
    

    export let comment: CommentView                 
    export let avatarSize = 42;
    export let hideBadges = false
    export let noClick = false
    export let content: boolean = false     // Show the comment content (only used for moderation UI purposes)
    export let inProfile: boolean = false
    
    let subscribing:boolean = false

    //$: inCommunity = ($page.url.pathname.startsWith("/c/"))
    //$: inProfile = ($page.url.pathname.startsWith("/u/") || $page.url.pathname.startsWith('/profile/user'))
    $: subscribed = comment.subscribed == 'Subscribed' || comment.subscribed == 'Pending'

</script>


<div class="flex flex-col gap-1.5 grow ">

    <div class="flex flex-col gap-1">

        <span class="flex flex-row gap-2 text-sm items-center {noClick ? 'pointer-events-none' : ''}">
                
            <span class="flex flex-col items-end gap-1">    
                <Avatar url={comment.community.icon} width={avatarSize} alt={comment.community.name} community={true}/>
            
                {#if $profile?.user}
                    <!---Overlay small subscribe/unsubscribe button on avatar--->
                    <button class="flex flex-row items-center -mt-[15px]" title={subscribed ? 'Unsubscribe' : 'Subscribe'}
                        on:click={async () => {
                            subscribing = true
                            let result = await subscribe(comment.community, subscribed)
                            
                            if (result) comment.subscribed = 'Subscribed'
                            else comment.subscribed = 'NotSubscribed'

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
            



            <div class="flex flex-col w-full text-xs">
                
                <CommunityLink community={comment.community} {avatarSize} />
                
                
                <span class="text-slate-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:gap-1 flex-wrap">
                    {#if !inProfile && comment.creator}
                        <div class="flex flex-wrap items-center w-full" class:text-slate-900={!comment.community} class:dark:text-zinc-100={!comment.community}>
                            <span class="hidden md:block'">Commented by&nbsp;</span>
                            <UserLink avatarSize={20} user={comment.creator} 
                                mod={comment.creator_is_moderator} admin={comment.creator_is_admin}
                                avatar={!comment.community} />
                        </div>
                    {/if}

                </span>
                
                <!---Published and edited date--->
                <div class="flex flex-row gap-4 items-center text-slate-600 dark:text-zinc-400">
                    <RelativeDate date={comment.post.published} />

                    {#if comment.post.updated}
                        <span class="flex flex-row gap-1 items-center">    
                            <Icon src={Pencil} solid size="12" title="Edited" />
                            <RelativeDate date={comment.post.updated}/>
                        </span>
                    {/if}
                </div>
            </div>

            <!--- Badges --->
            {#if !hideBadges}
            <div class="flex flex-row ml-auto mb-auto gap-2 items-center">
                
                <!---Badge accounts less than 5 days old (1440 minutes = 24 hours * 5)-->
                {#if comment?.creator?.published && isNewAccount(comment.creator.published)}
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

        {#if content}
            <span class="flex max-h-[15vh] overflow-y-scroll text-xs font-normal">
                <Markdown source={comment.comment.content} />
            </span> 
        {/if}
    </div>
</div>
