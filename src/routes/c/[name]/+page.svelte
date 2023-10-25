<script lang="ts">
    
    import { afterNavigate, disableScrollHandling, goto } from '$app/navigation';
    import { arrayRange, fullCommunityName, searchParam } from '$lib/util.js'
    import { getSessionStorage, setSessionStorage } from '$lib/session.js'
    import { onDestroy, onMount } from 'svelte'
    import { page } from '$app/stores'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    import { sortOptions, sortOptionNames } from '$lib/lemmy'
    import { userSettings } from '$lib/settings.js'
    
    
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import Sort from '$lib/components/lemmy/Sort.svelte'

    import {
        ArrowSmallRight,
        Bars3,
        ChartBar,
        DocumentDuplicate,
        Icon,
        QueueList,
        UserGroup
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

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        <header class="sticky top-16 w-[101%] bg-slate-100/80 dark:bg-black/80 z-20 backdrop-blur-3xl mt-[-0.6rem] md:mx-[-0.5rem]">
            <span class="flex flex-row gap-2 items-center font-bold text-sm text-center mx-auto my-2 mr-2">
                
                <!--Return to Base community page-->
                <span class="mt-[-6px] mr-2 cursor-pointer" title="{data.community.community_view.community.title}"
                    on:click={() => {
                        goto(window.location.pathname);
                    }}
                >
                    <Icon src={UserGroup} width={24} />
                </span>
                
                <!---Sort Menu--->
                <SelectMenu
                    alignment="bottom-left"
                    options={sortOptions}
                    optionNames={sortOptionNames}
                    selected={data.sort}
                    title="Sort Direction"
                    icon={ChartBar}
                    on:select={(e) => {
                        // @ts-ignore
                        searchParam($page.url, 'sort', e.detail, 'page')
                    }}
                />
                
                                    
                
                <Icon src={ArrowSmallRight} mini width={24} />
                
                <!---Page Selection--->
                <SelectMenu
                    alignment="bottom-left"
                    options={arrayRange(1, data.page +1)}
                    selected={data.page}
                    title="Page"
                    icon={DocumentDuplicate}
                    on:select={(e) => {
                        // @ts-ignore
                        searchParam($page.url, 'page', e.detail.toString())
                    }}
                />

                <span class="ml-auto"/>
                
                <!---Card/Compact Selection--->
                <SelectMenu
                    alignment="bottom-right"
                    title="Post Display Type"
                    icon={QueueList}
                    options={['Cards', 'Compact']}
                    selected={$userSettings.showCompactPosts
                        ? 'Compact'
                        : 'Cards'
                    }
                    on:select={(e) => {
                        $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                    }}
                />


            </span>
        </header>
        
        <PostFeed posts={data.posts.posts}/>
        
        <Pageination
            page={data.page}
            on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
        />
    </div>

    <div class="mt-[8px]">
        <CommunityCard community_view={data.community.community_view} moderators={data.community.moderators}/>
    </div>
</div>
