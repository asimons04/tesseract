<script lang="ts">
    import type { CommunityView } from 'lemmy-js-client'
    
    import { profile } from '$lib/auth.js'
    import { amMod } from '$lib/components/lemmy/moderation/moderation.js'
    import { getClient } from '$lib/lemmy.js'
    import { addSubscription } from '$lib/lemmy/user.js'
    import { fullCommunityName } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte'
    import Badge from '$lib/components/ui/Badge.svelte'
    
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    
    
    import {
        Calendar,
        ChatBubbleOvalLeftEllipsis,
        ChevronDoubleRight,
        Cog6Tooth,
        Icon,
        Minus,
        PencilSquare,
        Plus,
        UserGroup,
    } from 'svelte-hero-icons'
    
    

    export let community_view: CommunityView

    let loading = {
        blocking: false,
        subscribing: false,
    }

    async function subscribe() {
        if (!$profile?.jwt) return
        loading.subscribing = true
        const subscribed = 
            community_view.subscribed == 'Subscribed' ||
            community_view.subscribed == 'Pending'
        try {
            await getClient().followCommunity({
                auth: $profile.jwt,
                community_id: community_view.community.id,
                follow: !subscribed,
            })
        } catch (error) {
            toast({ content: error as any, type: 'error' })
        }

        community_view.subscribed = subscribed ? 'NotSubscribed' : 'Subscribed'
        addSubscription(community_view.community, !subscribed)

        loading.subscribing = false
    }

    async function block() {
        if (!$profile?.jwt) return
        loading.blocking = true
        const blocked = community_view.blocked

        try {
            await getClient().blockCommunity({
                auth: $profile.jwt,
                community_id: community_view.community.id,
                block: !blocked,
            })
        } catch (error) {
            toast({ content: error as any, type: 'error' })
        }

        community_view.blocked = !blocked
        loading.blocking = false
    }
</script>

<!---Button to hide/show the community sidebar--->
<aside class="sticky top-[5.1rem] flex flex-col pr-4 hidden lg:block xl:block">
    <div class="grid justify-items-end w-full mr-2">
        <Button
            alignment="right"
            on:click={() =>
                ($userSettings.uiState.expandCommunitySidebar = !$userSettings.uiState.expandCommunitySidebar)
            }
            class="w-max hover:bg-slate-200"
            aria-label={$userSettings.uiState.expandCommunitySidebar
                ? 'Collapse community sidebar'
                : 'Expand community sidebar'
            }
            title={$userSettings.uiState.expandCommunitySidebar
                ? 'Collapse community sidebar'
                : 'Expand community sidebar'
            }
        >
            <Icon
                src={ChevronDoubleRight}
                mini
                size="16"
                class="transition-transform {$userSettings.uiState.expandCommunitySidebar
                    ? ''
                    : 'rotate-180'}"
            />
        </Button>
    </div>
</aside>



<!--- Hideable div to contain the main part of the community sidebar --->
<StickyCard class="p-3 mb-3
    {$userSettings.uiState.expandCommunitySidebar
        ? 'hidden lg:block xl:block'
        : 'hidden'}
    "
>
    <Card>
        <div class="flex flex-row gap-3 items-center p-3">
            <div class="flex-shrink-0">
                <Avatar
                    width={48}
                    url={community_view.community.icon}
                    alt={community_view.community.name}
                />
            </div>
            <div class="flex flex-col gap-0">
                <a href="/c/{community_view.community.name}@{new URL(community_view.community.actor_id).hostname}" title="{community_view.community.name}">
                    <h1 class="font-bold text-xl">{community_view.community.title}</h1>
                    <span class="dark:text-zinc-400 text-slate-600 text-sm">
                        !{community_view.community.name}@{new URL(community_view.community.actor_id).hostname}
                    </span>
                </a>
                {#if community_view.community.nsfw}
                    <div class="flex flex-row ml-auto gap-2 flex-wrap">    
                        <Badge color="red">NSFW</Badge>
                    </div>
                {/if}
            </div>
        </div>

        
        <div class="mt-4 p-3 w-[95%] ml-auto mr-auto ">
            <div class="text-sm flex flex-row flex-wrap gap-3 justify-between">
                <span class="flex flex-row items-center gap-2">
                    <Icon src={Calendar} width={16} height={16} mini />
                    <RelativeDate date={new Date(community_view.community.published + 'Z')} />
                </span>

                <span class="flex flex-row items-center gap-2">
                    <Icon src={UserGroup} width={16} height={16} mini />
                    <FormattedNumber number={community_view.counts.subscribers} />
                </span>

                <span class="flex flex-row items-center gap-2">
                    <Icon src={PencilSquare} width={16} height={16} mini />
                    <FormattedNumber number={community_view.counts.posts} />
                </span>

                <span class="flex flex-row items-center gap-2">
                    <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                    <FormattedNumber number={community_view.counts.comments} />
                </span>
            </div>
        </div>
    </Card>

    {#if $profile?.jwt}
        <div class="w-full mt-2 flex flex-col gap-2">
            <Button
                href="/create/post"
                color="ghost"
                size="lg"
                disabled={community_view.community.posting_restricted_to_mods}
            >
                <Icon src={PencilSquare} mini size="16" slot="icon" />
                Create Post
            </Button>

            <Button
                disabled={loading.subscribing}
                loading={loading.subscribing}
                color="ghost"
                size="lg"
                on:click={subscribe}
            >
                <Icon
                    src={community_view.subscribed == 'Subscribed' ? Minus : Plus}
                    mini
                    size="16"
                    slot="icon"
                />
                    {
                    community_view.subscribed == 'Subscribed' ||
                        community_view.subscribed == 'Pending'
                        ? 'Unsubscribe'
                        : 'Subscribe'
                    }
            </Button>

            <Button
                disabled={loading.blocking}
                loading={loading.blocking}
                color="danger"
                size="lg"
                on:click={block}
            >
                {community_view.blocked ? 'Unblock' : 'Block'}
            </Button>

            {#if $profile.user && amMod($profile.user, community_view.community)}
                <div class="flex flex-row gap-2 ml-auto">
                        <Button
                            href="/c/{fullCommunityName(
                                community_view.community.name,
                                community_view.community.actor_id
                            )}/settings"
                            size="square-md"
                        >
                            <Icon src={Cog6Tooth} mini size="16" slot="icon" />
                        </Button>
                </div>
            {/if}
        </div>
    {/if}
    <Markdown source={community_view.community.description} />

</StickyCard>
