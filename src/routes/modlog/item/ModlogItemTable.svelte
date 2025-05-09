<script lang="ts">
    import type {Filters, ModLog} from '../+page.js'
    import type { Post } from 'lemmy-js-client'

    import { getClient } from '$lib/lemmy'
    import { instance } from '$lib/instance.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js';

    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import ModlogAction from '../ModlogAction.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    
    import { Icon, 
        MinusCircle, 
        PlusCircle, 
    } from 'svelte-hero-icons'
    
    
    export let item: ModLog
    export let filter: Filters

</script>


<div class="flex flex-col-reverse gap-1 items-start lg:flex-row lg:gap-4 lg:items-center w-full max-w-full" >
    
    <!---Date/time column--->
    <div class="flex flex-row gap-2 px-1 text-xs w-full lg:w-[5%]">
        <span class="lg:hidden text-xs font-bold min-w-[10ch]">When:</span>
        <RelativeDate date={item.when} />
    </div>

    <!---Community--->
    <div class="flex flex-row gap-1 px-1 text-xs w-full lg:w-[15%] truncate items-center">
        
        <span class="flex flex-row gap-2 items-center w-full">
            <span class="lg:hidden text-xs font-bold min-w-[10ch]">Community:</span>
            {#if item.community}        
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

                <CommunityLink showInstance={true} avatar={false} avatarSize={20} community={item.community} inline={true} class="truncate"/>
            {/if}
        </span>
        
    </div>
    
    <!---Moderator--->
    
    <div class="flex flex-row gap-1 px-1 text-xs w-full lg:w-[20%] truncate items-center">
        
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

                <UserLink showInstance={true} avatar={false} avatarSize={20} user={item.moderator} inline={true} class="truncate"/>
            {:else}
                ---
            {/if}
        </span>
        
    </div>
    

    <!---Moderatee / user --->
    <div class="flex flex-row gap-1 px-1 text-xs w-full lg:w-[20%] truncate items-center">
        
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

                
                <UserLink avatar={false} showInstance={true} user={item.moderatee} inline={true} class="truncate"/>
            {/if}
        </span>
        

    </div>


    <!---Details--->
    <div class="flex flex-row gap-1 px-1 text-xs w-full {$profile?.user ? 'lg:w-[40%]' : 'lg:w-[60%]'}">
        <div class="flex flex-col gap-2 text-xs w-full">
            <ModlogAction action={item.actionName} expires={item.expires} />

            <span class="text-xs">
                {#if item.expires}
                    <span class="flex flex-nowrap gap-1">
                        <strong>Expires</strong>: {new Date(item.expires).toLocaleDateString()}
                    </span>
                {/if}

                
                {#if item.reason}
                <span class="flex flex-nowrap gap-1 items-start">
                    <Markdown noPreview={true} source={item.reason} class="w-full" />
                </span>
                {/if}
                

                {#if item.link || item.content}
                    
                    <span class="flex flex-row gap-1">
                        {#if item.content && !['Purged a post', 'Purged a comment'].includes(item.content)}
                            <span class="text-xs font-bold w-24 lg:w-fit">Item:</span>
                        {/if}

                        <span class="flex flex-nowrap w-[calc(100%-108px)] gap-1 overflow-hidden">
                            {#if item.link && item.content && !['Purged a post', 'Purged a comment'].includes(item.content)}
                                <Link href={item.link} highlight newtab={true} title={item.content}> {item.content.substring(0, 250)} </Link>
                            {:else if item.content && !['Purged a post', 'Purged a comment'].includes(item.content)}
                                <span title="{item.content}">{item.content.substring(0,250)}</span>
                            {:else if item.link}
                                <Link href={item.link} highlight newtab={true}/>
                            {/if}
                        </span>
                    </span>
                {/if}
            </span>
        </div>


    </div>
    

</div>
