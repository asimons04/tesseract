<script lang="ts">
    import type { CommentReplyView, PersonMentionView, PostView } from 'lemmy-js-client'
    import { 
        extractFlairsFromTitle,
        fixLemmyEncodings, 
        isPostView 
    } from '$lib/components/lemmy/post/helpers'
    import { getInstance } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { userSettings } from '$lib/settings.js'
    
    import Badge from '$lib/components/ui/Badge.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    
    import { Tag } from 'svelte-hero-icons'

    export let post:PostView | CommentReplyView | PersonMentionView

    // Extract any [flairs] from the post title and update the title to remove them.
    let postName: string = post.post.name
    let postFlairs:string[] = []
    $:  {
            let {name, flairs} = extractFlairsFromTitle(post.post.name)
            postName = postName = name
            postFlairs = postFlairs = flairs
        }

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
        <h1 class="text-base md:text-lg  {(isPostView(post) && !post.read) || !$userSettings.markReadPosts ? 'font-bold' : ''}">
            {postName}
        </h1>

        <!---Flairs--->
        <span class="flex flex-row flex-wrap gap-2 ml-auto text-xs">
            {#each postFlairs as flair, idx}
                <Badge randomColor  class="capitalize" icon={Tag} rightJustify={false}
                    on:click={(e) => { 
                        e.preventDefault()
                        e.stopPropagation()
                        goto(`/search?type=Posts&q=${encodeURIComponent(`[${flair}]`)}`)
                    }}
                >
                    {flair}
                </Badge>
            {/each}
        </span>
    </a>
{:else}
    <button
        on:click={ () => goto(`/post/${getInstance()}/${post.post.id}`) }
        class="flex flex-row flex-wrap items-center gap-2 font-medium max-w-full w-full break-words text-left"
        style="word-break: break-word;"
        class:text-slate-500={isPostView(post) && post.read && $userSettings.markReadPosts}
        class:dark:text-zinc-400={isPostView(post) &&post.read && $userSettings.markReadPosts}
        title="{fixLemmyEncodings(post.post.name)}"
    >

        <h1 class="text-base md:text-lg  {(isPostView(post) && !post.read) || !$userSettings.markReadPosts ? 'font-bold' : ''}">
            <Markdown source={postName} />
        </h1>

         <!---Flairs--->
         <span class="flex flex-row flex-wrap gap-2 ml-auto text-xs">
            {#each postFlairs as flair, idx}
                <Badge randomColor  class="capitalize" icon={Tag} rightJustify={false}
                    on:click={(e) => { 
                        e.preventDefault()
                        e.stopPropagation()
                        goto(`/search?type=Posts&q=${encodeURIComponent(`[${flair}]`)}`)
                    }}
                >
                    {flair}
                </Badge>
            {/each}
        </span>

    </button>
{/if}

