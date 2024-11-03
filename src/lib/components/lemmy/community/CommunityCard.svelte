<script lang="ts">
    import type { CommunityView, CommunityModeratorView } from 'lemmy-js-client'
    
    import {addFavorite, isFavorite } from '$lib/favorites'

    import { addSubscription } from '$lib/lemmy/user.js'
    import { amMod, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { createPost } from '$lib/components/lemmy/community/helpers';
    import { fullCommunityName } from '$lib/util.js'
    import { getClient, hideCommunity } from '$lib/lemmy.js'
    import { goto } from '$app/navigation';
    import {imageProxyURL} from '$lib/image-proxy'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import SidebarFooter from '$lib/components/ui/SidebarFooter.svelte';
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    

    import {
        Calendar,
        ChatBubbleOvalLeftEllipsis,
        Cog6Tooth,
        EllipsisHorizontal,
        EllipsisVertical,
        Eye,
        EyeSlash,
        HandRaised,
        Icon,
        InformationCircle,
        Minus,
        MinusCircle,
        Newspaper,
        PencilSquare,
        Plus,
        PlusCircle,
        QueueList,
        Rss,
        ShieldCheck,
        ShieldExclamation,
        Star,
        Trash,
        UserGroup,
    } from 'svelte-hero-icons'
    import CommunityLink from './CommunityLink.svelte';
    
    
    

    export let community_view: CommunityView 
    export let moderators: Array<CommunityModeratorView> = []
    
    let groupAddModal:boolean = false
    let loading = {
        blocking: false,
        hiding: false,
        removing: false,
        subscribing: false,
    }

    $: favorite = isFavorite(community_view.community)

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

    async function remove() {
        if (!$profile?.jwt) return
        loading.removing = true
        
        const removed = community_view.community.removed

        try {
            await getClient().removeCommunity({
                community_id: community_view.community.id,
                removed: !removed,
            })
            community_view.community.removed = !removed
        } catch (error) {
            toast({ content: error as any, type: 'error' })
        }
        loading.removing = false
    }

    async function block() {
        if (!$profile?.jwt) return
        loading.blocking = true
        const blocked = community_view.blocked

        try {
            await getClient().blockCommunity({
                community_id: community_view.community.id,
                block: !blocked,
            })
            community_view.blocked = !blocked
        } catch (error) {
            toast({ content: error as any, type: 'error' })
        }
      
        loading.blocking = false
        
        goto($page.url.toString(), {
            invalidateAll: true,
        })
    }

    async function hide() {
        if (!$profile?.jwt) return
        loading.hiding = true
        
        const hidden = community_view.community.hidden;
        try {
            await hideCommunity(community_view.community.id, !hidden); 
            community_view.community.hidden = !hidden

        } catch (error) {
            toast({content: error as any, type: 'error'})
        }
        loading.hiding = false;

        goto($page.url.toString(), {
            invalidateAll: true,
        })
    }

</script>

{#if community_view}
    <!---Modal to Add Community to a Group--->
    <div class="z-20">
        <AddCommunityGroup bind:open={groupAddModal} community={community_view.community} />
    </div>

    <!--- Hideable div to contain the main part of the community sidebar --->
    <StickyCard class="{$$props.class}" >
        <Card backgroundImage={($userSettings.uiState.showBannersInCards && community_view?.community?.banner) ? imageProxyURL(community_view.community.banner, undefined, 'webp') : ''}
            class="p-2 text-base overflow-hidden min-h-[190px]"
        >
            <div class="flex flex-col gap-2 h-full">
                <CommunityLink avatar avatarSize={64} useDisplayNames showInstance inline={false}
                    bind:community={community_view.community} 
                    class="text-lg"
                />

                <div class="mt-auto"/>

                <!-- Community subscribers, counts, etc --->
                <Card elevation={0} class="p-1 w-full opacity-80">
                    <div class="flex flex-row p-1 mx-auto">
                        
                        <div class="text-sm flex flex-row flex-wrap gap-8 mx-auto">
                            <span class="flex flex-row items-center gap-2" title="Created">
                                <Icon src={Calendar} width={16} height={16} mini />
                                <RelativeDate date={community_view.community.published} />
                            </span>

                            <span class="flex flex-row items-center gap-2" title="Subscribers">
                                <Icon src={UserGroup} width={16} height={16} mini />
                                <FormattedNumber number={community_view.counts.subscribers} />
                            </span>

                            <span class="flex flex-row items-center gap-2" title="Posts">
                                <Icon src={PencilSquare} width={16} height={16} mini />
                                <FormattedNumber number={community_view.counts.posts} />
                            </span>

                            <span class="flex flex-row items-center gap-2" title="Comments">
                                <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                                <FormattedNumber number={community_view.counts.comments} />
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            
        </Card>
            
        <!--- Convenience button to create post --->
        <div class="w-full mt-2 flex flex-row gap-2 hidden xl:flex">
            {#if $profile?.jwt && $profile?.user}
                
                <!---Create Post--->
                <Button color="tertiary-border" class="w-full" size="lg"
                    on:click={() => createPost(community_view.community)}
                    hidden={
                        (community_view.community.posting_restricted_to_mods && !amMod($profile.user, community_view.community)) || 
                        community_view.community.removed
                    }
                >
                    <Icon src={PencilSquare} mini size="16" slot="icon" />
                    Create Post
                </Button>

                <!---Subscrube/UnSubscribe--->
                <Button color="tertiary-border" class="w-full" size="lg" loading={loading.subscribing}
                    disabled={loading.subscribing || community_view.community.removed } 
                    on:click={ (e) => {
                        e.stopPropagation();
                        subscribe();
                    }}
                >
                    <Icon src={community_view.subscribed == 'Subscribed' ? Minus : Rss} mini size="16"/>
                    {
                        (community_view.subscribed == 'Subscribed' || community_view.subscribed == 'Pending')
                            ? 'Unsubscribe'
                            : 'Subscribe'
                    }
                </Button>
            {/if}
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