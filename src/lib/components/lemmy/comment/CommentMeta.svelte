<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Icon,
        Pencil,
    } from 'svelte-hero-icons'
    

    export let comment: CommentView                 
    export let avatarSize = 42;
    export let noClick = false
    export let content: boolean = false     // Show the comment content (only used for moderation UI purposes)
    export let inProfile: boolean = false
       

</script>


<div class="flex flex-col gap-1.5 grow ">

    <div class="flex flex-col gap-1">

        <span class="flex flex-row gap-2 text-sm items-center {noClick ? 'pointer-events-none' : ''}">
                
            <span class="flex flex-col items-end gap-1">    
                <Avatar url={comment.community.icon} width={avatarSize} alt={comment.community.name} community={true}/>
            </span>

            <div class="flex flex-col w-full truncate text-xs">
                
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

            
        </span>

        {#if content}
            <span class="flex max-h-[15vh] overflow-y-scroll text-xs font-normal">
                <Markdown source={comment.comment.content} noUserCommunityLink  noHashtags noLink />
            </span> 
        {/if}
    </div>
</div>
