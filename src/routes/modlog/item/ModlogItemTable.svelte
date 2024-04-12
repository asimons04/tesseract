<script lang="ts">
    import type {Filters, ModLog} from '../+page.js'
    
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'

    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import ModlogAction from '../ModlogAction.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    
    import { Icon, PlusCircle, MinusCircle} from 'svelte-hero-icons'

    export let item: ModLog
    export let filter: Filters

</script>

<div class="flex flex-col gap-1 items-start lg:flex-row lg:gap-4 lg:items-center w-full" >
    
    <!---Date/time column--->
    <div class="flex flex-col text-xs w-full lg:w-[5%]">
        <RelativeDate date={item.when} />
    </div>

    <!---Community--->
    <div class="flex flex-row gap-1 text-xs w-full lg:w-[15%] items-center">
        {#if item.community}
            <span class="flex flex-row gap-2 items-center w-full">
                <span class="lg:hidden text-xs font-bold">Community:</span>
                
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

                <CommunityLink showInstance={true} avatar={false} avatarSize={20} community={item.community}/>
            </span>
        {/if}
    </div>
    
    <!---Moderator--->
    {#if $profile?.user}
    <div class="flex flex-row gap-1 text-xs w-full lg:w-[20%] items-center">
        {#if item.moderator}
        <span class="flex flex-row gap-2 items-center w-full">    
            <span class="lg:hidden text-xs font-bold">Moderator:</span>
            
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

            <UserLink showInstance={true} avatar={false} avatarSize={20} user={item.moderator} />
        </span>
        {/if}
    </div>
    {/if}

    <!---Moderatee / user --->
    <div class="flex flex-row gap-1 text-xs w-full lg:w-[20%] items-center">
        {#if item.moderatee}
        <span class="flex flex-row gap-2 items-center w-full">        
            <span class="lg:hidden text-xs font-bold">Moderatee:</span>
            
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

            <UserLink avatar={false} showInstance={true} user={item.moderatee} />
        </span>
        {/if}

    </div>


    <!---Details--->
    <div class="flex flex-col gap-1 text-xs w-full {$profile?.user ? 'lg:w-[40%]' : 'lg:w-[60%]'}">
        <ModlogAction action={item.actionName} expires={item.expires} />

        <ul class="pl-4 text-xs">
            {#if item.expires}
                <li class="flex flex-nowrap gap-1">
                    <strong>Expires</strong>: {new Date(item.expires).toLocaleDateString()}
                </li>
            {/if}

            {#if item.reason}
                <li class="flex flex-nowrap gap-1">
                    <strong>Reason:</strong> {item.reason}
                </li>
            {/if}

            {#if item.link || item.content}
                <li class="flex flex-nowrap gap-1">
                    <strong>Item:</strong>
                    {#if item.link && item.content}
                        <Link href={item.link} highlight newtab={$userSettings.openInNewTab.links}>{item.content}</Link>
                    {:else if item.content}
                        {item.content}
                    {:else if item.link}
                        <Link href={item.link} highlight newtab={$userSettings.openInNewTab.links}/>
                    {/if}
                </li>
            {/if}
        </ul>

    </div>
</div>
