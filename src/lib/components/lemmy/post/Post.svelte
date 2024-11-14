<script context="module">
    const moduleName = 'Post.svelte';
</script>

<script lang="ts">
    import { 
        dispatchWindowEvent,
        type BanCommunityEvent, 
        type BanUserEvent, 
        type BlockCommunityEvent, 
        type BlockInstanceEvent, 
        type BlockUserEvent, 
        type FeaturePostEvent,
        type HideCommunityEvent,
        type LastClickedPostEvent,
        type LockPostEvent,
        type PurgePostEvent, 
        type RemoveCommunityEvent, 
        type RemovePostEvent, 
        type ScrollPostIntoViewEvent, 
        type SubscribeEvent 
    } from '$lib/ui/events'

    import type { PostView } from 'lemmy-js-client'
    import { type PostType, type PostDisplayType, postType as getPostType, sleep } from './helpers.js'

    import { fade } from 'svelte/transition'
    import { getClient } from '$lib/lemmy'
    import { profile } from '$lib/auth.js'
    import { userSettings } from '$lib/settings.js'

    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'
    import PostCompactStyle from '$lib/components/lemmy/post/PostCompactStyle.svelte';
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    import { onMount } from 'svelte';

    export let post: PostView | undefined
    export let actions: boolean = true
    export let autoplay:boolean = false;
    export let displayType: PostDisplayType = "feed"
    export let forceCompact:boolean = false;
    export let disablePostLinks:boolean = false
    export let collapseBadges:boolean = false;
    export let expandCompact: boolean = computeExpandCompact()

    export let scrollTo:number = -1
    export let inCommunity: boolean = false
    export let inProfile: boolean = false

    let expandPreviewText:boolean
    let postContainer: HTMLDivElement
    let inViewport = false
    let postType = getPostType(post)
    let lastClickedPost = -1
    
    $:  debugMode = $userSettings.debugInfo
    $:  post, postType = getPostType(post)
    $:  inViewport, setTimeout(() => markPostAsRead(), 1500)
    $:  post, applyDummyThumbnail()
    
    function applyDummyThumbnail() {
        if (!post || post?.post?.thumbnail_url) return
        
        let pType = getPostType(post)
        
        switch (pType) {
            case 'dailymotion':
                post.post.thumbnail_url = '/img/dailymotion.png'
                break
            case 'youtube':
                post.post.thumbnail_url = '/img/youtube.png'
                break
        }
       
    }

    function markPostAsRead() {
        if (!post || !inViewport || !$profile?.jwt || post.read) return
        
        if ( (displayType == 'feed' && $userSettings.markReadOnScroll) || displayType == 'post' ) {
            post.read = true
            post = post
            getClient().markPostAsRead({
                read: true,
                post_ids: [ post.post.id ]
            })
        }

        
    }

    function handleBanInstance(e:BanUserEvent) {
        if (post?.creator.id == e.detail.person_id) {
            post.creator.banned = e.detail.banned
            if (e.detail.remove_content) post.post.removed = true
            post = post
        }
    }

    function handleBanCommunity(e:BanCommunityEvent) {
        if (post?.creator.id == e.detail.person_id && post.community.id == e.detail.community_id) {
            post.creator_banned_from_community = e.detail.banned
            if (e.detail.remove_content) post.post.removed = true
            post = post
        }
    }

    function handleUserBlock(e:BlockUserEvent) {
        if (post?.creator.id == e.detail.person_id) {
            post.creator_blocked = e.detail.blocked

            post = post
        }
    }

    function handleLockPost(e:LockPostEvent) {
        if (post?.post.id == e.detail.post_id) {
            post.post.locked = e.detail.locked
            post = post
        }
    }

    function handleFeaturePost(e:FeaturePostEvent) {
        if (post?.post.id == e.detail.post_id) {
            if (e.detail.community_id) post.post.featured_community = e.detail.featured
            else post.post.featured_local = e.detail.featured
            post = post
        }
    }

    function handleCommunityBlock(e:BlockCommunityEvent) {
        if (post?.community.id == e.detail.community_id) {
            post.community.hidden = e.detail.blocked
            post = post
        }
    }

    function handleInstanceBlock(e:BlockInstanceEvent) {
        if (post?.creator.instance_id == e.detail.instance_id || post?.community.instance_id == e.detail.instance_id) {
            post.creator_blocked = e.detail.blocked
            post = post
        }
    }

    function handleSubscribeUnsubscribe(e:SubscribeEvent) {
        if (post?.community.id == e.detail.community_id) {
                post.subscribed = e.detail.subscribed
                    ? 'Subscribed'
                    : 'NotSubscribed'
            post = post
        }
    }

    function handleRemovePost(e:RemovePostEvent) {
        if (post?.post.id == e.detail.post_id) {
            post.post.removed = e.detail.removed
            post = post
        }
    }

    function handlePurgePost(e:PurgePostEvent) {
        if (post?.post.id == e.detail.post_id) {
            post.post.removed = e.detail.purged
            post.post.name = '*Purged*'
            post.post.body = ''
            post.post.url = ''
            post.post.thumbnail_url = ''
            post.post.embed_description = ''
            post.post.embed_title = ''
            post.post.featured_community = false
            post.post.featured_local = false
        }
    }
   
   function handleHideCommunity(e:HideCommunityEvent) {
        if (post?.community.id == e.detail.community_id) {
            post.community.hidden = e.detail.hidden
            post = post
        }
    }

    function handleRemoveCommunity(e:RemoveCommunityEvent) {
        if (post?.community.id == e.detail.community_id) {
            post.community.removed = e.detail.removed
            post = post
        }
    }

    function handleRefreshFeed() {
        expandCompact = computeExpandCompact()
    }

    function handleCompactViewChange() {
        expandCompact = computeExpandCompact()
    }


    async function scrollIntoView(smooth:boolean = false) {
        if (scrollTo == post?.post.id && postContainer?.scrollIntoView) {
            if (debugMode) console.log(moduleName, ": Scrolling post " , post.post.id, "into view via param")
            await sleep(50)
            postContainer.scrollIntoView({
                behavior: smooth ? 'smooth' : 'instant',
                block: 'start'
            })
        }
    }

    onMount(async () => await scrollIntoView() )

    /** Determines whether a compact post should be shown expanded to a card if "hybrid" view set. Returns 'true' if post should render as card, 'false' if compact */
    function computeExpandCompact() {
        // If view is not set to 'hybrid' return based on 'show compact posts' value
        if ($userSettings.uiState.view != 'hybrid') return !($userSettings.showCompactPosts)

        let result = 
            $userSettings.uiState.hybridViewAsCardTypes.includes(getPostType(post)) && 
            (post?.read && $userSettings.uiState.hybridViewKeepReadCollapsed ? false : true)
                ? true
                : false
        
        return result
    }

    function announceLastClickedPost(post:PostView|undefined) {
        if (!post || lastClickedPost == post.post.id) return
        lastClickedPost = post.post.id
        //lastSeenPost.set(post.post.id)
        dispatchWindowEvent('lastClickedPost', {post_id: post.post.id})
    }

    function handleLastClickedPostEvent(e:LastClickedPostEvent) {
        lastClickedPost = e.detail.post_id
    }

    function handleScrollPostIntoView(e:LastClickedPostEvent) {
        scrollTo = e.detail.post_id
        scrollIntoView(true)
    }
