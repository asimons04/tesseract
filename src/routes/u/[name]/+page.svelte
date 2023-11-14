<script lang="ts">
    import { arrayRange, searchParam } from '$lib/util.js'
    import { goto } from '$app/navigation'
    import { isCommentView } from '$lib/lemmy/item.js'
    import { page } from '$app/stores'
    import { userSettings } from '$lib/settings.js'

    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'

    import {
        ArrowSmallRight,
        Bars3,
        ChartBar,
        DocumentDuplicate,
        Home,
        Icon,
        PencilSquare,
        ShieldCheck,
        QueueList,
        UserCircle,
        Window
    } from 'svelte-hero-icons'
    

    export let data
    export let userSideCard = true
</script>

<svelte:head>
  <title>{data.person_view.person.name}</title>
</svelte:head>


<div class="flex flex-col-reverse xl:flex-row gap-4 max-w-full w-full">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">



        {#if data.items.length == 0}
            <Placeholder
                icon={PencilSquare}
                title="No submissions"
                description="This user has no submissions that match this filter."
            />
        {:else}
            <header class="sticky top-16 w-full backdrop-blur-3xl z-20 mt-[-0.5rem] px-2">
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
                        
                        <!---Listing Type--->
                        <SelectMenu
                            alignment="bottom-left"
                            options={['all', 'posts', 'comments']}
                            optionNames={['All', 'Posts', 'Comments']}
                            selected={data.type}
                            title="Listing Type"
                            icon={Bars3}
                            on:select={(e) => {
                                // @ts-ignore
                                searchParam($page.url, 'type', e.detail, 'page')
                            }}
                        />
                        
                        <Icon src={ArrowSmallRight} mini width={24} />
                        
                        <!---Sort Menu--->
                        <SelectMenu
                            alignment="bottom-left"
                            options={['New', 'TopAll', 'Old']}
                            optionNames={['New', 'Top', 'Old']}
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
                        <span class="mr-2 cursor-pointer" title="Switch to {$userSettings.showCompactPosts ? 'card view' : 'compact view'}."
                            on:click={() => {
                                $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                            }}
                        >
                            <Icon src={$userSettings.showCompactPosts ? Window : QueueList} width={24} />
                        </span>

                    </span>
            </header>
            
            <div class="w-full sm:w-full md:w-[80%] lg:w-[90%] xl:w-[75%] flex flex-col gap-5 ml-auto mr-auto">
                {#each data.items as item (item.counts.id)}
                    {#if isCommentView(item) && (data.type == 'all' || data.type == 'comments')}
                        <CommentItem comment={item} />
                    {:else if !isCommentView(item) && (data.type == 'all' || data.type == 'posts')}
                        <Post post={item} />
                    {/if}
                {/each}
            </div>
        {/if}
    
        <Pageination
            page={data.page}
            on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
        />
    </div>
    
    {#if userSideCard}
        <div>
            <UserCard person={data.person_view} />
        </div>
    {/if}
</div>
