<script lang="ts">
    
    
    import { afterNavigate, beforeNavigate, disableScrollHandling, goto } from '$app/navigation';
    import { page } from '$app/stores'
    import { arrayRange, searchParam } from '$lib/util.js'
    import { getSessionStorage, setSessionStorage } from '$lib/session'
    import { scrollToTop } from '$lib/components/lemmy/post/helpers'
    import { sortOptions, sortOptionNames } from '$lib/lemmy'
    import { userSettings } from '$lib/settings'

    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import PostFeed from '$lib/components/lemmy/post/PostFeed.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    
    import { 
        Icon, 
        ArchiveBox,
        ArrowSmallRight,
        Bars3,
        ChartBar,
        DocumentDuplicate,
        Home,
        QueueList,
    } from 'svelte-hero-icons'


    export let data
    console.log(data);

    // Hack to deal with Svelte not returning to the correct spot when returning to the post.
    afterNavigate(() => {
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
            // Use default scroll handling
            disableScrollHandling();
            window.scrollTo(0,0);
        }
    });

</script>

<div class="flex flex-col-reverse  xl:flex-row gap-4 max-w-full w-full">

    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">

        <header class="sticky top-16 w-full rounded-md bg-white/25 dark:bg-black/25 backdrop-blur-3xl z-20 mt-[-0.4rem] px-2">
            <span class="flex flex-row gap-2 items-center font-bold text-sm text-center mx-auto my-2 mr-2">
                
                <!--Home Button-->
                <span class="mt-[-6px] mr-2 cursor-pointer" title="Frontpage"
                    on:click={() => {
                        goto('/', {invalidateAll: true});
                        window.scrollTo(0,0);
                    }}
                >
                    <Icon src={Home} width={24} />
                </span>

                <!---Listing Type
                <SelectMenu
                    alignment="bottom-left"
                    options={['Subscribed', 'Local', 'All']}
                    selected={data.listingType}
                    title="Listing Type"
                    icon={Bars3}
                    on:select={(e) => {
                        // @ts-ignore
                        searchParam($page.url, 'type', e.detail, 'page')
                    }}
                />
                
                <Icon src={ArrowSmallRight} mini width={24} />
                --->
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
                
                <span class="hidden md:flex md:flex-row gap-2 items-center">
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


            </span>
        </header>
        
        {#if data}
            {#if data.posts.length > 0}
                <PostFeed posts={data.posts} />
            {:else}
                <Placeholder
                    icon={ArchiveBox}
                    title="No posts"
                    description="There's nothing here. Have you favorited any communities?"
                />
            {/if}
            
            <div class="mt-auto px-2">
                <Pageination
                    page={data.page}
                    on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
                />
            </div>
        {/if}
    </div>

    <div class="mt-[-8px] mb-[-24px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins}/>
    </div>
</div>