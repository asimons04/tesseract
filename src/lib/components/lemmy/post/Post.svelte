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
        type EditPostEvent,
        type FeaturePostEvent,
        type FilterCommunityEvent,
        type FilterUserEvent,
        type HideCommunityEvent,
        type HidePostEvent,
        type LastClickedPostEvent,
        type LockPostEvent,
        type PurgePostEvent, 
        type RemoveCommunityEvent, 
        type RemovePostEvent, 
        type ScrollPostIntoViewEvent, 
        type SubscribeEvent 
    } from '$lib/ui/events'

    import type { PostView } from 'lemmy-js-client'
    import { type PostType, type PostDisplayType, postType as getPostType, sleep, isNewAccount } from './helpers.js'

    import { amMod }                from '../moderation/moderation.js'
    import { fade }                 from 'svelte/transition'
    import { getClient }            from '$lib/lemmy'
    import { onDestroy, onMount }   from 'svelte'
    import { profile }              from '$lib/auth.js'
    import { userIsInstanceBlocked } from '$lib/lemmy/user.js'
    import { userSettings }         from '$lib/settings.js'

    import Button           from '$lib/components/input/Button.svelte'
    import Card             from '$lib/components/ui/Card.svelte'
    import PostIsInViewport from './utils/PostIsInViewport.svelte'
    
    
    // New Post Renderers
    import AudioPost        from '$lib/components/lemmy/post/renderers/AudioPost.svelte'
    import BandcampPost     from '$lib/components/lemmy/post/renderers/BandcampPost.svelte'
    import DailyMotionPost  from '$lib/components/lemmy/post/renderers/DailyMotionPost.svelte'
    import ImagePost        from '$lib/components/lemmy/post/renderers/ImagePost.svelte'
    import LinkPost         from '$lib/components/lemmy/post/renderers/LinkPost.svelte'
    import LoopsPost        from '$lib/components/lemmy/post/renderers/LoopsPost.svelte'
    import OdyseePost       from '$lib/components/lemmy/post/renderers/OdyseePost.svelte'
    import PeerTubePost     from '$lib/components/lemmy/post/renderers/PeerTubePost.svelte'
    import SongLinkPost     from '$lib/components/lemmy/post/renderers/SongLinkPost.svelte'
    import SoundCloudPost   from '$lib/components/lemmy/post/renderers/SoundCloudPost.svelte'
    import SpotifyPost      from '$lib/components/lemmy/post/renderers/SpotifyPost.svelte'
    import TextPost         from '$lib/components/lemmy/post/renderers/TextPost.svelte'
    import TidalPost        from '$lib/components/lemmy/post//renderers/TidalPost.svelte'
    import VideoPost        from '$lib/components/lemmy/post/renderers/VideoPost.svelte'
    import YouTubePost      from '$lib/components/lemmy/post/renderers/YouTubePost.svelte'
    import VimeoPost        from '$lib/components/lemmy/post/renderers/VimeoPost.svelte'
    
    
    
    import { EyeSlash } from 'svelte-hero-icons'


    export let post: PostView                                           // The Post to display
    export let actions: boolean             = true                      // Set to false to disable action buttons (except expand)
    export let displayType: PostDisplayType = "feed"                    // Whether to render the post for the 'feed' or 'post'
    export let forceCompact:boolean         = false                     // Force the post to render in compact view
    export let disablePostLinks:boolean     = false                     // Force the post to be read only by adding 'pointer-events-none'                        
    export let expandCompact: boolean       = computeExpandCompact()    // Not sure if needs exported now? Controls expanding/collapsing a compact post to/from card view
    export let previewing: boolean          = false                     // Used to control margins if previewing
    export let scrollTo:number              = -1                        // The feed can pass a post id (e.g. last seen post) and if the current post's ID matches, it will scroll itself into view
    export let inCommunity: boolean         = false                     // If true, the community avatar and name will be hidden and only show the poster's info/avatar
    export let inProfile: boolean           = false                     // If true, the poster's info/avatar will be hidden and only show that of the community
    export let inModal: boolean             = false
    export let onHomeInstance: boolean      = true
    
    let postContainer: HTMLDivElement | null
    let inViewport      = false
    let postType        = getPostType(post)
    let lastClickedPost = -1
    let postHidden      = false
    let overrideHidePost = false
    let hidePostReason  = ''
    
    $:  post.post.removed, post.post.deleted, post.creator_blocked, post.hidden, post.community.hidden, overrideHidePost, postHidden = shouldHidePost()
    $:  post.post.id, onPostChange()
    
    function onPostChange() {
        postType = getPostType(post)
        applyDummyThumbnail()
    }

    function applyDummyThumbnail() {
        if (!post || post?.post?.thumbnail_url) return

        switch (postType) {
            case 'dailymotion':
                post.post.thumbnail_url = '/img/dailymotion.png'
                break
            case 'youtube':
                post.post.thumbnail_url = '/img/youtube.png'
                break
            case 'loops':
                post.post.thumbnail_url = '/img/loops.png'
                break
        }
       
    }

    function markPostAsRead() {
        if (!post || !inViewport || !onHomeInstance || !$profile?.jwt || post.read || post.post.id < 0) return
        
        if ( (displayType == 'feed' && $userSettings.markReadOnScroll) || displayType == 'post' ) {
            post.read = true
            post = post
            getClient().markPostAsRead({
                read: true,
                post_ids: [ post.post.id ]
            })
        }

        
    }

    // Event Handlers
    const handlers = {

        BanUserEvent: function (e:BanUserEvent) {
            if (post?.creator.id == e.detail.person_id) {
                post.creator.banned = e.detail.banned
                if (e.detail.remove_content) post.post.removed = true
                post = post
            }
        },

        BanCommunityEvent: function (e:BanCommunityEvent) {
            if (post?.creator.id == e.detail.person_id && post.community.id == e.detail.community_id) {
                post.creator_banned_from_community = e.detail.banned
                if (e.detail.remove_content) post.post.removed = true
                post = post
            }
        },

        BlockCommunityEvent: function (e:BlockCommunityEvent) {
            if (post?.community.id == e.detail.community_id) {
                //@ts-ignore - "blocked" is not a valid key for Community type; just kind of shoving it here since we only need true and undefined counts as false
                postHidden = post.community.blocked = e.detail.blocked
            }
        },

        BlockInstanceEvent: function (e:BlockInstanceEvent) {
            if (post?.creator.instance_id == e.detail.instance_id || post?.community.instance_id == e.detail.instance_id) {

                hidePostReason = e.detail.blocked ? "Creator or community is from a blocked instance" : ""
                postHidden = e.detail.blocked
            }
        },

        BlockUserEvent: function (e:BlockUserEvent) {
            if (post?.creator.id == e.detail.person_id) {
                post.creator_blocked = e.detail.blocked
                post = post
            }
        },

        CompactViewChange: function() {
            expandCompact = computeExpandCompact()
        },

        EditPostEvent: function (e:EditPostEvent) {
            if (post?.post.id == e.detail.post.post.id) {
                post = {
                    ...e.detail.post,
                    //@ts-ignore
                    cross_posts: post.cross_posts ? [...post.cross_posts] : undefined,
                    //@ts-ignore
                    mbfc: post.mbfc ? {...post.mbfc} : undefined
                }
            }
        },

        FeaturePostEvent: function (e:FeaturePostEvent) {
            if (post?.post.id == e.detail.post_id) {
                if (e.detail.community_id) post.post.featured_community = e.detail.featured
                else post.post.featured_local = e.detail.featured
                post = post
            }
        },

        FilterCommunityEvent: function (e:FilterCommunityEvent) {
            if (post?.community.actor_id == e.detail.actor_id) {
                overrideHidePost = false
                postHidden = shouldHidePost()
            }
        },

        FilterUserEvent: function (e:FilterUserEvent) {
            if (post?.creator.actor_id == e.detail.actor_id) {
                overrideHidePost = false
                postHidden = shouldHidePost()
            }
        },

        HideCommunityEvent: function (e:HideCommunityEvent) {
            if (post?.community.id == e.detail.community_id) {
                post.community.hidden = e.detail.hidden
                post = post
            }
        },

        HidePostEvent: function(e:HidePostEvent) {
            if (e.detail.post_ids.includes(post?.post.id)) {
                post.hidden = e.detail.hide
                post = post
                if (e.detail.hide) {
                    overrideHidePost = false
                    postHidden = true
                }
            }
        },

        LastClickedPostEvent: function (e:LastClickedPostEvent) {
            lastClickedPost = e.detail.post_id
        },

        LockPostEvent: function (e:LockPostEvent) {
            if (post?.post.id == e.detail.post_id) {
                post.post.locked = e.detail.locked
                post = post
            }
        },

        PurgePostEvent: function (e:PurgePostEvent) {
            if (post?.post.id == e.detail.post_id) {
                post.post.removed = e.detail.purged
                post.post.name = '*Purged*'
                post.post.body = undefined
                post.post.url = undefined
                post.post.thumbnail_url = undefined
                post.post.embed_description = undefined
                post.post.embed_title = undefined
                post.post.featured_community = false
                post.post.featured_local = false
                post = post
            }
        },

        RefreshFeed: function() {
            expandCompact = computeExpandCompact()
        },

        RemoveCommunityEvent: function (e:RemoveCommunityEvent) {
            if (post?.community.id == e.detail.community_id) {
                post.community.removed = e.detail.removed
                post = post
            }
        },

        RemovePostEvent: function (e:RemovePostEvent) {
            if (post?.post.id == e.detail.post_id) {
                post.post.removed = e.detail.removed
                post = post
            }
        },

        ScrollPostIntoView: function (e:LastClickedPostEvent) {
            scrollTo = e.detail.post_id
            scrollIntoView(true)
        },

        SubscribeEvent: function (e:SubscribeEvent) {
            if (post?.community.id == e.detail.community_id) {
                post.subscribed = e.detail.subscribed
                    ? 'Subscribed'
                    : 'NotSubscribed'
                post = post
            }
        },
    }

    async function scrollIntoView(smooth:boolean = false) {
        if (scrollTo == post?.post.id && post?.post.id > 0 && postContainer?.scrollIntoView) {
            if ($userSettings.debugInfo) console.log(moduleName, ": Scrolling post " , post.post.id, "into view via param")
            await sleep(50)
            postContainer.scrollIntoView({
                behavior: smooth ? 'smooth' : 'instant',
                block: 'start'
            })
        }
    }

    /** Determines whether a compact post should be shown expanded to a card if "hybrid" view set. Returns 'true' if post should render as card, 'false' if compact */
    function computeExpandCompact() {
        if (forceCompact) return false
        
        // If view is not set to 'hybrid' return based on 'show compact posts' value
        if ($userSettings.uiState.view != 'hybrid') return !($userSettings.showCompactPosts)


        let result = 
            $userSettings.uiState.hybridViewAsCardTypes.includes(getPostType(post)) && 
            (post?.read && $userSettings.uiState.hybridViewKeepReadCollapsed ? false : true)
                ? true
                : false
        
        return result
    }

    function announceLastClickedPost(post:PostView|undefined|null) {
        if (!post || lastClickedPost == post.post.id) return
        lastClickedPost = post.post.id
        dispatchWindowEvent('lastClickedPost', {post_id: post.post.id})
    }

    function shouldHidePost(): boolean {
        // Safety checks
        if (displayType == 'post' || inProfile || overrideHidePost) return false
        if (post.post.creator_id == $profile?.user?.local_user_view.person.id) return false
        if (amMod($profile?.user, post.community)) return false

        // Creator Blocked
        if (post.creator_blocked) {
            hidePostReason = 'Creator is blocked'
            return true
        }

        // Community Hidden
        if (post.community.hidden) {
            hidePostReason = 'Community is hidden'
            return true
        }

        // Community Blocked (Tacking on a custom key here)
        //@ts-ignore
        if (!inCommunity && post.community.blocked) {
            hidePostReason = 'Community is blocked'
            return true
        }

        // Post Hidden
        if (post.hidden) {
            hidePostReason = 'Post marked as hidden'
            return true
        }

        // Post Deleted
        if ($userSettings.hidePosts.deleted && post.post.deleted) {
            hidePostReason = 'Post is deleted'
            return true
        }

        // Post Removed
        if ($userSettings.hidePosts.removed && post.post.removed) {
            hidePostReason = "Post is removed"
            return true
        }

        // MBFC Low Credibility
        //@ts-ignore
        if ($userSettings.hidePosts.MBFCLowCredibility && post.mbfc?.credibility == 'Low Credibility') {
            hidePostReason = "Post links to low-credibility source"
            return true
        }

        // New Account
        if ($userSettings.hidePosts.newAccounts &&  isNewAccount(post.creator.published) && post.creator.id != $profile?.user?.local_user_view?.person?.id) {
            hidePostReason = "New account"
            return true
        }

        // Blocked Instance
        if ($userSettings.hidePosts.hideUsersFromBlockedInstances && userIsInstanceBlocked($profile?.user, post.creator.instance_id)) {
            hidePostReason = `Creator is from a blocked instance: ${new URL(post.creator.actor_id).hostname}`
            return true
        }

        // Hide content from users without avatars
        if ( $userSettings.hidePosts.usersWithNoAvatar && !post.creator.avatar && !post.creator.bio) {
            hidePostReason = "Creator has blank profile."
            return true
        }

        // Hide content from users in your filter list
        if ($userSettings.hidePosts.userList.includes(post.creator.actor_id)) {
            hidePostReason = `Creator is filtered: ${post.creator.actor_id}`
            return true
        }

        // Hide content from communities in your filter list
        if (!inCommunity && $userSettings.hidePosts.communityList.includes(post.community.actor_id)) {
            hidePostReason = `Community is filtered: ${post.community.actor_id}`
            return true
        }

        // Hide posts containing filtered keywords
        if ($userSettings.hidePosts.keywords) {
            const keywords = $userSettings.hidePosts.keywordList
            let keywordsFound: string[] = []

            for (let i:number = 0; i<keywords.length; i++) {
                let keyword = keywords[i].replace('^', '').replace('*', '').replace('!', '')
                
                if  (
                        post.post.name?.toLowerCase().includes(keyword.toLowerCase()) ||
                        post.post.body?.toLowerCase().includes(keyword.toLowerCase()) ||
                        post.post.embed_description?.toLowerCase().includes(keyword.toLowerCase())
                    ) {
                        keywordsFound.push(keyword.toLowerCase())
                }
            }
            if (keywordsFound.length > 0) {
                hidePostReason = `Contains filtered ${keywordsFound.length == 1 ? 'keyword' : 'keywords'}: ${keywordsFound.toString().replaceAll(',',', ')}`
                return true
            }
        }
        hidePostReason = ''
        return false
    }
    

    onMount(async () =>  {
        await scrollIntoView() 
    })
    
    onDestroy(() => {
        postContainer?.remove()
    })

