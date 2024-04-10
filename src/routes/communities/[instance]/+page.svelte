<script lang="ts">
    import type { CommunityView } from 'lemmy-js-client'

    import { addSubscription } from '$lib/lemmy/user.js'
    import { goto } from '$app/navigation'
    import { instance as homeInstance} from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { validateInstance } from '$lib/lemmy.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    //import Subscribe from '../Subscribe.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import {
        Bars3,
        CalendarDays,
        ChartBar,
        ChatBubbleOvalLeftEllipsis,
        Icon,
        InformationCircle,
        LockClosed,
        MagnifyingGlass,
        PencilSquare,
        QuestionMarkCircle,
        UserGroup,
        XCircle
    } from 'svelte-hero-icons'
    
    import { load } from './+page'
    

    export let data
    
    //let instance: string = ''
    let validating: boolean = false
    
    let communityInfoModal:boolean = false
    let selectedCommunity:CommunityView

    let searchParams = {
        query: data.query,
        sort: data.sort,
        page: data.page,
        type: data.type,
        instance: data.instance,
    }

    let searching = false

    async function search() {
        /*
        validating = true
        const reValidated = await validateInstance(searchParams.instance.trim())
        if (!reValidated) {
            toast({
                content: 'Could not contact that instance URL.',
                type: 'error',
                title: "Error"

            })
            validating = false
            return
        }
        */
        
        data.communities = []
        searching = true
        
        const searchURL = new URL(window.location.href)
        if (searchParams.query) searchURL.searchParams.set('q', searchParams.query)
        if (searchParams.sort)  searchURL.searchParams.set('sort', searchParams.sort)
        if (searchParams.page)  searchURL.searchParams.set('page', searchParams.page.toString())
        if (searchParams.type)  searchURL.searchParams.set('type', searchParams.type)
        if (searchParams.instance)  searchURL.searchParams.set('instance', searchParams.instance)
        else searchURL.searchParams.set('instance', $homeInstance)
        
        // Construct the expected request object for the page's load function
        const req = {
            url: searchURL,
            //params: {
            //    instance: searchParams.instance
            //}
        }

        const results = await load(req)
        data = results
        searching = false
    }

</script>

<svelte:head>
    <title>Communities at {data.site.site_view.site.name}</title>
</svelte:head>

