<script lang="ts">
    import type { PostDisplayType, PostType } from '../helpers.js'
    import type { PostView } from 'lemmy-js-client'

    import Crossposts   from '$lib/components/lemmy/post/components/Crossposts.svelte'
    import PostActions  from '$lib/components/lemmy/post/components/PostActions.svelte'
    import PostBody     from '$lib/components/lemmy/post/components/PostBody.svelte'
    import PostMeta     from '$lib/components/lemmy/post/components/PostMeta.svelte'

    // Standard for all post types
    export let post:PostView
    export let actions: boolean             = true
    export let inCommunity                  = false
    export let inProfile                    = false
    export let displayType: PostDisplayType = 'feed'
    export let postType: PostType           = 'text'
    export let compact: boolean             = true
    export let inModal: boolean             = false
    export let onHomeInstance: boolean      = false
    
    let expandPreviewText:boolean
</script>

<PostMeta bind:post showTitle={true} {actions} {postType} {inCommunity} {inProfile} {inModal} {onHomeInstance} {compact} on:toggleCompact={() => compact = !compact} />
<PostBody bind:post bind:expandPreviewText {displayType}  />
<Crossposts bind:post size="xs" {onHomeInstance} class="mb-1 !pl-0"/>
<PostActions bind:post {inModal} {displayType} {onHomeInstance} on:reply class="mt-2" />