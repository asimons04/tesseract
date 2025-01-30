<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers.js'
    
    import { createEventDispatcher } from 'svelte'
    import { instance } from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { Icon, ArrowUturnLeft } from 'svelte-hero-icons'

    import Button from '$lib/components/input/Button.svelte'
    

    export let post:PostView
    export let displayType:PostDisplayType
    export let onHomeInstance: boolean = false

    let dispatcher = createEventDispatcher()
</script>

{#if displayType == 'post'}
<Button
    size="sm"
    color="tertiary-border"
    disabled={post.post.locked || post.post.removed || post.post.deleted || !$profile?.user || !onHomeInstance}
    hidden={post.post.locked || !$profile?.user}
    icon={ArrowUturnLeft}
    iconSize={18}
    on:click={() => { dispatcher('reply') }}
>
    <span class="text-sm">Reply</span>
</Button>
{/if}