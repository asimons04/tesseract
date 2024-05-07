<script lang="ts">
    import type { CommentReplyView, PersonMentionView, PostView } from 'lemmy-js-client'
    import { getInstance } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { fixLemmyEncodings, isPostView } from '$lib/components/lemmy/post/helpers'
    import { userSettings } from '$lib/settings.js'
    
    export let post:PostView | CommentReplyView | PersonMentionView

</script>

{#if $userSettings.openInNewTab.posts}
    <a
        href="/post/{getInstance()}/{post.post.id}"
        target="_blank"
        class="font-medium max-w-full w-full break-words text-left"
        style="word-break: break-word;"
        class:text-slate-500={isPostView(post) && post.read && $userSettings.markReadPosts}
        class:dark:text-zinc-400={isPostView(post) && post.read && $userSettings.markReadPosts}
        title="{fixLemmyEncodings(post.post.name)}"
    >
        <h1 class="text-base md:text-lg {(isPostView(post) && !post.read) || !$userSettings.markReadPosts ? 'font-bold' : ''}">{fixLemmyEncodings(post.post.name)}</h1>    
    </a>
{:else}
    <button
        on:click={ () => goto(`/post/${getInstance()}/${post.post.id}`) }
        class="font-medium max-w-full w-full break-words text-left"
        style="word-break: break-word;"
        class:text-slate-500={isPostView(post) && post.read && $userSettings.markReadPosts}
        class:dark:text-zinc-400={isPostView(post) &&post.read && $userSettings.markReadPosts}
        title="{fixLemmyEncodings(post.post.name)}"
    >
        <h1 class="text-base md:text-lg {(isPostView(post) && !post.read) || !$userSettings.markReadPosts ? 'font-bold' : ''}">{fixLemmyEncodings(post.post.name)}</h1>    
    </button>
{/if}

