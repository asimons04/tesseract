<script lang="ts">
    import type { Community } from 'lemmy-js-client'
    import type{ CommunityGroup } from '$lib/auth'

    import { onMount } from 'svelte'
    import { toast } from '$lib/components/ui/toasts/toasts';


    import {
        removeGroup,
        sortCommunities,
        updateGroup
    } from '$lib/favorites'
    
    

    import Button from '$lib/components/input/Button.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import CommunityAutocomplete from '$lib/components/lemmy/CommunityAutocomplete.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import { 
        ArrowUpTray,
        ArrowUturnDown,
        Folder,
        Trash,
        XCircle,
    } from 'svelte-hero-icons'
    

    export let open:boolean = false;
    export let group:CommunityGroup = {} as CommunityGroup
    

    let formData:CommunityGroup = {
        ...group,
        communities: [...group.communities.sort(sortCommunities)]
    }

    // Reset the formdata value to the current group
    onMount(() => reset() );

    let communitySearchInput:string
    
    let modified:boolean
    // = !(JSON.stringify(formData) == JSON.stringify(group))
    $: modified = !(JSON.stringify(formData) == JSON.stringify(group))

    function reset():void {
        formData = {
            ...group,
            communities: [...group.communities.sort(sortCommunities)]
        }
    }

    function submit() {
        if (formData.name == '') {
            toast({
                content: `Group name cannot be blank.`,
                type: "warning",
                title: "Warning"

            })
            return
        }
        
        if (updateGroup(group, formData)) {
            open = false;
            toast({
                title: `Updated Group.`,
                type: "success",
                content: `Successfully updated ${formData.name}`
            })
        }
        else {
            toast({
                content: `Failed to update group.`,
                type: "error",
                title: "Error"
            })
            return
        }
    
    }

    function removeMember(community:Community):void {
        if (!formData) return
        let communityIndex = formData.communities.findIndex((c:Community) => c.id == community.id)
        if (communityIndex < 0) return
        
        formData.communities.splice(communityIndex, 1);
        formData.communities.sort(sortCommunities)
        formData.communities = formData.communities
    }

    function addMember(community:Community):void {
        if(!formData) return
        
        let communityIndex = formData.communities.findIndex((c:Community) => c.id == community.id)
        if (communityIndex >=0) return
        
        formData.communities.push(community)
        formData.communities.sort(sortCommunities)
        
        formData.communities = formData.communities
    }

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
        formData = {} as CommunityGroup;
        open = false;
    }
    
    

</script>

{#if formData && open}
    <Modal bind:open={open} icon={Folder} preventCloseOnClickOut title="Edit Group: {group.name}"  height="h-full" width="max-w-4xl">
        <div class="flex flex-col h-full gap-2 pr-2">
            
            <TextInput bind:value={formData.name} readonly={group.name == 'Favorites'} label="Group Name" class="{group.name == 'Favorites' ? 'hidden' : ''}"/>
            
            <CommunityAutocomplete
                label="Add Member"
                placeholder="Add a community to '{formData.name}'"
                listing_type="All"
                containerClass="!max-h-[50vh]"
                bind:q={communitySearchInput}
                on:select={(e) => {
                    if (e.detail) {
                        addMember(e.detail)
                        communitySearchInput = ''
                    }
                }}
            />
            
            <div class="flex flex-col gap-2 w-full">
                {#if formData.communities.length > 0}
                    <span class="text-sm font-bold">Members</span>
                    <span class="text-xs font-normal">The following communities are members of this group:</span>
                    
                    <div class="flex flex-col gap-2 md:ml-[20%] pr-4" >
                        {#each formData.communities as community}
                            
                            <div class="flex flex-row gap-2 w-full rounded-md bg-slate-200 dark:bg-zinc-700 items-center px-2 text-sm">
                                
                                <div class="w-[calc(100%-35px-0.5rem)]">
                                    <CommunityLink avatar={true} avatarSize={18} noClick community={community} />
                                </div>

                                <div class="ml-auto w-[35px]">
                                    <Button color="ghost" class="border-none" icon={XCircle} width={22}
                                        on:click={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeMember(community);
                                        }}
                                    />
                                </div>

                            </div>
                        {/each}
                    </div>
                {:else}
                    <Placeholder
                        icon={Folder}
                        title="No Communities"
                        description="This group is empty."
                    />
                {/if}
            </div>

            <span class="mt-auto"/>
            <span class="flex flex-row gap-4 w-full p-2">
                <Button size="lg" color="danger"  class="w-full" icon={Trash} disabled={group.name == 'Favorites'}
                    on:click={() => deleteGroup()} 
                >
                    Delete
                </Button>
                <Button size="lg" color="primary" class="w-full" icon={ArrowUturnDown} on:click={reset} disabled={!modified} >Reset</Button>
                <Button size="lg" color="primary" class="w-full" icon={ArrowUpTray} on:click={submit} disabled={!modified}>Save</Button>
            </span>
        </div>

    
    </Modal>
{/if}