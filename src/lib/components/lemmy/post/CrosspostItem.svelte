<script lang="ts">
    import type { PostView } from 'lemmy-js-client';

    import { getInstance } from '$lib/lemmy.js'
    import { userSettings } from '$lib/settings'

    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import PostVote from './PostActions/PostVote.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import UserLink from '../user/UserLink.svelte';

    import {
        Icon,
        ArrowUp,
        ArrowDown,
        ChatBubbleOvalLeftEllipsis,
        Pencil
    } from 'svelte-hero-icons'
    

    export let crosspost:PostView;                      // PostView object to render
    export let textSize:string = "text-xs"              // Taildwind text size class to apply
    export let iconSize:number = 18                     // Size of the icons to use for avatars
    export let showUser:boolean = false                 // Show the creator of the crosspost
    export let showTitle:boolean = false                // Show the title of the crosspost
    export let newTab:boolean = false                   // Open the crosspost in a new tab
    export let instance:string = getInstance()          // Allows passing an instance if the post ID is remote (defaults to current)
    export let noClick:boolean = false                  // Disables pointer events if list is for display only
    export let voteButtons: boolean = true              // Whether to show the vote buttons

    const getTextSize = () => `text-xs md:${textSize}`

</script>

<div class="flex flex-row gap-2 items-center w-full">
    <div class="flex flex-row min-w-fit gap-1 ml-auto {getTextSize()}">
        <span class="hidden md:flex flex-row gap-1 items-center text-slate-600 dark:text-zinc-400">
            
            <RelativeDate date={crosspost.post.published} />
            {#if crosspost.post.updated}
                <span class="flex flex-row items-center gap-1 ml-1">•
                    <Icon src={Pencil} solid size="12" title="Edited" />
                    <RelativeDate date={crosspost.post.updated}/>
                </span>
            {/if}
        </span>

        {#if $userSettings.uiState.showScores && !voteButtons}
        <span class="flex flex-row gap-2 font-normal items-center">
            <Icon src={crosspost.counts.score > 0 ? ArrowUp : ArrowDown} mini width={iconSize} height={iconSize}/>
            <FormattedNumber number={crosspost.counts.score} />
        </span>
        {/if}

    
        <span class="flex flex-row gap-2 font-normal items-center" >
            <Icon src={ChatBubbleOvalLeftEllipsis} mini width={iconSize} height={iconSize}/>
            <FormattedNumber number={crosspost.counts.comments} />
        </span>
    </div>
    
    <a class="flex flex-col gap-1 items-start w-full
            hover:dark:bg-zinc-800 hover:bg-slate-200
            py-2.5 px-4 
            {getTextSize()}
            {noClick ? 'pointer-events-none' : ''}
        " 
        id="{crosspost.post.id.toString()}"
        href="/post/{instance}/{crosspost.post.id}" title="{crosspost.post.name}"
        target={newTab ? '_blank' : undefined}
    >
        
        <div class="flex flex-col w-full gap-1">
            {#if showTitle}
                <span class="font-bold truncate">{crosspost.post.name}</span>
            {/if}

            <div class="flex flex-row w-full items-center">
                
                <div class="flex flex-col lg:flex-row gap-1">
                    <CommunityLink community={crosspost.community} avatar avatarSize={iconSize}/>
                    {#if showUser}
                        <span> by <UserLink user={crosspost.creator} avatar={false} /></span>
                    {/if}
                </div>

                

            </div>
        </div>
    </a>
    
    

    {#if voteButtons}
        <PostVote bind:post={crosspost} small/>
    {/if}
</div>