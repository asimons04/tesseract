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
    import { goto } from '$app/navigation'
    import { profile } from '$lib/auth'
    import {  setSessionStorage } from '$lib/session.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import AddCommunityGroup from '$lib/components/util/AddCommunityGroup.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'


    import {
        Icon,
        Bars3,
        Minus,
        PencilSquare,
        QueueList,
        Star,
        Trash
    } from 'svelte-hero-icons'

    export let community:Community
    export let hidden:boolean = false
    export let expanded:boolean = true;
    export let group:string = ''
    
    let isGroupMember:boolean = false;
    $: favorite = isFavorite(community)
    $: if (group && memberOf(community).includes(group)) isGroupMember = true;

    function removeFromCurrentGroup(confirm:boolean=false):void {
        if (!confirm) {
            toast({
                type: "warning",
                content: `Are you sure you want to remove ${community.title || community.name} from ${group}?`,
                action: () => removeFromCurrentGroup(true),
            })
            return
        }

        removeCommunityFromGroup(community, group)
    }

    function createPost() {
        setSessionStorage('lastSeenCommunity', {
            id: community.id,
            name: fullCommunityName(community.name, community.actor_id),
        });
        // Hack to get the session storage to read on create post. "goto" wasn't picking up the change
        window.location.pathname='/create/post';
    }

    let unsubscribing:boolean = false;
    async function unsubscribe(confirm:boolean=false):Promise<void> {
        if (!$profile?.jwt) return
        
        if (!confirm) {
            toast({
                type: "warning",
                content: `Are you sure you want to unsubscribe from ${community.title || community.name}?`,
                action: () => unsubscribe(true),
            })
            return
        }
    
        unsubscribing = true
        try {
            await getClient().followCommunity({
                auth: $profile.jwt,
                community_id: community.id,
                follow: false,
            })
        } catch (error) {
            toast({ content: error as any, type: 'error' })
        }
        
        addSubscription(community, false)
        unsubscribing = false
    }
    
    let groupAddModal:boolean = false;
</script>

<div class="z-20">
    <AddCommunityGroup bind:open={groupAddModal} community={community} />
</div>

<div class="inline-flex w-full" class:hidden={hidden}>
    <Button
        class="hover:bg-slate-200 w-full h-max {expanded ? '' : '!p-1.5'}"
        color="tertiary"
        alignment="left"
        href="/c/{community.name}@{new URL(community.actor_id).hostname}"
        title="{community.title.replace('&amp;', '&')}@{new URL(community.actor_id).hostname}"
    >
        <div class="flex-none">
            <Avatar
                url={community.icon}
                alt={community.name}
                title={community.title}
                width={20}
                slot="icon"
            />
        </div>
        
        <span class="w-full break-words" class:hidden={!expanded}>
            {community.title.replace('&amp;', '&')}
        </span>

        <span class="ml-auto"/>

    </Button>
    
    {#if expanded}
    <Menu alignment="bottom-right" itemsClass="h-8 md:h-8" containerClass="!max-h-[90vh] max-w-[19rem]">
        <Button color="tertiary" slot="button" let:toggleOpen on:click={toggleOpen} title="Community Options">
            <Icon src={Bars3} mini size="16" slot="icon" />
        </Button>
        
        <!---Community Name Header--->
        <span class="px-4 py-1 my-1 text-xs text-slate-600 dark:text-zinc-400">
            {community.title ?? community.name}@{new URL(community.actor_id).host}
        </span>

        <!---Create Post --->
        <MenuButton link href="/create/post"
            disabled={(community.posting_restricted_to_mods && !amMod($profile.user, community)) || community.removed}
            on:click={createPost}
            title="Create post"
        >
            <Icon src={PencilSquare} mini size="16" />
            Create Post
        </MenuButton>

        <!---Favorite/Unfavorite--->
        <MenuButton title="{favorite ? 'Remove from Favorites' : 'Add to Favorites'}" on:click={(e) => {e.stopPropagation(); addFavorite(community, !favorite)} }>
            <Icon src={Star} mini size="16" />
            {favorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </MenuButton>

        <!---Add to Group--->
        <MenuButton title="Add/Remove to Group" on:click={(e) => {e.stopPropagation(); groupAddModal=!groupAddModal} }>
            <Icon src={QueueList} mini size="16" />
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
            <span class="flex flex-row gap-2 w-full" on:click={ (e) => {
                e.stopPropagation();
                unsubscribe();
            }}>
                <span class:hidden={unsubscribing}>
                    <Icon src={Minus} mini size="16" />
                </span>
                Unsubscribe
            </span>
        </MenuButton>

        
    </Menu>
    {/if}
</div>