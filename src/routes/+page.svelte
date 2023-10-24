<script lang="ts">
    import { getSessionStorage, setSessionStorage } from '$lib/session'
    import { afterNavigate, disableScrollHandling } from '$app/navigation';
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
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
    
    export let data
</script>

<svelte:head>
    <title>{data.site.site_view.site.name}</title>
</svelte:head>

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full px-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
        
        <header>
            <span class="flex flex-row gap-4 items-center font-bold text-sm text-center mx-auto">
                {data.listingType} > {data.sort} > Page {data.page}
                
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
      
            <div class="flex flex-col hidden md:block">
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
            </div>


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

    <div class="mt-[-8px] mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins}/>
    </div>
</div>
