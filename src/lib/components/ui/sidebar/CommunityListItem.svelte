<script lang="ts">
    import type { Community } from 'lemmy-js-client'

    import { 
        addFavorite, 
        addCommunityToGroup, 
        isFavorite, 
        memberOf,
        removeCommunityFromGroup
    } from '$lib/favorites'
    
    import { addSubscription } from '$lib/lemmy/user.js'
    import {getClient} from '$lib/lemmy'

    import { amMod, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { fullCommunityName } from '$lib/util.js'
    import { profile } from '$lib/auth'
    import { createPost, shortenCommunityName } from '$lib/components/lemmy/community/helpers'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'


    import {
        Icon,
        Bars3,
        Cog6Tooth,
        Minus,
        PencilSquare,
        Star,
        Trash,
        UserGroup,
    } from 'svelte-hero-icons'

    export let community:Community
    export let hidden:boolean = false
    export let expanded:boolean = true;
    export let group:string = ''
    export let menu:boolean = false
    
    let isGroupMember:boolean = false;
    $: favorite = isFavorite(community)
    $: if (group && memberOf(community).includes(group)) isGroupMember = true;

    function removeFromCurrentGroup(confirm:boolean=false):void {
        if (!confirm) {
            toast({
                type: "warning",
                title: "Confirm Remove",
                content: `Are you sure you want to remove ${shortenCommunityName(community.title, 30) || community.name} from ${group}?`,
                action: () => removeFromCurrentGroup(true),
            })
            return
        }

        removeCommunityFromGroup(community, group)
    }


    let unsubscribing:boolean = false;
    async function unsubscribe(confirm:boolean=false):Promise<void> {
        if (!$profile?.jwt) return
        
        if (!confirm) {
            toast({
                type: "warning",
                title: "Confirm Unsubscribe",
                content: `Are you sure you want to unsubscribe from ${community.title || community.name}?`,
                action: () => unsubscribe(true),
            })
            return
        }
    
        unsubscribing = true
        try {
            await getClient().followCommunity({
                community_id: community.id,
                follow: false,
            })
        } catch (error) {
            toast({ title: 'Error', content: error as any, type: 'error' })
        }
        
        addSubscription(community, false)
        unsubscribing = false
    }
    
    let groupAddModal:boolean = false;
</script>

{#if menu}
<div class="z-20">
    <AddCommunityGroup bind:open={groupAddModal} community={community} />
</div>
{/if}

<div class="inline-flex w-full" class:hidden={hidden}>
    <Button
        class="!text-xs hover:bg-slate-200 w-full h-max {expanded ? '' : '!p-1.5'}"
        color="tertiary"
        alignment="left"
        href="/c/{community.name}@{new URL(community.actor_id).hostname}"
        title="{community.title.replace('&amp;', '&')}@{new URL(community.actor_id).hostname}"
    >
        <div class="flex-none">
            <Avatar url={community.icon} alt={community.name} title={community.title} width={20} community={true} background={true} slot="icon" />
        </div>
        
        <span class="w-full break-words capitalize" class:hidden={!expanded}>
            {shortenCommunityName(community.title, 30)}
        </span>

        <span class="ml-auto"/>

    </Button>
    
    {#if expanded && menu}
    <Menu alignment="bottom-right" itemsClass="h-8 md:h-8" containerClass="!max-h-[90vh] max-w-[19rem]">
        <Button color="tertiary" slot="button" let:toggleOpen on:click={(e) => { e.stopPropagation(); toggleOpen() }} title="Community Options">
            <Icon src={Bars3} mini size="16" slot="icon" />
        </Button>
        
        <!---Community Name Header--->
        <span class="px-4 py-1 my-1 text-xs text-slate-600 dark:text-zinc-400">
            {shortenCommunityName(community.title, 30) ?? community.name}@{new URL(community.actor_id).host}
        </span>

        <!---Create Post --->
        {#if $profile?.user}
        <MenuButton title="Create post"
            disabled={(community.posting_restricted_to_mods && !amMod($profile.user, community)) || community.removed}
            on:click={() => createPost(community)}
        >
            <Icon src={PencilSquare} mini size="16" />
            Create Post
        </MenuButton>
        {/if}

        <!---Favorite/Unfavorite--->
        <MenuButton title="{favorite ? 'Remove from Favorites' : 'Add to Favorites'}" on:click={(e) => {e.stopPropagation(); addFavorite(community, !favorite)} }>
            <Icon src={Star} mini size="16" />
            {favorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </MenuButton>

        <!---Add to Group--->
        <MenuButton title="Add/Remove to Group" on:click={(e) => {e.stopPropagation(); groupAddModal=!groupAddModal} }>
            <Icon src={UserGroup} mini size="16" />
            Add/Remove to Group(s)
        </MenuButton>

        <!---Remove from Group--->
        {#if isGroupMember && group != 'Favorites'}
        <MenuButton title="Remove from Group" on:click={(e) => {e.stopPropagation(); removeFromCurrentGroup()}} >
            <Icon src={Trash} mini size="16" />
            Remove from {group}
        </MenuButton>
        {/if}

        <!---Unsubscribe--->
        <MenuButton disabled={unsubscribing} loading={unsubscribing}>
            
            <button class="flex flex-row gap-2 w-full" tabindex="0" on:click|stopPropagation={ () => {
                unsubscribe();
            }}>
                <span class:hidden={unsubscribing}>
                    <Icon src={Minus} mini size="16" />
                </span>
                Unsubscribe
            </button>
        </MenuButton>

        <!---Community Settings--->
        {#if amMod($profile?.user, community) || (community.local && isAdmin($profile?.user))}
            <MenuButton title="Community Settings" link href="/c/{community.name}@{new URL(community.actor_id).hostname}/settings">
                <Icon src={Cog6Tooth} mini size="16"/>
                Community Settings
            </MenuButton>

        {/if}

        
    </Menu>
    {/if}
</div>