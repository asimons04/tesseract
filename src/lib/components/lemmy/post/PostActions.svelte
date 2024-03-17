<script lang="ts">
    import type { CommunityView, PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    import { amMod, isAdmin, report} from '$lib/components/lemmy/moderation/moderation.js'
    import { profile } from '$lib/auth.js'
    import { scrollToTop } from './helpers.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button               from '$lib/components/input/Button.svelte'
    import ModerationMenu       from '$lib/components/lemmy/moderation/ModerationMenu.svelte'
    
    // Post Action Bar Components
    import CommentCountButton   from './PostActions/CommentCountButton.svelte'
    import CommunityActionMenu  from './PostActions/CommunityActionMenu.svelte'
    import DebugButton          from './PostActions/DebugButton.svelte'
    import ExploreMenu          from './PostActions/ExploreMenu.svelte'
    import PostActionsMenu      from './PostActions/PostActionsMenu.svelte'
    import PostReplyButton      from './PostActions/PostReplyButton.svelte'
    import PostVote             from './PostActions/PostVote.svelte'
    
    
    
    

    import {
        ArrowsPointingIn,
        ArrowsPointingOut,
        Icon,
        Tv,
    } from 'svelte-hero-icons'
    
    export let post: PostView
    export let postType: PostType
    export let displayType: PostDisplayType
    export let expandCompact: boolean
    export let showCommentForm:boolean = false;

    let theaterMode = false;
    
    function delay(millisec:number) {
        return new Promise(resolve => {
            setTimeout(() => { resolve('') }, millisec);
        })
    }
</script>

<div 
    class="flex flex-row gap-0 sm:gap-2 items-center h-8 
    {displayType == 'post' ? 'mt-auto' : ''} 
    {displayType == 'feed' && $userSettings.showCompactPosts && !expandCompact ? '' : 'ml-[-0.5rem]'}
    {displayType == 'post' ? 'ml-[-0.5rem]' : ''}
    "
>

    <!--- Post Vote Buttons--->
    <PostVote post={post.post} bind:vote={post.my_vote} bind:score={post.counts.score} />

    <!--- Comment Count and Link to Post--->
    <CommentCountButton post={post} displayType={displayType} />

    <!---Reply Button that enables the comment form--->
    <PostReplyButton displayType={displayType} bind:showCommentForm bind:post/>
  
    <!--- Spacer --->
    <div class="ml-auto" />

    <!---Debug Button--->
    <DebugButton bind:post />
  
    
    <!--- Expand Compact Post to Card--->
    {#if displayType == 'feed' && $userSettings.showCompactPosts && !theaterMode}
        <Button  color="ghost" class="hover:text-inherit border-none" title="{expandCompact ? 'Collapse' : 'Expand'}" 
            on:click={() => {  
                expandCompact = !expandCompact; 
                const element = document.getElementById(post.post.id.toString());
                if (element) scrollToTop(element);
            }}
        >
            <Icon src={expandCompact ? ArrowsPointingIn : ArrowsPointingOut} mini size="16" slot="icon" />
        </Button>
    {/if}

    <!--Theater Mode Button for YouTube/Vimeo Videos--->
    {#if ['youtube', 'vimeo', 'video'].includes(postType) && ( ($userSettings.embeddedMedia.post && displayType == 'post') ||($userSettings.embeddedMedia.feed && displayType == 'feed') ) }
        <span class="hidden md:block">
            <Button  class="hover:text-inherit !border-none"title="{theaterMode ? 'Exit' : ''} Theater Mode" color="ghost" size="square-md"
                on:click={
                    async () => {
                        if (!theaterMode) {
                            $userSettings.uiState.expandCommunitySidebar=false;
                            $userSettings.uiState.expandSidebar = false;
                            theaterMode=true;
                        }
                        else {
                            $userSettings.uiState.expandCommunitySidebar=true;
                            $userSettings.uiState.expandSidebar = true;
                            theaterMode=false;
                        }
                        await delay(10);
                        const element = document.getElementById("video-" + post.post.id);
                        if (element) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: "center"
                            });
                        }
                    }
                }
            >
                <Icon src={Tv} mini size="16" slot="icon" />
            </Button>
        </span>
    {/if}
    
    <!--- Moderation Menu--->
    {#if $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user))}
        <ModerationMenu bind:item={post} community={post.community} color="ghost" alignment="top-right"/>
    {/if}

    <!---Explore Menu--->
    <ExploreMenu bind:post />

    <!---Community Action Menu--->
    <CommunityActionMenu bind:post />
        
    <!--- Post Actions Menu --->
    <PostActionsMenu bind:post />
    
</div>
