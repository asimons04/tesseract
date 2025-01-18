<script lang="ts">
    import type { PostDisplayType } from '../helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import Crossposts from '../components/Crossposts.svelte'
    import PostActions from '../PostActions.svelte'
    import PostBody from '../components/PostBody.svelte'
    import PostMeta from '../components/PostMeta.svelte'

    // Standard for all post types
    export let post:PostView
    export let actions: boolean = true
    export let inCommunity = false
    export let inProfile = false
    export let displayType: PostDisplayType = 'feed'
    export let collapseBadges = false
    export let postType = 'text'
    export let inViewport = true
    export let compact: boolean = true
</script>

<PostMeta bind:post showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} {compact} on:toggleCompact={() => compact = !compact} />
<PostBody bind:post {displayType}  />
<Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
<PostActions bind:post {displayType} on:reply class="mt-2" />