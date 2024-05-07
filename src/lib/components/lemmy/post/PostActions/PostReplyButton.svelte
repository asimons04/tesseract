<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from '$lib/components/lemmy/post/helpers.js'
    
    import { instance } from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { Icon, ArrowUturnLeft } from 'svelte-hero-icons'

    import Button from '$lib/components/input/Button.svelte'
    

    export let post:PostView
    export let displayType:PostDisplayType
    export let showCommentForm:boolean

    let onHomeInstance: boolean = true
    $: onHomeInstance = ($page.params.instance ?? $instance)  == $instance
</script>

{#if displayType == 'post'}
<Button
    size="sm"
    color="tertiary-border"
    disabled={post.post.locked || !$profile?.user || !onHomeInstance}
    hidden={post.post.locked || !$profile?.user}
    on:click={() => {
        showCommentForm = !showCommentForm;
        // Interval to deal with animiation delay
        setTimeout(() => {
            let commentForm = document.getElementById(`commentForm-${post.post.id}`);
            commentForm?.focus()
        }, 250);

    }}
>
    <Icon src={ArrowUturnLeft} width={14} height={14} mini />
    <span class="text-sm">Reply</span>
</Button>
{/if}