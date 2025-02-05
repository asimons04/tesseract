<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers.js'

    import { dispatchWindowEvent } from '$lib/ui/events';
    import { getInstance } from '$lib/lemmy'
    import { goto } from '$app/navigation'
    import { instance } from '$lib/instance'
    import { postViewerModal } from '$lib/components/lemmy/moderation/moderation'
    import { userSettings } from '$lib/settings'
    
    import Button           from '$lib/components/input/Button.svelte'
    import FormattedNumber  from '$lib/components/util/FormattedNumber.svelte'
    
    import { ChatBubbleLeftRight } from 'svelte-hero-icons'
    

    export let displayType:PostDisplayType
    export let post:PostView
    export let inModal: boolean         = false
    export let onHomeInstance: boolean  = false
    
    let postInstance: string
    let postID: number
    let postURL: string
    
    $:  onHomeInstance, generatePostInstanceAndID()
    

    function generatePostInstanceAndID() {
        postInstance = onHomeInstance
            ? $instance
            : new URL(post.post.ap_id).hostname

        postID = onHomeInstance 
            ? post.post.id
            : Number(new URL(post.post.ap_id).pathname.replace('/post/',''))
        
        postURL = `/post/${postInstance}/${postID}`
    }
</script>


<Button
    href={postURL}
    newtab={$userSettings.openInNewTab.posts && displayType=='feed'}
    size="sm"
    class="!text-inherit {$$props.class}"
    title="{post.counts.comments} Comments {post.unread_comments > 0 ? `(${post.unread_comments} new)` : ''}"
    color="tertiary-border"
    icon={ChatBubbleLeftRight}
    iconSize={20}
    on:click={(e) => {

        if (!inModal && $userSettings.openInNewTab.postsInModal) {
                e.preventDefault()
                e.stopPropagation()
                postViewerModal(postInstance, postID)
                dispatchWindowEvent('requestSnapshot')
                return
        }
        
        if (!($userSettings.openInNewTab.posts && displayType=='feed')) {
            e.preventDefault()
            e.stopPropagation()
            dispatchWindowEvent('clickIntoPost', {post_id: postID})
            goto(postURL)
        }
    }}
>
    <span class="text-xs whitespace-nowrap opacity-80">    
        <FormattedNumber number={post.counts.comments ?? 0} /> 
        <span class="hidden sm:inline">    
            {post.counts.comments == 1 ? 'comment' : 'comments'}
            
            {#if post.unread_comments > 0 && post.counts.comments > post.unread_comments}
                ({post.unread_comments} new)
            {/if}
        </span>
    </span>
    
</Button>
