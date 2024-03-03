<script lang="ts">
    import type { CommunityView } from 'lemmy-js-client'

    import { addSubscription } from '$lib/lemmy/user.js'
    import { goto } from '$app/navigation'
    import { DEFAULT_INSTANCE_URL } from '$lib/instance.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { validateInstance } from '$lib/lemmy.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import Subscribe from './Subscribe.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import {
        Bars3,
        CalendarDays,
        ChartBar,
        ChatBubbleOvalLeftEllipsis,
        Icon,
        InformationCircle,
        LockClosed,
        PencilSquare,
        QuestionMarkCircle,
        UserGroup,
    } from 'svelte-hero-icons'
    import { isCommunityView } from '../../lib/lemmy/item';

    export let data
    
    let search = ''
    let instance: string = ''
    let validating: boolean = false

    let communityInfoModal:boolean = false
    let selectedCommunity:CommunityView

</script>

<svelte:head>
    <title>Communities</title>
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

<div class="flex flex-col-reverse xl:flex-row gap-4 max-w-full w-full px-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
    
        <div class="p-2">
            <span class="flex flex-row gap-4 items-center font-bold text-xl text-center mx-auto pl-3 pt-4">
                {#if data.site.site_view.site.icon}
                    <Avatar circle={false} width={48} url={data.site.site_view.site.icon} />
                {/if}
                <h1 class="text-2xl font-bold">Communities</h1>
            </span>

            
            
            <p class="text-slate-600 dark:text-zinc-400 mt-2">
                The communities shown here are known to your instance. If you don't see what you're looking for, enter another instance to browse the communities
                there.  You can also look for specific communities using the 
                <Link href="https://lemmyverse.net/communities" title="Lemmy Community Explorer" highlight newtab={true}>
                    Lemmy Community Explorer
                </Link>
                .
            </p>
            
            <form class="flex flex-row my-2 gap-2 w-full items-center"
                on:submit|preventDefault={async () => {
                    if (instance != '') {
                        validating = true
                        if (await validateInstance(instance.trim())) {
                            goto(`/communities/${instance}`)
                        } else {
                            toast({
                                content: 'Could not contact that instance URL',
                                type: 'error',
                            })
                        }
                        validating = false
                    }
                }}
            >
                <TextInput
                    bind:value={instance}
                    label="Instance URL to Browse"
                    placeholder={DEFAULT_INSTANCE_URL}
                    on:input={() => {
                        instance = instance.toLowerCase().replaceAll(' ', '')
                    }}
                    focus={false}
                    class="w-full"
                />
                <Button
                    submit
                    color="primary"
                    loading={validating}
                    disabled={validating}
                    class="h-max mt-[1.5rem]"
                >
                    Browse
                </Button>
            </form>


            <div class="flex flex-col-reverse md:flex-row gap-4">
                <div class="flex flex-row justify-between w-full md:w-1/2">
                    <MultiSelect
                        options={['Subscribed', 'Local', 'All']}
                        selected={$page.url.searchParams.get('type') ?? 'All'}
                        on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
                        label="Type"
                        items={0}
                        headless={true}
                        fullWidth={false}
                    >
                        <Icon src={Bars3} mini width={16} slot="icon"/>
                        <span slot="label">List Type</span>
                    </MultiSelect>
                    
                    <MultiSelect
                        options={["asc", "desc", "posts_desc", "subscribers_desc"]}
                        optionNames={["A-Z", "Z-A", "Most Posts", "Most Subscribers"]}
                        selected={$page.url.searchParams.get('sort') ?? 'asc'}
                        on:select={(e) => { searchParam($page.url, 'sort', e.detail, 'page')} }
                        items={0}
                        headless={true}
                        fullWidth={false}
                    >
                        <Icon src={ChartBar} mini width={16} slot="icon"/>
                        <span slot="label">Sort Direction</span>
                    </MultiSelect>
                </div>

                <div class="flex flex-row gap-2 items-center w-full md:w-1/2 md:mt-[1.5rem]">
                    <TextInput
                        class="w-full"
                        bind:value={search}
                        on:change={() => {
                            $page.url.searchParams.set('q', search)
                            $page.url.searchParams.set('page', '1')
                            goto($page.url.toString(), {
                                invalidateAll: true,
                            })
                        }}
                        focus={false}
                    />
                    <Button
                        on:click={() => {
                            $page.url.searchParams.set('q', search)
                            $page.url.searchParams.set('page', '1')
                            goto($page.url.toString(), {
                                invalidateAll: true,
                            })
                        }}
                        color="primary"
                        class="h-max"
                    >
                        Search
                    </Button>
                </div>
            </div>

            <hr class="border-slate-300/50 my-2"/>

            <ul class="flex flex-col divide-y dark:divide-zinc-800">
                {#if data.communities.length == 0}
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
                                    <span class="break-words text-base font-bold text-sky-400 hover:underline">
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

                                <!--- Action Buttons for Community Entry --->
                                <div class="ml-auto flex flex-row gap-2">
                                    <!-- If community has a description, show an 'About' button-->
                                    {#if community.community.description}
                                        <Button
                                            on:click={ () => {
                                                selectedCommunity = community;
                                                communityInfoModal = true
                                            }}
                                            color="primary"
                                        >
                                            <Icon src={InformationCircle} mini size="14"/>
                                        </Button>
                                    {/if}

                                    <Subscribe {community} let:subscribe let:subscribing>
                                        <Button
                                            disabled={subscribing || !$profile?.jwt}
                                            loading={subscribing}
                                            on:click={async () => {
                                                const res = await subscribe()

                                                if (res) {
                                                    community.subscribed =
                                                    res.community_view.subscribed != 'NotSubscribed'
                                                        ? 'Subscribed'
                                                        : 'NotSubscribed'

                                                    addSubscription(
                                                        community.community,
                                                        res.community_view.subscribed == 'Subscribed' ||
                                                        res.community_view.subscribed == 'Pending'
                                                    )
                                                }
                                            }}
                                            color={community.subscribed == 'Subscribed'
                                                ? 'primary'
                                                : 'ghost'}
                                        >
                                            {community.subscribed == 'Subscribed'
                                            ? 'Subscribed'
                                            : 'Subscribe'
                                            }
                                        </Button>
                                    </Subscribe>
                                </div>
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
        </div>
    </div>

    <div class="hidden xl:block mt-[8px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version}/>
    </div>
</div>