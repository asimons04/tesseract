<script lang="ts">
    import type { CommentReplyView, PersonMentionView, PostView } from 'lemmy-js-client'
    
    import { dispatchWindowEvent } from '$lib/ui/events.js'
    import { 
        extractFlairsFromTitle,
        fixLemmyEncodings, 
        isPostView, 
        type PostType

    } from '$lib/components/lemmy/post/helpers'
    
    import { debugModal, postViewerModal } from '$lib/components/lemmy/moderation/moderation'
    import { getInstance } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { instance } from '$lib/instance'
    import { userSettings } from '$lib/settings.js'
    
    import Badge from '$lib/components/ui/Badge.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    
    import { BugAnt, ExclamationCircle, Tag } from 'svelte-hero-icons'
    

    export let post:PostView | CommentReplyView | PersonMentionView
    export let postType: PostType
    export let flairs: boolean      = true
    export let inModal: boolean     = false

    // Extract any [flairs] from the post title and update the title to remove them.
    let postName: string = post.post.name
    let postFlairs:string[] = []
    $:  {
            let {name, flairs} = extractFlairsFromTitle(post.post.name.trim())
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
            if (!inModal && $userSettings.openInNewTab.postsInModal) {
                e.preventDefault()
                e.stopPropagation()
                postViewerModal($instance, post.post.id)
                return
            }
            // Use goto instead of href to avoid occasionally reloading the whole app on page transition
            if (!$userSettings.openInNewTab.posts) { 
                e.preventDefault()
                e.stopPropagation()
                goto(`/post/${getInstance()}/${post.post.id}`) 
                dispatchWindowEvent('clickIntoPost', {post_id: post.post.id})
            }
        }
    }
    class="flex flex-row flex-wrap items-start gap-2 font-medium max-w-full w-full break-words text-left"
    style="word-break: break-word;"
    title="{fixLemmyEncodings(post.post.name)}"
>

    <h1 class="flex flex-row flex-wrap gap-0 items-start text-base md:text-lg mb-1 font-bold {(isPostView(post) && post.read && $userSettings.markReadPosts) ? 'opacity-90' : ''}">
        <Markdown source={postName} noUserCommunityLink  noHashtags noLink/>
        
        
        <span class="mr-2" />
        
        {#if $userSettings.debugInfo}
            <Badge label={postType} color="gray" class="mb-1 mr-2" icon={BugAnt} click={true} 
                on:click={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    debugModal(post)
                }}
            >
                <span class="text-xs capitalize">{postType}</span>
            </Badge>
        {/if}
        
        {#if post.post.nsfw}
            <Badge label="NSFW" color="red" class="mb-1 mr-2" icon={ExclamationCircle} click={false}>
                <span class="text-xs">NSFW</span>
            </Badge>
        {/if}

        {#if flairs}
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