</script>


<svelte:window 
    on:banUser={handleBanInstance}
    on:banCommunity={handleBanCommunity}
    on:blockUser={handleUserBlock} 
    on:blockCommunity={handleCommunityBlock} 
    on:blockInstance={handleInstanceBlock}
    on:changeCompactView={handleCompactViewChange}
    on:featurePost={handleFeaturePost}
    on:hideCommunity={handleHideCommunity}
    on:lockPost={handleLockPost}
    on:subscribe={handleSubscribeUnsubscribe}
    on:refreshFeed={handleRefreshFeed}
    on:removeCommunity={handleRemoveCommunity}
    on:removePost={handleRemovePost}
    on:purgePost={handlePurgePost}
    on:lastClickedPost={handleLastClickedPostEvent}
    on:scrollPostIntoView={handleScrollPostIntoView}
/>

<PostIsInViewport bind:postContainer bind:inViewport threshold={.6}/>

{#if post?.post?.id}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <div class="relative" 
        id={post.post.id.toString()} 
        on:mouseover={() => announceLastClickedPost(post) } 
        on:touchstart={() => announceLastClickedPost(post) } 
        bind:this={postContainer}
        transition:fade
    >

        <!--- Compact Posts --->
        {#if  (forceCompact || !expandCompact) }
            <PostCompactStyle {actions} {displayType} {disablePostLinks} {collapseBadges} {postType} {inCommunity} {inProfile}
                bind:post 
                bind:expandCompact 
                bind:expandPreviewText  
                bind:postContainer
                on:reply
            />


        <!--- Card Posts --->
        {:else}
            <PostCardStyle {actions} {displayType}  {autoplay} loop={$userSettings.embeddedMedia.loop} {collapseBadges} {inCommunity} {inProfile}
                bind:post 
                bind:expandCompact 
                bind:expandPreviewText  
                bind:postContainer
                on:reply
                
            />
        {/if}
    </div>
{/if}