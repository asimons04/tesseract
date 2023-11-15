<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import { userSettings } from '$lib/settings.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { ArchiveBox, Icon, Plus } from 'svelte-hero-icons'

    export let posts: PostView[]
</script>

{#if posts.length == 0}
    <div class="h-full grid place-items-center">
        <Placeholder
            icon={ArchiveBox}
            title="No posts"
            description="There are no posts that match this filter."
        >
        </Placeholder>
    </div>
{:else}
    <div class="w-full {$userSettings.uiState.feedMargins ? 'sm:w-full md:w-[85%] lg:w-[90%] xl:w-[75%]' : ''}
        ml-auto mr-auto flex flex-col gap-5
        "
    >
    {#each posts as post, index (post.post.id)}
        {#if 
                !($userSettings.hidePosts.deleted && post.post.deleted) && 
                !($userSettings.hidePosts.removed && post.post.removed) &&
                !($userSettings.hidePosts.MBFCLowCredibility && post.mbfc?.credibility == 'Low Credibility')
        }
            <Post bind:post={post} displayType="feed"/>
        {/if}
    {/each}
    </div>
{/if}
