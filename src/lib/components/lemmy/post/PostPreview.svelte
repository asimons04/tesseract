<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'


    import { userSettings } from '$lib/settings.js'

    import PostCardStyle from '$lib/components/lemmy/post/PostCardStyle.svelte'

    export let post: PostView
    export let actions: boolean = true
    export let autoplay:boolean = false;
    export let displayType: PostDisplayType = "feed"
    export let collapseBadges:boolean = false;

    let postContainer: HTMLDivElement

</script>

{#if post?.post?.id}
    <PostCardStyle  {post} {actions} {postContainer} {displayType}  {autoplay} loop={false} {collapseBadges} />
{/if}