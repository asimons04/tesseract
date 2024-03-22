<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers.js'

    import { getInstance } from '$lib/lemmy'
    import { userSettings } from '$lib/settings'
    
    import Button from '$lib/components/input/Button.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    
    import {
        Icon,
        ChatBubbleOvalLeftEllipsis
    } from 'svelte-hero-icons'

    export let displayType:PostDisplayType
    export let post:PostView

</script>


<Button
    size="sm"
    href={`/post/${getInstance()}/${post.post.id}`}
    newtab={$userSettings.openInNewTab.posts && displayType=='feed'}
    class="!text-inherit h-8 px-3 border-none relative"
    title="{post.counts.comments} Comments {post.unread_comments > 0 ? `(${post.unread_comments} new)` : ''}"
    color="ghost"
>
    <Icon slot="icon" src={ChatBubbleOvalLeftEllipsis} mini width={16} height={16} />
    <FormattedNumber number={post.counts.comments} />
</Button>