<script lang="ts">
    import type { CommunityBlockView, PersonBlockView, Site, Person, InstanceBlockView } from 'lemmy-js-client'

    import { flip } from 'svelte/animate'
    import { getClient, site } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { refreshProfile } from '$lib/lemmy/user.js'
    import { slide } from 'svelte/transition'

    import Button from '$lib/components/input/Button.svelte'
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import EditableList from '$lib/components/ui/list/EditableList.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SiteLink from '$lib/components/lemmy/SiteLink.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { 
        Check, 
        Server,
        Trash, 
        User,
        UserGroup,
    } from 'svelte-hero-icons'

    let blocking = false
    
    refreshProfile()

    async function unblockUser(item: PersonBlockView) {
        if (!$profile?.jwt) return
        
        blocking = true
        await getClient().blockPerson({
            block: false,
            person_id: item.target.id,
        })
        await refreshProfile()
        blocking = false
    }
    
    async function unblockInstance(item: InstanceBlockView) {
        if (!$profile?.jwt) return
        
        blocking = true
        await getClient().blockInstance({
            instance_id: item.instance.id,
            block: false
        })
        await refreshProfile()
        blocking = false
    }

    async function unblockCommunity(item: CommunityBlockView) {
        if (!$profile?.jwt) return
        
        blocking = true
        await getClient().blockCommunity({
            block: false,
            community_id: item.community.id,
        })
        await refreshProfile()
        blocking = true
    }
</script>

<svelte:head>
    <title>Profile | Blocks</title>
</svelte:head>

<h1 class="flex flex-row justify-between">
    <span class="font-bold text-2xl">Blocks</span>
</h1>


<MainContentArea>
{#if $profile?.user}
    
    <!---User Blocks--->
    <CollapseButton title="Users" icon={User} heading={true} innerClass="max-h-[50vh] overflow-y-auto">
        {#if $profile.user.person_blocks.length > 0}
            <EditableList let:action on:action={(i) => unblockUser(i.detail)}>
                {#each $profile.user.person_blocks as block (block.target.id)}

                    <div class="flex flex-row gap-4 items-center py-4 px-2 justify-between" animate:flip={{ duration: 250 }} out:slide|local={{ axis: 'y' }} >
                        <UserLink user={block.target} avatar badges />
                        <Button size="square-md" loading={blocking} icon={Trash} iconSize={16} on:click={() => action(block)} />
                    </div>
                {/each}
            </EditableList>
        {:else}
            <Placeholder description="You have not blocked any users yet." title="No user blocks" icon={Check} />
        {/if}
    </CollapseButton>
    
    

    <!---Community Blocks--->
    <CollapseButton title="Communities" icon={UserGroup}  heading={true} innerClass="max-h-[50vh] overflow-y-auto">
        {#if $profile.user.community_blocks.length > 0}
            <EditableList let:action on:action={(i) => unblockCommunity(i.detail)}>
                {#each $profile.user.community_blocks as block (block.community.id)}
                    <div class="flex flex-row gap-4 items-center py-4 px-2 justify-between" animate:flip={{ duration: 250 }} out:slide|local={{ axis: 'y' }} >
                        <CommunityLink community={block.community} avatar />
                        <Button size="square-md" loading={blocking} icon={Trash} iconSize={16} on:click={() => action(block)} />
                    </div>
                {/each}
            </EditableList>
        {:else}
            <Placeholder description="You have not blocked any communities yet." title="No community blocks" icon={Check} />
        {/if}
    </CollapseButton>




    <!---Instance Blocks (Only show for 0.19+ instances)--->
    <CollapseButton title="Instances" icon={Server}  heading={true} innerClass="max-h-[50vh] overflow-y-auto">
        {#if $profile.user.instance_blocks.length > 0}
            <EditableList let:action on:action={(i) => unblockInstance(i.detail)}>
                {#each $profile.user.instance_blocks as block (block.instance.id)}
                    
                    <div class="flex flex-row gap-4 items-center py-4 px-2 justify-between" animate:flip={{ duration: 250 }} out:slide|local={{ axis: 'y' }} >
                        {#if block.site}
                            <SiteLink site={block.site} avatar={true} />
                        {:else}
                            {block.instance.domain}
                        {/if}
                        <Button size="square-md" loading={blocking} icon={Trash} iconSize={16} on:click={() => action(block)} />
                    </div>

                {/each}
            </EditableList>
        {:else}
            <Placeholder description="You have not blocked any instances yet." title="No instance blocks" icon={Check} />
        {/if}
    </CollapseButton>
    
{/if}
</MainContentArea>


