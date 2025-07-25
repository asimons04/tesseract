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
    import { goto } from '$app/navigation'
    import { instance } from '$lib/instance'
    import { userSettings } from '$lib/settings.js'
    
    import Badge    from '$lib/components/ui/Badge.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    
    import { 
        BugAnt, 
        ExclamationCircle, 
        HandRaised, 
        LockClosed, 
        Megaphone, 
        NoSymbol, 
        Tag, 
        Trash 
    } from 'svelte-hero-icons'
    

    export let post:PostView | CommentReplyView | PersonMentionView
    export let postType: PostType
    export let flairs: boolean          = true
    export let inModal: boolean         = false
    export let onHomeInstance: boolean  = false
    export let hideBadges: boolean      = false
    export let inCommunity: boolean     = false

    // Extract any [flairs] from the post title and update the title to remove them.
    let postName: string    = post.post.name
    let postFlairs:string[] = []
    let postInstance: string
    let postID: number
    let postURL: string
    
    $:  onHomeInstance, generatePostInstanceAndID()
    $:  post.post.name, processPostTitle()

    function generatePostInstanceAndID() {
        postInstance = onHomeInstance
            ? $instance
            : new URL(post.post.ap_id).hostname

        postID = onHomeInstance 
            ? post.post.id
            : Number(new URL(post.post.ap_id).pathname.replace('/post/',''))
        
        postURL = `/post/${postInstance}/${postID}`
    }
    

    function processPostTitle() {
        let {name, flairs} = extractFlairsFromTitle(post.post.name.trim())
        postName = postName = name
        postFlairs = postFlairs = flairs
    }
</script>

<!---Regular link that opens in new tab by default.  Other options and states change that default behavior and prevent the default behavior if triggered--->
<a href={postURL} target="_blank" title="{fixLemmyEncodings(post.post.name)}" style="word-break: break-word;"
    class="flex flex-row flex-wrap items-start gap-2 font-medium max-w-full w-full break-words text-left"
    on:click={ (
        //@ts-ignore
        e ) => {
            // If not already in modal and the setting to open posts in modals is enabled, open the modal viewer.
            if (!inModal && $userSettings.openInNewTab.postsInModal) {
                e.preventDefault()
                e.stopPropagation()
                postViewerModal(postInstance, postID)
                dispatchWindowEvent('requestSnapshot')
                return
            }
            // Use goto instead of href to avoid occasionally reloading the whole app on page transition
            if (!$userSettings.openInNewTab.posts) { 
                e.preventDefault()
                e.stopPropagation()
                dispatchWindowEvent('clickIntoPost', {post_id: postID})
                dispatchWindowEvent('requestSnapshot')
                goto(postURL)
                return
            }
        }
    }
>
    <h1 class="flex flex-row flex-wrap gap-0 items-start text-base md:text-lg mb-1 font-bold {(isPostView(post) && post.read && $userSettings.markReadPosts) ? 'opacity-80' : ''}">
        <Markdown source={postName} noUserCommunityLink  noHashtags noLink/>
        
        <span class="mr-2" />
        
        <!---Debug Flair with the Post Type--->
        {#if $userSettings.debugInfo}
            <Badge label={postType} color="gray" class="mb-1 mr-2" icon={BugAnt} click={true} rightJustify={false}
                on:click={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    debugModal(post)
                }}
            >
                <span class="text-xs capitalize">{postType}</span>
            </Badge>
        {/if}
        
        <!---NSFW Flair--->
        {#if post.post.nsfw}
            <Badge label="NSFW" color="red" class="mb-1 mr-2" icon={ExclamationCircle} click={false} rightJustify={false}>
                <span class="text-xs">NSFW</span>
            </Badge>
        {/if}

        <!---User-Defined Flairs--->
        {#if flairs}
            {#each postFlairs as flair, idx}
                <Badge randomColor  class="capitalize mb-1 mr-2 !max-w-[25ch]" icon={Tag} rightJustify={false}
                    label="{flair}"
                    on:click={(e) => { 
                        e.preventDefault()
                        e.stopPropagation()
                        if (inCommunity) goto(`/search?type=Posts&community_id=${post.community.id}&q=${encodeURIComponent(`[${flair}]`)}`)
                        else goto(`/search?type=Posts&q=${encodeURIComponent(`[${flair}]`)}`)
                    }}
                >
                    {flair}
                </Badge>
            {/each}
        {/if}

        <!---Post State Flairs (Formerly Post Badges--->
        {#if !hideBadges}
            
            <!---Post Locked--->
            {#if post.post.locked}
                <Badge label="Locked" color="yellow" icon={LockClosed} click={false} rightJustify={false} class="mb-1 mr-2">
                    Locked  
                </Badge>
            {/if}
            
                      
            <!---Post Removed--->
            {#if post.post.removed}
                <Badge label="Removed" color="red" icon={HandRaised} click={true} rightJustify={false} class="mb-1 mr-2"
                    on:click={(e) => { 
                        e.preventDefault()
                        e.stopPropagation()
                        goto(`/modlog?post_id=${post.post.id}`)
                    }}
                >
                    Removed by Mod
                </Badge>
            {/if}
            
            <!---Post Deleted--->
            {#if post.post.deleted}
                <Badge label="Deleted" color="red" icon={Trash} click={false} rightJustify={false} class="mb-1 mr-2">
                    Deleted by Creator
                </Badge>
            {/if}
            
            <!---Featured--->
            {#if (post.post.featured_local || post.post.featured_community)}
                <Badge label="Featured" color="green" icon={Megaphone} click={false} rightJustify={false}  class="mb-1 mr-2">
                    Featured
                </Badge>
            {/if}
        {/if}
    </h1>
</a>


