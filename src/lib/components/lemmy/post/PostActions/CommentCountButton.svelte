<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers.js'

    import { dispatchWindowEvent } from '$lib/ui/events';
    import { getInstance } from '$lib/lemmy'
    import { userSettings } from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    
    import {
        ChatBubbleOvalLeftEllipsis
    } from 'svelte-hero-icons'
    import { goto } from '$app/navigation';
    

    export let displayType:PostDisplayType
    export let post:PostView

</script>


<Button
    size="md"
    href={`/post/${getInstance()}/${post.post.id}`}
    newtab={$userSettings.openInNewTab.posts && displayType=='feed'}
    class="!text-inherit h-8 px-3 {$$props.class}"
    title="{post.counts.comments} Comments {post.unread_comments > 0 ? `(${post.unread_comments} new)` : ''}"
    color="tertiary"
    icon={ChatBubbleOvalLeftEllipsis}
    iconSize={22}
    on:click={(e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatchWindowEvent('clickIntoPost', {post_id: post.post.id}) 
        goto(`/post/${getInstance()}/${post.post.id}`)
    }}
>
    <FormattedNumber number={post.counts.comments} />
</Button>
