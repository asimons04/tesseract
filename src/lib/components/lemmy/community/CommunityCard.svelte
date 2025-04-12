<script lang="ts">
    import type { CommunityView, CommunityModeratorView } from 'lemmy-js-client'
    
    import { addSubscription } from '$lib/lemmy/user.js'
    import { amMod, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { communityProfileModal } from '../moderation/moderation'
    import { createPost } from '$lib/components/lemmy/community/helpers';
    import { fullCommunityName } from '$lib/util.js'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import Button                   from '$lib/components/input/Button.svelte'
    import CollapseButton           from '$lib/components/ui/CollapseButton.svelte'
    import CommunityCardSmall       from './CommunityCardSmall.svelte';
    import CommunitySubscribeButton from './CommunitySubscribeButton.svelte'
    import Markdown                 from '$lib/components/markdown/Markdown.svelte'
    import SidebarFooter            from '$lib/components/ui/SidebarFooter.svelte'
    import StickyCard               from '$lib/components/ui/StickyCard.svelte'
    import UserLink                 from '$lib/components/lemmy/user/UserLink.svelte'
    

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
    import CommunityCreatePostButton from './CommunityCreatePostButton.svelte';
    

    export let community_view: CommunityView 
    export let moderators: Array<CommunityModeratorView> = []

</script>

{#if community_view}
    <!--- Hideable div to contain the main part of the community sidebar --->
    <StickyCard class="{$$props.class}" >
        
        
        <CommunityCardSmall community_view={community_view} />
            
        <!--- Convenience button to create post --->
        <div class="w-full mt-2 flex flex-row gap-2 hidden xl:flex">

            <!---Create Post--->
            <CommunityCreatePostButton {community_view} class="w-[45%]" />

            <!---Subscrube/UnSubscribe--->
            <CommunitySubscribeButton {community_view} class="w-[45%]" />

            <!---Bring Up Community Modal--->
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
                    disabled={community_view.banned_from_community}
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
                <CollapseButton icon={InformationCircle} title="Community Details" expanded={true}>
                    <Markdown source={community_view.community.description} />
                </CollapseButton>
            {/if}
        </div>

        <SidebarFooter />


    </StickyCard>
{/if}