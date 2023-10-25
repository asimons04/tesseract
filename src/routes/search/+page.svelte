<script lang="ts">
    import type {
        CommentView,
        CommunityView,
        PersonView,
        PostView,
    } from 'lemmy-js-client'
    
    import { arrayRange } from '$lib/util.js'
    import { expoInOut, expoOut } from 'svelte/easing'
    import { fly, slide } from 'svelte/transition'
    import {
        isCommentView,
        isCommunityView,
        isPostView,
        isUser,
    } from '$lib/lemmy/item.js'
    
    
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { sortOptions, sortOptionNames } from '$lib/lemmy'
    import { userSettings } from '$lib/settings.js'
    
    
    
    import Button from '$lib/components/input/Button.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    import Comment from '$lib/components/lemmy/comment/Comment.svelte'
    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    import CommunityItem from '$lib/components/lemmy/community/CommunityItem.svelte'
    import ObjectAutocomplete from '$lib/components/lemmy/ObjectAutocomplete.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    import UserItem from '$lib/components/lemmy/user/UserItem.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    
    import { searchParam } from '$lib/util.js'
    
    import { 
        Icon, 
        ArrowSmallRight,
        Bars3,
        ChartBar,
        DocumentDuplicate,
        MagnifyingGlass,
        QueueList
    } from 'svelte-hero-icons'
    
    

    type Result = PostView | CommentView | PersonView | CommunityView

    export let data

    let pageNum = data.page
    let searchParams = {
        query: '',
        community_name: data.community_name ?? '',
        sort: data.sort ?? 'New',
        type: data.type ?? 'All',
        person: undefined,
        limit: 40

    }
    let searchURL = new URL($page.url);

    function search() {
        searchParams.community_name
            ? searchURL.searchParams.set('community_name', searchParams.community_name)
            : searchURL.searchParams.delete('community_name')
        
        searchParams.query
            ? searchURL.searchParams.set('q', searchParams.query)
            : searchURL.searchParams.delete('q')
        
        searchParams.sort
            ? searchURL.searchParams.set('sort', searchParams.sort)
            : searchURL.searchParams.delete('sort')
        
        searchParams.type
            ? searchURL.searchParams.set('type', searchParams.type)
            : searchURL.searchParams.delete('type');

        searchParams.person
            ? searchURL.searchParams.set('person', searchParams.person)
            : searchURL.searchParams.delete('person')

        searchParams.limit
            ? searchURL.searchParams.set('limit', searchParams.limit.toString())
            : searchURL.searchParams.delete('limit')
        
        goto(searchURL, {
            invalidateAll: true,
        })
    }
    
    
</script>

<svelte:head>
    <title>Search</title>
</svelte:head>

<header class="sticky top-16 w-[101%] flex flex-col gap-4 bg-slate-100/80 dark:bg-black/80 backdrop-blur-3xl z-40 mt-[-0.6rem] md:mx-[-0.6rem]">
    <span class="flex flex-row gap-4 items-center font-bold text-sm text-center my-2">
        <!--Home Button-->
        <span class="mt-[-6px] mr-2 cursor-pointer" title="Frontpage"
            on:click={() => {
                searchParams = {
                    query: '',
                    community_name: '',
                    sort: data.sort ?? 'New',
                    type: data.type ?? 'All',
                    person: undefined,
                    limit: 40

                }
                goto(window.location.pathname);
            }}
        >
            <Icon src={MagnifyingGlass} width={24} />
        </span>
        
        <SelectMenu
            alignment="bottom-left"
            options={['All', 'Posts', 'Comments', 'Communities', 'Users']}
            selected={searchParams.type}
            items={0}
            icon={Bars3}
            headless={true}
            class="pb-2"
            on:select={(e) => {
                searchParams.type = e.detail;
            }}
        />
        
        <Icon src={ArrowSmallRight} mini width={24} />
        
        <!---Sort Menu--->
        <SelectMenu
            alignment="bottom-left"
            options={sortOptions}
            optionNames={sortOptionNames}
            selected={searchParams.sort}
            title="Sorting"
            icon={ChartBar}
            on:select={(e) => {
                // @ts-ignore
                searchParams.sort = e.detail;
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
        
        <div class="ml-auto"/>
        
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

    <span class="flex flex-row gap-2 items-center text-sm text-center mx-auto mb-2">
        <!---Filter by User--->
        <ObjectAutocomplete
            placeholder="Filter by User"
            type="person"
            jwt={$profile?.jwt}
            listing_type="All"
            showWhenEmpty={false}
            bind:q={searchParams.person}

            on:select={ (e) => {
                searchParams.person = e.detail.id;
            }}
        />

        <!---Filter by Community--->
        <ObjectAutocomplete
            placeholder="Filter by Community"
            jwt={$profile?.jwt}
            listing_type="All"
            showWhenEmpty={false}
            bind:q={searchParams.community_name}
            
            on:select={ (e) => {
                let communityURL = `${e.detail?.name}@${new URL(e.detail?.actor_id).host}`
                searchParams.community_name = communityURL;
            }}
        />


        <div class="mx-auto" />
        
        <TextInput
            bind:value={searchParams.query}
            placeholder="Search Term(s)"
            type="search"
        />

        <Button
            on:click={() => {
                search();
            }}
            size="lg"
            class="h-full"
            icon={MagnifyingGlass} 
        >
            Search
        </Button>
    </span>
</header>

<div class="p-2 mt-4">
    <h1 class="font-bold text-2xl">Search</h1>


    {#if !data.results}
        <Placeholder
            icon={MagnifyingGlass}
            title="No results"
            description="Search across the fediverse"
        />
    {:else}
        {#await data.streamed.object}
            <div
                class="flex gap-2 items-center mt-4"
                out:slide={{ axis: 'y', easing: expoOut }}
            >
                <Spinner width={24} />
                <span>Federating...</span>
            </div>
        {:then object}

            {#if object}
                <div transition:slide={{ axis: 'y', easing: expoOut }}>
                    {#if object.community}
                        <CommunityItem community={object.community} />
                    {/if}
                    
                    {#if object.post}
                        <Post post={object.post} />
                    {/if}
                    
                    {#if object.comment}
                        <CommentItem comment={object.comment} />
                    {/if}
                    
                    {#if object.person}
                        <UserItem user={object.person} />
                    {/if}
                </div>
            {/if}
        {/await}

        <div class="flex flex-col gap-4 mt-4 sm:max-w-full md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] mx-auto">
            {#each data.results as result}
                {#if isPostView(result)}
                    <Post post={result} />
                {:else if isCommentView(result)}
                    <CommentItem comment={result} />
                {:else if isCommunityView(result)}
                    <CommunityItem community={result} />
                {:else if isUser(result)}
                    <UserItem user={result} />
                {/if}
            {/each}
        </div>
        <div class="mt-4" />
        {#if data.results.length > 0}
            <Pageination
                bind:page={pageNum}
                on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
            />
        {/if}
    {/if}
</div>