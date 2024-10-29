<script lang="ts">
    import type { CommunityView, PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    import { amMod, isAdmin, postModerationModal, report} from '$lib/components/lemmy/moderation/moderation.js'
    import { instance } from '$lib/instance.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { scrollToTop } from './helpers.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button               from '$lib/components/input/Button.svelte'
    
    // Post Action Bar Components
    import CommentCountButton   from './PostActions/CommentCountButton.svelte'
    import DebugButton          from './PostActions/DebugButton.svelte'
    import InstanceMenu         from './PostActions/InstanceMenu.svelte'
    import PostActionsMenu      from './PostActions/PostActionsMenu.svelte'
    import PostReplyButton      from './PostActions/PostReplyButton.svelte'
    import PostVote             from './PostActions/PostVote.svelte'

    import {
        ArrowsPointingIn,
        ArrowsPointingOut,
        Icon,
        ShieldCheck,
    } from 'svelte-hero-icons'
   
    export let post: PostView
    export let displayType: PostDisplayType
    export let expandCompact: boolean
    export let postContainer: HTMLDivElement

    $: onHomeInstance = ($page.params.instance ?? $instance)  == $instance

</script>

<div  class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-1 sm:gap-2 items-center h-8 
    {displayType == 'post' ? 'pt-2 mt-auto' : 'mt-1'} 
    "
>

    <!--- Post Vote Buttons--->
    <PostVote bind:post  />

    <!--- Comment Count and Link to Post--->
    {#if displayType == 'feed'}
        <CommentCountButton bind:post displayType={displayType} />
    {/if}
    

    <!---Reply Button that enables the comment form--->
    <PostReplyButton displayType={displayType} on:reply bind:post/>
  
    <!--- Spacer --->
    <div class="ml-auto" />

    <!---Debug Button--->
    <DebugButton bind:post />
  
    
    <!--- Expand Compact Post to Card--->
    {#if $userSettings.showCompactPosts}
        <Button  color="tertiary-border" title="{expandCompact ? 'Collapse' : 'Expand'}" 
            on:click={() => {  
                expandCompact = !expandCompact; 
                scrollToTop(postContainer)
            }}
        >
            <Icon src={expandCompact ? ArrowsPointingIn : ArrowsPointingOut} mini size="16" slot="icon" />
        </Button>
    {/if}

    <!--- Moderation Menu--->
    {#if onHomeInstance && $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user))}
        <Button color="tertiary-border" title="Moderation" icon={ShieldCheck} iconSize={16} on:click={() => postModerationModal(post) } />
    {/if}

    <!---Explore Menu--->
    <InstanceMenu bind:post bind:expandCompact />
        
    <!--- Post Actions Menu --->
    <PostActionsMenu bind:post bind:expandCompact />
    
</div>
