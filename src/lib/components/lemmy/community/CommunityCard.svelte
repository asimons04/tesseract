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
    import Modal from '$lib/components/ui/modal/Modal.svelte'
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
        InformationCircle,
        Minus,
        Newspaper,
        PencilSquare,
        Plus,
        ShieldCheck,
        ShieldExclamation,
        UserGroup,
    } from 'svelte-hero-icons'
    
    

    export let community_view: CommunityView
    
    let sidebar: boolean = false
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

<Modal bind:open={sidebar}>
    <span slot="title">About</span>
    <div class="mx-auto">
        <Markdown source={community_view.community.description} />
    </div>
</Modal>




<!---Button to hide/show the community sidebar--->
<aside class="sticky top-[5.1rem] flex flex-col pr-4 hidden xl:block">
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
<StickyCard class="p-3 mb-3 {!$userSettings.uiState.expandCommunitySidebar ? 'hidden' : ''}" >
    <Card>
        <!--- Commuinity Avatar, display name, and federation name--->
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
                    <h1 class="font-bold text-xl">{community_view.community.title.replace('&amp;', '&')}</h1>
                    <span class="dark:text-zinc-400 text-slate-600 text-sm">
                        !{community_view.community.name}@{new URL(community_view.community.actor_id).hostname}
                    </span>
                </a>
            </div>
        </div>

        <!--- 
            Community Action Buttons Inside The Card (Community Info, Modlog, and Settings)
            These appear when the community sidebar reflows to the top in lg and below
        --->
        <div class="mt-2 mb-2 flex flex-row gap-4">
            
            
            <div class="flex flex-row gap-4 mx-auto xl:hidden">
                
                <!--- Community Info Modal--->                
                <Button color="primary" on:click={() => (sidebar = !sidebar)} title="Community Info">
                    <Icon src={InformationCircle} mini size="16" slot="icon" />
                </Button>

                {#if $profile?.jwt}
                    <!---Create Post --->
                    <Button
                        href="/create/post"
                        color="primary"
                        disabled={community_view.community.posting_restricted_to_mods}
                        title="Create post"
                    >
                        <Icon src={PencilSquare} mini size="16" slot="icon" />
                    </Button>

                    <!--- Subscribe/Unsubscribe--->
                    <Button
                        disabled={loading.subscribing}
                        loading={loading.subscribing}
                        color="primary"
                        on:click={subscribe}
                        title="{
                            community_view.subscribed == 'Subscribed' || community_view.subscribed == 'Pending'
                            ? 'Unsubscribe'
                            : 'Subscribe'
                        }"
                    >
                        <Icon
                            src={community_view.subscribed == 'Subscribed' ? Minus : Plus}
                            mini
                            size="16"
                            slot="icon"
                        />
                    </Button>
                    
                    <!--- Block/Unblock Community --->
                    <Button
                        disabled={loading.blocking}
                        loading={loading.blocking}
                        color="primary"
                        on:click={block}
                        title="{community_view.blocked ? 'Unblock' : 'Block'} Community"
                    >
                        <Icon
                            src={community_view.blocked  ? ShieldCheck : ShieldExclamation}
                            mini
                            size="16"
                            slot="icon"
                        />
                    </Button>
                {/if}

                <!---Modlog--->
                <Button
                    href="/modlog?community={community_view.community.id}"
                    color="primary"
                    title="Modlog for {community_view.community.title}"
                >
                    <Icon src={Newspaper} mini size="16" slot="icon" />
                </Button>

                <!--- Settings --->
                {#if $profile.user && amMod($profile.user, community_view.community)}
                <div class="flex flex-row gap-2">
                    <Button
                        href="/c/{fullCommunityName(
                            community_view.community.name,
                            community_view.community.actor_id
                        )}/settings"
                        color="primary"
                        title="Edit Community"
                    >
                        <Icon src={Cog6Tooth} mini size="16" slot="icon" />
                    </Button>
                </div>
                {/if}


            </div>
        
        </div>

        <!-- Community subscribers, counts, etc --->
        <div class="p-2">
            <div class="text-sm flex flex-row flex-wrap gap-3">
                <span class="flex flex-row items-center gap-2 mx-auto">
                    <Icon src={Calendar} width={16} height={16} mini />
                    <RelativeDate date={new Date(community_view.community.published + 'Z')} />
                </span>

                <span class="flex flex-row items-center gap-2 mx-auto">
                    <Icon src={UserGroup} width={16} height={16} mini />
                    <FormattedNumber number={community_view.counts.subscribers} />
                </span>

                <span class="flex flex-row items-center gap-2 mx-auto">
                    <Icon src={PencilSquare} width={16} height={16} mini />
                    <FormattedNumber number={community_view.counts.posts} />
                </span>

                <span class="flex flex-row items-center gap-2 mx-auto">
                    <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                    <FormattedNumber number={community_view.counts.comments} />
                </span>
            </div>
        </div>

        
    </Card>
        
    <!--- Full sizeCreate post, sub/unsubscribe, block buttons --->
    <div class="w-full mt-2 mb-2 flex flex-col gap-2 hidden xl:flex">
        {#if $profile?.jwt}
            <Button
                href="/create/post"
                color="primary"
                size="lg"
                disabled={community_view.community.posting_restricted_to_mods}
            >
                <Icon src={PencilSquare} mini size="16" slot="icon" />
                Create Post
            </Button>

            <div class="flex flex-row gap-2">
                <Button
                    disabled={loading.subscribing}
                    loading={loading.subscribing}
                    color="primary"
                    size="lg"
                    class="w-full"
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
                    color="primary"
                    size="lg"
                    class="w-full"
                    on:click={block}
                >
                    <Icon
                        src={community_view.blocked  ? ShieldCheck : ShieldExclamation}
                        mini
                        size="16"
                        slot="icon"
                    />
                    {community_view.blocked ? 'Unblock' : 'Block'}
                </Button>
            </div>
            <div class="flex flex-row gap-2">
                {#if $profile.user && amMod($profile.user, community_view.community)}
                        <Button
                            href="/c/{fullCommunityName(
                                community_view.community.name,
                                community_view.community.actor_id
                            )}/settings"
                            color="primary"
                            class="w-full"
                            title="Edit Community"
                        >
                            <Icon src={Cog6Tooth} mini size="16" slot="icon" />
                            Settings
                        </Button>
                {/if}
                
                <Button
                    href="/modlog?community={community_view.community.id}"
                    color="primary"
                    title="Modlog for {community_view.community.title}"
                    class="w-full"
                >
                    <Icon src={Newspaper} mini size="16" slot="icon" />
                    Modlog
                </Button>
            </div>
        {/if}
        
        
    </div>

    <div class="hidden  xl:block">
        <Markdown source={community_view.community.description} />
    </div>

</StickyCard>
