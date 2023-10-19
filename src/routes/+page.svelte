<script lang="ts">

    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'
   
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import Sort from '$lib/components/lemmy/Sort.svelte'
   
    import {
        Bars3,
        ChartBar,
        Icon,
        QueueList
    } from 'svelte-hero-icons'
    
    
    export let data
</script>

<svelte:head>
    <title>{data.site.site_view.site.name}</title>
</svelte:head>

<div class="flex flex-row gap-4 w-full h-full">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        <header>
            <span class="flex flex-row gap-4 items-center font-bold text-xl text-center mx-auto pl-3 pt-4">
                {#if data.site.site_view.site.icon}
                    <Avatar circle={false} width={48} url={data.site.site_view.site.icon} />
                {/if}
                Frontpage
            </span>
        </header>
        
        <div class="flex flex-row gap-4 max-w-full w-full justify-between flex-wrap px-2">
            <MultiSelect
                options={['Subscribed', 'Local', 'All']}
                disabled={[$profile?.jwt == undefined]}
                selected={data.listingType}
                on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
                headless={true}
                fullWidth={true}
                items={0}
            >
                <Icon src={Bars3} mini width={16} slot="icon"/>
                <span slot="label">List Type</span>
            </MultiSelect>
      
            <MultiSelect
                options={['Cards', 'Compact']}
                selected={$userSettings.showCompactPosts
                    ? 'Compact'
                    : 'Cards'
                }
                on:select={(e) => {
                    $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                }}
                items={0}
                headless={true}
                fullWidth={true}
            >
                <Icon src={QueueList} mini width={16} slot="icon"/>
                <span slot="label">Display Type</span>
            </MultiSelect>


            <Sort selected={data.sort} headless={true}  fullWidth={true} items={0}>
                <Icon src={ChartBar} mini width={16} slot="icon"/>
                <span slot="label">Sort Direction</span>
            </Sort>
        </div>

        <section class="flex flex-col gap-3 sm:gap-4 h-full">
            <PostFeed posts={data.posts.posts} />
        </section>

        <div class="mt-auto px-2">
            <Pageination
                page={data.page}
                on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
            />
        </div>
    </div>

    <div class="hidden xl:block mt-[-8px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins}/>
    </div>
</div>