<Modal bind:open={communityInfoModal}>
    <div class="flex flex-col gap-2 mx-auto">
        {#if selectedCommunity.community}
            <CommunityLink
                showInstance={true}
                avatar
                avatarSize={96}
                heading={true}
                community={selectedCommunity.community}
            />
           
            {#if selectedCommunity.community?.description}
                <h1 class="font-bold text-xl">About Community</h1>
                <hr class="border-slate-300 dark:border-zinc-800 my-1" />
                <Markdown source={selectedCommunity.community?.description} />
            {/if}
        {/if}
    </div>

</Modal>

<SubNavbar home scrollButtons  toggleCommunitySidebar >
    <div class="flex flex-row gap-1 md:gap-2 items-center" let:iconSize slot="far-left">
        <SelectMenu
            options={
                data.instance == $homeInstance
                ?  ['Subscribed', 'Local', 'All']
                :  ['Local', 'All']
            }
            selected={searchParams.type}
            on:select={(e) => searchParams.type = e.detail}
            title="Listing Type"
            icon={Bars3}
        />
        
        <SelectMenu
            options={["asc", "desc", "posts_desc", "subscribers_desc"]}
            optionNames={["A-Z", "Z-A", "Most Posts", "Most Subscribers"]}
            selected={searchParams.sort}
            on:select={(e) => { searchParams.sort = e.detail} }
            title="Sort Direction"
            icon={ChartBar}
            containerClass="min-w-[200px]"
        />
    </div>

    
    <div class="hidden xl:flex flex-row gap-0" let:iconSize slot="center">
        <div class="mx-auto">
            <TextInput bind:value={searchParams.instance} placeholder={searchParams.instance} focus={false} class="w-full"
                on:input={() => {
                    data.instance = data.instance.toLowerCase().replaceAll(' ', '')
                }}
            />
        </div>
        
        <form class="flex flex-row gap-0 items-center mx-auto"
            on:submit={async (e) => {
                e.preventDefault();
                await search()
            }}
        >
            <TextInput type="search" placeholder="Search Communities" bind:value={searchParams.query}

            />

            <Button submit color="tertiary">
                <Icon src={MagnifyingGlass} mini width={iconSize} />
                Browse
            </Button>

            <!---Reset Search Button
            <Button color="tertiary" size="sm" title="Clear Search" on:click={() => resetSearch() } >
                <Icon src={XCircle} mini width={iconSize-2}/>
            </Button>
            --->
        </form>

        
    </div>
    


</SubNavbar>

<MainContentArea>
    
    <span class="flex flex-row gap-4 items-center font-bold text-xl text-center mx-auto pl-3">
        {#if data.site.site_view.site.icon}
            <Avatar circle={false} width={48} url={data.site.site_view.site.icon} />
        {/if}
        <h1 class="text-2xl font-bold">Communities {searchParams.type == 'All' ? 'Known to' : 'At'} {data.site.site_view.site.name}</h1>
    </span>

    
    <p class="text-slate-600 dark:text-zinc-400 mt-2">
        Browse the communities on {data.site.site_view.site.name}.  By default, only communities local to this instance are shown.  You can switch the type to "All"
        and browse/search all communities known to {data.site.site_view.site.name}.  
    </p>

    <hr class="border-slate-300/50 my-2"/>

    {#if data.communities.length == 0 && searching}
        <div class="flex gap-2 items-center mx-auto mt-4" >
            <Spinner width={48} />
            <span>Searching...</span>
        </div>
    {/if}


    <ul class="flex flex-col divide-y dark:divide-zinc-800">
        {#if data.communities.length == 0 && !searching}
            <div class="text-slate-600 dark:text-zinc-400 flex flex-col justify-center items-center py-8">
                <Icon src={QuestionMarkCircle} size="32" solid />
                <h1 class="font-bold text-2xl">No communities</h1>
                <p class="mt-2 text-center">
                    There are no communities with that name. Try refining your search.
                </p>
            </div>
        {/if}

        {#each data.communities as community}
            <li class="py-3">
                <div class="flex flex-col gap-1 text-sm max-w-full">
                    
                    <div class="flex flex-row items-center">
                        <div class="flex flex-col">
                            <span class="break-words  text-base font-bold text-sky-400 hover:underline">
                                <CommunityLink
                                    showInstance={false}
                                    avatar
                                    community={community.community}
                                />
                            </span>
                            
                            <span class="opacity-80 text-xs ml-[2.1rem]">
                                !{community.community.name}@{new URL(community.community.actor_id).hostname}
                            </span>
                        </div>
                        
                        <!-- If community has a description, show an 'About' button-->
                        {#if community.community.description}
                            <div class="ml-auto">
                                <Button
                                    on:click={ () => {
                                        selectedCommunity = community;
                                        communityInfoModal = true
                                    }}
                                    color="primary"
                                >
                                    <Icon src={InformationCircle} mini size="14"/>
                                </Button>
                            </div>
                        {/if}
                    </div>

                    <!--- Icons/Counts Row --->
                    <div class="flex flex-row gap-3 mt-2 items-center ml-[2.1rem]">
                        
                        <!---Community Created Date (Relative) --->
                        <div class="flex flex-row gap-1 items-center">
                            <Icon src={CalendarDays} width={16} mini/>
                            <span>
                                <RelativeDate date={community.community.published} />
                            </span>
                        </div>

                        <!--- Subscriber Count --->
                        <div class="flex flex-row gap-1 items-center">
                            <Icon src={UserGroup} width={16} mini />
                            <span>
                                {Intl.NumberFormat('en', { notation: 'compact' }).format(
                                    community.counts.subscribers
                                )}
                            </span>
                        </div>

                        <!---Post Count--->
                        <div class="flex flex-row gap-1 items-center">
                            <Icon src={PencilSquare} mini width={16} />
                            <span>
                                {Intl.NumberFormat('en', { notation: 'compact' }).format(
                                    community.counts.posts
                                )}
                            </span>
                        </div>

                        <!---Comment Count--->
                        <div class="flex flex-row gap-1 items-center">
                            <Icon src={ChatBubbleOvalLeftEllipsis} mini width={16} />
                            <span>
                                {Intl.NumberFormat('en', { notation: 'compact' }).format(
                                community.counts.comments
                                )}
                            </span>
                        </div>
                        
                        <!--- Posting Restricted to Mods Indicator--->
                        {#if community.community.posting_restricted_to_mods}
                            <div class="flex flex-row gap-1 items-center" title="Posting is Restricted to Mods Only">
                                <Icon src={LockClosed} mini width={16} />
                            </div>
                        {/if}

                        <!--- NSFW Indicator Badge --->
                        {#if community.community.nsfw}
                            <div class="flex flex-row gap-1 items-center">
                                <Badge color="red">NSFW</Badge>
                            </div>
                        {/if}

                    </div>
                </div>
            </li>
        {/each}
    </ul>
    {#if data.communities.length > 0 || parseInt($page.url.searchParams.get('page') ?? '1') > 1}
        <div class="mt-2 w-full">
            <Pageination
                page={Number($page.url.searchParams.get('page')) || 1}
                on:change={(p) => {
                    $page.url.searchParams.set('page', p.detail.toString())
                    goto($page.url.toString(), {
                        invalidateAll: true,
                    })
                }}
            />
        </div>
    {/if}
    

    <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} slot="right-panel"/>
</MainContentArea>
