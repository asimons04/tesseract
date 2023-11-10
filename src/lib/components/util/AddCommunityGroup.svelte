<script lang="ts">
    import type {
        Community
    } from 'lemmy-js-client'
    
    import { 
        type CommunityGroup,
        profile 
    } from '$lib/auth'
    
    import {
        addCommunityToGroup,
        addGroup,
        saveProfile
    } from '$lib/favorites'
    import { toast } from '$lib/components/ui/toasts/toasts';

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { 
        Icon, 
        UserGroup,
    } from 'svelte-hero-icons'
    

    export let open:boolean = false;
    export let community:Community;
    
    let myGroups:string[] = []
    $: myGroups = $profile?.groups?.map((cg:CommunityGroup) => cg.name)?.sort() || [] as string[]

    let newGroupName:string = ''
    let selectedGroup:string = 'new'

    function submit() {
        if (newGroupName) addGroup(newGroupName, [community])
        else addCommunityToGroup(community, selectedGroup);
        
        toast({
            content: `Added ${community.name} to ${newGroupName ? newGroupName : selectedGroup }`,
            type: "success"
        })

        // Reset the values
        open = !open
        selectedGroup = 'new';
        newGroupName = ''
    }

</script>

<Modal bind:open={open} icon={UserGroup} title="Add Community to Group">
    <div class="flex flex-col gap-2">
        {#if community}
            <CommunityLink avatar avatarSize={42} community={community} />

            <div class="flex flex-row gap-4 items-center mx-auto">
                
                
                <MultiSelect
                    options={['new', ...myGroups] }
                    optionNames = {['New Group', ...myGroups]}
                    selected={selectedGroup}
                    headless
                    items={0}
                    on:select={(e) => {
                        selectedGroup = e.detail
                    }}
                >
                    <span slot="label">
                        Select a Group
                    </span>
                </MultiSelect>

                {#if selectedGroup == 'new'}
                    <TextInput type="text" bind:value={newGroupName} maxlength={25} label="Group Name" placeholder="New group name"/>
                {/if}
                
                <span class="ml-auto"/>
                
                <Button disabled={selectedGroup=='new' && newGroupName==''} color="primary" size="lg" on:click={submit} class="h-[2.5rem] mt-[1.5rem]">
                    Add
                </Button>
            </div>

            
        {/if}

    </div>
    
    
</Modal>