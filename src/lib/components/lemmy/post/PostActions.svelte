<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from './helpers.js'

    import { userSettings } from '$lib/settings.js'
    

    
    // Post Action Bar Components
    import CommentCountButton   from './PostActions/CommentCountButton.svelte'
    import DebugButton          from './PostActions/DebugButton.svelte'
    import PostReplyButton      from './PostActions/PostReplyButton.svelte'
    import PostVote             from './PostActions/PostVote.svelte'
   
    export let post: PostView
    export let displayType: PostDisplayType

    //$: onHomeInstance = ($page.params.instance ?? $instance)  == $instance

</script>

<div  class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-1 sm:gap-2 items-center 
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
</div>
