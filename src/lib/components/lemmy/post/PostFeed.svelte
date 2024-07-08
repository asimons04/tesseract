<script lang="ts">
    import type { BlockCommunityEvent, BlockUserEvent } from '$lib/ui/events.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { amMod } from '../moderation/moderation';
    import { fade } from 'svelte/transition'
    import { isNewAccount } from './helpers'
    import { profile } from '$lib/auth';
    import { userSettings } from '$lib/settings.js'

    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    
    import { ArchiveBox } from 'svelte-hero-icons'
    
    

    export let posts: PostView[]

    

    // Handlers for custom window event that's raised when a user or community is blocked. Used to show/hide posts in the feed
    
    function handleCommunityBlock(e:BlockCommunityEvent) {
        console.log("Received 'blockCommunity' event: ", e);

        for (let i:number=0; i < posts.length; i++) {
            
            if (posts[i].community.id == e.detail.community_id) {
                // Setting the creator_blocked will hide the post; there's no key for `community_blocked`
                posts[i].creator_blocked = e.detail.blocked
            }
        }
        posts = posts
    }

    function handleUserBlock(e:BlockUserEvent) {
        console.log("Received 'blockUser' event: ", e);

        for (let i:number=0; i < posts.length; i++) {
            
            if (posts[i].creator?.id == e.detail.person_id) {
                posts[i].creator_blocked = e.detail.blocked
            }
        }
        posts = posts
    }

    
</script>

<svelte:window on:blockUser={handleUserBlock} on:blockCommunity={handleCommunityBlock}/>

<section class="flex flex-col gap-3 sm:gap-4 h-full">
    {#if posts.length == 0}
        <Placeholder icon={ArchiveBox} title="No posts" description="There are no posts that match this filter." />
    {:else}
        <FeedContainer>
            {#each posts as post, index (post.post.id)}
                {#if 
                    !(post.creator_blocked) && 
                    
                    // Optionally hide posts from new users if you are not a mod of that community or if the community is local and you are an admin
                    // Don't hide if it is your own post and your account is new
                    !(
                        $userSettings.hidePosts.newAccounts &&  isNewAccount(post.creator.published) &&
                        post.creator.id != $profile?.user?.local_user_view?.person?.id && !amMod($profile?.user, post.community)
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