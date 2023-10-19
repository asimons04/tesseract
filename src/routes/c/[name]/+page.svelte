<script lang="ts">
    
    import { afterNavigate, disableScrollHandling } from '$app/navigation';
    import { fullCommunityName, searchParam } from '$lib/util.js'
    import { getSessionStorage, setSessionStorage } from '$lib/session.js'
    import { onDestroy, onMount } from 'svelte'
    import { page } from '$app/stores'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import Sort from '$lib/components/lemmy/Sort.svelte'

    import {
        Bars3,
        ChartBar,
        Icon,
        QueueList
    } from 'svelte-hero-icons'

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

    // Hack to deal with Svelte not returning to the correct spot when returning to the post.
    afterNavigate(async () => {
        let postID:number|undefined = getSessionStorage('lastClickedPost')?.postID
        if (postID) {
            let postDiv = document.getElementById(postID.toString())
            if (postDiv) {
                disableScrollHandling();
                scrollToTop(postDiv, false);
                setSessionStorage('lastClickedPost', undefined);
            }
        }
        else {
            window.scrollTo(0,0);
        }
    });
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

                <!--Sort Direction-->
                <Sort selected={data.sort} headless={true} fullWidth={true} items={0}>
                    <Icon src={ChartBar} mini width={16} slot="icon"/>
                    <span slot="label">Sort Direction</span>
                </Sort>
                
                <!--Card/Compact View-->
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
                    fullWidth={true}
                    items={0}
                >
                    <Icon src={QueueList} mini width={16} slot="icon"/>
                    <span slot="label">Display Type</span>
                </MultiSelect>
            </div>
        </div>

        <PostFeed posts={data.posts.posts} />
        
        <Pageination
            page={data.page}
            on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
        />
    </div>

    <div class="mt-[8px]">
        <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators}/>
    </div>
</div>
