<script lang="ts">
    import type { CommunityGroup } from '$lib/auth'
    import { goto } from '$app/navigation'

    import Button from '$lib/components/input/Button.svelte'
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'

    import {
        Icon,
        ArrowTopRightOnSquare,
        Bars3,
        PencilSquare,
        UserGroup
    } from 'svelte-hero-icons'

    export let group:CommunityGroup
    export let expanded:boolean = true;

    let open:boolean = false;
</script>


{#if group && expanded && group.communities?.length > 0}
    <div class="flex flex-col gap-1">    
        
        <div class="flex flex-row w-full px-2 gap-4 items-center">
            <SidebarButton class="w-full" title="{open ? 'Collapse' : 'Expand'} {group.name}" on:click={() => open = !open}>
                <span class="flex flex-row w-full gap-2 {expanded ? '' : 'hidden'}">
                    <Icon src={UserGroup} mini size="18" />
                    {group.name}
                </span>
            </SidebarButton>

            <span class="ml-auto"/>
            {#if expanded}
            
            <Menu
                alignment="bottom-right"
                itemsClass="h-8 md:h-8"
                containerClass="!max-h-[90vh]"
            >
                <Button color="tertiary" slot="button" let:toggleOpen on:click={toggleOpen} title="Group Options">
                    <Icon src={Bars3} mini size="16" slot="icon" />
                </Button>
                
                <!---Group Name Header--->
                <span class="px-4 py-1 my-1 text-xs text-slate-600 dark:text-zinc-400">
                    {group.name}
                </span>
        
                <!---View Group as Feed--->
                <MenuButton link href="/feeds/{group.name}" title="View as Feed">
                    <Icon src={ArrowTopRightOnSquare} mini size="18"/>
                    View as Feed
                </MenuButton>

                <!---Create Post --->
                <MenuButton link title="Edit Group">
                    <Icon src={PencilSquare} mini size="16" />
                    Edit Group
                </MenuButton>
                
            </Menu>
            {/if}
        </div>
        
        {#if open}
            <div class="pl-4 pr-2">
                <CommunityList {expanded} items={group.communities} group={group.name}/>
            </div>
        {/if}
    </div>

{/if}