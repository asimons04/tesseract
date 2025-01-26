<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers.js'

    import { dispatchWindowEvent } from '$lib/ui/events';
    import { getInstance } from '$lib/lemmy'
    import { goto } from '$app/navigation'
    import { userSettings } from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    
    import { ChatBubbleLeftRight } from 'svelte-hero-icons'

    export let displayType:PostDisplayType
    export let post:PostView

</script>


<Button
    size="sm"
    class="!text-inherit {$$props.class}"
    title="{post.counts.comments} Comments {post.unread_comments > 0 ? `(${post.unread_comments} new)` : ''}"
    color="tertiary-border"
    icon={ChatBubbleLeftRight}
    iconSize={20}
    on:click={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if ($userSettings.openInNewTab.posts && displayType=='feed') window.open(`/post/${getInstance()}/${post.post.id}`)
        else {
            dispatchWindowEvent('clickIntoPost', {post_id: post.post.id})
            goto(`/post/${getInstance()}/${post.post.id}`)
        }
    }}
>
    <span class="text-xs opacity-80">    
        <FormattedNumber number={post.counts.comments ?? 0} /> 
        <span class="hidden sm:inline">    
            {post.counts.comments == 1 ? 'comment' : 'comments'}
            
            {#if post.unread_comments > 0 && post.counts.comments > post.unread_comments}
                ({post.unread_comments} new)
            {/if}
        </span>
    </span>
    
</Button>
