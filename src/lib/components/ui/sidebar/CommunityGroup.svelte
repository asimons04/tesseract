<script lang="ts">
    import type { CommunityGroup } from '$lib/auth'
    
    import { editCommunityGroup } from '$lib/components/lemmy/moderation/moderation'
    import { removeGroup } from '$lib/favorites'
    import { slide } from 'svelte/transition'
    import { toast } from '$lib/components/ui/toasts/toasts';

    import Button from '$lib/components/input/Button.svelte'
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'

    import {
        Icon,
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
    <div class="flex flex-col px-2 gap-0">    
        
        <div class="flex flex-row w-full gap-1 items-center rounded-md {open ? '!bg-slate-200 dark:!bg-zinc-800' : ''}">
            <SidebarButton class="w-[calc(100%-96px)] {open ? 'mb-[6px]' : 'opacity-80'}" 
                title="{open ? 'Collapse' : 'Expand'} {group.name}" 
                icon={open ? FolderOpen : Folder}
                iconSize={16}
                on:click={ (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    open = !open
                }}
            >
                <span class="w-[calc(100%-18px)] {open ? 'font-bold' : ''} truncate">{group.name}</span>
            </SidebarButton>

            <span class="ml-auto"/>
            <!--Edit/Delete Buttons--->
            <span class="{expanded ? 'flex' : 'hidden'} flex-row gap-2 items-center">
                <!---Edit Group --->
                <Button title="Edit Group" 
                    icon={PencilSquare} iconSize={16}
                    on:click={(e)=> {
                        e.preventDefault()
                        e.stopPropagation()
                        editCommunityGroup(group)
                    }}
                />

                <!---Delete Group --->
                <Button title="Delete Group" 
                    icon={Trash} iconSize={16}
                    on:click={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteGroup()
                    }}
                />
            </span>
            
        </div>
        
        {#if open}
            <div class="flex flex-col gap-2 pl-1 pr-2 {open ? '!bg-slate-200 dark:!bg-zinc-800 -mt-[4px] rounded-bl-md rounded-br-md' : ''}" transition:slide>
                <CommunityList {expanded} items={group.communities} group={group.name} 
                    placeholderTitle="Empty Group" 
                    placeholderDescription="There are no communities in this group"
                />
            </div>
        {/if}
    </div>

{/if}