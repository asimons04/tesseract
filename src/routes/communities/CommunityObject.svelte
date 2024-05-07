<script lang="ts">
    import type { CommunityView } from "lemmy-js-client";
    
    import { addSubscription } from '$lib/lemmy/user.js'
    import { profile } from '$lib/auth'
    
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import CollapseButton from "$lib/components/ui/CollapseButton.svelte";
    import CommunityLink from "$lib/components/lemmy/community/CommunityLink.svelte";
    import Button from "$lib/components/input/Button.svelte";
    import Markdown from "$lib/components/markdown/Markdown.svelte";
    import RelativeDate from "$lib/components/util/RelativeDate.svelte";
    import Subscribe from "./Subscribe.svelte";

    import {
        Icon,
        CalendarDays,
        ChatBubbleOvalLeftEllipsis,
        Check,
        LockClosed,
        PencilSquare,
        UserGroup,
    } from 'svelte-hero-icons'
    
    
    export let community: CommunityView

    function isSubscribed(community_view:CommunityView): boolean {
        if (!$profile?.user?.follows) return false
        
        for (let i:number=0; i<$profile.user.follows.length; i++) {
            if ($profile.user.follows[i].community.actor_id == community_view.community.actor_id) return true
        }
        return false
    }

    community.subscribed = isSubscribed(community) ? 'Subscribed' : 'NotSubscribed'

</script>


<CollapseButton>
    <Avatar width={48} alt={community.community.title ?? community.community.name} url={community.community.icon ?? undefined} slot="icon"/>
    
    <div class="flex flex-row items-center w-full justify-between" slot="title">
        
        <!--- Avatar + Community Name + !name@instance --->
        <div class="flex flex-col gap-0 w-full" >
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="break-words  text-base font-bold text-sky-400 hover:underline" on:click={(e) => e.stopPropagation()}>
                <CommunityLink  showInstance={false} avatar={false} avatarSize={48} community={community.community} />
            </span>
            
            <span class="opacity-80 text-xs">
                !{community.community.name}@{new URL(community.community.actor_id).hostname}
            </span>

            <!--- Icons/Counts Row --->
            <div class="flex flex-row gap-3 mt-2 font-normal items-center">
                
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
                        {Intl.NumberFormat('en', { notation: 'compact' }).format(community.counts.subscribers)}
                    </span>
                </div>

                <!---Post Count--->
                <div class="flex flex-row gap-1 items-center">
                    <Icon src={PencilSquare} mini width={16} />
                    <span>
                        {Intl.NumberFormat('en', { notation: 'compact' }).format(community.counts.posts)}
                    </span>
                </div>

                <!---Comment Count--->
                <div class="flex flex-row gap-1 items-center">
                    <Icon src={ChatBubbleOvalLeftEllipsis} mini width={16} />
                    <span>
                        {Intl.NumberFormat('en', { notation: 'compact' }).format(community.counts.comments)}
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
        
           
        <Subscribe {community} let:subscribe let:subscribing class="mr-4">
            <Button
                disabled={subscribing || !$profile?.jwt}
                loading={subscribing}
                color="tertiary-border"
                size="square-sm"
                title={['Subscribed', 'Pending'].includes(community.subscribed) ? 'Unsubscribe' : 'Subscribe'}
                on:click ={async (e) => {
                    e.stopPropagation()
                    const res = await subscribe()

                    if (res) {
                        community.subscribed = res.community_view.subscribed != 'NotSubscribed'
                            ? 'Subscribed'
                            : 'NotSubscribed'

                        addSubscription(
                            community.community, ['Subscribed', 'Pending'].includes(res.community_view.subscribed)
                        )
                    }
                }}
                
            >
                {#if !subscribing}
                    <span class="{['Subscribed', 'Pending'].includes(community.subscribed) ? 'text-green-500 font-bold' : ''}">
                        <Icon mini src={Check} width={18}/>
                    </span>
                {/if}
            </Button>
        </Subscribe>
    </div>
    
    <!---Collapsed Area--->    
    <div class="flex flex-col gap-1 text-sm max-w-full">
        
        <!---Community Description--->
        <div class="flex flex-col w-full">
            <Markdown source={community.community.description ?? '*No community information was provided.*'}/>
        </div>
    </div>
</CollapseButton>
