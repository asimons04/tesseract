<script lang="ts">
    import type { CommunityView } from "lemmy-js-client"
    import type { HideCommunityEvent, RemoveCommunityEvent } from "$lib/ui/events"

    import { communityProfileModal } from '../moderation/moderation'
    import { createEventDispatcher } from "svelte"
    import { imageProxyURL } from "$lib/image-proxy"
    import { userSettings } from '$lib/settings'

    import Avatar from "$lib/components/ui/Avatar.svelte"
    import Badge from "$lib/components/ui/Badge.svelte";
    import Card from "$lib/components/ui/Card.svelte"
    import FormattedNumber from "$lib/components/util/FormattedNumber.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"

    import {
        Icon,
        Cake,
        ChatBubbleOvalLeftEllipsis,
        PencilSquare,
        UserGroup,
        EyeSlash,
        NoSymbol,
        Trash,
    } from 'svelte-hero-icons'
    
    
    

    export let community_view: CommunityView
    export let href: boolean = false            // If true, community link in the card will go to the /c/ page. False, default, will open the community modal.
   
    let avatarWidth = 96
    const dispatcher = createEventDispatcher()

    function handleHideCommunity(e:HideCommunityEvent) {
        if (community_view.community.id == e.detail.community_id) community_view.community.hidden = e.detail.hidden
    }

    function handleRemoveCommunity(e:RemoveCommunityEvent) {
        if (community_view.community.id == e.detail.community_id) community_view.community.removed = e.detail.removed
    }

</script>


<svelte:window on:hideCommunity={handleHideCommunity} on:removeCommunity={handleRemoveCommunity} />

<Card backgroundImage={($userSettings.uiState.showBannersInCards && community_view.community.banner) ? imageProxyURL(community_view.community.banner, undefined, 'webp') : ''} 
    class="p-0 !items-start"
>
    <div class="flex flex-row gap-1 md:gap-3 items-start p-0">
        <div class="p-2 flex-shrink-1">
            <Avatar width={avatarWidth} fullRes ring url={community_view.community.icon} alt={community_view.community.name} fadeIn={false} community />
        </div>

        <div class="flex flex-col gap-0 overflow-hidden break-words border border-slate-300 dark:border-zinc-900 bg-slate-200 dark:bg-zinc-950 rounded-bl-2xl rounded-tr-2xl p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 pl-4"
            style="width: calc(100% - {avatarWidth}px;"
        >
            
            <a href="/c/{community_view.community.name}@{new URL(community_view.community.actor_id).hostname}"
                class="text-left items-center hover:underline capitalize font-bold text-xl truncate"     
                title={community_view.community.title ?? community_view.community.name}
                on:click={(
                    //@ts-ignore
                    e
                ) => {
                    if (href) {
                        dispatcher('communityLinkClick')
                        return
                    }
                    e.preventDefault()
                    e.stopPropagation()    
                    communityProfileModal(community_view.community) 
                }}
            >
                {community_view.community.title ?? community_view.community.name}
            </a>
            
           
            <span class="text-base font-normal truncate">
                !{community_view.community.name}@{new URL(community_view.community.actor_id).hostname}
            </span>

            <span class="flex flex-row flex-wrap w-full gap-2 text-sm font-normal mt-1">
                {#if community_view.blocked}
                    <Badge color="red" icon={EyeSlash} inline click={false} rightJustify={false}>
                        Blocked
                    </Badge>
                {/if}

                {#if community_view.banned_from_community}
                    <Badge color="red" icon={NoSymbol} inline click={false} rightJustify={false}>
                        Banned
                    </Badge>
                {/if}

                {#if community_view.community.hidden}
                    <Badge color="red" icon={EyeSlash} inline click={false} rightJustify={false}>
                        Hidden
                    </Badge>
                {/if}

                {#if community_view.community.removed}
                    <Badge color="red" icon={Trash} inline click={false} rightJustify={false}>
                        Removed
                    </Badge>
                {/if}
            </span>
        </div>
    </div>

    <div class="mt-2" />

    <Card elevation={0} class="p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 rounded-b-2xl rounded-t-none">
        <div class="flex flex-row w-full">
            
            <div class="text-xs md:text-sm flex flex-row gap-0 px-2 w-full flex-wrap justify-between">
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Cake Day">
                    <Icon src={Cake} width={20}  mini />
                    <span class="capitalize">
                        <RelativeDate date={community_view.community.published}/>
                    </span>
                </span>
                
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Subscribers">
                    <Icon src={UserGroup} width={20}  mini />
                    
                    <span class="flex flex-row mx-auto items-center gap-1">
                        {#if community_view.counts.subscribers_local}
                            <FormattedNumber number={community_view.counts.subscribers_local} /> / 
                        {/if}
                        <FormattedNumber number={community_view.counts.subscribers} />
                    </span>
                </span>

                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Posts">
                    <Icon src={PencilSquare} width={20}  mini />
                    <FormattedNumber number={community_view.counts.posts} />
                </span>
    
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Comments">
                    <Icon src={ChatBubbleOvalLeftEllipsis} width={20}  mini />
                    <FormattedNumber number={community_view.counts.comments} />
                </span>
            </div>
        </div>
    </Card>
</Card>