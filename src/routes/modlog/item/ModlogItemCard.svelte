<script lang="ts">
  import Link from '$lib/components/input/Link.svelte'
  import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
  import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import Card from '$lib/components/ui/Card.svelte'
  import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
  import RelativeDate from '$lib/components/util/RelativeDate.svelte'
  import type { ModLog } from '../+page.js'
  import ModlogAction from '../ModlogAction.svelte'
  import { userSettings } from '$lib/settings.js'

  export let item: ModLog
</script>

<Card elevation={0} class="p-5 flex flex-col gap-2 text-sm">
    <div class="flex flex-row justify-between flex-wrap gap-2">
        {#if item.community}
            <CommunityLink community={item.community} avatar showInstance />
        {/if}
        <SectionTitle class="font-normal">
            <RelativeDate date={item.timestamp} />
        </SectionTitle>
    </div>
    
    <hr class="mt-1 border-zinc-800"/>
    
    {#if item.actionName}
        <SectionTitle class="mt-2">Action</SectionTitle>
        <span class="">
            <ModlogAction action={item.actionName} expires={item.expires ?? undefined}  />
            {#if item.expires}
                <span class="text-xs flex items-center gap-1">
                    Expires on {new Date(item.expires).toLocaleDateString()}
                </span>
            {/if}
        </span>
    {/if}
  
    {#if item.moderator}
        <SectionTitle class="mt-2">Moderator</SectionTitle>
        <span class="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
            <UserLink showInstance={true} avatar user={item.moderator} />
        </span>
    {/if}
  
    {#if item.moderatee}
        <SectionTitle class="mt-2">User</SectionTitle>
        <UserLink showInstance={true} avatar user={item.moderatee} />
    {/if}

    {#if item.link || item.content}
        <SectionTitle class="mt-2">Item</SectionTitle>

        {#if item.link && item.content}
            <Link href={item.link} highlight newtab={true}>
                {item.content}
            </Link>
        {:else if item.content}
            <p>{item.content}</p>
        {:else if item.link}
            <Link href={item.link} highlight newtab={true}/>
        {/if}
    {/if}
  
    {#if item.reason}
        <SectionTitle class="mt-2">Reason</SectionTitle>
        <p>{item.reason}</p>
    {/if}
</Card>
