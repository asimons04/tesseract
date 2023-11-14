<script lang="ts">
    import type { Community } from 'lemmy-js-client'
    
    import { 
        type CommunityGroup,
        profile 
    } from '$lib/auth'
    
    import {
        addCommunityToGroup,
        addGroup,
        memberOf,
        removeCommunityFromGroup
    } from '$lib/favorites'
    
    import { toast } from '$lib/components/ui/toasts/toasts';

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { 
        Icon, 
        UserGroup,
        XCircle
    } from 'svelte-hero-icons'
    

    export let open:boolean = false;
    export let community:Community;

    $: myGroups = $profile?.groups?.map((cg:CommunityGroup) => cg.name )?.filter((gname:string) => !memberOf(community).includes(gname))?.sort() || [] as string[]
    $: communityMemberOf = memberOf(community) || [] as string[]


    let newGroupName:string = ''
    let selectedGroup:string = 'new'

    function submit() {
        newGroupName
            ? addGroup(newGroupName, [community])
            : addCommunityToGroup(community, selectedGroup);
        
        communityMemberOf = memberOf(community) || []
        toast({
            content: `Added ${community.name} to ${newGroupName ? newGroupName : selectedGroup }`,
            type: "success"
        })

        // Reset the values
        selectedGroup = 'new';
        newGroupName = ''
    }

</script>

<Modal bind:open={open} icon={UserGroup} title="Add Community to Group">
    <div class="flex flex-col gap-2">
        {#if community}
            <CommunityLink avatar avatarSize={42} community={community} />

            <div class="flex flex-col md:flex-row gap-8 w-full">
                <div class="flex flex-row gap-4 items-center w-full">
                    
                    <div class="flex flex-col gap-2 w-full">
                        <div class="flex flex-row gap-4 w-full">
                            <MultiSelect
                                fullWidth={true}
                                options={['new', ...myGroups] }
                                optionNames = {['<New Group>', ...myGroups]}
                                selected={selectedGroup}
                                headless
                                items={0}
                                on:select={(e) => {
                                    selectedGroup = e.detail
                                    newGroupName = ''
                                }}
                            >
                                <span slot="label">
                                    Select a Group
                                </span>
                            </MultiSelect>
                            
                            <span class="ml-auto"/>
                    
                            <Button disabled={selectedGroup=='new' && (newGroupName=='' || myGroups.includes(newGroupName))} color="primary" size="lg" on:click={submit} class="h-[2.5rem] mt-[1.5rem]">
                                Add
                            </Button>
                        </div>

                        {#if selectedGroup == 'new'}
                            <TextInput type="text" bind:value={newGroupName} maxlength={25} label="Group Name" placeholder="New group name"/>
                        {/if}
                    </div>
                    
                    
                </div>


                <div class="flex flex-col gap-1 w-full">
                    {#if communityMemberOf.length > 0}
                        <span class="text-sm font-bold">Member Of</span>
                        <span class="text-xs font-normal">This community is a member of the following groups:</span>
                        
                        <div class="flex flex-col gap-2 ml-[20%]">
                            {#each communityMemberOf as group}
                                <div class="w-full rounded-md bg-slate-200 dark:bg-zinc-700 flex flex-row gap-2 items-center">
                                    <p class="pl-4 py-2 text-sm font-bold">{group}</p>
    
                                    <div class="mx-auto"/>
                                    
                                    <Button
                                        color="ghost"
                                        class="mr-4 border-none"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeCommunityFromGroup(community, group);
                                            communityMemberOf = memberOf(community) || []
                                        }}
                                    >
                                        
                                        <Icon src={XCircle} mini width={22}/>
                                    </Button>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <Placeholder
                            icon={UserGroup}
                            title="No Groups"
                            description="This community is not a member of any groups yet."
                        />
                    {/if}
    
                </div>

            </div>

            
            
        {/if}

    </div>
    
    
</Modal>