<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import { getInstance } from '$lib/lemmy.js'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { userSettings } from '$lib/settings.js'
    
    export let post:PostView

</script>

<a
    href="/post/{getInstance()}/{post.post.id}"
    target="{$userSettings.openInNewTab.posts ? '_blank' : undefined}"
    class="font-medium max-w-full w-full break-words"
    style="word-break: break-word;"
    class:text-slate-500={post.read && $userSettings.markReadPosts}
    class:dark:text-zinc-400={post.read && $userSettings.markReadPosts}
    title="{fixLemmyEncodings(post.post.name)}"
>
    <h1 class="text-base md:text-lg {!post.read || !$userSettings.markReadPosts ? 'font-bold' : ''}">{fixLemmyEncodings(post.post.name)}</h1>    

</a>