</script>


<svelte:window 
    on:banUser              = {handlers.BanUserEvent}
    on:banCommunity         = {handlers.BanCommunityEvent}
    on:blockUser            = {handlers.BlockUserEvent} 
    on:blockCommunity       = {handlers.BlockCommunityEvent} 
    on:blockInstance        = {handlers.BlockInstanceEvent}
    on:changeCompactView    = {handlers.CompactViewChange}
    on:editPost             = {handlers.EditPostEvent}
    on:featurePost          = {handlers.FeaturePostEvent}
    on:filterCommunity      = {handlers.FilterCommunityEvent}
    on:filterUser           = {handlers.FilterUserEvent}
    on:hideCommunity        = {handlers.HideCommunityEvent}
    on:hidePost             = {handlers.HidePostEvent}
    on:lockPost             = {handlers.LockPostEvent}
    on:subscribe            = {handlers.SubscribeEvent}
    on:refreshFeed          = {handlers.RefreshFeed}
    on:removeCommunity      = {handlers.RemoveCommunityEvent}
    on:removePost           = {handlers.RemovePostEvent}
    on:purgePost            = {handlers.PurgePostEvent}
    on:lastClickedPost      = {handlers.LastClickedPostEvent}
    on:scrollPostIntoView   = {handlers.ScrollPostIntoView}
