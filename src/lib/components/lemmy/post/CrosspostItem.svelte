<script lang="ts">
    import type { PostView } from 'lemmy-js-client';

    import { amMod, isAdmin, postModerationModal } from '../moderation/moderation'
    import { fade } from 'svelte/transition'
    import { getInstance } from '$lib/lemmy.js'
    import { instance as homeInstance } from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { userSettings } from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte'
    import CommentCountButton from './PostActions/CommentCountButton.svelte';
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import PostVote from './PostActions/PostVote.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import UserLink from '../user/UserLink.svelte';

    import {
        Icon,
        ArrowUp,
        ArrowDown,
        Pencil,
        ShieldCheck
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
    $: onHomeInstance   = ($page.params.instance ?? $homeInstance)  == $homeInstance
</script>


{#if !crosspost.post.removed}
    <a class="flex flex-col gap-2 items-start w-full rounded-lg
            hover:dark:bg-zinc-800 hover:bg-slate-200
            py-1 px-1 sm:px-2
            {getTextSize()}
            {noClick ? 'pointer-events-none' : ''}
        " 
        id="{crosspost.post.id.toString()}"
        href="/post/{instance}/{crosspost.post.id}" title="{crosspost.post.name}"
        target={newTab ? '_blank' : undefined}
        transition:fade
    >
        
        <div class="flex flex-col w-full gap-1">
            <CommunityLink community={crosspost.community} avatar avatarSize={iconSize} showInstance={true}/>
            
            {#if showTitle}
                <span class="font-bold truncate">{crosspost.post.name}</span>
            {/if}

            {#if showUser}
                <span class="flex flex-row opacity-80">
                    by <UserLink user={crosspost.creator} avatar={false} />
                </span>
            {/if}
        </div>

        <div class="flex flex-row gap-4 items-center w-full">
            
            <!---Vote Buttons for the XPost Item--->
            {#if voteButtons}
                <button on:click|preventDefault|stopPropagation>
                    <PostVote bind:post={crosspost} small/>
                </button>
            {/if}
            
            {#if $userSettings.uiState.showScores && !voteButtons}
                <span class="flex flex-row gap-1 font-normal items-center">
                    <Icon src={crosspost.counts.score > 0 ? ArrowUp : ArrowDown} mini width={iconSize} height={iconSize}/>
                    <FormattedNumber number={crosspost.counts.score} />
                </span>
            {/if}
        
            <!---Comment Counts--->
            <CommentCountButton bind:post={crosspost} displayType="feed" />

             <!---Moderation--->
             {#if !noClick && onHomeInstance && (amMod($profile?.user, crosspost.community) || isAdmin($profile?.user))}
                <Button color="tertiary-border" size="sm" title="Moderation" icon={ShieldCheck} iconSize={20} on:click={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        postModerationModal(crosspost) 
                    }}
                />
            {/if}
            
            <!---Published and Edited Date--->
            <span class="flex flex-row gap-1 ml-auto items-center text-slate-600 dark:text-zinc-400">
                
                <RelativeDate date={crosspost.post.published} />
                
                <!---Edited Date (hidden on mobile)--->
                {#if crosspost.post.updated}
                    <span class="hidden md:flex flex-row items-center gap-1 ml-1">•
                        <Icon src={Pencil} solid size="12" title="Edited" />
                        <RelativeDate date={crosspost.post.updated}/>
                    </span>
                {/if}

               
            </span>

        </div>
    </a>
{/if}