<script lang="ts">
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import Button from '$lib/components/input/Button.svelte'
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import { fly } from 'svelte/transition'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import { ArchiveBox, Icon, Plus } from 'svelte-hero-icons'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import { profile } from '$lib/auth.js'
    import Sort from '$lib/components/lemmy/Sort.svelte'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'

    export let data
    let sidebar = false

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
                {data.site.site_view.site.name} | Frontpage
            </span>
        </header>

        <div class="xl:hidden">
            <!---<Button on:click={() => (sidebar = !sidebar)}>About</Button>--->
        </div>

        <div class="flex flex-row gap-4 max-w-full w-full justify-between flex-wrap px-2">
            <MultiSelect
                options={['Subscribed', 'Local', 'All']}
                disabled={[$profile?.jwt == undefined]}
                selected={data.listingType}
                on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
                headless={true}
                items={0}
            />
      
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
            />


            <Sort selected={data.sort} headless={true}  items={0}/>
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
