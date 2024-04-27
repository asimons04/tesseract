<script lang="ts">
    import type { Community } from 'lemmy-js-client'    
    import { clearLastSeenCommunity, getLastSeenCommunity } from '$lib/components/lemmy/community/helpers.js';
    import { getSessionStorage, setSessionStorage } from '$lib/session.js'
    import { goto } from '$app/navigation'
    import { onMount } from 'svelte'    
    import { profile } from '$lib/auth.js'
    import { site } from '$lib/lemmy'
    
    
    import PostForm from '$lib/components/lemmy/post/PostForm.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte';
    

    export let data

    onMount(() => {
        if (!$profile?.jwt) {
            goto('/login')
        }
    })

    let draft = getSessionStorage('postDraft') as any
</script>

<svelte:head>
    <title>Create Post</title>
</svelte:head>

<SubNavbar home back toggleMargins toggleCommunitySidebar />

<MainContentArea>
    <FeedContainer>
            <h1 class="text-2xl font-bold">Create Post</h1>
            <PostForm crosspostData={data.crosspost ? draft : undefined}
                on:submit={(e) => goto(`/post/${e.detail.post.id}`)}
            />
    </FeedContainer>

    <div class="h-full" slot="right-panel">
        {#if $site }
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version} />
        {/if}

    </div>
</MainContentArea>