<script lang="ts">
    import type { CommunityBlockView, PersonBlockView, Site, Person } from 'lemmy-js-client'
    import type { PageData } from './$types.js'

    import { flip } from 'svelte/animate'
    import { blockInstance, getClient, site } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
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
        Icon, 
        Server,
        Trash, 
        User,
        UserGroup,
    } from 'svelte-hero-icons'
    
    interface InstanceBlockView {
        instance: {
            domain: string,
            id: number,
            published: string,
            software: string,
            updated: string,
            version: string
        }
        person?: Person,
        site?: Site
    }
  
    export let data: PageData & {
        person_blocks: PersonBlockView[]
        community_blocks: CommunityBlockView[]
        instance_blocks?: InstanceBlockView[]
    }

    async function unblockUser(item: PersonBlockView) {
        if (!$profile?.jwt) return

        data.person_blocks.splice(
            data.person_blocks.findIndex((i) => i.target.id == item.target.id)
            , 1
        )
        data.person_blocks = data.person_blocks

        await getClient().blockPerson({
            auth: $profile.jwt,
            block: false,
            person_id: item.target.id,
        })
    }
    
    async function unblockInstance(item: InstanceBlockView) {
        const blocked = await blockInstance(item.instance.id, false)
        
        if (!blocked.blocked) {
            data.instance_blocks?.splice(
                data.instance_blocks?.findIndex( (i) => i.instance.id == item.instance.id )
                , 1
            )

            data.instance_blocks = data.instance_blocks
        }
    }

    async function unblockCommunity(item: CommunityBlockView) {
        if (!$profile?.jwt) return

        data.community_blocks.splice(
            data.community_blocks.findIndex(
                (i) => i.community.id == item.community.id)
            ,1
        )
        data.community_blocks = data.community_blocks

        await getClient().blockCommunity({
            auth: $profile.jwt,
            block: false,
            community_id: item.community.id,
        })
    }
</script>

<svelte:head>
    <title>Profile | Blocks</title>
</svelte:head>

<h1 class="flex flex-row justify-between">
    <span class="font-bold text-2xl">Blocks</span>
</h1>


<MainContentArea>

    <!---User Blocks--->
    <CollapseButton title="Users" icon={User} heading={true} innerClass="max-h-[50vh] overflow-y-auto">
        {#if data.person_blocks.length > 0}
            <EditableList let:action on:action={(i) => unblockUser(i.detail)}>
                {#each data.person_blocks as block (block.target.id)}
                    <div class="flex flex-row gap-4 items-center py-4 justify-between" animate:flip={{ duration: 250 }} out:slide|local={{ axis: 'y' }} >
                        <UserLink user={block.target} avatar badges />
                        <Button size="square-md" on:click={() => action(block)}>
                            <Icon src={Trash} mini size="16" slot="icon" />
                        </Button>
                    </div>
                {/each}
            </EditableList>
        {:else}
            <Placeholder description="You have not blocked any users yet." title="No user blocks" icon={Check} />
        {/if}
    </CollapseButton>
    
    

    <!---Community Blocks--->
    
    <CollapseButton title="Communities" icon={UserGroup}  heading={true} innerClass="max-h-[50vh] overflow-y-auto">
        {#if data.community_blocks.length > 0}
            <EditableList let:action on:action={(i) => unblockCommunity(i.detail)}>
                {#each data.community_blocks as block (block.community.id)}
                    <div class="flex flex-row gap-4 items-center py-4 justify-between" animate:flip={{ duration: 250 }} out:slide|local={{ axis: 'y' }} >
                        <CommunityLink community={block.community} avatar />
                        <Button size="square-md" on:click={() => action(block)}>
                            <Icon src={Trash} mini size="16" slot="icon" />
                        </Button>
                    </div>
                {/each}
            </EditableList>
        {:else}
            <Placeholder description="You have not blocked any communities yet." title="No community blocks" icon={Check} />
        {/if}
    </CollapseButton>




    <!---Instance Blocks (Only show for 0.19+ instances)--->
    {#if $site?.version.startsWith('0.19')}
    <CollapseButton title="Instances" icon={Server}  heading={true} innerClass="max-h-[50vh] overflow-y-auto">
        {#if data.instance_blocks && data.instance_blocks?.length > 0}
            <EditableList let:action on:action={(i) => unblockInstance(i.detail)}>
                {#each data.instance_blocks as block (block.instance.id)}
                    
                    <div class="flex flex-row gap-4 items-center py-4 justify-between" animate:flip={{ duration: 250 }} out:slide|local={{ axis: 'y' }} >
                        {#if block.site}
                            <SiteLink site={block.site} avatar={true} />
                        {:else}
                            {block.instance.domain}
                        {/if}
                        <Button size="square-md" on:click={() => action(block)}>
                            <Icon src={Trash} mini size="16" slot="icon" />
                        </Button>
                    </div>

                {/each}
            </EditableList>
        {:else}
            <Placeholder description="You have not blocked any instances yet." title="No instance blocks" icon={Check} />
        {/if}
    </CollapseButton>
    {/if}
</MainContentArea>


