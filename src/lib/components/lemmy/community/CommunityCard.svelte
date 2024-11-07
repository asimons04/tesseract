<script lang="ts">
    import type { CommunityView, CommunityModeratorView } from 'lemmy-js-client'
    
    import { isFavorite } from '$lib/favorites'

    import { addSubscription } from '$lib/lemmy/user.js'
    import { amMod, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { communityProfileModal } from '../moderation/moderation'
    import { createPost } from '$lib/components/lemmy/community/helpers';
    import { fullCommunityName } from '$lib/util.js'
    import { getClient, hideCommunity } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte'
    import CommunityCardSmall from './CommunityCardSmall.svelte';
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import SidebarFooter from '$lib/components/ui/SidebarFooter.svelte'
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    

    import {
        Cog6Tooth,
        EllipsisVertical,
        HandRaised,
        Icon,
        InformationCircle,
        Minus,
        PencilSquare,
        Rss,
    } from 'svelte-hero-icons'

    export let community_view: CommunityView 
    export let moderators: Array<CommunityModeratorView> = []
    
    let groupAddModal:boolean = false
    
    let loading = {
        subscribing: false,
    }


    async function subscribe() {
        if (!$profile?.jwt) return
        loading.subscribing = true
        const subscribed = community_view.subscribed == 'Subscribed' || community_view.subscribed == 'Pending'
        try {
            await getClient().followCommunity({
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



</script>

{#if community_view}
    <!---Modal to Add Community to a Group--->
    <div class="z-20">
        <AddCommunityGroup bind:open={groupAddModal} community={community_view.community} />
    </div>

    <!--- Hideable div to contain the main part of the community sidebar --->
    <StickyCard class="{$$props.class}" >
        
        
        <CommunityCardSmall community_view={community_view} />
            
        <!--- Convenience button to create post --->
        <div class="w-full mt-2 flex flex-row gap-2 hidden xl:flex">

            <!---Create Post--->
            <Button color="tertiary-border" class="w-[45%]" size="lg"
                on:click={() => createPost(community_view.community)}
                icon={PencilSquare}
                disabled={
                    (community_view.community.posting_restricted_to_mods && !amMod($profile?.user, community_view.community)) || 
                    community_view.community.removed ||
                    (!$profile?.jwt)
                }
            >
                Create Post
            </Button>

            <!---Subscrube/UnSubscribe--->
            <Button color="tertiary-border" class="w-[45%]" size="lg" loading={loading.subscribing}
                disabled={loading.subscribing || community_view.community.removed || !$profile?.jwt} 
                icon={community_view.subscribed == 'Subscribed' ? Minus : Rss}
                on:click={ (e) => {
                    e.stopPropagation();
                    subscribe();
                }}
            >
                {
                    (community_view.subscribed == 'Subscribed' || community_view.subscribed == 'Pending')
                        ? 'Unsubscribe'
                        : 'Subscribe'
                }
            </Button>

            <Button color="tertiary-border" class="w-[10%]" size="square-lg" icon={EllipsisVertical} iconSize={20}  title="Community Actions"
                on:click={() => {
                    communityProfileModal(community_view.community)
                }}
            />
            
        </div>

        <!---Settings buttons for Mod/Admin--->
        {#if $profile?.user && amMod($profile.user, community_view.community) || (isAdmin($profile?.user) && community_view.community.local)}
            <div class="w-full flex flex-row gap-2 hidden xl:flex">
                <Button link title="Edit Community" class="w-full" size="lg" color="tertiary-border"
                    href="/c/{fullCommunityName(community_view.community.name,community_view.community.actor_id)}/settings"
                >
                    <Icon src={Cog6Tooth} mini size="16" />
                    Community Settings
                </Button>
            </div>
        {/if}    
        
        <div class="hidden xl:block w-full mt-2 overflow-y-auto">
            {#if moderators.length > 0}
                <CollapseButton icon={HandRaised} title="Moderators">
                    {#each moderators as moderator (moderator.moderator.id)}
                        <UserLink bind:user={moderator.moderator} avatar={true}/>
                    {/each}
                </CollapseButton>
            {/if}
            
            {#if community_view?.community?.description}
                <CollapseButton icon={InformationCircle} title="Community Details" expanded={false}>
                    <Markdown source={community_view.community.description} />
                </CollapseButton>
            {/if}
        
            <!-- Spacer block to give community action menu room to expand --->
            <!--<div class="hidden xl:block h-[150px]" />-->

            
        </div>

        <SidebarFooter />


    </StickyCard>
{/if}