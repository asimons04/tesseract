<script lang="ts">
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'

    export let data

</script>

{#if data}
    <PostFeed posts={data.posts} />

{/if}