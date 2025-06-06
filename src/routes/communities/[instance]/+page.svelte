<script lang="ts">
    import { FEATURED_INSTANCES } from '$lib/settings'
    import { goto } from '$app/navigation';
    import { hrColors } from '$lib/ui/colors';
    import { instance as homeInstance} from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { validateInstance } from '$lib/lemmy.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte';
    import CommunityObject from './CommunityObject.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import SubnavbarMenu from '$lib/components/ui/subnavbar/SubnavbarMenu.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import {
        ArrowRightOnRectangle,
        Bars3,
        ChartBar,
        Check,
        Cog6Tooth,
        Home,
        Icon,
        MagnifyingGlass,
        QuestionMarkCircle,
        Server,
        ServerStack,
        XCircle,
    } from 'svelte-hero-icons'
    
    
    export let data
    
    let searchParams = {
        query: data.query,
        sort: data.sort,
        page: data.page,
        type: data.type,
        instance: data.instance,
    }
    let customInstance = ''
    let searching = false


    async function search(refresh:boolean=false) {
        if (searchParams.query) $page.url.searchParams.set('q', searchParams.query)
        else $page.url.searchParams.delete('q')

        if (searchParams.sort)  $page.url.searchParams.set('sort', searchParams.sort)
        
        if (refresh)  $page.url.searchParams.set('page', "1")
        else if (searchParams.page)  $page.url.searchParams.set('page', searchParams.page.toString())

        if (searchParams.type)  $page.url.searchParams.set('type', searchParams.type)

        if (searchParams.instance == $page.params.instance) {
            goto($page.url, {invalidateAll: true})
        }
        else {
            let newURL = new URL($page.url)
            newURL.pathname = `/communities/${searchParams.instance}`
            goto(newURL, {invalidateAll: true})
        }
        
    }

    let INSTANCE_LIST = [
        ...new Set([
            ...FEATURED_INSTANCES,
            $homeInstance,
            searchParams.instance
        ])
    ].sort()
</script>

<svelte:head>
    <title>Communities at {data.site.site_view.site.name}</title>
</svelte:head>

<SubNavbar home back scrollButtons toggleCommunitySidebar
    refreshButton refreshPreventDefault on:navRefresh={() => search(true) }
/>


