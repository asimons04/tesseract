<script lang="ts">
    import { dispatchWindowEvent, type EditPostEvent } from '$lib/ui/events'
    import type { PostView } from 'lemmy-js-client';

    import { amMod, isAdmin, postModerationModal, postViewerModal } from '$lib/components/lemmy/moderation/moderation'
    import { fade } from 'svelte/transition'
    import { getInstance } from '$lib/lemmy.js'
    import { profile } from '$lib/auth'
    import { userSettings } from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte'
    import CommentCountButton from '$lib/components/lemmy/post/PostActions/CommentCountButton.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import PostVote from '$lib/components/lemmy/post/PostActions/PostVote.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'

    import {
        Icon,
        ArrowUp,
        ArrowDown,
        Pencil,
        ShieldCheck
    } from 'svelte-hero-icons'
    import { goto } from '$app/navigation';

    export let crosspost:PostView;                      // PostView object to render
    export let textSize:string = "text-xs"              // Taildwind text size class to apply
    export let iconSize:number = 20                     // Size of the icons to use for avatars
    export let instance:string = getInstance()          // Allows passing an instance if the post ID is remote (defaults to current)
    export let noClick:boolean = false                  // Disables pointer events if list is for display only
    export let voteButtons: boolean = true              // Whether to show the vote buttons
    export let onHomeInstance: boolean = false

    const getTextSize = () => `text-xs md:${textSize}`

    const handlers= {
        EditPostEvent: function (e:EditPostEvent) {
            if (crosspost?.post.id == e.detail.post.post.id) {
                crosspost = {
                    ...e.detail.post,
                }
            }
        },
    }
    
    let postInstance: string
    let postID: number
    let postURL: string
    
    function generatePostInstanceAndID() {
        postInstance = onHomeInstance
            ? instance
            : new URL(crosspost.post.ap_id).hostname

        postID = onHomeInstance 
            ? crosspost.post.id
            : Number(new URL(crosspost.post.ap_id).pathname.replace('/post/',''))
        
        postURL = `/post/${postInstance}/${postID}`
    }

    $:  crosspost.post.id, onHomeInstance, generatePostInstanceAndID()

</script>

<svelte:window on:editPost={handlers.EditPostEvent} />

{#if !crosspost.post.removed}
    <a class="flex flex-col lg:flex-row gap-2 items-center w-full rounded-lg
            hover:dark:bg-zinc-800 hover:bg-slate-200
            py-1 px-1 sm:px-2
            {getTextSize()}
            {noClick ? 'pointer-events-none' : ''}
        " 
        id="{crosspost.post.id.toString()}"
        href="{postURL}" 
        title="{crosspost.post.name}"
        target="_blank"
        transition:fade
        on:click={ (
            //@ts-ignore
            e ) => {
                // If not already in modal and the setting to open posts in modals is enabled, open the modal viewer.
                if ($userSettings.openInNewTab.postsInModal) {
                    e.preventDefault()
                    e.stopPropagation()
                    postViewerModal(postInstance, postID)
                    dispatchWindowEvent('requestSnapshot')
                    return
                }
                // Use goto instead of href to avoid occasionally reloading the whole app on page transition
                if (!$userSettings.openInNewTab.posts) { 
                    e.preventDefault()
                    e.stopPropagation()
                    goto(postURL)
                    dispatchWindowEvent('clickIntoPost', {post_id: postID})
                    return
                }
            }
        }
    >

        <!---Published Date--->
        <span class="flex flex-row-reverse mr-auto w-full justify-between gap-2 items-center lg:flex-row lg:mr-0 lg:justify-start ">
            <RelativeDate date={crosspost.post.published} class="opacity-80"/>
            <CommunityLink community={crosspost.community} avatar avatarSize={iconSize} showInstance={true} noClick class="!w-[calc(100%-75px)]" />
        </span>

        <div class="flex flex-row gap-2 mr-auto lg:ml-auto lg:mr-0 items-center">
            
            <!---Vote Buttons for the XPost Item--->
            {#if voteButtons}
                <button on:click|preventDefault|stopPropagation>
                    <PostVote bind:post={crosspost} small {onHomeInstance}/>
                </button>
            {/if}
           
            
            {#if $userSettings.uiState.showScores && !voteButtons}
                <span class="flex flex-row gap-1 font-normal items-center">
                    <Icon src={crosspost.counts.score > 0 ? ArrowUp : ArrowDown} mini width={iconSize} height={iconSize}/>
                    <FormattedNumber number={crosspost.counts.score} />
                </span>
            {/if}
        
            <!---Comment Counts--->
            <CommentCountButton bind:post={crosspost} {onHomeInstance} displayType="feed" />

            <!---Moderation--->
            {#if !noClick && onHomeInstance && (amMod($profile?.user, crosspost.community) || isAdmin($profile?.user))}
                <Button color="tertiary-border" size="sm" title="Moderation" icon={ShieldCheck} iconSize={iconSize} on:click={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        postModerationModal(crosspost) 
                    }}
                />
            {/if}

             
            
            

        </div>
    </a>
{/if}