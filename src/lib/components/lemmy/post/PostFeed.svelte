<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import { fade } from 'svelte/transition'
    import { userSettings } from '$lib/settings.js'

    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    
    import { ArchiveBox } from 'svelte-hero-icons'

    export let posts: PostView[]
</script>


<section class="flex flex-col gap-3 sm:gap-4 h-full">
    {#if posts.length == 0}
        <div class="h-full grid place-items-center">
            <Placeholder icon={ArchiveBox} title="No posts" description="There are no posts that match this filter." />
        </div>
    {:else}
        <FeedContainer>
            {#each posts as post, index (post.post.id)}
                {#if 
                    !(post.creator_blocked) && 
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