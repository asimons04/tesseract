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
    export let flairs: boolean = true
    // Extract any [flairs] from the post title and update the title to remove them.
    let postName: string = post.post.name
    let postFlairs:string[] = []
    $:  {
            let {name, flairs} = extractFlairsFromTitle(post.post.name)
            postName = postName = name
            postFlairs = postFlairs = flairs
        }

</script>



<a
    href="/post/{getInstance()}/{post.post.id}"
    target="_blank"
    on:click={ 
        (
            //@ts-ignore
            e
        ) => {
            // Use goto instead of href to avoid occasionally reloading the whole app on page transition
            if (!$userSettings.openInNewTab.posts) { 
                e.preventDefault()
                e.stopPropagation()
                goto(`/post/${getInstance()}/${post.post.id}`) 
            }
        }
    }
    class="flex flex-row flex-wrap items-start gap-2 {$userSettings.showCompactPosts ? 'md:mt-4' : ''} font-medium max-w-full w-full break-words text-left"
    style="word-break: break-word;"
    class:text-slate-500={isPostView(post) && post.read && $userSettings.markReadPosts}
    class:dark:text-zinc-200={isPostView(post) && post.read && $userSettings.markReadPosts}
    title="{fixLemmyEncodings(post.post.name)}"
>

    <h1 class="flex flex-row flex-wrap gap-0 items-start text-base md:text-lg mb-1  {(isPostView(post) && !post.read) || !$userSettings.markReadPosts ? 'font-bold' : ''}">
        <Markdown source={postName} noUserCommunityLink  noHashtags/>
        
        {#if flairs}
            <span class="mr-2" />
            {#each postFlairs as flair, idx}
                <Badge randomColor  class="capitalize mb-1 mr-2" icon={Tag} rightJustify={false}
                    on:click={(e) => { 
                        e.preventDefault()
                        e.stopPropagation()
                        goto(`/search?type=Posts&q=${encodeURIComponent(`[${flair}]`)}`)
                    }}
                >
                    {flair}
                </Badge>
            {/each}
        {/if}
    </h1>
</a>


