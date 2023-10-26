<script lang="ts">
    import type {Filters} from '../page.js'
    
    import { userSettings } from '$lib/settings.js'
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'

    import Link from '$lib/components/input/Link.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import type { ModLog } from '../+page.js'
    import ModlogAction from '../ModlogAction.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    
    import { Icon, PlusCircle, MinusCircle} from 'svelte-hero-icons'

    export let item: ModLog
    export let filter: Filters

</script>

<tr class="">
    <!---Time Column--->
    <td>
        <span class="text-sm">
            <RelativeDate date={item.timestamp} />
        </span>
    </td>

    <!--- Community Column--->
    <td>
        {#if item.community}
            <div class="flex flex-row w-full justify-between"> 
                <CommunityLink
                    showInstance={false}
                    avatar
                    avatarSize={20}
                    community={item.community}
                />
                
                <span class="ml-2 cursor-pointer" on:click={() => {
                    filter.community.set = !filter.community.set;
                    if (filter.community.set) {
                        searchParam($page.url, 'community', item.community.id, 'page');
                    } else {
                        searchParam($page.url, 'community', '', 'community');
                    }
                    
                }}>
                    <Icon src={filter.community.set ? MinusCircle : PlusCircle} mini width={24} />
                </span>
            
            </div>
        {/if}
    </td>

    <!--- Moderator--->
    <td>
        {#if item.moderator}
            <div class="flex flex-row w-full text-sm justify-between"> 
                <UserLink
                    showInstance={true}
                    avatar
                    avatarSize={20}
                    user={item.moderator}
                />

                <span class="ml-2 cursor-pointer" on:click={() => {
                    filter.moderator.set = !filter.moderator.set;
                    if (filter.moderator.set) {
                        searchParam($page.url, 'mod_id', item.moderator.id, 'page');
                    } else {
                        searchParam($page.url, 'mod_id', '', 'mod_id');
                    }
                    
                }}>
                    <Icon src={filter.moderator.set ? MinusCircle : PlusCircle} mini width={24} />
                </span>
            </div>
            
        {/if}
    </td>
  
    <!--- Moderatee--->
    <td>
        {#if item.moderatee}
            <div class="flex flex-row w-full justify-between gap-2 text-sm">     
                <UserLink showInstance={true} user={item.moderatee} />
                
                <span class="ml-2 cursor-pointer" on:click={() => {
                    filter.moderatee.set = !filter.moderatee.set;
                    if (filter.moderatee.set) {
                        searchParam($page.url, 'other_person_id', item.moderatee.id, 'page');
                    } else {
                        searchParam($page.url, 'other_person_id', '', 'other_person_id');
                    }
                    
                }}>
                    <Icon src={filter.moderatee.set ? MinusCircle : PlusCircle} mini width={24} />
                </span>
            </div>
        {/if}
    </td>

    <!--- Details Column--->
    <td>
        <ModlogAction action={item.actionName} expires={item.expires ?? undefined} />
        
        {#if item.expires}
            <span class="text-xs flex items-center gap-1">
                Expires on {new Date(item.expires).toLocaleDateString()}
            </span>
        {/if}

        {#if item.content}
            <p class="text-sm font-bold mt-2">Content</p>
            {#if item.link}
                <Link highlight href={item.link} newtab={$userSettings.openInNewTab.postLinks}>
                    <p class="text-sm">{item.content.substring(0, 360)}</p>
                </Link>
            {:else}
                <p class="text-sm">{item.content.substring(0, 120)}</p>
            {/if}
        {/if}
        
        {#if item.reason}
            <p class="text-sm font-bold mt-2">Reason</p>
            <p class="text-sm">{@html item.reason.replaceAll('\n', '<br/>')}</p>
        {/if}

    </td>
</tr>
