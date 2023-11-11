<script lang="ts">
import type { CommunityGroup } from '$lib/auth'
import { goto } from '$app/navigation'

import Button from '$lib/components/input/Button.svelte'
import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
import SidebarButton from '$lib/components/ui/sidebar/SidebarButton.svelte'

import {
    Icon,
    ArrowTopRightOnSquare,
    PencilSquare,
    UserGroup
} from 'svelte-hero-icons'

export let group:CommunityGroup
export let expanded:boolean = true;

let open:boolean = false;
</script>


{#if group && group.communities?.length > 0}
    <div class="flex flex-col gap-1">    
        
        <div class="flex flex-row w-full px-2 gap-4 items-center">
            <SidebarButton class="w-full" title="{open ? 'Collapse' : 'Expand'} {group.name}" on:click={() => open = !open}>
                <span class="flex flex-row w-full gap-2 {expanded ? '' : 'hidden'}">
                    <Icon src={UserGroup} mini size="18" />
                    {group.name}
                </span>
            </SidebarButton>

            <span class="ml-auto"/>
            
            <!--Edit Group Button--->
            <span class="cursor-pointer {expanded ? '' : 'hidden'}" title="Edit Group" on:click={() => { }}>
                <Icon src={PencilSquare} mini size="18" />
            </span>

            <!---View as Feed Button--->
            <span class="cursor-pointer {expanded ? '' : 'hidden'}" on:click={() => goto(`/feeds/${group.name}`)} title="View as Feed">
                <Icon src={ArrowTopRightOnSquare} mini size="18"/>
            </span>
            
        </div>
        
        {#if open}
            <div class="pl-4">
                <CommunityList {expanded} items={group.communities} group={group.name}/>
            </div>
        {/if}
    </div>

{/if}