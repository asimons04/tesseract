<script lang="ts">
    import type { CommunityView } from "lemmy-js-client"
    
    import { addSubscription } from '$lib/lemmy/user.js'
    import { hrColors } from "$lib/ui/colors"
    import { profile } from '$lib/auth'
    
    import Avatar from "$lib/components/ui/Avatar.svelte"
    import Badge from "$lib/components/ui/Badge.svelte"
    import CollapseButton from "$lib/components/ui/CollapseButton.svelte"
    import CommunityLink from "$lib/components/lemmy/community/CommunityLink.svelte"
    import Button from "$lib/components/input/Button.svelte"
    import Markdown from "$lib/components/markdown/Markdown.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"
    import Subscribe from "$lib/components/lemmy/community/Subscribe.svelte"

    import {
        Icon,
        CalendarDays,
        ChatBubbleOvalLeftEllipsis,
        LockClosed,
        PencilSquare,
        Rss,
        UserGroup,
        ArrowTopRightOnSquare,
    } from 'svelte-hero-icons'
    
   
    
    export let community: CommunityView

    function isSubscribed(community_view:CommunityView): boolean {
        if (!$profile?.user?.follows) return false
        
        for (let i:number=0; i<$profile.user.follows.length; i++) {
            if ($profile.user.follows[i].community.actor_id == community_view.community.actor_id) return true
        }
        return false
    }

    $: community, $profile?.user?.follows, community.subscribed = isSubscribed(community) ? 'Subscribed' : 'NotSubscribed'

</script>

<div class="flex flex-row gap-2 w-full items-start">
    
    <CollapseButton bottomBorder={false} class="!my-0 w-[calc(100%-60px)] lg:w-[calc(100%-120px)]">
        <Avatar width={48} alt={community.community.actor_id} url={community.community.icon ?? undefined} community={true} slot="icon"/>
        
        <div class="flex flex-row gap-2 items-center w-full justify-between" slot="title">
            
            <!--- Avatar + Community Name + !name@instance --->
            <div class="flex flex-col gap-0 w-full" >

                <button class="break-words  text-base font-bold text-sky-400 hover:underline" on:click|stopPropagation>
                    <CommunityLink showInstance={false} avatar={false} useDisplayNames community={community.community} />
                </button>
                
                <span class="flex flex-col gap-2 lg:flex-row lg:justify-between w-full">
                    <span class="flex flex-row flex-wrap opacity-80 text-xs">
                        <span>!{community.community.name}</span>
                        <span>@{new URL(community.community.actor_id).hostname}</span>
                    </span>

                    <!--- Icons/Counts Row --->
                    <span class="flex flex-row flex-wrap gap-3 font-normal items-center">
                        
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

                    </span>
                </span>
            </div>
            
            
        </div>
        
        <!---Collapsed Area--->    
        <div class="flex flex-col gap-1 text-sm max-w-full">
            
            <!---Community Description--->
            <div class="flex flex-col w-full">
                <Markdown source={community.community.description ?? '*No community information was provided.*'}/>
            </div>
        </div>
    </CollapseButton>
    
    <div class="flex flex-row items-start gap-4 mt-4">
        <div class="hidden lg:flex">
            <Button 
                title="Go to Community"     
                href="/c/{community.community.name}@{new URL(community.community.actor_id).hostname}"
                color="tertiary-border" 
                icon={ArrowTopRightOnSquare} 
                iconSize={24}
                size="md"
            />
        </div>

        <Subscribe bind:community let:subscribe let:subscribing>
            <Button
                disabled={subscribing || !$profile?.jwt}
                loading={subscribing}
                icon={Rss}
                iconSize={24}
                color="tertiary-border"
                size="md"
                class="{community.subscribed == 'NotSubscribed' ? 'opacity-70' : '!text-amber-500'}"
                title={['Subscribed', 'Pending'].includes(community.subscribed) ? 'Unsubscribe' : 'Subscribe'}
                
                on:click ={async (e) => {
                    e.stopPropagation()
                    const res = await subscribe()

                    if (res) {
                        community.subscribed = res.community_view.subscribed != 'NotSubscribed'
                            ? 'Subscribed'
                            : 'NotSubscribed'

                        await addSubscription(
                            community.community, ['Subscribed', 'Pending'].includes(res.community_view.subscribed)
                        )
                    }
                }}
                
            />
        </Subscribe>
    </div>
</div>

<hr class="{hrColors}" />

