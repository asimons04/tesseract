<script lang="ts">
    import type { CommunityView } from "lemmy-js-client"
        
    import { createEventDispatcher } from "svelte"
    import { imageProxyURL } from "$lib/image-proxy"
    import { userSettings } from '$lib/settings'

    import Avatar from "$lib/components/ui/Avatar.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    import CommunityLink from "./CommunityLink.svelte"
    import FormattedNumber from "$lib/components/util/FormattedNumber.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"

    import {
        Icon,
        Cake,
        ChatBubbleOvalLeftEllipsis,
        PencilSquare,
        UserGroup,
    } from 'svelte-hero-icons'
    

    export let community_view: CommunityView
    export let href: boolean = false            // If true, community link in the card will go to the /c/ page. False, default, will open the community modal.
   
    let avatarWidth = 128
    const dispatcher = createEventDispatcher()
</script>

<Card backgroundImage={($userSettings.uiState.showBannersInCards && community_view.community.banner) ? imageProxyURL(community_view.community.banner, undefined, 'webp') : ''} 
    class="p-0 !items-start"
>
    <div class="flex flex-row gap-1 md:gap-3 items-start p-0">
        <div class="flex-shrink-0 p-2" style="min-width: {Math.round(avatarWidth * 0.75)}px; max-width: min({avatarWidth}px, 25%);">
            <Avatar width={avatarWidth} fullRes ring url={community_view.community.icon} alt={community_view.community.name} community />
        </div>

        <div class="flex flex-col gap-0 w-3/4 overflow-hidden break-words border border-slate-300 dark:border-zinc-900 bg-slate-200 dark:bg-zinc-950 rounded-bl-3xl rounded-tr-3xl p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 pl-4">            
            <span class="font-bold w-full text-xl">
                <CommunityLink name href={href} useDisplayNames showInstance={false} community={community_view.community} 
                    on:click={ () => dispatcher('communityLinkClick') }
                />
            </span>
            
            <span class="text-base font-normal truncate">
                !{community_view.community.name}@{new URL(community_view.community.actor_id).hostname}
            </span>
        </div>
    </div>

    <div class="mt-2" />

    <Card elevation={0} class="p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 rounded-b-3xl rounded-t-none">
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
                    
                    {#if community_view.counts.subscribers_local}
                        <FormattedNumber number={community_view.counts.subscribers_local} /> / 
                    {/if}
                    <FormattedNumber number={community_view.counts.subscribers} />
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