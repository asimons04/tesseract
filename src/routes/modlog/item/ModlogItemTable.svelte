<script lang="ts">
    import type {Filters, ModLog} from '../+page.js'
    import type { Person } from 'lemmy-js-client'

    import { getClient } from '$lib/lemmy'
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'
    import { StorageCache } from '$lib/storage-controller'
    import { userSettings } from '$lib/settings'

    import CommunityLink    from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Link             from '$lib/components/input/Link.svelte'
    import Markdown         from '$lib/components/markdown/Markdown.svelte'
    import ModlogAction     from '../ModlogAction.svelte'
    import RelativeDate     from '$lib/components/util/RelativeDate.svelte'
    import UserLink         from '$lib/components/lemmy/user/UserLink.svelte'
    
    import { Icon, 
        MinusCircle, 
        PlusCircle, 
    } from 'svelte-hero-icons'
    import { sleep } from '$lib/components/lemmy/post/helpers.js';
    
    
    export let item: ModLog
    export let filter: Filters
    export let showModeratorColumn: boolean = true
    export let showAbsoluteTime: boolean = false

    $: selectedType = $page.url.searchParams.get('type')
    $: item, $userSettings.modlogResolveMissingNames,  populateModeratee()
    
    function randomInteger(min:number, max:number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Lemmy stupidly doesn't include the moderatee/person in post removal responses. Add it dynamically.
    const populateModeratee = async () => {
        if ($userSettings.modlogResolveMissingNames && ['postRemoval', 'postRestore', 'postLock', 'postUnlock'].includes(item.actionName) && item.post && !item.moderatee) {
            try {
                await sleep(randomInteger(10, 100))
                const storage = new StorageCache({
                    type: 'session',
                    ttl: 5,
                    useCompression: false
                })
                const key = `person_id: ${item.post.creator_id}`
                
                // Try to use the already populated person object from the filter if it's available.
                if (filter.moderatee?.person?.id == item.post.creator_id) {
                    item.moderatee = filter.moderatee.person
                    storage.put(key, filter.moderatee.person)
                    return
                }
                
                // Check if the person details are already in the session cache
                let person = await storage.get(key) as Person|undefined
                
                // If not otherwise available, call the API to get the person's details.
                if (!person) {
                    person = (await getClient().getPersonDetails({person_id: item.post.creator_id, limit: 1})).person_view.person 
                    storage.put(key, person)
                }

                item.moderatee = person
            }
            catch {}
        }
    }
</script>

<div class="flex flex-col w-full gap-1 pt-2 overflow-x-scroll">
    <div class="flex flex-col gap-1 items-start lg:flex-row lg:gap-4 lg:items-center w-full max-w-full" >

        <!---Date/Time--->
        <div class="flex flex-row gap-2 px-1 text-xs w-full lg:w-[8%]">
            <span class="lg:hidden text-xs font-bold min-w-[10ch]">When:</span>
            <RelativeDate date={item.when} {showAbsoluteTime}/>
        </div>

        <!---Community--->
        <div class="flex flex-row gap-1 px-1 text-xs w-full lg:w-[19%] truncate items-center">
            
            <span class="flex flex-row gap-2 items-center w-full">
                {#if item.community}        
                    <span class="lg:hidden text-xs font-bold min-w-[10ch]">Community:</span>
                    <button class="cursor-pointer" title="Filter modlog for {item.community.name}" on:click={() => {
                        filter.community.set = !filter.community.set;
                        if (item?.community?.id && filter.community.set) {
                            filter.community.community = item.community;
                            searchParam($page.url, 'community', item.community.id.toString(), 'page');
                        } else {
                            searchParam($page.url, 'community', '', 'community');
                        }
                        
                    }}>
                        <Icon src={filter.community.set ? MinusCircle : PlusCircle} mini width={24} />
                    </button>

                    <CommunityLink avatar={false} avatarSize={20} community={item.community} inline={true} class="truncate"/>
                {/if}
            </span>
            
        </div>
        
        <!---Moderator--->
        {#if showModeratorColumn}
        <div class="flex flex-row gap-1 px-1 text-xs w-full lg:w-[19%] truncate items-center">
            
            <span class="flex flex-row gap-2 items-center w-full">    
                <span class="lg:hidden text-xs font-bold min-w-[10ch]">Mod:</span>
                {#if item.moderator}    
                    <button class="cursor-pointer" title="Filter modlog for {item.moderator.name}" on:click={() => {
                        filter.moderator.set = !filter.moderator.set;
                        if (item?.moderator && filter.moderator.set) {
                            filter.moderator.person = item.moderator;
                            searchParam($page.url, 'mod_id', item.moderator.id.toString(), 'page');
                        } else {
                            searchParam($page.url, 'mod_id', '', 'mod_id');
                        }
                        
                    }}>
                        <Icon src={filter.moderator.set ? MinusCircle : PlusCircle} mini width={24} />
                    </button>

                    <UserLink avatar={false} showNewAccountBadge={false} avatarSize={20} user={item.moderator} inline={true} class="truncate"/>
                {:else}
                    ---
                {/if}
            </span>
            
        </div>
        {/if}
        

        <!---Moderatee--->
        <div class="flex flex-row gap-1 px-1 text-xs w-full lg:w-[19%] truncate items-center">
            
            <span class="flex flex-row gap-2 items-center w-full">    
                <span class="lg:hidden text-xs font-bold min-w-[10ch]">User:</span>
                {#if item.moderatee}    
                    <button class="cursor-pointer" title="Filter modlog for {item.moderatee.name}" on:click={() => {
                        filter.moderatee.set = !filter.moderatee.set;
                        if (item?.moderatee && filter.moderatee.set) {
                            filter.moderatee.person = item.moderatee;
                            searchParam($page.url, 'other_person_id', item.moderatee.id.toString(), 'page');
                        } else {
                            searchParam($page.url, 'other_person_id', '', 'other_person_id');
                        }
                        
                    }}>
                        <Icon src={filter.moderatee.set ? MinusCircle : PlusCircle} mini width={24} />
                    </button>

                    
                    <UserLink avatar={false} user={item.moderatee} showNewAccountBadge={false} inline={true} class="truncate"/>
                {/if}
            </span>
            

        </div>


        <!---Details--->
        <div class="px-1 text-xs w-full {showModeratorColumn ? 'lg:w-[35%]' : 'lg:w-[55%]'}">
            <div class="flex flex-col text-xs gap-2 text-xs w-full">
                
                <!---Action--->
                <span class="flex flex-row gap-2 items-start w-full">    
                    <span class="text-xs font-bold min-w-[10ch]">Action:</span>
                    
                    <button class="cursor-pointer" title="Filter modlog for actions of type {item.type}" on:click={() => {
                        if ( selectedType != item.type) {
                            searchParam($page.url, 'type', item.type, 'page');
                        } else {
                            searchParam($page.url, 'type', 'All', 'page');
                        }
                        
                    }}>
                        <Icon src={selectedType == item.type ? MinusCircle : PlusCircle} mini width={24} />
                    </button>

                    <ModlogAction action={item.actionName} expires={item.expires} />
                </span>
                
                <!---Expiration--->
                {#if item.expires}
                    <span class="flex flex-row gap-2 items-start w-full">    
                        <span class="text-xs font-bold min-w-[10ch]">Expires:</span>
                        <span class="flex flex-nowrap gap-1">
                            {new Date(item.expires).toLocaleString()}
                        </span>
                    </span>
                {/if}
                
                <!---Removed Item--->
                {#if item.link || item.content}
                    
                    <span class="flex flex-row gap-2 items-start w-full">    
                        {#if item.content && !['Purged a post', 'Purged a comment'].includes(item.content)}
                            <span class="text-xs font-bold min-w-[10ch]">Item:</span>
                        {/if}

                        <span class="flex flex-nowrap w-[calc(100%-12ch)] gap-1 overflow-hidden">
                            {#if item.link && item.content && !['Purged a post', 'Purged a comment'].includes(item.content)}
                                <Link href={item.link} highlight newtab={true} title={item.content}> {item.content.substring(0, 250)} </Link>
                            {:else if item.content && !['Purged a post', 'Purged a comment'].includes(item.content)}
                                <span title="{item.content}">{item.content.substring(0,250)}</span>
                            {/if}
                        </span>
                    </span>
                {/if}

                <!---Reason--->
                {#if item.reason}
                    <span class="flex flex-row gap-2 items-start w-full">    
                        <span class="text-xs font-bold min-w-[10ch]">Reason:</span>
                        <span class="flex flex-nowrap gap-1 items-start">
                            <Markdown noPreview={true} source={item.reason} class="w-full" />
                        </span>
                    </span>
                {/if}
            </div>
        </div>
        

    </div>
</div>
