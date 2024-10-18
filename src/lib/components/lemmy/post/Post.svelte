<script lang="ts">
    import type { 
        BanCommunityEvent, 
        BanUserEvent, 
        BlockCommunityEvent, 
        BlockInstanceEvent, 
        BlockUserEvent, 
        PurgePostEvent, 
        RemovePostEvent, 
        SubscribeEvent 
    } from '$lib/ui/events'

    import type { PostView } from 'lemmy-js-client'
    import { type PostType, type PostDisplayType, postType as getPostType } from './helpers.js'

    import { fade } from 'svelte/transition'
    import { getClient, site } from '$lib/lemmy'
    import { lastSeenPost } from './helpers.js'
    import { profile } from '$lib/auth.js'
    import { userSettings } from '$lib/settings.js'

    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'
    import PostCompactStyle from '$lib/components/lemmy/post/PostCompactStyle.svelte';
    import PostIsInViewport from './utils/PostIsInViewport.svelte'

    export let post: PostView | undefined
    export let actions: boolean = true
    export let autoplay:boolean = false;
    export let displayType: PostDisplayType = "feed"
    export let forceCompact:boolean = false;
    export let disablePostLinks:boolean = false
    export let collapseBadges:boolean = false;
    
    export let expandCompact: boolean = false

    let expandPreviewText:boolean
    let postContainer: HTMLDivElement
    let inViewport = false


    let postType = getPostType(post)
    
    $: post, postType = getPostType(post)

    $:  inViewport, setTimeout(() => markPostAsRead(), 1500)

    function markPostAsRead() {
        if (
            (
                (displayType == 'feed' && $userSettings.markReadOnScroll) || displayType == 'post'
            )
            && post && !post.read && $profile?.jwt && inViewport
        ) {
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

    
</script>


<svelte:window 
    on:banUser={handleBanInstance}
    on:banCommunity={handleBanCommunity}
    on:blockUser={handleUserBlock} 
    on:blockCommunity={handleCommunityBlock} 
    on:blockInstance={handleInstanceBlock}
    on:subscribe={handleSubscribeUnsubscribe}
    on:removePost={handleRemovePost}
    on:purgePost={handlePurgePost}

/>

<PostIsInViewport bind:postContainer bind:inViewport threshold={.8}/>

{#if post?.post?.id}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <div class="relative" 
        id={post.post.id.toString()} on:mouseover={() => { 
            if (post) lastSeenPost.set(post.post.id)
        }} 
        
        on:touchstart={() => {
            if (post) lastSeenPost.set(post.post.id) 
        }} 
        bind:this={postContainer}
        transition:fade
    >

        <!--- Compact Posts --->
        <!---{#if  (forceCompact || ($userSettings.showCompactPosts && !expandCompact && displayType=='feed')) }--->
        {#if  (forceCompact || ($userSettings.showCompactPosts && !expandCompact )) }
            <PostCompactStyle {actions} {displayType} {disablePostLinks} {collapseBadges}
                bind:post 
                bind:expandCompact 
                bind:expandPreviewText  
                bind:postContainer  
                on:reply
            />


        <!--- Card Posts --->
        {:else}
            <PostCardStyle {actions} {displayType}  {autoplay} loop={$userSettings.embeddedMedia.loop} {collapseBadges} 
                bind:post 
                bind:expandCompact 
                bind:expandPreviewText  
                bind:postContainer
                on:reply
                
            />
        {/if}
    </div>
{/if}