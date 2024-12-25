<script lang="ts">
    import type { CommunityGroup } from '$lib/auth'
    
    import { editCommunityGroup } from '$lib/components/lemmy/moderation/moderation'
    import { removeGroup } from '$lib/favorites'
    import { slide } from 'svelte/transition'
    import { toast } from '$lib/components/ui/toasts/toasts';

    import Button from '$lib/components/input/Button.svelte'
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'

    import {
        Icon,
        Bars3,
        Folder,
        FolderOpen,
        PencilSquare,
        Trash,
    } from 'svelte-hero-icons'

    export let group:CommunityGroup
    export let showEmptyGroups:boolean = false;
    export let expanded:boolean = true;

    function deleteGroup(confirm:boolean=false):void {
        if (!confirm) {
            toast({
                type: "warning",
                content: `Are you sure you want to remove ${group.name}?`,
                action: () => deleteGroup(true),
            })
            return
        }
        removeGroup(group.name)


    }
    
    let open:boolean = false;
</script>


{#if group && expanded && (showEmptyGroups || group.communities?.length > 0)}
    <div class="flex flex-col gap-1">    
        
        <div class="border border-transparent bg-transparent hover:bg-slate-200 hover:dark:bg-zinc-800 dark:text-zinc-200  border-none disabled:border-none
            flex flex-row w-full px-2 gap-1 items-center rounded-md {open ? '!bg-slate-200 dark:!bg-zinc-800' : ''}"
        >
            <SidebarButton class="w-full {open ? '' : 'opacity-80'}" title="{open ? 'Collapse' : 'Expand'} {group.name}" on:click={ (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    open = !open
                }}
            >
                <Icon src={open ? FolderOpen : Folder} mini size="16"/>
                <span class="font-bold">{group.name}</span>
            </SidebarButton>

            <span class="ml-auto"/>

            {#if expanded}
                <!--<Button size="sm" color="ghost" class="border-none" icon={ArrowTopRightOnSquare} href="/feeds/{group.name}" title="View as Feed"/>-->

                <Menu alignment="bottom-right" itemsClass="h-8 md:h-8" containerClass="!max-h-[90vh] max-w-[18rem]">
                    
                    <Button color="tertiary" slot="button" let:toggleOpen title="Group Options" 
                        icon={Bars3} iconSize={16}
                        on:click={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleOpen()
                        }}
                    />
                    
                    <!---Group Name Header--->
                    <span class="px-4 py-1 my-1 text-xs text-slate-600 dark:text-zinc-400">
                        {group.name}
                    </span>
            

                    <!---Edit Group --->
                    <MenuButton title="Edit Group" on:click={(e)=> {
                            e.preventDefault()
                            e.stopPropagation()
                            editCommunityGroup(group)
                        }}
                    >
                        <Icon src={PencilSquare} mini size="16" />
                        Edit Group
                    </MenuButton>

                    <!---Delete Post --->
                    <MenuButton title="Delete Group" on:click={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            deleteGroup()
                        }}
                    >
                        <Icon src={Trash} mini size="16"/>
                        Delete Group
                    </MenuButton>
                    
                </Menu>
            {/if}
        </div>
        
        {#if open}
            <div class="flex flex-col gap-2 pl-1 pr-2" transition:slide>
                <CommunityList {expanded} items={group.communities} group={group.name} 
                    placeholderTitle="Empty Group" 
                    placeholderDescription="There are no communities in this group"
                />
            </div>
        {/if}
    </div>

{/if}