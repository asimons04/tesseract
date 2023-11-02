<script lang="ts">
    import type { ModLog } from '../+page.js'
    
    import { fly } from 'svelte/transition'
    import { userSettings } from '$lib/settings.js'

    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import ModlogAction from '../ModlogAction.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    
    export let item: ModLog
</script>

    <div class="text-xs font-normal"  transition:fly={{duration:300, x: '33%'}}>
        {#if item.actionName}
            <span class="text-sm font-bold">
                <ModlogAction action={item.actionName} expires={item.expires ?? undefined}/>
                {#if item.expires}
                    <span class="text-xs flex items-center gap-1">
                        Expires on {new Date(item.expires).toLocaleDateString()}
                    </span>
                {/if}
            </span>
        {/if}

        <ul class="pl-4">
            <li class="flex flex-nowrap gap-1"><strong>Date:</strong> {new Date(item.timestamp).toLocaleString()}</li>
            
            {#if item.community}
                <li class="flex flex-nowrap gap-1"><strong>Community:</strong> <CommunityLink community={item.community} showInstance />
            {/if}

            {#if item.moderator}
                <li class="flex flex-nowrap gap-1"><strong>Mod:</strong> <UserLink showInstance={true} user={item.moderator} />
            {/if}

            {#if item.moderatee}
                <li class="flex flex-nowrap gap-1"><strong>User:</strong> <UserLink showInstance={true} user={item.moderatee} />
            {/if}

            {#if item.link || item.content}
                <li class="flex flex-nowrap gap-1">
                    <strong>Item:</strong>
                    {#if item.link && item.content}
                        <Link href={item.link} highlight newtab={$userSettings.openInNewTab.postLinks}>{item.content}</Link>
                    {:else if item.content}
                        {item.content}
                    {:else if item.link}
                        <Link href={item.link} highlight newtab={$userSettings.openInNewTab.postLinks}/>
                    {/if}
                </li>
            {/if}

            {#if item.reason}
                <li class="flex flex-nowrap gap-1">
                    <strong>Reason:</strong> {item.reason}
                </li>
            {/if}
        </ul>
    </div>

  