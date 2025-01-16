<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers'


    import { userSettings } from '$lib/settings'
        
    // Post Action Bar Components
    import CommentCountButton   from '$lib/components/lemmy/post/PostActions/CommentCountButton.svelte'
    import PostReplyButton      from '$lib/components/lemmy/post/PostActions/PostReplyButton.svelte'
    import PostVote             from '$lib/components/lemmy/post/PostActions/PostVote.svelte'

   
    export let post: PostView
    export let displayType: PostDisplayType
    export let actions: boolean = true
    
</script>

<div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} w-full gap-1 sm:gap-4 items-center mt-auto {$$props.class}">

    <!--- Post Vote Buttons--->
    <PostVote bind:post />
    
    {#if actions}
        <!--- Comment Count and Link to Post--->
        {#if displayType == 'feed'}
            <CommentCountButton bind:post displayType={displayType} />
        {/if}
        

        <!---Reply Button that enables the comment form--->
        <PostReplyButton displayType={displayType} on:reply bind:post/>

        <!--- Spacer --->
        <div class="ml-auto" />

    {/if}
</div>
