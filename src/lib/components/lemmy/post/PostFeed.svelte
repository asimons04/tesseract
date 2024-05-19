<script lang="ts">
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
</script>


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