<MainContentArea>
    <span class="flex flex-row gap-4 items-center font-bold text-xl text-center mx-auto pl-3">
        {#if data.site.site_view.site.icon}
            <Avatar circle={false} width={48} url={data.site.site_view.site.icon} />
        {/if}
        <h1 class="text-lg lg:text-xl xl:text-2xl font-bold">Communities {searchParams.type == 'All' ? 'Known to' : 'At'} {data.site.site_view.site.name}</h1>
    </span>

    
    <span class="text-slate-600 dark:text-zinc-400 mt-2">
        <p>
            Browse and/or subscribe to the communities on {data.site.site_view.site.name}.  By default, only communities local to this instance are shown.  
            You can switch the type to "All" and browse/search all communities known to {data.site.site_view.site.name}.  Browsing 'all' on a remote
            instance, particularly a larger one that's subscribed to lots of communities, can be useful for discovering communites without knowing 
            what instance they're on.
        </p>
    </span>

    <div class="flex flex-col gap-2 w-full my-2">
        <hr class={hrColors} />

        <div class="flex flex-row items-center w-full justify-between">
            <!---Instance--->
            <SubnavbarMenu alignment="bottom-left" icon={ServerStack} title="Instance" topHR={false} showTitleOnButton containerClass="mt-auto">

                <Card class="p-2 m-2">
                    <!--- List the featured instances provided by the admin--->
                    <div class="flex flex-col w-full overflow-y-scroll max-h-[30vh]">
                        {#each INSTANCE_LIST as instance}
                            <MenuButton on:click={() => {
                                searchParams.instance = instance.toLowerCase().replaceAll(' ', '') 
                                searchParams.page = 1
                                // Default to Local view when switching to browse a remote instance
                                if (searchParams.instance != $profile?.instance) {
                                    searchParams.type = 'Local'
                                }
                                // If clicking to your own instance, show 'All'
                                else {
                                    searchParams.type = 'All'
                                }
                                search()
                            }}>
                                <Icon mini src={$homeInstance == instance ? Home : Server} width={24} />
                                
                                <span class="flex flex-row w-full text-left justify-between" class:font-bold={searchParams.instance == instance.toLowerCase()}>
                                    {instance}
                                    
                                    <!---Show an indicator icon next to the selected option--->
                                    {#if searchParams.instance == instance.toLowerCase()}
                                    <span>    
                                        <Icon src={Check} mini width={12}/>
                                    </span>
                                    {/if}
                    
                                </span>
                            </MenuButton>
                        {/each}
                    </div>
                </Card>

                <!--- Manual Instance Input--->
                <div class="p-2 m-2">
                    <!-- svelte-ignore a11y-click-events-have-key-events --> <!-- svelte-ignore a11y-no-noninteractive-element-interactions --> <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div class="flex flex-col gap-1 w-full" on:click|stopPropagation>
                        <span class="font-bold text-xs text-left">Browse another instance:</span>
                        
                        <form class="flex flex-row gap-4 w-full justify-between"  on:submit|preventDefault={ async() => {
                            if (!customInstance) return

                            if (!(INSTANCE_LIST.includes(customInstance))) {
                                
                                if (await validateInstance(customInstance)) {
                                    INSTANCE_LIST.push(customInstance)
                                    INSTANCE_LIST.sort()
                                    INSTANCE_LIST = INSTANCE_LIST
                                    searchParams.instance = customInstance
                                    searchParams.type = 'Local'
                                    customInstance = ''

                                    search(true)
                                }
                                else {
                                    toast({
                                        title: 'Invalid Instance',
                                        type: 'error',
                                        content: 'Unable to contact the provided instance. Please check the domain and try again.'
                                    })
                                }
                            }
                            
                            // If the entered instance is already on the list, just switch to it
                            else {
                                searchParams.instance = customInstance
                                searchParams.type = 'Local'
                                customInstance = ''
                                search(true)
                            }
                        }}>
                            <TextInput bind:value={customInstance} placeholder={searchParams.instance} focus={false} class="w-full"/>
                            
                            <button class="flex flex-row gap-1 ml-auto" title="Set Custom Instance" type="submit">
                                <Icon mini src={ArrowRightOnRectangle} width={24} />
                            </button>
                        </form>
                    </div>
                </div>
            </SubnavbarMenu>
            
            <!---Listing Type--->
            <SelectMenu
                title="Listing Type"    
                icon={Bars3}
                options={
                    data.instance == $homeInstance
                    ?  ['Subscribed', 'Local', 'All']
                    :  ['Local', 'All']
                }
                selected={searchParams.type}
                alignment="bottom-center"
                on:select={(e) => { 
                    searchParams.type = e.detail
                    searchParams.page = 1
                    search()
                }}
            />
            

            <SelectMenu
                title="Sort Direction"
                icon={ChartBar}
                options={["asc", "desc", "posts_desc", "subscribers_desc"]}
                optionNames={["A-Z", "Z-A", "Most Posts", "Most Subscribers"]}
                selected={searchParams.sort}
                alignment="bottom-right"                
                
                on:select={(e) => { 
                    searchParams.page = 1
                    searchParams.sort = e.detail
                    search()
                }}
            />
        </div>

        
        <form class="flex flex-row gap-1 items-center w-full justify-between"
            on:submit|preventDefault={async () => {
                await search(true)
            }}
        >
            <TextInput type="search" class="w-full" placeholder="Search Communities at {data.site.site_view.site.name}" bind:value={searchParams.query}/>

            <Button icon={MagnifyingGlass} iconSize={28} submit title="Search" color="tertiary-border">
                <span class="hidden lg:flex">
                    Search
                </span>
            </Button>

            <Button icon={XCircle} iconSize={28} color="tertiary-border" title="Reset Search" on:click={() => {
                searchParams.instance = $profile?.instance
                searchParams.query = ''
                searchParams.page = 1
                searchParams.type = 'All'
                search(true)
            }}>
                <span class="hidden lg:flex">
                    Reset
                </span>
            </Button>
        </form>

        <hr class={hrColors} />
    </div>

    {#if data.communities.length == 0 && searching}
        <div class="flex gap-2 items-center mx-auto mt-4" >
            <Spinner width={48} />
            <span>Searching...</span>
        </div>
    {/if}


    <div class="flex flex-col h-full gap-4">
        {#if data.communities.length == 0 && !searching}
            <Placeholder icon={QuestionMarkCircle} size="32" class="mx-auto"
                title="No {data.page > 1 ? 'More' : ''} Communities"
                description="No communities were returned from the query." />
        {/if}

        {#each data.communities as community}
            <CommunityObject bind:community />
        {/each}
    </div>
    
    
    <div class="mt-2 w-full">
        <Pageination page={data.page} on:change={(p) => {
            searchParams.page = p.detail
            search()
            window.scrollTo(0,0)
        }}/>
    </div>

    <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} slot="right-panel"/>
</MainContentArea>