/>




{#if postHidden}
    <Card class="flex flex-col px-2 py-1 gap-2 mx-auto opacity-70 w-full
        {($userSettings.uiState.feedMargins && displayType=='feed' && !inModal) || (displayType=='post' && !inModal && previewing) ? 'max-w-3xl' : '' }
        "
    >
        <div class="flex flex-row gap-1 items-start w-full p-1">
            <div class="w-[42px]">
                <Button color="tertiary" size="square-lg" icon={EyeSlash} iconSize={28} 
                    title="Show Hidden Post"
                    on:click={async () => { overrideHidePost = true }}
                />
            </div>
            <div class="flex flex-col w-[calc(100%-48px)] gap-0 text-xs font-normal">
                <span class="font-bold">Post Hidden</span>
                <span>{hidePostReason}</span>
            </div>
        </div>
    </Card>

{:else}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div class="relative" 
    id={post.post.id.toString()} 
    on:mouseover={() => announceLastClickedPost(post) } 
    on:touchstart={() => announceLastClickedPost(post) } 
    bind:this={postContainer}
    transition:fade
>
    <PostIsInViewport bind:postContainer threshold={.4} delay={1000} on:inViewport={(e) => {
            inViewport = e.detail
            setTimeout(() => markPostAsRead(), 1500)
        }}
    />


    <Card class="flex flex-col px-2 py-1 gap-2 mx-auto
            {disablePostLinks ? 'pointer-events-none list-none' : ''}
            {($userSettings.uiState.feedMargins && displayType=='feed' && !inModal) || (displayType=='post' && !inModal && previewing) ? 'max-w-3xl' : 'w-full' }
        "
        cardColor={
            (post.post.removed || post.post.deleted)
                ? 'error'
                : (post.post.featured_community || post.post.featured_local)
                    ? 'success'
                    : 'default'
        }
    >    
        {#if postType ==  'audio'}
            <AudioPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />

        {:else if postType == 'bandcamp'}
            <BandcampPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />
        
        {:else if postType == 'dailymotion'}
            <DailyMotionPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply/>

        {:else if postType == 'image'}    
            <ImagePost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} compact={!expandCompact} on:reply />

        {:else if ['link', 'thumbLink'].includes(postType)}
            <LinkPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} compact={!expandCompact} on:reply />
        
        {:else if postType == 'loops'}
            <LoopsPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />

        {:else if postType == 'odysee'}
            <OdyseePost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />

        {:else if postType == 'peertube'}
            <PeerTubePost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />

        {:else if postType == 'songlink'}
            <SongLinkPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />

        {:else if postType == 'soundcloud'}    
            <SoundCloudPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />

        {:else if postType == 'spotify'}
            <SpotifyPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />
        

        {:else if postType == 'text'}
            <TextPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} compact={!expandCompact} on:reply />

        {:else if postType == 'tidal'}
            <TidalPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />

        {:else if postType == 'video'}
            <VideoPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />
        
        {:else if postType == 'vimeo'}
            <VimeoPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />
        
        {:else if postType == 'youtube'}
            <YouTubePost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} {inViewport} compact={!expandCompact} on:reply />
        
        <!---If all else fails, render it as a text post--->
        {:else}
            <TextPost bind:post {actions} {displayType} {postType}  {inCommunity} {inModal}  {onHomeInstance}  {inProfile} compact={!expandCompact} on:reply />
        {/if}


    
    </Card>

</div>
{/if}