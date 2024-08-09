<script lang="ts">
    import type { 
        BanCommunityEvent, 
        BanUserEvent, 
        BlockCommunityEvent, 
        BlockInstanceEvent, 
        BlockUserEvent, 
        SubscribeEvent 
    } from '$lib/ui/events'
    import type { PostView } from 'lemmy-js-client'
    
    import { amMod } from '../moderation/moderation';
    import { fade } from 'svelte/transition'
    import { isNewAccount } from './helpers'
    import { profile } from '$lib/auth';
    import { userSettings } from '$lib/settings.js'
    import { userIsInstanceBlocked } from '$lib/lemmy/user'

    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    
    import { ArchiveBox } from 'svelte-hero-icons'
    
    

    export let posts: PostView[]

    

    // Handlers for custom window event that's raised when a user or community is blocked. Used to show/hide posts in the feed
    function handleBanCommunity(e:BanCommunityEvent) {
        for (let i:number=0; i < posts.length; i++) {
            if (posts[i].creator.id == e.detail.person_id && posts[i].community.id == e.detail.community_id) {
                posts[i].creator_banned_from_community = e.detail.banned
                posts[i].post.removed = e.detail.remove_content
            }
        }
        posts = posts
    }

    function handleBanInstance(e:BanUserEvent) {
        for (let i:number=0; i < posts.length; i++) {
            if (posts[i].creator.id == e.detail.person_id) {
                posts[i].creator.banned = e.detail.banned
                posts[i].post.removed = e.detail.remove_content
            }
        }
        posts = posts
    }


    function handleCommunityBlock(e:BlockCommunityEvent) {
        for (let i:number=0; i < posts.length; i++) {
            
            if (posts[i].community.id == e.detail.community_id) {
                // Setting the creator_blocked will hide the post; there's no key for `community_blocked`
                posts[i].creator_blocked = e.detail.blocked
            }
        }
        posts = posts
    }

    function handleInstanceBlock(e:BlockInstanceEvent) {
        for (let i:number=0; i < posts.length; i++) {
            
            if (posts[i].creator.instance_id == e.detail.instance_id || posts[i].community.instance_id == e.detail.instance_id) {
                // Setting the creator_blocked will hide the post; there's no key for `instance_blocked`
                posts[i].creator_blocked = e.detail.blocked
            }
        }
        posts = posts
    }

    function handleUserBlock(e:BlockUserEvent) {
        for (let i:number=0; i < posts.length; i++) {
            
            if (posts[i].creator?.id == e.detail.person_id) {
                posts[i].creator_blocked = e.detail.blocked
            }
        }
        posts = posts
    }

    function handleSubscribeUnsubscribe(e:SubscribeEvent) {
        for (let i:number=0; i < posts.length; i++) {
            if(posts[i].community.id == e.detail.community_id) {
                posts[i].subscribed = e.detail.subscribed
                    ? 'Subscribed'
                    : 'NotSubscribed'
            }
        }
        posts = posts
    }

    
</script>

<svelte:window 
    on:banUser={handleBanInstance}
    on:banCommunity={handleBanCommunity}
    on:blockUser={handleUserBlock} 
    on:blockCommunity={handleCommunityBlock} 
    on:blockInstance={handleInstanceBlock}
    on:subscribe={handleSubscribeUnsubscribe}
/>

<section class="flex flex-col gap-3 sm:gap-4 h-full">
    {#if posts.length == 0}
        <Placeholder icon={ArchiveBox} title="No posts" description="There are no posts that match this filter." />
    {:else}
        <FeedContainer>
            {#each posts as post, index (post.post.id)}
                {#if 
                    !(post.creator_blocked) && 
                    !(
                        // "or" conditions that should qualify the post to be hidden in the feed unless you're a mod of the community it's posted to
                        // or a local admin and the community is local
                        (
                            // Hide posts from new accounts (if they are not your own posts)
                            ($userSettings.hidePosts.newAccounts &&  isNewAccount(post.creator.published) && post.creator.id != $profile?.user?.local_user_view?.person?.id) ||
                            
                            // Hide posts from users whose instances you have blocked
                            ($userSettings.hidePosts.hideUsersFromBlockedInstances && userIsInstanceBlocked($profile?.user, post.creator.instance_id))
                        ) 
                        // Safety check to ensure moderators and local admins will see the posts for moderation purposes
                        && (!amMod($profile?.user, post.community))
                    ) &&
                    
                    !($userSettings.hidePosts.deleted && post.post.deleted) && 
                    !($userSettings.hidePosts.removed && post.post.removed) &&
                    //@ts-ignore
                    !($userSettings.hidePosts.MBFCLowCredibility && post.mbfc?.credibility == 'Low Credibility')
                }
                    <div transition:fade>
                        <Post bind:post={post} displayType="feed" />
                    </div>
                {/if}
            {/each}
        </FeedContainer>
    {/if}
</section>