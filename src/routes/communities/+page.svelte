<script lang="ts">
    import { addSubscription } from '$lib/lemmy/user.js'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    import { LINKED_INSTANCE_URL } from '$lib/instance.js'
    
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Link from '$lib/components/input/Link.svelte'
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
        LockClosed,
        PencilSquare,
        QuestionMarkCircle,
        UserGroup,
    } from 'svelte-hero-icons'
    import { isCommunityView } from '../../lib/lemmy/item';

    export let data
    
    let search = ''
</script>

<svelte:head>
    <title>Communities</title>
</svelte:head>


<div class="flex flex-col-reverse xl:flex-row gap-4 max-w-full w-full px-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
    
        <div class="p-2">
            <h1 class="text-2xl font-bold">Communities</h1>
            
            <p class="text-slate-600 dark:text-zinc-400 mt-2">
                Can't find a community on your home instance? Go to the 
                <a href="/search" class="text-blue-500 hover:underline">
                    search
                </a>
                page, and search with this syntax: <code>!community@instance.com</code>
            </p>


            <div class="flex flex-row flex-wrap justify-between mt-4">
                <MultiSelect
                    options={['Subscribed', 'Local', 'All']}
                    selected={$page.url.searchParams.get('type') ?? 'Local'}
                    on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
                    label="Type"
                    items={0}
                    headless={true}
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
                >
                    <Icon src={ChartBar} mini width={16} slot="icon"/>
                    <span slot="label">Sort Direction</span>
                </MultiSelect>
            </div>

            <div class="flex flex-row my-2 gap-2 w-full items-center">
                <TextInput
                    class="w-full"
                    bind:value={search}
                    on:change={() => {
                        $page.url.searchParams.set('q', search)
                        goto($page.url.toString(), {
                            invalidateAll: true,
                        })
                    }}
                />
                <Button
                    on:click={() => {
                        $page.url.searchParams.set('q', search)
                        goto($page.url.toString(), {
                            invalidateAll: true,
                        })
                    }}
                    color="ghost"
                    class="h-max"
                >
                    Search
                </Button>
            </div>


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
                                    <span class="break-words max-w-full w-max text-base font-bold text-sky-400 hover:underline">
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
                                
                                <div class="ml-auto">
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
                                        <RelativeDate date={new Date(community.community.published)} />
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
            {#if data.communities.length > 0}
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

    <div class="hidden xl:block mt-[-8px]">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins}/>
    </div>
</div>