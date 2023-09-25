<script lang="ts">
    import { page } from '$app/stores'
    import { goto } from '$app/navigation'
    import { userSettings } from '$lib/settings.js'
    import Badge from '$lib/components/ui/Badge.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'

    import Link from '$lib/components/input/Link.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Card from '$lib/components/ui/StickyCard.svelte'
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'

    import Button from '$lib/components/input/Button.svelte'
    import { Color } from '$lib/ui/colors'
    import { fly } from 'svelte/transition'

    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Sort from '$lib/components/lemmy/Sort.svelte'
    import { fullCommunityName, searchParam } from '$lib/util.js'
    import { onDestroy, onMount } from 'svelte'
    import { setSessionStorage } from '$lib/session.js'


    export let data
    
    
    onMount(() => {
        setSessionStorage('lastSeenCommunity', {
            id: data.community.community_view.community.id,
            name: fullCommunityName(
                data.community.community_view.community.name,
                data.community.community_view.community.actor_id
            ),
        })
    })
</script>

<svelte:head>
    <title>{data.community.community_view.community.title}</title>

    <meta
        name="og:title"
        content={data.community.community_view.community.title}
    />
    {#if data.community.community_view.community.description}
        <meta
            name="og:description"
            content={data.community.community_view.community.description}
        />
    {/if}
</svelte:head>

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full px-2">
    <div class="flex flex-col gap-3 sm:gap-4 max-w-full w-full min-w-0">
        
        <!--- Community Metadata -- Hide when sidebar reflows as it would be redundant--->
        <div class="flex flex-row gap-3 items-center hidden xl:block">
            <Avatar
                width={48}
                url={data.community.community_view.community.icon}
                alt={data.community.community_view.community.name}
            />
            <div class="flex flex-col gap-0 w-full">
                <h1 class="font-bold text-xl flex flex-row justify-between">
                    {data.community.community_view.community.title.replace('&amp;', '&')}

                    {#if data.community.community_view.community.nsfw && $userSettings.tagNSFWCommunities}
                        <Badge color="red">NSFW</Badge>
                    {/if}
                </h1>
                <span class="dark:text-zinc-400 text-slate-600 text-sm">
                    !{data.community.community_view.community.name}@{new URL(
                        data.community.community_view.community.actor_id
                    ).hostname}
                </span>
            </div>
        </div>
    
        <div class="flex flex-col sm:flex-row gap-4 max-w-full w-full">
            <div class="flex flex-row gap-4 max-w-full w-full justify-between flex-wrap">
                <Sort selected={data.sort} headless={true} items={0}/>

                <MultiSelect
                    options={['Cards', 'Compact']}
                    selected={$userSettings.showCompactPosts
                        ? 'Compact'
                        : 'Cards'
                    }
                    on:select={(e) => {
                        $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                    }}
                    headless={true}
                />
            </div>
        </div>

        <PostFeed posts={data.posts.posts} />
        
        <Pageination
            page={data.page}
            on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
        />
    </div>

    <div class="mt-[-8px]">
        <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators}/>
    </div>
</div>
