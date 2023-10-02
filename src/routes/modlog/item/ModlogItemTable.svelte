<script lang="ts">
    import { userSettings } from '$lib/settings.js'
    import Link from '$lib/components/input/Link.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import type { ModLog } from '../+page.js'
    import ModlogAction from '../ModlogAction.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    export let item: ModLog
</script>

<tr class="">
    <td>
        <span>
            <RelativeDate date={item.timestamp} />
        </span>
    </td>

    <td>
        {#if item.moderator}
        <UserLink
            showInstance={true}
            avatar
            avatarSize={20}
            user={item.moderator}
        />
        {/if}
    </td>
  
    <td>
        <ModlogAction action={item.actionName} expires={item.expires ?? undefined} />
        
        {#if item.expires}
            <span class="text-xs flex items-center gap-1">
                Expires on {new Date(item.expires).toLocaleDateString()}
            </span>
        {/if}
    </td>
  
    <td>
        {#if item.moderatee}
        <UserLink showInstance={true} user={item.moderatee} />
        {/if}
    </td>

    <td>
        {#if item.community}
        <CommunityLink
            showInstance={false}
            avatar
            avatarSize={20}
            community={item.community}
        />
        {/if}
    </td>

    <td>
        {#if item.content && item.link}
        <Link highlight href={item.link} newtab={$userSettings.openInNewTab.postLinks}>
            <p>{item.content.substring(0, 120)}</p>
        </Link>
        
        {:else if item.content}
        <p>{item.content.substring(0, 120)}</p>
        {/if}
    </td>

    <td>
        {#if item.reason}
        <p>{item.reason}</p>
        {/if}
    </td>
</tr>
