<script lang="ts">
    import type { CommunityModeratorView, CommentView } from 'lemmy-js-client'
    import { page } from '$app/stores'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    

    export let comment: CommentView                 
    export let moderators: Array<CommunityModeratorView> = [];
    export let avatarSize:number = 48;

    let inCommunity:boolean = false
    let inProfile:boolean = false

    $: inCommunity = ($page.url.pathname.startsWith("/c/"))
    $: inProfile = ($page.url.pathname.startsWith("/u/") || $page.url.pathname.startsWith('/profile/user'))
    
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
        </span>
    </div>
</div>
