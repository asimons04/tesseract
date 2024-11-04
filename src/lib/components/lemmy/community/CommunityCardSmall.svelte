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
        UserGroup
    } from 'svelte-hero-icons'

    export let community_view: CommunityView

    const dispatcher = createEventDispatcher()
</script>

<Card backgroundImage={($userSettings.uiState.showBannersInCards && community_view.community.banner) ? imageProxyURL(community_view.community.banner, undefined, 'webp') : ''} >
    <div class="flex flex-row gap-1 md:gap-3 items-center p-3">
        <div class="flex-shrink-0">
            <Avatar width={128} fullRes ring url={community_view.community.icon} alt={community_view.community.name} community />
        </div>

        <div class="flex flex-col gap-1 w-full overflow-hidden">
            <span class="font-bold text-lg">
                <CommunityLink name href useDisplayNames showInstance={false} community={community_view.community} 
                    on:click={ () => dispatcher('communityLinkClick') }
                />
            </span>

            <span class="text-xs font-normal">
                !{community_view.community.name}@{new URL(community_view.community.actor_id).hostname}
            </span>
            
            <div class="mt-2" />

            <Card elevation={0} class="p-1 w-fit opacity-80 w-fit">
                <div class="flex flex-row">
                    
                    <div class="text-xs md:text-sm flex flex-row gap-4 flex-wrap justify-between">
                        <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Cake Day">
                            <Icon src={Cake} width={16} height={16} mini />
                            <span class="capitalize">
                                <RelativeDate date={community_view.community.published}/>
                            </span>
                        </span>
                        
                        <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Subscribers">
                            <Icon src={UserGroup} width={16} height={16} mini />
                            
                            {#if community_view.counts.subscribers_local}
                                <FormattedNumber number={community_view.counts.subscribers_local} /> / 
                            {/if}
                            <FormattedNumber number={community_view.counts.subscribers} />
                        </span>

                        <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Posts">
                            <Icon src={PencilSquare} width={16} height={16} mini />
                            <FormattedNumber number={community_view.counts.posts} />
                        </span>
            
                        <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Comments">
                            <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                            <FormattedNumber number={community_view.counts.comments} />
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    </div>
</Card>